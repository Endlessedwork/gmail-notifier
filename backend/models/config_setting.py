from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from backend.core.database import Base


class ConfigSetting(Base):
    __tablename__ = "config_settings"

    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
