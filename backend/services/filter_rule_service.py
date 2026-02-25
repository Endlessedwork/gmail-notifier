from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
import re
from backend.models import FilterRule
from backend.schemas import FilterRuleCreate, FilterRuleUpdate
from fastapi import HTTPException, status


class FilterRuleService:
    """Service layer for managing Filter Rules"""

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
    ) -> Tuple[List[FilterRule], int]:
        """Get all rules, optionally filtered by user_id"""
        query = db.query(FilterRule)
        if user_id is not None:
            query = query.filter(FilterRule.user_id == user_id)
        total = query.count()
        rules = (
            query.order_by(FilterRule.priority.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return rules, total

    @staticmethod
    def get_by_id(
        db: Session,
        rule_id: int,
        user_id: Optional[int] = None,
    ) -> Optional[FilterRule]:
        """Get rule by ID, optionally scoped to user"""
        query = db.query(FilterRule).filter(FilterRule.id == rule_id)
        if user_id is not None:
            query = query.filter(FilterRule.user_id == user_id)
        return query.first()

    @staticmethod
    def get_by_account(db: Session, account_id: int) -> List[FilterRule]:
        """Get enabled rules by Gmail account (used by worker)"""
        return (
            db.query(FilterRule)
            .filter(FilterRule.gmail_account_id == account_id)
            .filter(FilterRule.enabled == True)
            .order_by(FilterRule.priority.asc())
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        rule_data: FilterRuleCreate,
        user_id: Optional[int] = None,
    ) -> FilterRule:
        """Create a new filter rule"""
        from backend.services.gmail_account_service import GmailAccountService
        from backend.services.notification_channel_service import (
            NotificationChannelService,
        )

        account = GmailAccountService.get_by_id(
            db, rule_data.gmail_account_id, user_id
        )
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Gmail account {rule_data.gmail_account_id} not found",
            )

        channel = NotificationChannelService.get_by_id(
            db, rule_data.channel_id, user_id
        )
        if not channel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification channel {rule_data.channel_id} not found",
            )

        if rule_data.match_type == "regex":
            try:
                re.compile(rule_data.match_value)
            except re.error as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid regex pattern: {str(e)}",
                )

        rule = FilterRule(**rule_data.model_dump(), user_id=user_id)
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def update(
        db: Session,
        rule_id: int,
        rule_data: FilterRuleUpdate,
        user_id: Optional[int] = None,
    ) -> Optional[FilterRule]:
        """Update a filter rule"""
        rule = FilterRuleService.get_by_id(db, rule_id, user_id)
        if not rule:
            return None

        update_data = rule_data.model_dump(exclude_unset=True)

        if "match_type" in update_data or "match_value" in update_data:
            match_type = update_data.get("match_type", rule.match_type)
            match_value = update_data.get("match_value", rule.match_value)

            if match_type == "regex":
                try:
                    re.compile(match_value)
                except re.error as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid regex pattern: {str(e)}",
                    )

        if "channel_id" in update_data:
            from backend.services.notification_channel_service import (
                NotificationChannelService,
            )

            channel = NotificationChannelService.get_by_id(
                db, update_data["channel_id"], user_id
            )
            if not channel:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Notification channel {update_data['channel_id']} not found",
                )

        for field, value in update_data.items():
            setattr(rule, field, value)

        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def delete(
        db: Session,
        rule_id: int,
        user_id: Optional[int] = None,
    ) -> bool:
        """Delete a filter rule"""
        rule = FilterRuleService.get_by_id(db, rule_id, user_id)
        if not rule:
            return False

        db.delete(rule)
        db.commit()
        return True

    @staticmethod
    def match_email(rule: FilterRule, email_data: dict) -> bool:
        """Check if email matches this rule"""
        field_value = ""
        if rule.field == "from":
            field_value = email_data.get("from", "")
        elif rule.field == "subject":
            field_value = email_data.get("subject", "")
        elif rule.field == "body":
            field_value = email_data.get("body", "")

        if rule.match_type == "contains":
            return rule.match_value.lower() in field_value.lower()
        elif rule.match_type == "equals":
            return rule.match_value.lower() == field_value.lower()
        elif rule.match_type == "regex":
            try:
                return bool(re.search(rule.match_value, field_value, re.IGNORECASE))
            except re.error:
                return False

        return False

    @staticmethod
    def find_matching_rule(
        db: Session, account_id: int, email_data: dict
    ) -> Optional[FilterRule]:
        """Find matching rule for email (ordered by priority)"""
        rules = FilterRuleService.get_by_account(db, account_id)

        for rule in rules:
            if FilterRuleService.match_email(rule, email_data):
                return rule

        return None
