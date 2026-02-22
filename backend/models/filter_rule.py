from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base


class FilterRule(Base):
    __tablename__ = "filter_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gmail_account_id = Column(Integer, ForeignKey("gmail_accounts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    field = Column(String, nullable=False)  # from, subject, body
    match_type = Column(String, default="contains")  # contains, regex, equals
    match_value = Column(String, nullable=False)
    channel_id = Column(Integer, ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False)
    priority = Column(Integer, default=50)  # Lower = higher priority
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    gmail_account = relationship("GmailAccount", back_populates="filter_rules")
    channel = relationship("NotificationChannel", back_populates="filter_rules")
    notification_logs = relationship("NotificationLog", back_populates="filter_rule")
