from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.core.database import get_db
from backend.core.auth import get_current_user
from backend.models import User
from backend.services import FilterRuleService
from backend.schemas import (
    FilterRuleCreate,
    FilterRuleUpdate,
    FilterRuleResponse,
    FilterRuleList,
)

router = APIRouter(prefix="/filter-rules", tags=["Filter Rules"])


@router.get("", response_model=FilterRuleList)
def list_filter_rules(
    skip: int = 0,
    limit: int = 100,
    account_id: Optional[int] = Query(
        None, description="Filter by Gmail account ID"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List filter rules for the current user"""
    if account_id:
        rules = FilterRuleService.get_by_account(db, account_id)
        # Filter to only rules owned by current user
        rules = [r for r in rules if r.user_id == current_user.id or r.user_id is None]
        return FilterRuleList(total=len(rules), rules=rules)

    rules, total = FilterRuleService.get_all(
        db, skip, limit, user_id=current_user.id
    )
    return FilterRuleList(total=total, rules=rules)


@router.get("/{rule_id}", response_model=FilterRuleResponse)
def get_filter_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a filter rule by ID"""
    rule = FilterRuleService.get_by_id(
        db, rule_id, user_id=current_user.id
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found",
        )
    return rule


@router.post(
    "",
    response_model=FilterRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_filter_rule(
    rule_data: FilterRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new filter rule"""
    return FilterRuleService.create(
        db, rule_data, user_id=current_user.id
    )


@router.put("/{rule_id}", response_model=FilterRuleResponse)
def update_filter_rule(
    rule_id: int,
    rule_data: FilterRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a filter rule"""
    rule = FilterRuleService.update(
        db, rule_id, rule_data, user_id=current_user.id
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found",
        )
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_filter_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a filter rule"""
    success = FilterRuleService.delete(
        db, rule_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found",
        )
