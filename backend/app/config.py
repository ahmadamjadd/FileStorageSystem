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

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single settings instance used throughout the app
settings = Settings()
