import imaplib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services import GmailAccountService
from backend.schemas import (
    GmailAccountCreate,
    GmailAccountUpdate,
    GmailAccountResponse,
    GmailAccountList,
    GmailAccountTestRequest,
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


@router.post("/test-connection")
def test_gmail_connection(data: GmailAccountTestRequest):
    """ทดสอบการเชื่อมต่อ IMAP (ไม่บันทึกข้อมูล)"""
    try:
        password = data.password.replace(" ", "")  # ลบช่องว่าง
        mail = imaplib.IMAP4_SSL(data.imap_server, data.imap_port)
        mail.login(data.email, password)
        mail.logout()
        return {"success": True, "message": "เชื่อมต่อสำเร็จ"}
    except imaplib.IMAP4.error as e:
        raise HTTPException(status_code=400, detail=f"IMAP error: {str(e)}")
    except Exception as e:
        err_msg = str(e) or repr(e) or type(e).__name__
        raise HTTPException(status_code=400, detail=f"Connection error: {type(e).__name__}: {err_msg}")


@router.post("/{account_id}/test-connection")
def test_existing_gmail_connection(
    account_id: int,
    db: Session = Depends(get_db)
):
    """ทดสอบการเชื่อมต่อ IMAP ของ account ที่มีอยู่แล้ว"""
    account = GmailAccountService.get_by_id(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    try:
        password = GmailAccountService.get_decrypted_password(account).replace(" ", "")  # ลบช่องว่าง
        mail = imaplib.IMAP4_SSL(account.imap_server, account.imap_port)
        mail.login(account.email, password)
        mail.logout()
        return {"success": True, "message": "เชื่อมต่อสำเร็จ"}
    except imaplib.IMAP4.error as e:
        raise HTTPException(status_code=400, detail=f"IMAP error: {str(e)}")
    except Exception as e:
        err_msg = str(e) or repr(e) or type(e).__name__
        raise HTTPException(status_code=400, detail=f"Connection error: {type(e).__name__}: {err_msg}")


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
