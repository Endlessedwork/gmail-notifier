"""
Legacy API routes สำหรับ frontend ที่เรียก /api/config, /api/metrics, /api/rules, /api/health
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os
import subprocess
from datetime import datetime
from backend.core.database import get_db
from backend.core.auth import get_current_user
from backend.models import User, GmailAccount
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


@router.put("/config")
def update_config(
    config_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update config settings - บันทึกลง config_settings table"""
    if "settings" not in config_data:
        raise HTTPException(status_code=400, detail="Missing 'settings' field")

    settings = config_data["settings"]

    # บันทึกแต่ละ setting
    for key, value in settings.items():
        ConfigSettingService.set_value(db, key, str(value))

    # Return ข้อมูลที่อัพเดทแล้ว
    return {
        "message": "Config updated successfully",
        "settings": settings
    }


@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
):
    """Metrics - แปลงจาก notification-logs stats (ไม่ต้อง auth สำหรับ legacy compatibility)"""
    stats = NotificationLogService.get_stats(db, user_id=None)
    return {
        "total_emails_processed": stats.get("total", 0),
        "total_notifications_sent": stats.get("sent", 0),
        "errors_count": stats.get("failed", 0),
        "rules_triggered": {},
    }


@router.get("/rules")
def get_rules(
    db: Session = Depends(get_db),
):
    """Rules - alias ไป filter-rules (ไม่ต้อง auth สำหรับ legacy compatibility)"""
    rules, _ = FilterRuleService.get_all(db, skip=0, limit=1000, user_id=None)
    return {"rules": [_serialize_rule(r) for r in rules]}


@router.get("/worker-status")
def get_worker_status(db: Session = Depends(get_db)):
    """ตรวจสอบสถานะ worker และ Gmail accounts"""
    status = {
        "timestamp": datetime.utcnow().isoformat(),
        "worker": {
            "running": False,
            "process_id": None,
            "check_method": None
        },
        "gmail_accounts": {
            "total": 0,
            "enabled": 0,
            "last_checked": None,
            "accounts": []
        },
        "database": {
            "path": None,
            "notification_logs_count": 0
        },
        "environment": {
            "check_interval": os.environ.get("CHECK_INTERVAL", "60"),
            "database_url": os.environ.get("DATABASE_URL", "not set")
        }
    }

    # เช็ค worker process
    try:
        # วิธีที่ 1: เช็คจาก supervisorctl (ใน Docker)
        result = subprocess.run(
            ["supervisorctl", "status", "worker"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and "RUNNING" in result.stdout:
            status["worker"]["running"] = True
            status["worker"]["check_method"] = "supervisorctl"
            # ดึง PID จาก output
            parts = result.stdout.split()
            if "pid" in result.stdout:
                pid_idx = parts.index("pid") + 1
                if pid_idx < len(parts):
                    status["worker"]["process_id"] = parts[pid_idx].rstrip(",")
    except Exception as e:
        # ถ้าไม่มี supervisorctl ให้เช็คจาก ps
        try:
            result = subprocess.run(
                ["ps", "aux"],
                capture_output=True,
                text=True,
                timeout=5
            )
            for line in result.stdout.split("\n"):
                if "worker.main" in line or "worker/main.py" in line:
                    status["worker"]["running"] = True
                    status["worker"]["check_method"] = "ps"
                    # ดึง PID (column ที่ 2)
                    parts = line.split()
                    if len(parts) > 1:
                        status["worker"]["process_id"] = parts[1]
                    break
        except Exception as ps_error:
            status["worker"]["check_method"] = f"error: {str(e)}, {str(ps_error)}"

    # เช็ค Gmail accounts
    accounts = db.query(GmailAccount).all()
    status["gmail_accounts"]["total"] = len(accounts)
    status["gmail_accounts"]["enabled"] = len([a for a in accounts if a.enabled])

    for acc in accounts:
        status["gmail_accounts"]["accounts"].append({
            "id": acc.id,
            "email": acc.email,
            "enabled": acc.enabled,
            "last_checked_at": acc.last_checked_at.isoformat() if acc.last_checked_at else None,
            "sync_mode": acc.sync_mode
        })

        # หา last_checked ที่ล่าสุด
        if acc.last_checked_at:
            if not status["gmail_accounts"]["last_checked"] or acc.last_checked_at > datetime.fromisoformat(status["gmail_accounts"]["last_checked"]):
                status["gmail_accounts"]["last_checked"] = acc.last_checked_at.isoformat()

    # เช็ค notification logs
    logs_count = NotificationLogService._user_scoped_query(db, user_id=None).count()
    status["database"]["notification_logs_count"] = logs_count

    # Database path
    from backend.core.database import DATABASE_URL
    status["database"]["path"] = DATABASE_URL

    return status
