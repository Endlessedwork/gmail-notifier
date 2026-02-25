from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from backend.models import GmailAccount
from backend.schemas import GmailAccountCreate, GmailAccountUpdate
from backend.core.security import encrypt_password, decrypt_password
from fastapi import HTTPException, status


class GmailAccountService:
    """Service layer for managing Gmail Accounts"""

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
    ) -> tuple[list[GmailAccount], int]:
        """Get all Gmail accounts, optionally filtered by user_id"""
        query = db.query(GmailAccount)
        if user_id is not None:
            query = query.filter(GmailAccount.user_id == user_id)
        total = query.count()
        accounts = query.offset(skip).limit(limit).all()
        return accounts, total

    @staticmethod
    def get_by_id(
        db: Session,
        account_id: int,
        user_id: Optional[int] = None,
    ) -> Optional[GmailAccount]:
        """Get account by ID, optionally scoped to user"""
        query = db.query(GmailAccount).filter(GmailAccount.id == account_id)
        if user_id is not None:
            query = query.filter(GmailAccount.user_id == user_id)
        return query.first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[GmailAccount]:
        """Get account by email"""
        return db.query(GmailAccount).filter(GmailAccount.email == email).first()

    @staticmethod
    def get_enabled_accounts(db: Session) -> list[GmailAccount]:
        """Get all enabled accounts (used by worker, no user scope)"""
        return db.query(GmailAccount).filter(GmailAccount.enabled == True).all()

    @staticmethod
    def create(
        db: Session,
        account_data: GmailAccountCreate,
        user_id: Optional[int] = None,
    ) -> GmailAccount:
        """Create a new Gmail account"""
        password = account_data.password.replace(" ", "")
        encrypted_password = encrypt_password(password)

        account = GmailAccount(
            user_id=user_id,
            email=account_data.email,
            password=encrypted_password,
            imap_server=account_data.imap_server,
            imap_port=account_data.imap_port,
            enabled=account_data.enabled,
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
                detail=f"Email {account_data.email} already exists",
            )

    @staticmethod
    def update(
        db: Session,
        account_id: int,
        account_data: GmailAccountUpdate,
        user_id: Optional[int] = None,
    ) -> Optional[GmailAccount]:
        """Update a Gmail account"""
        account = GmailAccountService.get_by_id(db, account_id, user_id)
        if not account:
            return None

        update_data = account_data.model_dump(exclude_unset=True)

        if "password" in update_data:
            update_data["password"] = encrypt_password(
                update_data["password"].replace(" ", "")
            )

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
                detail="Email already exists",
            )

    @staticmethod
    def delete(
        db: Session,
        account_id: int,
        user_id: Optional[int] = None,
    ) -> bool:
        """Delete a Gmail account"""
        account = GmailAccountService.get_by_id(db, account_id, user_id)
        if not account:
            return False

        db.delete(account)
        db.commit()
        return True

    @staticmethod
    def get_decrypted_password(account: GmailAccount) -> str:
        """Decrypt password (used by worker)"""
        return decrypt_password(account.password)

    @staticmethod
    def update_last_checked(db: Session, account_id: int) -> None:
        """Update last checked timestamp"""
        from datetime import datetime

        account = GmailAccountService.get_by_id(db, account_id)
        if account:
            account.last_checked_at = datetime.utcnow()
            db.commit()
