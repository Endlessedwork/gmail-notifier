from pydantic_settings import BaseSettings
from typing import Optional
import os


def _get_allowed_origins() -> list[str]:
    raw = os.environ.get("ALLOWED_ORIGINS", "").strip()
    if raw == "*":
        return ["*"]
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return ["http://localhost:3000", "http://localhost:5173"]


class Settings(BaseSettings):
    """Application settings"""

    # FastAPI
    app_name: str = "Gmail Notifier API"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # CORS (ตั้ง ALLOWED_ORIGINS ใน env เป็น * หรือรายการ origin คั่นด้วย comma)
    @property
    def allowed_origins(self) -> list[str]:
        return _get_allowed_origins()

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
