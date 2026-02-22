from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services import NotificationChannelService
from backend.schemas import (
    NotificationChannelCreate,
    NotificationChannelUpdate,
    NotificationChannelResponse,
    NotificationChannelList
)
import json

router = APIRouter(prefix="/notification-channels", tags=["Notification Channels"])


@router.get("", response_model=NotificationChannelList)
def list_notification_channels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """ดึงรายการ notification channels ทั้งหมด"""
    channels, total = NotificationChannelService.get_all(db, skip, limit)

    # แปลง config เป็น dict
    channel_responses = []
    for channel in channels:
        channel_dict = {
            "id": channel.id,
            "type": channel.type,
            "name": channel.name,
            "config": json.loads(channel.config),
            "enabled": channel.enabled,
            "created_at": channel.created_at,
            "updated_at": channel.updated_at
        }
        channel_responses.append(NotificationChannelResponse(**channel_dict))

    return NotificationChannelList(
        total=total,
        channels=channel_responses
    )


@router.get("/{channel_id}", response_model=NotificationChannelResponse)
def get_notification_channel(
    channel_id: int,
    db: Session = Depends(get_db)
):
    """ดึงข้อมูล notification channel ตาม ID"""
    channel = NotificationChannelService.get_by_id(db, channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found"
        )

    return NotificationChannelResponse(
        id=channel.id,
        type=channel.type,
        name=channel.name,
        config=json.loads(channel.config),
        enabled=channel.enabled,
        created_at=channel.created_at,
        updated_at=channel.updated_at
    )


@router.post("", response_model=NotificationChannelResponse, status_code=status.HTTP_201_CREATED)
def create_notification_channel(
    channel_data: NotificationChannelCreate,
    db: Session = Depends(get_db)
):
    """สร้าง notification channel ใหม่"""
    channel = NotificationChannelService.create(db, channel_data)

    return NotificationChannelResponse(
        id=channel.id,
        type=channel.type,
        name=channel.name,
        config=json.loads(channel.config),
        enabled=channel.enabled,
        created_at=channel.created_at,
        updated_at=channel.updated_at
    )


@router.put("/{channel_id}", response_model=NotificationChannelResponse)
def update_notification_channel(
    channel_id: int,
    channel_data: NotificationChannelUpdate,
    db: Session = Depends(get_db)
):
    """อัพเดท notification channel"""
    channel = NotificationChannelService.update(db, channel_id, channel_data)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found"
        )

    return NotificationChannelResponse(
        id=channel.id,
        type=channel.type,
        name=channel.name,
        config=json.loads(channel.config),
        enabled=channel.enabled,
        created_at=channel.created_at,
        updated_at=channel.updated_at
    )


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification_channel(
    channel_id: int,
    db: Session = Depends(get_db)
):
    """ลบ notification channel"""
    success = NotificationChannelService.delete(db, channel_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found"
        )
