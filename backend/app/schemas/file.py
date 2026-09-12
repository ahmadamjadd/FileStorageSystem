from datetime import datetime

from pydantic import BaseModel


class FileResponse(BaseModel):
    """
    Schema for file metadata returned in API responses.
    
    Note: This does NOT include the s3_key. We don't expose
    internal storage details to the client. When they need to
    download, they'll use the file ID and we'll generate a
    pre-signed URL server-side.
    """

    id: str
    original_filename: str
    file_size: int
    content_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    """
    Response after a successful file upload.
    Includes the file metadata plus a success message.
    """

    message: str
    file: FileResponse

# Add this to the bottom of backend/app/schemas/file.py

class FileDownloadResponse(BaseModel):
    """
    Response containing the pre-signed S3 URL for downloading a file.
    """
    download_url: str
