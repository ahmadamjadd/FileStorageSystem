import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class File(Base):
    """
    File model — represents the 'files' table in PostgreSQL.
    
    This stores METADATA only. The actual file content lives in S3.
    
    Think of this table as an index card catalog in a library:
    it tells you what exists and where to find it, but it's not
    the book itself.
    """

    __tablename__ = "files"

    # Unique identifier for this file record
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Who owns this file — links to the users table
    # ForeignKey enforces referential integrity: you can't create a file
    # record for a user that doesn't exist
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )

    # Original filename as uploaded by the user (e.g., "vacation_photo.jpg")
    # We store this so we can display it in the UI, even though the S3 key is different
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)

    # The S3 object key where the actual file is stored
    # e.g., "users/abc123/550e8400_vacation_photo.jpg"
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)

    # File size in bytes — useful for displaying "2.5 MB" in the UI
    # and for enforcing upload limits
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)

    # MIME type — e.g., "image/jpeg", "application/pdf"
    # Needed so browsers know how to handle the file when downloaded
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)

    # When the file was uploaded
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
