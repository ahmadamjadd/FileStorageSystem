from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class FileRename(BaseModel):
    name: str


class FileResponse(BaseModel):
    id: str
    name: str = Field(alias="original_filename")
    folder_id: Optional[str] = None
    size_bytes: int = Field(alias="file_size")
    mime_type: str = Field(alias="content_type")
    created_at: datetime = Field(alias="uploaded_at")
    updated_at: datetime = Field(alias="uploaded_at")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class FileUploadResponse(BaseModel):
    message: str
    file: FileResponse


class FileDownloadResponse(BaseModel):
    download_url: str
