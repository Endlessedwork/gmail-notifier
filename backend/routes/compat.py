"""
Legacy API routes สำหรับ frontend ที่เรียก /api/config, /api/metrics, /api/rules, /api/health
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services import ConfigSettingService, NotificationLogService, FilterRuleService
from backend.schemas import FilterRuleResponse

router = APIRouter(prefix="/api", tags=["Compat"])


@router.get("/health")
def health():
    """Health check - legacy format"""
    return {"status": "healthy", "database": "connected"}


@router.get("/config")
def get_config(db: Session = Depends(get_db)):
    """Config - แปลงจาก config-settings เป็น format ที่ frontend ต้องการ"""
    def get(k: str, default: str = ""):
        return ConfigSettingService.get_value(db, k, default)

    def get_int(k: str, default: int = 0):
        return ConfigSettingService.get_int(db, k, default)

    return {
        "settings": {
            "imap_server": get("imap_server", "imap.gmail.com"),
            "imap_port": get_int("imap_port", 993),
            "check_interval": get_int("check_interval", 60),
            "max_body_length": get_int("max_body_length", 300),
            "default_chat_id": get("default_chat_id", ""),
            "log_level": get("log_level", "INFO"),
        }
    }


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """Metrics - แปลงจาก notification-logs stats"""
    stats = NotificationLogService.get_stats(db)
    return {
        "total_emails_processed": stats.get("total", 0),
        "total_notifications_sent": stats.get("sent", 0),
        "errors_count": stats.get("failed", 0),
        "rules_triggered": {},
    }


@router.get("/rules")
def get_rules(db: Session = Depends(get_db)):
    """Rules - alias ไป filter-rules"""
    rules, _ = FilterRuleService.get_all(db, skip=0, limit=1000)
    return {"rules": [FilterRuleResponse.model_validate(r) for r in rules]}
