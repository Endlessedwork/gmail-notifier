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
from pydantic import BaseModel
import json
import httpx
from datetime import datetime

router = APIRouter(
    prefix="/notification-channels", tags=["Notification Channels"]
)


def _channel_to_response(channel) -> NotificationChannelResponse:
    try:
        config = json.loads(channel.config) if channel.config else {}
    except (json.JSONDecodeError, TypeError):
        config = {}
    return NotificationChannelResponse(
        id=channel.id,
        type=channel.type,
        name=channel.name,
        config=config,
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


class WebhookTestRequest(BaseModel):
    url: str
    headers: dict = {}


class TelegramTestRequest(BaseModel):
    bot_token: str
    chat_id: str


class LineTestRequest(BaseModel):
    access_token: str


@router.post("/test/webhook")
async def test_webhook(
    test_data: WebhookTestRequest,
    current_user: User = Depends(get_current_user),
):
    """
    ทดสอบส่ง mock notification ไปยัง webhook URL
    """
    mock_payload = {
        "event": "test",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "🧪 Test notification from Gmail Notifier",
        "data": {
            "subject": "[TEST] ทดสอบ Webhook Notification",
            "from": "test@example.com",
            "date": datetime.utcnow().isoformat(),
            "body": "นี่คือข้อความทดสอบจากระบบ Gmail Notifier เพื่อตรวจสอบว่า Webhook URL ของคุณทำงานได้ปกติ",
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Gmail-Notifier/1.0",
                **test_data.headers
            }

            response = await client.post(
                test_data.url,
                json=mock_payload,
                headers=headers
            )

            return {
                "success": True,
                "status_code": response.status_code,
                "response_text": response.text[:500],  # แค่ 500 ตัวอักษรแรก
                "message": f"✅ ส่งสำเร็จ! (HTTP {response.status_code})"
            }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="❌ Webhook timeout (เกิน 10 วินาที)"
        )
    except httpx.ConnectError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"❌ ไม่สามารถเชื่อมต่อ: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"❌ เกิดข้อผิดพลาด: {str(e)}"
        )


@router.post("/test/telegram")
async def test_telegram(
    test_data: TelegramTestRequest,
    current_user: User = Depends(get_current_user),
):
    """
    ทดสอบส่ง mock notification ไปยัง Telegram
    """
    message = """🧪 *Test Notification from Gmail Notifier*

📧 *Subject:* [TEST] ทดสอบ Telegram Notification
👤 *From:* test@example.com
📅 *Date:* {}

📝 *Message:*
นี่คือข้อความทดสอบจากระบบ Gmail Notifier เพื่อตรวจสอบว่า Telegram Bot ของคุณทำงานได้ปกติ
""".format(datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"https://api.telegram.org/bot{test_data.bot_token}/sendMessage"

            response = await client.post(
                url,
                json={
                    "chat_id": test_data.chat_id,
                    "text": message,
                    "parse_mode": "Markdown"
                }
            )

            result = response.json()

            if response.status_code == 200 and result.get("ok"):
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "message": "✅ ส่งสำเร็จ! ตรวจสอบ Telegram ของคุณ"
                }
            else:
                error_desc = result.get("description", "Unknown error")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"❌ Telegram API Error: {error_desc}"
                )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="❌ Telegram timeout (เกิน 10 วินาที)"
        )
    except httpx.ConnectError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"❌ ไม่สามารถเชื่อมต่อ Telegram API: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"❌ เกิดข้อผิดพลาด: {str(e)}"
        )


@router.post("/test/line")
async def test_line(
    test_data: LineTestRequest,
    current_user: User = Depends(get_current_user),
):
    """
    ทดสอบส่ง mock notification ไปยัง LINE Notify
    """
    message = """
🧪 Test Notification from Gmail Notifier

📧 Subject: [TEST] ทดสอบ LINE Notification
👤 From: test@example.com
📅 Date: {}

📝 Message:
นี่คือข้อความทดสอบจากระบบ Gmail Notifier เพื่อตรวจสอบว่า LINE Notify ของคุณทำงานได้ปกติ
""".format(datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = "https://notify-api.line.me/api/notify"

            headers = {
                "Authorization": f"Bearer {test_data.access_token}",
            }

            response = await client.post(
                url,
                headers=headers,
                data={"message": message}
            )

            result = response.json()

            if response.status_code == 200 and result.get("status") == 200:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "message": "✅ ส่งสำเร็จ! ตรวจสอบ LINE ของคุณ"
                }
            else:
                error_msg = result.get("message", "Unknown error")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"❌ LINE Notify Error: {error_msg}"
                )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="❌ LINE Notify timeout (เกิน 10 วินาที)"
        )
    except httpx.ConnectError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"❌ ไม่สามารถเชื่อมต่อ LINE Notify API: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"❌ เกิดข้อผิดพลาด: {str(e)}"
        )
