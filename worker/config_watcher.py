"""
Database configuration watcher
ติดตามการเปลี่ยนแปลงของ config ใน database
"""

import logging
import os
from typing import List, Dict
from datetime import datetime
import pytz

from sqlalchemy.orm import Session
from backend.models import (
    GmailAccount,
    NotificationChannel,
    FilterRule
)

logger = logging.getLogger(__name__)


class ConfigWatcher:
    """ติดตาม configuration changes จาก database"""

    def __init__(self, db: Session):
        """
        Args:
            db: Database session
        """
        self.db = db
        tz_name = os.getenv('TZ', 'UTC')
        self.timezone = pytz.timezone(tz_name)
        self._last_check = datetime.now(self.timezone)

    def get_active_accounts(self) -> List[GmailAccount]:
        """
        ดึง active Gmail accounts จาก database

        Returns:
            List of active GmailAccount instances
        """
        try:
            accounts = (
                self.db.query(GmailAccount)
                .filter(GmailAccount.enabled == True)
                .all()
            )
            logger.debug(f"Found {len(accounts)} active account(s)")
            return accounts
        except Exception as e:
            logger.error(f"Failed to get active accounts: {e}")
            return []

    def get_filter_rules(self, account_id: int) -> List[FilterRule]:
        """
        ดึง filter rules สำหรับ account

        Args:
            account_id: Gmail account ID

        Returns:
            List of FilterRule instances (sorted by priority)
        """
        try:
            rules = (
                self.db.query(FilterRule)
                .filter(
                    FilterRule.gmail_account_id == account_id,
                    FilterRule.enabled == True
                )
                .order_by(FilterRule.priority.asc())
                .all()
            )
            logger.debug(f"Found {len(rules)} filter rule(s) for account {account_id}")
            return rules
        except Exception as e:
            logger.error(f"Failed to get filter rules: {e}")
            return []

    def get_channel(self, channel_id: int) -> NotificationChannel:
        """
        ดึง notification channel

        Args:
            channel_id: Channel ID

        Returns:
            NotificationChannel instance or None
        """
        try:
            channel = (
                self.db.query(NotificationChannel)
                .filter(NotificationChannel.id == channel_id)
                .first()
            )
            return channel
        except Exception as e:
            logger.error(f"Failed to get channel {channel_id}: {e}")
            return None

    def get_account_config(self, account_id: int) -> Dict:
        """
        ดึง complete config สำหรับ account (account + rules + channels)

        Args:
            account_id: Gmail account ID

        Returns:
            Dictionary with account, rules, and channels
        """
        try:
            account = (
                self.db.query(GmailAccount)
                .filter(GmailAccount.id == account_id)
                .first()
            )

            if not account or not account.enabled:
                return {}

            rules = self.get_filter_rules(account_id)

            # Get unique channels
            channel_ids = {rule.channel_id for rule in rules if rule.channel_id}
            channels = {}

            for channel_id in channel_ids:
                channel = self.get_channel(channel_id)
                if channel and channel.enabled:
                    channels[channel_id] = channel

            return {
                'account': account,
                'rules': rules,
                'channels': channels
            }

        except Exception as e:
            logger.error(f"Failed to get account config: {e}")
            return {}

    def has_config_changed(self) -> bool:
        """
        ตรวจสอบว่า config มีการเปลี่ยนแปลงหรือไม่

        Returns:
            True ถ้ามีการเปลี่ยนแปลง
        """
        try:
            # Check if any accounts were updated
            updated_accounts = (
                self.db.query(GmailAccount)
                .filter(GmailAccount.updated_at > self._last_check)
                .count()
            )

            # Check if any channels were updated
            updated_channels = (
                self.db.query(NotificationChannel)
                .filter(NotificationChannel.updated_at > self._last_check)
                .count()
            )

            # Check if any rules were updated
            updated_rules = (
                self.db.query(FilterRule)
                .filter(FilterRule.updated_at > self._last_check)
                .count()
            )

            has_changed = (
                updated_accounts > 0 or
                updated_channels > 0 or
                updated_rules > 0
            )

            if has_changed:
                logger.info(
                    f"Config changed: "
                    f"accounts={updated_accounts}, "
                    f"channels={updated_channels}, "
                    f"rules={updated_rules}"
                )
                self._last_check = datetime.now(self.timezone)

            return has_changed

        except Exception as e:
            logger.error(f"Failed to check config changes: {e}")
            return False

    def update_account_last_checked(self, account_id: int):
        """
        อัพเดท last_checked_at สำหรับ account

        Args:
            account_id: Gmail account ID
        """
        try:
            account = (
                self.db.query(GmailAccount)
                .filter(GmailAccount.id == account_id)
                .first()
            )

            if account:
                account.last_checked_at = datetime.now(self.timezone)
                self.db.commit()
                logger.debug(f"Updated last_checked_at for account {account_id}")

        except Exception as e:
            logger.error(f"Failed to update last_checked_at: {e}")
            self.db.rollback()
