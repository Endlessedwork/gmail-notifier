from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class NotificationChannelBase(BaseModel):
    type: Literal["telegram", "line", "webhook"]
    name: str = Field(..., min_length=1, max_length=255)
    enabled: bool = True


class TelegramConfig(BaseModel):
    bot_token: str = Field(..., min_length=1)
    chat_id: str = Field(..., min_length=1)


class LineConfig(BaseModel):
    access_token: str = Field(..., min_length=1)


class WebhookConfig(BaseModel):
    url: str = Field(..., min_length=1)
    headers: Optional[dict[str, str]] = None


class NotificationChannelCreate(NotificationChannelBase):
    config: TelegramConfig | LineConfig | WebhookConfig


class NotificationChannelUpdate(BaseModel):
    type: Optional[Literal["telegram", "line", "webhook"]] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    config: Optional[TelegramConfig | LineConfig | WebhookConfig] = None
    enabled: Optional[bool] = None


class NotificationChannelResponse(BaseModel):
    id: int
    type: str
    name: str
    config: dict
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationChannelList(BaseModel):
    total: int
    channels: list[NotificationChannelResponse]
