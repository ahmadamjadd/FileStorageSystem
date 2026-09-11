from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.file import File
from app.models.user import User
from app.schemas.file import FileUploadResponse
from app.services.s3 import generate_s3_key, upload_file_to_s3

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
