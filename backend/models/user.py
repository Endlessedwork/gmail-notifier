from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    google_id = Column(String, unique=True, nullable=True, index=True)  # สำหรับ Google OAuth
    refresh_token = Column(Text, nullable=True)  # เก็บ refresh token
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    gmail_accounts = relationship("GmailAccount", back_populates="user", cascade="all, delete-orphan")
    notification_channels = relationship("NotificationChannel", back_populates="user", cascade="all, delete-orphan")
    filter_rules = relationship("FilterRule", back_populates="user", cascade="all, delete-orphan")
