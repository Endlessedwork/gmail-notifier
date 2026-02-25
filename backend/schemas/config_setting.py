from pydantic import BaseModel
from typing import List
from datetime import datetime


class ConfigSettingResponse(BaseModel):
    key: str
    value: str
    updated_at: datetime

    class Config:
        from_attributes = True


class ConfigSettingUpdate(BaseModel):
    value: str


class ConfigSettingList(BaseModel):
    total: int
    settings: List[ConfigSettingResponse]
