from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base


class NotificationChannel(Base):
    __tablename__ = "notification_channels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(String, nullable=False)  # telegram, line, webhook
    name = Column(String, unique=True, nullable=False, index=True)
    config = Column(Text, nullable=False)  # JSON string
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    filter_rules = relationship("FilterRule", back_populates="channel", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="channel", cascade="all, delete-orphan")
