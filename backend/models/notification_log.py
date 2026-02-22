from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gmail_account_id = Column(Integer, ForeignKey("gmail_accounts.id", ondelete="CASCADE"), nullable=False)
    filter_rule_id = Column(Integer, ForeignKey("filter_rules.id", ondelete="SET NULL"), nullable=True)
    channel_id = Column(Integer, ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False)
    email_subject = Column(String, nullable=True)
    email_from = Column(String, nullable=True)
    email_date = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, sent, failed
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    gmail_account = relationship("GmailAccount", back_populates="notification_logs")
    filter_rule = relationship("FilterRule", back_populates="notification_logs")
    channel = relationship("NotificationChannel", back_populates="notification_logs")
