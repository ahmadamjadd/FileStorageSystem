from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """
    Schema for registration requests.
    
    Pydantic validates that:
    - email is a valid email format
    - password meets minimum length
    
    If validation fails, FastAPI automatically returns a 422 error
    with details about what's wrong — we don't need to write that logic.
    """

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserResponse(BaseModel):
    """
    Schema for user data returned in API responses.
    
    IMPORTANT: This deliberately excludes hashed_password.
    Never send password hashes to the client — even hashed passwords
    could be targeted by offline brute-force attacks.
    """

    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allows creating this schema from a SQLAlchemy model
