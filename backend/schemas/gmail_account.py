from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class GmailAccountBase(BaseModel):
    email: str = Field(..., min_length=1)
    imap_server: str = "imap.gmail.com"
    imap_port: int = Field(default=993, ge=1, le=65535)
    enabled: bool = True


class GmailAccountCreate(GmailAccountBase):
    password: str = Field(..., min_length=1)


class GmailAccountUpdate(BaseModel):
    email: Optional[str] = Field(None, min_length=1)
    password: Optional[str] = Field(None, min_length=1)
    imap_server: Optional[str] = None
    imap_port: Optional[int] = Field(None, ge=1, le=65535)
    enabled: Optional[bool] = None


class GmailAccountResponse(GmailAccountBase):
    id: int
    last_checked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GmailAccountList(BaseModel):
    total: int
    accounts: list[GmailAccountResponse]
