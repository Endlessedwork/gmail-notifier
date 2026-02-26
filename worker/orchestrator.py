"""
WorkerOrchestrator - logic สำหรับ check อีเมลและส่ง notification
แยกจาก main เพื่อให้ API สามารถ import ได้โดยไม่โดน signal handlers
"""

import logging
import json
from typing import Dict, List
from datetime import datetime

from backend.core.database import get_db_context
from backend.models import NotificationLog
from worker.config_watcher import ConfigWatcher
from worker.email_checker import EmailChecker
from worker.notification_sender import NotificationSender
from worker.utils import match_filter

logger = logging.getLogger(__name__)


class WorkerOrchestrator:
    """Orchestrate email checking and notification sending"""

    def __init__(self, check_interval: int = 60):
        self.check_interval = check_interval

    def process_account(self, account, watcher: ConfigWatcher):
        """ประมวลผลอีเมลสำหรับ 1 account"""
        logger.info(f"📧 Checking {account.email}...")

        rules = watcher.get_filter_rules(account.id)
        if not rules:
            logger.warning(f"⚠️ No filter rules for {account.email}")
            return

        with EmailChecker(account) as checker:
            if not checker.mail:
                logger.error(f"❌ Failed to connect to {account.email}")
                return

            emails = checker.check_new_emails()
            if not emails:
                return

            for email_data in emails:
                try:
                    self._process_email(email_data, rules, watcher)
                    # ไม่ mark_as_seen เพื่อให้อีเมลยังคงเป็น UNSEEN ใน Gmail
                    # checker.mark_as_seen(email_data['id'])
                except Exception as e:
                    logger.error(f"Error processing email: {e}")

        watcher.update_account_last_checked(account.id)

    def _process_email(self, email_data: Dict, rules: List, watcher: ConfigWatcher):
        subject = email_data.get('subject', '')
        sender = email_data.get('from', '')
        body = email_data.get('body', '')
        date_str = email_data.get('date', '')
        account_id = email_data.get('account_id')

        matched_rule = None
        for rule in rules:
            field_value = ''
            if rule.field == 'from':
                field_value = sender
            elif rule.field == 'subject':
                field_value = subject
            elif rule.field == 'body':
                field_value = body

            if match_filter(field_value, rule.match_type, rule.match_value):
                matched_rule = rule
                logger.info(f"✅ Matched rule: {rule.name}")
                break

        if not matched_rule:
            logger.info(f"ℹ️ No matching rule for email: {subject}")
            return

        # แปลง channel_ids จาก JSON string เป็น list
        try:
            channel_ids = json.loads(matched_rule.channel_ids) if isinstance(matched_rule.channel_ids, str) else matched_rule.channel_ids
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"❌ Failed to parse channel_ids for rule {matched_rule.id}: {e}")
            return

        if not channel_ids:
            logger.error(f"❌ No channels configured for rule {matched_rule.id}")
            return

        # ส่ง notification ไปทุก channel
        for channel_id in channel_ids:
            channel = watcher.get_channel(channel_id)
            if not channel:
                logger.error(f"❌ Channel {channel_id} not found")
                self._log_notification(
                    account_id=account_id,
                    filter_rule_id=matched_rule.id,
                    channel_id=channel_id,
                    email_subject=subject,
                    email_from=sender,
                    email_date=date_str,
                    success=False
                )
                continue

            sender_instance = NotificationSender(channel)
            success = sender_instance.send(
                subject=subject,
                sender=sender,
                date_str=date_str,
                body=body,
                rule_name=matched_rule.name
            )

            self._log_notification(
                account_id=account_id,
                filter_rule_id=matched_rule.id,
                channel_id=channel.id,
                email_subject=subject,
                email_from=sender,
                email_date=date_str,
                success=success
            )

    def _log_notification(
        self,
        account_id: int,
        filter_rule_id: int,
        channel_id: int,
        email_subject: str,
        email_from: str,
        email_date: str,
        success: bool
    ):
        try:
            with get_db_context() as db:
                log = NotificationLog(
                    gmail_account_id=account_id,
                    filter_rule_id=filter_rule_id,
                    channel_id=channel_id,
                    email_subject=email_subject,
                    email_from=email_from,
                    email_date=email_date,
                    status='sent' if success else 'failed',
                    sent_at=datetime.utcnow() if success else None
                )
                db.add(log)
                db.commit()
        except Exception as e:
            logger.error(f"Failed to log notification: {e}")
