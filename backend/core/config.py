from pydantic_settings import BaseSettings
from typing import Optional
import os
import secrets
import warnings


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
    secret_key: str = ""  # MUST be set via environment variable

    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Database
    database_url: str = "sqlite:///./data/gmail_notifier.db"

    # Email checking
    default_check_interval: int = 60
    default_max_body_length: int = 300

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "allow"  # อนุญาตให้มี extra fields จาก .env
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Validate secret_key
        if not self.secret_key or self.secret_key == "change-this-to-random-secret-key":
            if self.debug:
                # Auto-generate for dev only, warn loudly
                self.secret_key = secrets.token_urlsafe(32)
                warnings.warn(
                    "⚠️  SECRET_KEY not set! Using random key. Sessions will NOT persist across restarts. "
                    "Set SECRET_KEY environment variable for production!",
                    UserWarning
                )
            else:
                raise ValueError(
                    "SECRET_KEY environment variable MUST be set in production! "
                    "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )


settings = Settings()
