from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Literal


class NotificationLogResponse(BaseModel):
    id: int
    gmail_account_id: int
    filter_rule_id: Optional[int] = None
    channel_id: int
    email_subject: Optional[str] = None
    email_from: Optional[str] = None
    email_date: Optional[str] = None
    status: Literal["pending", "sent", "failed"]
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationLogList(BaseModel):
    total: int
    logs: List[NotificationLogResponse]
