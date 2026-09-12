from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.file import File
from app.models.user import User
from app.schemas.file import FileResponse, FileUploadResponse, FileDownloadResponse
from app.services.s3 import generate_s3_key, upload_file_to_s3, generate_presigned_url, delete_file_from_s3


router = APIRouter(prefix="/api/files", tags=["Files"])

# Maximum file size: 10 MB
# This prevents users from uploading excessively large files
# that would consume storage and bandwidth
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes

# Allowed content types — only accept common, safe file types
# This prevents uploading executable files or other potentially dangerous content
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a file for the authenticated user.
    
    Flow:
    1. Validate the file (size, content type)
    2. Read the file content
    3. Generate a unique S3 key
    4. Upload the file to S3
    5. Save file metadata to PostgreSQL
    6. Return the file metadata
    
    The function is 'async' because reading the uploaded file is an I/O
    operation that benefits from async handling. FastAPI can serve other
    requests while waiting for the file to be read.
    """

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' is not allowed. Allowed types: images, PDF, text, CSV, Word, Excel.",
        )

    # Read file content
    file_content = await file.read()

    # Validate file size
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({file_size} bytes) exceeds maximum allowed size ({MAX_FILE_SIZE} bytes = 10 MB).",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload an empty file.",
        )

    # Generate unique S3 key
    s3_key = generate_s3_key(user_id=current_user.id, original_filename=file.filename)

    # Upload to S3
    upload_success = upload_file_to_s3(
        file_content=file_content,
        s3_key=s3_key,
        content_type=file.content_type,
    )

    if not upload_success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage. Please try again.",
        )

    # Save metadata to PostgreSQL
    file_record = File(
        user_id=current_user.id,
        original_filename=file.filename,
        s3_key=s3_key,
        file_size=file_size,
        content_type=file.content_type,
    )

    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    return FileUploadResponse(
        message="File uploaded successfully.",
        file=file_record,
    )

# Add this endpoint below the existing upload_file endpoint

@router.get("/", response_model=list[FileResponse])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    List all files for the authenticated user.
    
    Flow:
    1. Authenticate user (handled by get_current_user)
    2. Query the files table for records matching the user's ID
    3. Return the list of file metadata (no S3 keys exposed)
    
    Security: The WHERE clause (filter) ensures users can NEVER
    see another user's files. This is the core of tenant isolation.
    
    Pagination: We use skip and limit to prevent loading thousands
    of records at once if a user has many files.
    """

    # Query only the files belonging to the current user
    files = (
        db.query(File)
        .filter(File.user_id == current_user.id)
        .order_by(File.uploaded_at.desc()) # Newest first
        .offset(skip)
        .limit(limit)
        .all()
    )

    return files


@router.get("/{file_id}/download", response_model=FileDownloadResponse)
def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a pre-signed S3 URL to download a file.
    
    Flow:
    1. Authenticate user
    2. Look up the file in PostgreSQL by ID
    3. Verify the file belongs to the current user (Authorization)
    4. Generate a 1-hour pre-signed URL using the S3 key
    5. Return the URL to the client
    """

    # Find the file in the database
    file_record = db.query(File).filter(File.id == file_id).first()

    # 1. Does the file exist?
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    # 2. Does the file belong to the user requesting it?
    # This is a critical security check to prevent Insecure Direct Object Reference (IDOR)
    if file_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this file.",
        )

    # Generate the pre-signed URL
    download_url = generate_presigned_url(s3_key=file_record.s3_key)

    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download link. Please try again.",
        )

    return FileDownloadResponse(download_url=download_url)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a file from both S3 and the database.
    
    Flow:
    1. Authenticate user
    2. Look up the file in PostgreSQL
    3. Verify the file belongs to the current user
    4. Delete from S3 (the actual file bytes)
    5. Delete from PostgreSQL (the metadata record)
    
    We return a 204 No Content status, which is standard for DELETE operations.
    """

    # 1 & 2. Find the file
    file_record = db.query(File).filter(File.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    # 3. Security check (IDOR prevention)
    if file_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this file.",
        )

    # 4. Delete from S3 FIRST
    # If this fails, we don't want to delete the DB record.
    # Otherwise, we'd have a leaked file in S3 with no DB record pointing to it.
    s3_delete_success = delete_file_from_s3(s3_key=file_record.s3_key)
    
    if not s3_delete_success:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file from storage. Please try again.",
        )

    # 5. Delete from PostgreSQL LAST
    db.delete(file_record)
    db.commit()

    # We don't return anything (HTTP 204 No Content)
    return None

