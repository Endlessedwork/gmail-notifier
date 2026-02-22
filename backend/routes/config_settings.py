from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services import ConfigSettingService
from backend.schemas import (
    ConfigSettingResponse,
    ConfigSettingUpdate,
    ConfigSettingList
)

router = APIRouter(prefix="/config-settings", tags=["Config Settings"])


@router.get("", response_model=ConfigSettingList)
def list_config_settings(db: Session = Depends(get_db)):
    """ดึง config settings ทั้งหมด"""
    settings = ConfigSettingService.get_all(db)
    return ConfigSettingList(
        total=len(settings),
        settings=settings
    )


@router.get("/{key}", response_model=ConfigSettingResponse)
def get_config_setting(
    key: str,
    db: Session = Depends(get_db)
):
    """ดึง config setting ตาม key"""
    setting = ConfigSettingService.get_by_key(db, key)
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Config setting '{key}' not found"
        )
    return setting


@router.put("/{key}", response_model=ConfigSettingResponse)
def update_config_setting(
    key: str,
    setting_data: ConfigSettingUpdate,
    db: Session = Depends(get_db)
):
    """อัพเดท config setting (สร้างใหม่ถ้ายังไม่มี)"""
    return ConfigSettingService.set_value(db, key, setting_data.value)


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_config_setting(
    key: str,
    db: Session = Depends(get_db)
):
    """ลบ config setting"""
    success = ConfigSettingService.delete(db, key)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Config setting '{key}' not found"
        )
