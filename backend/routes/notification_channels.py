from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.auth import get_current_user
from backend.models import User
from backend.services import NotificationChannelService
from backend.schemas import (
    NotificationChannelCreate,
    NotificationChannelUpdate,
    NotificationChannelResponse,
    NotificationChannelList,
)
import json

router = APIRouter(
    prefix="/notification-channels", tags=["Notification Channels"]
)


def _channel_to_response(channel) -> NotificationChannelResponse:
    return NotificationChannelResponse(
        id=channel.id,
        type=channel.type,
        name=channel.name,
        config=json.loads(channel.config),
        enabled=channel.enabled,
        created_at=channel.created_at,
        updated_at=channel.updated_at,
    )


@router.get("", response_model=NotificationChannelList)
def list_notification_channels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List notification channels for the current user"""
    channels, total = NotificationChannelService.get_all(
        db, skip, limit, user_id=current_user.id
    )
    return NotificationChannelList(
        total=total,
        channels=[_channel_to_response(c) for c in channels],
    )


@router.get("/{channel_id}", response_model=NotificationChannelResponse)
def get_notification_channel(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a notification channel by ID"""
    channel = NotificationChannelService.get_by_id(
        db, channel_id, user_id=current_user.id
    )
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found",
        )
    return _channel_to_response(channel)


@router.post(
    "",
    response_model=NotificationChannelResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notification_channel(
    channel_data: NotificationChannelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new notification channel"""
    channel = NotificationChannelService.create(
        db, channel_data, user_id=current_user.id
    )
    return _channel_to_response(channel)


@router.put("/{channel_id}", response_model=NotificationChannelResponse)
def update_notification_channel(
    channel_id: int,
    channel_data: NotificationChannelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a notification channel"""
    channel = NotificationChannelService.update(
        db, channel_id, channel_data, user_id=current_user.id
    )
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found",
        )
    return _channel_to_response(channel)


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification_channel(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a notification channel"""
    success = NotificationChannelService.delete(
        db, channel_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification channel {channel_id} not found",
        )
