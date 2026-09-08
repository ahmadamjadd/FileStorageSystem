import bcrypt


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
