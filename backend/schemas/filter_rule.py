from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Literal


class FilterRuleBase(BaseModel):
    gmail_account_id: int
    name: str = Field(..., min_length=1, max_length=255)
    field: Literal["from", "subject", "body"]
    match_type: Literal["contains", "regex", "equals"] = "contains"
    match_value: str = Field(..., min_length=1)
    channel_id: int
    priority: int = Field(default=50, ge=0, le=100)
    enabled: bool = True


class FilterRuleCreate(FilterRuleBase):
    pass


class FilterRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    field: Optional[Literal["from", "subject", "body"]] = None
    match_type: Optional[Literal["contains", "regex", "equals"]] = None
    match_value: Optional[str] = Field(None, min_length=1)
    channel_id: Optional[int] = None
    priority: Optional[int] = Field(None, ge=0, le=100)
    enabled: Optional[bool] = None


class FilterRuleResponse(FilterRuleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FilterRuleList(BaseModel):
    total: int
    rules: List[FilterRuleResponse]
