from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import hash_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Flow:
    1. Check if email already exists → 400 error if it does
    2. Hash the password with bcrypt
    3. Create a new User in the database
    4. Return the user info (without password)
    
    FastAPI automatically:
    - Parses the JSON request body into a UserCreate object
    - Validates email format and password length
    - Returns 422 if validation fails
    - Serializes the response using UserResponse (excluding password)
    """

    # Check if a user with this email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Create new user with hashed password
    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Reload from DB to get the generated id and created_at

    return new_user
