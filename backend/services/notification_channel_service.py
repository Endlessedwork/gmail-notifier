from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional, Tuple
import json
from backend.models import NotificationChannel
from backend.schemas import NotificationChannelCreate, NotificationChannelUpdate
from fastapi import HTTPException, status


class NotificationChannelService:
    """Service layer for managing Notification Channels"""

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
    ) -> Tuple[List[NotificationChannel], int]:
        """Get all channels, optionally filtered by user_id"""
        query = db.query(NotificationChannel)
        if user_id is not None:
            query = query.filter(NotificationChannel.user_id == user_id)
        total = query.count()
        channels = query.offset(skip).limit(limit).all()
        return channels, total

    @staticmethod
    def get_by_id(
        db: Session,
        channel_id: int,
        user_id: Optional[int] = None,
    ) -> Optional[NotificationChannel]:
        """Get channel by ID, optionally scoped to user"""
        query = db.query(NotificationChannel).filter(
            NotificationChannel.id == channel_id
        )
        if user_id is not None:
            query = query.filter(NotificationChannel.user_id == user_id)
        return query.first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[NotificationChannel]:
        """Get channel by name"""
        return (
            db.query(NotificationChannel)
            .filter(NotificationChannel.name == name)
            .first()
        )

    @staticmethod
    def get_enabled_channels(db: Session) -> List[NotificationChannel]:
        """Get all enabled channels (used by worker, no user scope)"""
        return (
            db.query(NotificationChannel)
            .filter(NotificationChannel.enabled == True)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        channel_data: NotificationChannelCreate,
        user_id: Optional[int] = None,
    ) -> NotificationChannel:
        """Create a new notification channel"""
        config_json = channel_data.config.model_dump_json()

        channel = NotificationChannel(
            user_id=user_id,
            type=channel_data.type,
            name=channel_data.name,
            config=config_json,
            enabled=channel_data.enabled,
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
                detail=f"Channel name '{channel_data.name}' already exists",
            )

    @staticmethod
    def update(
        db: Session,
        channel_id: int,
        channel_data: NotificationChannelUpdate,
        user_id: Optional[int] = None,
    ) -> Optional[NotificationChannel]:
        """Update a notification channel"""
        channel = NotificationChannelService.get_by_id(db, channel_id, user_id)
        if not channel:
            return None

        update_data = channel_data.model_dump(exclude_unset=True)

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
                detail="Channel name already exists",
            )

    @staticmethod
    def delete(
        db: Session,
        channel_id: int,
        user_id: Optional[int] = None,
    ) -> bool:
        """Delete a notification channel"""
        channel = NotificationChannelService.get_by_id(db, channel_id, user_id)
        if not channel:
            return False

        db.delete(channel)
        db.commit()
        return True

    @staticmethod
    def get_config_dict(channel: NotificationChannel) -> dict:
        """Parse config JSON string to dict"""
        try:
            return json.loads(channel.config)
        except json.JSONDecodeError:
            return {}
