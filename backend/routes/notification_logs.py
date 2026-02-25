from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.core.database import get_db
from backend.services import NotificationLogService
from backend.schemas import NotificationLogResponse, NotificationLogList

router = APIRouter(prefix="/notification-logs", tags=["Notification Logs"])


@router.get("", response_model=NotificationLogList)
def list_notification_logs(
    skip: int = Query(0, alias="offset", description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500),
    account_id: Optional[int] = Query(None, description="Filter by Gmail account ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (pending/sent/failed)"),
    db: Session = Depends(get_db)
):
    """ดึงรายการ notification logs พร้อม filter"""
    logs, total = NotificationLogService.get_all(db, skip, limit, account_id, status_filter)
    return NotificationLogList(
        total=total,
        logs=logs
    )


@router.get("/stats", response_model=dict)
def get_notification_stats(
    account_id: Optional[int] = Query(None, description="Filter by Gmail account ID"),
    db: Session = Depends(get_db)
):
    """ดึงสถิติการส่ง notification"""
    return NotificationLogService.get_stats(db, account_id)


@router.get("/{log_id}", response_model=NotificationLogResponse)
def get_notification_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """ดึงข้อมูล notification log ตาม ID"""
    log = NotificationLogService.get_by_id(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification log {log_id} not found"
        )
    return log
