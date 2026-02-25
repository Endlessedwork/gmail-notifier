from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models import ConfigSetting


class ConfigSettingService:
    """Service layer สำหรับจัดการ Config Settings"""

    @staticmethod
    def get_all(db: Session) -> List[ConfigSetting]:
        """ดึง settings ทั้งหมด"""
        return db.query(ConfigSetting).all()

    @staticmethod
    def get_by_key(db: Session, key: str) -> Optional[ConfigSetting]:
        """ดึง setting ตาม key"""
        return db.query(ConfigSetting).filter(ConfigSetting.key == key).first()

    @staticmethod
    def get_value(db: Session, key: str, default: str = "") -> str:
        """ดึงค่า setting (คืน default ถ้าไม่มี)"""
        setting = ConfigSettingService.get_by_key(db, key)
        return setting.value if setting else default

    @staticmethod
    def set_value(db: Session, key: str, value: str) -> ConfigSetting:
        """ตั้งค่า setting (สร้างใหม่หรืออัพเดท)"""
        setting = ConfigSettingService.get_by_key(db, key)

        if setting:
            setting.value = value
        else:
            setting = ConfigSetting(key=key, value=value)
            db.add(setting)

        db.commit()
        db.refresh(setting)
        return setting

    @staticmethod
    def delete(db: Session, key: str) -> bool:
        """ลบ setting"""
        setting = ConfigSettingService.get_by_key(db, key)
        if not setting:
            return False

        db.delete(setting)
        db.commit()
        return True

    @staticmethod
    def get_int(db: Session, key: str, default: int = 0) -> int:
        """ดึงค่า setting แบบ integer"""
        value = ConfigSettingService.get_value(db, key)
        try:
            return int(value) if value else default
        except ValueError:
            return default

    @staticmethod
    def get_bool(db: Session, key: str, default: bool = False) -> bool:
        """ดึงค่า setting แบบ boolean"""
        value = ConfigSettingService.get_value(db, key)
        if not value:
            return default
        return value.lower() in ("true", "1", "yes", "on")
