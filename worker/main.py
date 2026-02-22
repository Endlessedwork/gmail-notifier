"""
Gmail Notifier Worker - Main orchestrator
รองรับหลาย accounts พร้อม database-driven configuration
"""

import logging
import signal
import sys
import time
from typing import Dict, List
from datetime import datetime

from backend.core.database import get_db_context
from backend.models import NotificationLog
from worker.config_watcher import ConfigWatcher
from worker.email_checker import EmailChecker
from worker.notification_sender import NotificationSender
from worker.utils import match_filter

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global state
running = True


def signal_handler(sig, frame):
    """Handle shutdown signals"""
    global running
    logger.info("🛑 Shutting down gracefully...")
    running = False
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


class WorkerOrchestrator:
    """Orchestrate email checking and notification sending"""

    def __init__(self, check_interval: int = 60):
        """
        Args:
            check_interval: Interval between checks (seconds)
        """
        self.check_interval = check_interval

    def process_account(self, account, watcher: ConfigWatcher):
        """
        ประมวลผลอีเมลสำหรับ 1 account

        Args:
            account: GmailAccount instance
            watcher: ConfigWatcher instance
        """
        logger.info(f"📧 Checking {account.email}...")

        # Get filter rules
        rules = watcher.get_filter_rules(account.id)

        if not rules:
            logger.warning(f"⚠️ No filter rules for {account.email}")
            return

        # Check emails
        with EmailChecker(account) as checker:
            if not checker.mail:
                logger.error(f"❌ Failed to connect to {account.email}")
                return

            emails = checker.check_new_emails()

            if not emails:
                return

            # Process each email
            for email_data in emails:
                try:
                    self._process_email(email_data, rules, watcher)
                    checker.mark_as_seen(email_data['id'])
                except Exception as e:
                    logger.error(f"Error processing email: {e}")

        # Update last checked
        watcher.update_account_last_checked(account.id)

    def _process_email(self, email_data: Dict, rules: List, watcher: ConfigWatcher):
        """
        ประมวลผล 1 email และส่ง notification

        Args:
            email_data: Email data dictionary
            rules: List of FilterRule instances
            watcher: ConfigWatcher instance
        """
        subject = email_data.get('subject', '')
        sender = email_data.get('from', '')
        body = email_data.get('body', '')
        date_str = email_data.get('date', '')
        account_id = email_data.get('account_id')

        # Find matching rule
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

        # Get notification channel
        channel = watcher.get_channel(matched_rule.channel_id)

        if not channel:
            logger.error(f"❌ Channel {matched_rule.channel_id} not found")
            return

        # Send notification
        sender_instance = NotificationSender(channel)
        success = sender_instance.send(
            subject=subject,
            sender=sender,
            date_str=date_str,
            body=body,
            rule_name=matched_rule.name
        )

        # Log to database
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
        """
        บันทึก notification log

        Args:
            account_id: Gmail account ID
            filter_rule_id: Filter rule ID
            channel_id: Channel ID
            email_subject: Email subject
            email_from: Email sender
            email_date: Email date
            success: Whether notification was sent successfully
        """
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
                logger.debug("Logged notification to database")
        except Exception as e:
            logger.error(f"Failed to log notification: {e}")

    def run(self):
        """Main worker loop"""
        logger.info("🚀 Gmail Notifier Worker started")
        logger.info(f"⏱️  Check interval: {self.check_interval}s")

        while running:
            try:
                with get_db_context() as db:
                    watcher = ConfigWatcher(db)

                    # Get active accounts
                    accounts = watcher.get_active_accounts()

                    if not accounts:
                        logger.warning("⚠️ No active accounts found")
                    else:
                        logger.info(f"📬 Processing {len(accounts)} account(s)")

                        for account in accounts:
                            try:
                                self.process_account(account, watcher)
                            except Exception as e:
                                logger.error(f"Error processing {account.email}: {e}")

            except Exception as e:
                logger.error(f"Worker loop error: {e}")

            # Sleep
            logger.debug(f"Sleeping for {self.check_interval}s...")
            time.sleep(self.check_interval)


def main():
    """Entry point"""
    import os

    check_interval = int(os.environ.get('CHECK_INTERVAL', '60'))

    orchestrator = WorkerOrchestrator(check_interval=check_interval)
    orchestrator.run()


if __name__ == '__main__':
    main()
