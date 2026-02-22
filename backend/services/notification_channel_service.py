from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
import json
from backend.models import NotificationChannel
from backend.schemas import NotificationChannelCreate, NotificationChannelUpdate
from fastapi import HTTPException, status


class NotificationChannelService:
    """Service layer สำหรับจัดการ Notification Channels"""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[NotificationChannel], int]:
        """ดึง channels ทั้งหมด"""
        total = db.query(NotificationChannel).count()
        channels = db.query(NotificationChannel).offset(skip).limit(limit).all()
        return channels, total

    @staticmethod
    def get_by_id(db: Session, channel_id: int) -> Optional[NotificationChannel]:
        """ดึง channel ตาม ID"""
        return db.query(NotificationChannel).filter(NotificationChannel.id == channel_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[NotificationChannel]:
        """ดึง channel ตาม name"""
        return db.query(NotificationChannel).filter(NotificationChannel.name == name).first()

    @staticmethod
    def get_enabled_channels(db: Session) -> list[NotificationChannel]:
        """ดึง channels ที่เปิดใช้งาน"""
        return db.query(NotificationChannel).filter(NotificationChannel.enabled == True).all()

    @staticmethod
    def create(db: Session, channel_data: NotificationChannelCreate) -> NotificationChannel:
        """สร้าง notification channel ใหม่"""
        # แปลง config เป็น JSON string
        config_json = channel_data.config.model_dump_json()

        channel = NotificationChannel(
            type=channel_data.type,
            name=channel_data.name,
            config=config_json,
            enabled=channel_data.enabled
        )

        try:
            db.add(channel)
            db.commit()
            db.refresh(channel)
            return channel
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Channel name '{channel_data.name}' already exists"
            )

    @staticmethod
    def update(db: Session, channel_id: int, channel_data: NotificationChannelUpdate) -> Optional[NotificationChannel]:
        """อัพเดท notification channel"""
        channel = NotificationChannelService.get_by_id(db, channel_id)
        if not channel:
            return None

        update_data = channel_data.model_dump(exclude_unset=True)

        # แปลง config เป็น JSON string ถ้ามีการเปลี่ยน
        if "config" in update_data and update_data["config"]:
            update_data["config"] = update_data["config"].model_dump_json()

        for field, value in update_data.items():
            setattr(channel, field, value)

        try:
            db.commit()
            db.refresh(channel)
            return channel
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Channel name already exists"
            )

    @staticmethod
    def delete(db: Session, channel_id: int) -> bool:
        """ลบ notification channel"""
        channel = NotificationChannelService.get_by_id(db, channel_id)
        if not channel:
            return False

        db.delete(channel)
        db.commit()
        return True

    @staticmethod
    def get_config_dict(channel: NotificationChannel) -> dict:
        """แปลง config JSON string เป็น dict"""
        try:
            return json.loads(channel.config)
        except json.JSONDecodeError:
            return {}
