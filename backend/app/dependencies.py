from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import decode_access_token

# HTTPBearer extracts the token from the "Authorization: Bearer <token>" header
# It also adds a lock icon to Swagger UI for protected endpoints
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that authenticates the current user.
    
    Flow:
    1. Extract the Bearer token from the Authorization header
    2. Decode the JWT to get the user_id
    3. Look up the user in the database
    4. Return the User object (or raise 401 if anything fails)
    
    Usage in a route:
        @router.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            # current_user is guaranteed to be a valid, authenticated user
            return {"email": current_user.email}
    
    If the token is missing, invalid, expired, or the user doesn't exist,
    this raises a 401 Unauthorized error BEFORE the route code runs.
    """
    token = credentials.credentials

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
