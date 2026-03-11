"""
Email checking logic using IMAP
"""

import imaplib
import email
from typing import List, Dict, Optional
from datetime import datetime
import logging

from worker.utils import decode_mime_header, get_email_body
from backend.models import GmailAccount, NotificationLog
from backend.core.security import decrypt_password
from backend.core.database import get_db_context

logger = logging.getLogger(__name__)


class EmailChecker:
    """ตรวจสอบอีเมลใหม่จาก Gmail accounts"""

    def __init__(self, account: GmailAccount, max_body_length: int = 300):
        """
        Args:
            account: GmailAccount instance
            max_body_length: Maximum email body length
        """
        self.account = account
        self.max_body_length = max_body_length
        self.mail: Optional[imaplib.IMAP4_SSL] = None

    def connect(self) -> bool:
        """
        เชื่อมต่อกับ IMAP server

        Returns:
            True ถ้าเชื่อมต่อสำเร็จ
        """
        try:
            password = decrypt_password(self.account.password).replace(" ", "")  # ลบช่องว่าง
            self.mail = imaplib.IMAP4_SSL(
                self.account.imap_server,
                self.account.imap_port
            )
            self.mail.login(self.account.email, password)
            logger.info(f"✅ Connected to {self.account.email}")
            return True
        except imaplib.IMAP4.error as e:
            logger.error(f"❌ IMAP error for {self.account.email}: {type(e).__name__}: {e}")
            return False
        except Exception as e:
            err_msg = str(e) or repr(e) or type(e).__name__
            logger.error(f"❌ Connection error for {self.account.email}: {type(e).__name__}: {err_msg}")
            return False

    def disconnect(self):
        """ตัดการเชื่อมต่อ"""
        if self.mail:
            try:
                self.mail.close()
                self.mail.logout()
                logger.debug(f"Disconnected from {self.account.email}")
            except Exception as e:
                logger.debug(f"Error disconnecting: {e}")

    def check_new_emails(self) -> List[Dict]:
        """
        ตรวจสอบอีเมลใหม่ที่ยังไม่ได้อ่าน

        ถ้า account มี last_checked_at แล้ว จะดึงเฉพาะอีเมลที่มาหลังจากเวลานั้น
        ถ้ายังไม่เคย check (ครั้งแรก) จะดึงเฉพาะอีเมลวันนี้เท่านั้น

        Returns:
            List of email dictionaries
        """
        if not self.mail:
            logger.error("Not connected to IMAP server")
            return []

        try:
            self.mail.select('INBOX')

            # สร้าง search criteria
            if self.account.last_checked_at:
                # มี last_checked_at แล้ว: ดึงเฉพาะอีเมลหลังจากเวลานั้น
                check_date = self.account.last_checked_at.strftime('%d-%b-%Y')
                search_criteria = f'(UNSEEN SINCE {check_date})'
                logger.debug(f"Searching emails SINCE {check_date}")
            else:
                # ครั้งแรก: เช็คตาม sync_mode ที่ user เลือก
                sync_mode = getattr(self.account, 'sync_mode', 'new_only')

                if sync_mode == 'all_unseen':
                    # Sync อีเมล UNSEEN ทั้งหมด
                    search_criteria = '(UNSEEN)'
                    logger.info(f"First check - syncing ALL UNSEEN emails (mode: all_unseen)")
                elif sync_mode == 'today':
                    # ดึงเฉพาะอีเมลวันนี้เท่านั้น
                    today = datetime.now().strftime('%d-%b-%Y')
                    search_criteria = f'(UNSEEN ON {today})'
                    logger.info(f"First check - searching emails ON {today} only (mode: today)")
                else:  # 'new_only'
                    # ไม่ดึงเลย - รอแค่อีเมลใหม่ที่จะมาหลังจากนี้
                    search_criteria = None
                    logger.info(f"First check - skipping (mode: new_only, waiting for new emails only)")

            # ถ้า search_criteria = None (mode: new_only ครั้งแรก) ให้ข้ามไป
            if search_criteria is None:
                # อัพเดท last_checked_at แล้วข้ามไป (ครั้งหน้าจะดึงแค่อีเมลใหม่)
                return []

            status, messages = self.mail.search(None, search_criteria)

            if status != 'OK':
                logger.error(f"Failed to search emails for {self.account.email}")
                return []

            email_ids = messages[0].split()

            if not email_ids:
                logger.debug(f"No new emails for {self.account.email}")
                return []

            logger.info(f"📬 Found {len(email_ids)} new email(s) for {self.account.email}")

            emails = []
            for email_id in email_ids:
                try:
                    email_data = self._fetch_email(email_id)
                    if email_data and not self._is_already_processed(email_data):
                        emails.append(email_data)
                    elif email_data:
                        logger.debug(f"Skipping already processed email: {email_data['subject'][:50]}")
                except Exception as e:
                    logger.error(f"Error processing email {email_id}: {e}")
                    continue

            logger.info(f"📧 {len(emails)} new unique email(s) (filtered from {len(email_ids)} UNSEEN)")
            return emails

        except Exception as e:
            logger.error(f"Error checking emails for {self.account.email}: {e}")
            return []

    def _fetch_email(self, email_id: bytes) -> Optional[Dict]:
        """
        ดึงข้อมูลอีเมล

        Args:
            email_id: Email ID

        Returns:
            Email data dictionary
        """
        try:
            status, data = self.mail.fetch(email_id, '(BODY.PEEK[])')

            if status != 'OK':
                return None

            msg = email.message_from_bytes(data[0][1])

            subject = decode_mime_header(msg['Subject'])
            sender = decode_mime_header(msg['From'])
            date_str = msg['Date'] or ''
            body = get_email_body(msg, self.max_body_length)

            logger.debug(f"📧 Email parsed - Subject: {subject[:50]}, From: {sender[:50]}, Body length: {len(body)}")

            return {
                'id': email_id,
                'subject': subject,
                'from': sender,
                'date': date_str,
                'body': body,
                'account_id': self.account.id
            }

        except Exception as e:
            logger.error(f"Failed to fetch email {email_id}: {e}")
            return None

    def _is_already_processed(self, email_data: Dict) -> bool:
        """
        เช็คว่าอีเมลนี้เคยถูกประมวลผล (log ไว้) แล้วหรือยัง

        Args:
            email_data: Email data dictionary

        Returns:
            True ถ้าเคยประมวลผลแล้ว
        """
        try:
            with get_db_context() as db:
                # เช็คว่ามี log ของอีเมลนี้หรือยัง (เช็คจาก subject + sender + account_id)
                exists = db.query(NotificationLog).filter(
                    NotificationLog.gmail_account_id == email_data['account_id'],
                    NotificationLog.email_subject == email_data['subject'],
                    NotificationLog.email_from == email_data['from'],
                    NotificationLog.email_date == email_data['date']
                ).first() is not None

                return exists
        except Exception as e:
            logger.error(f"Error checking if email already processed: {e}")
            # ถ้า error ให้ถือว่ายังไม่เคยประมวลผล (ดึงมาดีกว่าพลาด)
            return False

    def mark_as_seen(self, email_id: bytes):
        """
        Mark email เป็น SEEN

        Args:
            email_id: Email ID
        """
        try:
            self.mail.store(email_id, '+FLAGS', '\\Seen')
            logger.debug(f"Marked email {email_id} as seen")
        except Exception as e:
            logger.error(f"Failed to mark email as seen: {e}")

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
