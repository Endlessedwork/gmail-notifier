import imaplib
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.auth import get_current_user
from backend.models import User
from backend.services import GmailAccountService
from backend.schemas import (
    GmailAccountCreate,
    GmailAccountUpdate,
    GmailAccountResponse,
    GmailAccountList,
    GmailAccountTestRequest,
)

router = APIRouter(prefix="/gmail-accounts", tags=["Gmail Accounts"])
logger = logging.getLogger(__name__)


@router.get("", response_model=GmailAccountList)
def list_gmail_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List Gmail accounts for the current user"""
    accounts, total = GmailAccountService.get_all(
        db, skip, limit, user_id=current_user.id
    )
    return GmailAccountList(total=total, accounts=accounts)


@router.get("/{account_id}", response_model=GmailAccountResponse)
def get_gmail_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a Gmail account by ID"""
    account = GmailAccountService.get_by_id(
        db, account_id, user_id=current_user.id
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found",
        )
    return account


@router.post("/test-connection")
def test_gmail_connection(
    data: GmailAccountTestRequest,
    current_user: User = Depends(get_current_user),
):
    """Test IMAP connection (does not save data)"""
    try:
        password = data.password.replace(" ", "")
        mail = imaplib.IMAP4_SSL(data.imap_server, data.imap_port)
        mail.login(data.email, password)
        mail.logout()
        return {"success": True, "message": "Connection successful"}
    except imaplib.IMAP4.error as e:
        raise HTTPException(
            status_code=400, detail=f"IMAP error: {str(e)}"
        )
    except Exception as e:
        err_msg = str(e) or repr(e) or type(e).__name__
        raise HTTPException(
            status_code=400,
            detail=f"Connection error: {type(e).__name__}: {err_msg}",
        )


@router.post("/{account_id}/check-now")
def check_now_gmail_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch emails immediately for this account"""
    from worker.config_watcher import ConfigWatcher
    from worker.orchestrator import WorkerOrchestrator

    account = GmailAccountService.get_by_id(
        db, account_id, user_id=current_user.id
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    try:
        watcher = ConfigWatcher(db)
        orchestrator = WorkerOrchestrator(check_interval=60)
        orchestrator.process_account(account, watcher)
        return {"success": True, "message": "Email check completed"}
    except Exception as e:
        db.rollback()
        logger.exception("Check-now failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{account_id}/test-connection")
def test_existing_gmail_connection(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test IMAP connection for an existing account"""
    account = GmailAccountService.get_by_id(
        db, account_id, user_id=current_user.id
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    try:
        password = GmailAccountService.get_decrypted_password(account).replace(
            " ", ""
        )
        mail = imaplib.IMAP4_SSL(account.imap_server, account.imap_port)
        mail.login(account.email, password)
        mail.logout()
        return {"success": True, "message": "Connection successful"}
    except imaplib.IMAP4.error as e:
        raise HTTPException(
            status_code=400, detail=f"IMAP error: {str(e)}"
        )
    except Exception as e:
        err_msg = str(e) or repr(e) or type(e).__name__
        raise HTTPException(
            status_code=400,
            detail=f"Connection error: {type(e).__name__}: {err_msg}",
        )


@router.post(
    "", response_model=GmailAccountResponse, status_code=status.HTTP_201_CREATED
)
def create_gmail_account(
    account_data: GmailAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new Gmail account"""
    return GmailAccountService.create(
        db, account_data, user_id=current_user.id
    )


@router.put("/{account_id}", response_model=GmailAccountResponse)
def update_gmail_account(
    account_id: int,
    account_data: GmailAccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a Gmail account"""
    account = GmailAccountService.update(
        db, account_id, account_data, user_id=current_user.id
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found",
        )
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gmail_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a Gmail account"""
    success = GmailAccountService.delete(
        db, account_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gmail account {account_id} not found",
        )
