from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.core.database import get_db
from backend.services import FilterRuleService
from backend.schemas import (
    FilterRuleCreate,
    FilterRuleUpdate,
    FilterRuleResponse,
    FilterRuleList
)

router = APIRouter(prefix="/filter-rules", tags=["Filter Rules"])


@router.get("", response_model=FilterRuleList)
def list_filter_rules(
    skip: int = 0,
    limit: int = 100,
    account_id: Optional[int] = Query(None, description="Filter by Gmail account ID"),
    db: Session = Depends(get_db)
):
    """ดึงรายการ filter rules ทั้งหมด"""
    if account_id:
        rules = FilterRuleService.get_by_account(db, account_id)
        return FilterRuleList(
            total=len(rules),
            rules=rules
        )

    rules, total = FilterRuleService.get_all(db, skip, limit)
    return FilterRuleList(
        total=total,
        rules=rules
    )


@router.get("/{rule_id}", response_model=FilterRuleResponse)
def get_filter_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    """ดึงข้อมูล filter rule ตาม ID"""
    rule = FilterRuleService.get_by_id(db, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found"
        )
    return rule


@router.post("", response_model=FilterRuleResponse, status_code=status.HTTP_201_CREATED)
def create_filter_rule(
    rule_data: FilterRuleCreate,
    db: Session = Depends(get_db)
):
    """สร้าง filter rule ใหม่"""
    return FilterRuleService.create(db, rule_data)


@router.put("/{rule_id}", response_model=FilterRuleResponse)
def update_filter_rule(
    rule_id: int,
    rule_data: FilterRuleUpdate,
    db: Session = Depends(get_db)
):
    """อัพเดท filter rule"""
    rule = FilterRuleService.update(db, rule_id, rule_data)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found"
        )
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_filter_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    """ลบ filter rule"""
    success = FilterRuleService.delete(db, rule_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filter rule {rule_id} not found"
        )
