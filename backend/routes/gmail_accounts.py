from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services import GmailAccountService
from backend.schemas import (
    GmailAccountCreate,
    GmailAccountUpdate,
    GmailAccountResponse,
    GmailAccountList
)

router = APIRouter(prefix="/gmail-accounts", tags=["Gmail Accounts"])


@router.get("", response_model=GmailAccountList)
def list_gmail_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """ดึงรายการ Gmail accounts ทั้งหมด"""
    accounts, total = GmailAccountService.get_all(db, skip, limit)
    return GmailAccountList(
        total=total,
        accounts=accounts
    )


@router.get("/{account_id}", response_model=GmailAccountResponse)
def get_gmail_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    """ดึงข้อมูล Gmail account ตาม ID"""
    account = GmailAccountService.get_by_id(db, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found"
        )
    return account


@router.post("", response_model=GmailAccountResponse, status_code=status.HTTP_201_CREATED)
def create_gmail_account(
    account_data: GmailAccountCreate,
    db: Session = Depends(get_db)
):
    """สร้าง Gmail account ใหม่"""
    return GmailAccountService.create(db, account_data)


@router.put("/{account_id}", response_model=GmailAccountResponse)
def update_gmail_account(
    account_id: int,
    account_data: GmailAccountUpdate,
    db: Session = Depends(get_db)
):
    """อัพเดท Gmail account"""
    account = GmailAccountService.update(db, account_id, account_data)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found"
        )
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gmail_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    """ลบ Gmail account"""
    success = GmailAccountService.delete(db, account_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found"
        )
