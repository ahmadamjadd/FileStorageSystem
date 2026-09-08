import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    """
    User model — represents the 'users' table in PostgreSQL.
    
    Each row stores one registered user's information.
    Passwords are NEVER stored in plaintext — only the bcrypt hash.
    """

    __tablename__ = "users"

    # Primary key: UUID instead of auto-incrementing integer.
    # Why UUID?
    # 1. Security: Sequential IDs (1, 2, 3) let attackers guess other user IDs.
    #    UUIDs are random and unpredictable.
    # 2. Distributed systems: If you ever have multiple database servers,
    #    UUIDs won't collide. Auto-increment IDs would.
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Email: unique constraint prevents duplicate registrations
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    # Hashed password: we store the bcrypt hash, NEVER the plaintext password
    # Even if the database is compromised, attackers can't reverse the hash
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Timestamp: automatically set when the user registers
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
