from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # FastAPI
    app_name: str = "Gmail Notifier API"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Security
    secret_key: str = "change-this-to-random-secret-key"

    # Database
    database_url: str = "sqlite:///./data/gmail_notifier.db"

    # Email checking
    default_check_interval: int = 60
    default_max_body_length: int = 300

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
