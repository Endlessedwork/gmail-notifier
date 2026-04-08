from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import datetime
from backend.models import NotificationLog, GmailAccount
from fastapi import HTTPException, status


class NotificationLogService:
    """Service layer for managing Notification Logs"""

    @staticmethod
    def _user_scoped_query(db: Session, user_id: Optional[int] = None):
        """Build base query optionally scoped to user via gmail_accounts"""
        query = db.query(NotificationLog)
        if user_id is not None:
            query = query.join(GmailAccount).filter(
                GmailAccount.user_id == user_id
            )
        return query

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        account_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Tuple[List[NotificationLog], int]:
        """Get all logs with optional filters"""
        query = NotificationLogService._user_scoped_query(db, user_id)

        if account_id:
            query = query.filter(NotificationLog.gmail_account_id == account_id)

        if status_filter:
            query = query.filter(NotificationLog.status == status_filter)

        total = query.count()
        logs = (
            query.order_by(NotificationLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return logs, total

    @staticmethod
    def get_by_id(db: Session, log_id: int, user_id: Optional[int] = None) -> Optional[NotificationLog]:
        """Get log by ID, optionally scoped to user"""
        query = db.query(NotificationLog).filter(NotificationLog.id == log_id)
        if user_id is not None:
            query = query.join(GmailAccount).filter(
                GmailAccount.user_id == user_id
            )
        return query.first()

    @staticmethod
    def create(
        db: Session,
        gmail_account_id: int,
        channel_id: int,
        email_subject: str,
        email_from: str,
        email_date: str,
        filter_rule_id: Optional[int] = None,
        status: str = "pending",
    ) -> NotificationLog:
        """Create notification log"""
        log = NotificationLog(
            gmail_account_id=gmail_account_id,
            filter_rule_id=filter_rule_id,
            channel_id=channel_id,
            email_subject=email_subject,
            email_from=email_from,
            email_date=email_date,
            status=status,
        )

        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def update_status(
        db: Session,
        log_id: int,
        status: str,
        error_message: Optional[str] = None,
    ) -> Optional[NotificationLog]:
        """Update log status"""
        log = NotificationLogService.get_by_id(db, log_id)
        if not log:
            return None

        log.status = status
        if status == "sent":
            log.sent_at = datetime.utcnow()
        if error_message:
            log.error_message = error_message

        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_stats(
        db: Session,
        account_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> dict:
        """Get notification stats"""
        query = NotificationLogService._user_scoped_query(db, user_id)

        if account_id:
            query = query.filter(NotificationLog.gmail_account_id == account_id)

        total = query.count()
        sent = query.filter(NotificationLog.status == "sent").count()
        failed = query.filter(NotificationLog.status == "failed").count()
        pending = query.filter(NotificationLog.status == "pending").count()

        return {
            "total": total,
            "sent": sent,
            "failed": failed,
            "pending": pending,
            "success_rate": round((sent / total * 100) if total > 0 else 0, 2),
        }
