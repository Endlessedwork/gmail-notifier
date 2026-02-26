"""
Legacy API routes สำหรับ frontend ที่เรียก /api/config, /api/metrics, /api/rules, /api/health
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
from backend.core.database import get_db
from backend.core.auth import get_current_user
from backend.models import User
from backend.services import ConfigSettingService, NotificationLogService, FilterRuleService
from backend.schemas import FilterRuleResponse

router = APIRouter(prefix="/api", tags=["Compat"])


def _serialize_rule(rule) -> FilterRuleResponse:
    """แปลง FilterRule model เป็น response (แปลง channel_ids จาก JSON string เป็น list)"""
    rule_dict = {
        "id": rule.id,
        "gmail_account_id": rule.gmail_account_id,
        "name": rule.name,
        "field": rule.field,
        "match_type": rule.match_type,
        "match_value": rule.match_value,
        "channel_ids": json.loads(rule.channel_ids) if isinstance(rule.channel_ids, str) else rule.channel_ids,
        "priority": rule.priority,
        "enabled": rule.enabled,
        "created_at": rule.created_at,
        "updated_at": rule.updated_at,
    }
    return FilterRuleResponse(**rule_dict)


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
def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Metrics - แปลงจาก notification-logs stats (user-scoped)"""
    stats = NotificationLogService.get_stats(db, user_id=current_user.id)
    return {
        "total_emails_processed": stats.get("total", 0),
        "total_notifications_sent": stats.get("sent", 0),
        "errors_count": stats.get("failed", 0),
        "rules_triggered": {},
    }


@router.get("/rules")
def get_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rules - alias ไป filter-rules (user-scoped)"""
    rules, _ = FilterRuleService.get_all(db, skip=0, limit=1000, user_id=current_user.id)
    return {"rules": [_serialize_rule(r) for r in rules]}
