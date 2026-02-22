from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from backend.models import GmailAccount
from backend.schemas import GmailAccountCreate, GmailAccountUpdate
from backend.core.security import encrypt_password, decrypt_password
from fastapi import HTTPException, status


class GmailAccountService:
    """Service layer สำหรับจัดการ Gmail Accounts"""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[GmailAccount], int]:
        """ดึง Gmail accounts ทั้งหมด"""
        total = db.query(GmailAccount).count()
        accounts = db.query(GmailAccount).offset(skip).limit(limit).all()
        return accounts, total

    @staticmethod
    def get_by_id(db: Session, account_id: int) -> Optional[GmailAccount]:
        """ดึง account ตาม ID"""
        return db.query(GmailAccount).filter(GmailAccount.id == account_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[GmailAccount]:
        """ดึง account ตาม email"""
        return db.query(GmailAccount).filter(GmailAccount.email == email).first()

    @staticmethod
    def get_enabled_accounts(db: Session) -> list[GmailAccount]:
        """ดึง accounts ที่เปิดใช้งาน"""
        return db.query(GmailAccount).filter(GmailAccount.enabled == True).all()

    @staticmethod
    def create(db: Session, account_data: GmailAccountCreate) -> GmailAccount:
        """สร้าง Gmail account ใหม่"""
        # เข้ารหัสรหัสผ่าน
        encrypted_password = encrypt_password(account_data.password)

        account = GmailAccount(
            email=account_data.email,
            password=encrypted_password,
            imap_server=account_data.imap_server,
            imap_port=account_data.imap_port,
            enabled=account_data.enabled
        )

        try:
            db.add(account)
            db.commit()
            db.refresh(account)
            return account
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {account_data.email} already exists"
            )

    @staticmethod
    def update(db: Session, account_id: int, account_data: GmailAccountUpdate) -> Optional[GmailAccount]:
        """อัพเดท Gmail account"""
        account = GmailAccountService.get_by_id(db, account_id)
        if not account:
            return None

        update_data = account_data.model_dump(exclude_unset=True)

        # เข้ารหัสรหัสผ่านใหม่ถ้ามีการเปลี่ยน
        if "password" in update_data:
            update_data["password"] = encrypt_password(update_data["password"])

        for field, value in update_data.items():
            setattr(account, field, value)

        try:
            db.commit()
            db.refresh(account)
            return account
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

    @staticmethod
    def delete(db: Session, account_id: int) -> bool:
        """ลบ Gmail account"""
        account = GmailAccountService.get_by_id(db, account_id)
        if not account:
            return False

        db.delete(account)
        db.commit()
        return True

    @staticmethod
    def get_decrypted_password(account: GmailAccount) -> str:
        """ถอดรหัสรหัสผ่าน (ใช้ใน worker)"""
        return decrypt_password(account.password)

    @staticmethod
    def update_last_checked(db: Session, account_id: int) -> None:
        """อัพเดทเวลาตรวจสอบล่าสุด"""
        from datetime import datetime
        account = GmailAccountService.get_by_id(db, account_id)
        if account:
            account.last_checked_at = datetime.utcnow()
            db.commit()
