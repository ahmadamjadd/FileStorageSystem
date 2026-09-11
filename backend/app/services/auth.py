from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def hash_password(plain_password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    
    How bcrypt works:
    1. Generates a random 'salt' (random bytes added to the password)
    2. Hashes the password + salt together
    3. The salt is embedded in the output, so we don't need to store it separately
    
    The result looks like: $2b$12$LJ3m4ys3Lk0TdXHOdMFoUu...
    - $2b$   = bcrypt algorithm identifier
    - $12$   = cost factor (2^12 = 4096 hashing rounds)
    - rest   = salt + hash combined
    
    Why is this secure?
    - Same password → different hash each time (because of random salt)
    - Cannot reverse the hash to get the password
    - Intentionally slow to prevent brute-force attacks
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    
    This is used during login:
    1. User sends their plaintext password
    2. We retrieve the stored hash from the database
    3. bcrypt hashes the plaintext with the same salt (extracted from the stored hash)
    4. If the results match → correct password
    
    Returns True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(user_id: str) -> str:
    """
    Create a JWT access token containing the user's ID.
    
    The token contains:
    - sub (subject): the user's ID — identifies who this token belongs to
    - exp (expiration): when the token becomes invalid
    
    The token is signed with JWT_SECRET_KEY using HS256.
    Anyone can DECODE a JWT (it's just base64), but only someone
    with the secret key can CREATE a valid one. The signature
    proves the token wasn't tampered with.
    
    JWT structure (three parts separated by dots):
    header.payload.signature
    - Header: {"alg": "HS256", "typ": "JWT"}
    - Payload: {"sub": "user-uuid", "exp": 1234567890}
    - Signature: HMAC-SHA256(header + payload, secret_key)
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,   # Subject: who this token is for
        "exp": expire,     # Expiration: when it becomes invalid
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """
    Decode and verify a JWT access token.
    
    Returns the user_id if the token is valid, None otherwise.
    
    This function:
    1. Verifies the signature (was it signed with our secret key?)
    2. Checks expiration (has the token expired?)
    3. Extracts the user_id from the 'sub' claim
    
    If any step fails, returns None (invalid/expired/tampered token).
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        return user_id
    except JWTError:
        return None
