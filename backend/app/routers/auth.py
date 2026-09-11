from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import hash_password, verify_password, create_access_token

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


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    
    Flow:
    1. Find the user by email
    2. Verify the password against the stored hash
    3. Generate a JWT token containing the user's ID
    4. Return the token
    
    The client stores this token and sends it with every subsequent
    request in the Authorization header: "Bearer <token>"
    """

    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Create and return JWT token
    access_token = create_access_token(user_id=user.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    
    This is a protected route — it requires a valid JWT token.
    The get_current_user dependency handles all authentication logic.
    If the token is invalid, this route never executes.
    
    This endpoint is useful for:
    - The frontend to verify the token is still valid
    - Displaying the user's profile information
    """
    return current_user
