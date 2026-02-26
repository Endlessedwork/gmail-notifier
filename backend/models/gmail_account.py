from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base


class GmailAccount(Base):
    __tablename__ = "gmail_accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # Encrypted
    imap_server = Column(String, default="imap.gmail.com")
    imap_port = Column(Integer, default=993)
    enabled = Column(Boolean, default=True)
    sync_mode = Column(String, default="new_only")  # 'new_only', 'today', 'all_unseen'
    last_checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="gmail_accounts")
    filter_rules = relationship("FilterRule", back_populates="gmail_account", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="gmail_account", cascade="all, delete-orphan")
