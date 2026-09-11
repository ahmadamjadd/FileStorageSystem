from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Pydantic Settings automatically reads values from:
    1. Environment variables
    2. A .env file (if it exists)
    
    This means we NEVER hardcode secrets in our source code.
    """

    PROJECT_NAME: str = "Cloud File Storage"
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str

    # JWT Authentication
    JWT_SECRET_KEY: str          # Used to sign tokens — MUST be kept secret
    JWT_ALGORITHM: str = "HS256" # HMAC-SHA256: symmetric signing algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token expires after 30 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single settings instance used throughout the app
settings = Settings()
