"""
Multi-channel notification sender
รองรับ Telegram, LINE, Webhook
"""

import json
import logging
import requests
from typing import Dict, Optional
from datetime import datetime

from backend.models import NotificationChannel
from worker.utils import clean_html_tags

logger = logging.getLogger(__name__)


class NotificationSender:
    """ส่ง notifications ผ่านช่องทางต่างๆ"""

    def __init__(self, channel: NotificationChannel):
        """
        Args:
            channel: NotificationChannel instance
        """
        self.channel = channel
        self.config = self._parse_config()

    def _parse_config(self) -> Dict:
        """Parse JSON config"""
        try:
            return json.loads(self.channel.config)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid config JSON for channel {self.channel.name}: {e}")
            return {}

    def send(
        self,
        subject: str,
        sender: str,
        date_str: str,
        body: str = "",
        rule_name: Optional[str] = None
    ) -> bool:
        """
        ส่ง notification

        Args:
            subject: Email subject
            sender: Email sender
            date_str: Email date
            body: Email body preview
            rule_name: Filter rule name (optional)

        Returns:
            True ถ้าส่งสำเร็จ
        """
        if not self.channel.enabled:
            logger.warning(f"Channel {self.channel.name} is disabled")
            return False

        try:
            if self.channel.type == "telegram":
                return self._send_telegram(subject, sender, date_str, body, rule_name)
            elif self.channel.type == "line":
                return self._send_line(subject, sender, date_str, body, rule_name)
            elif self.channel.type == "webhook":
                return self._send_webhook(subject, sender, date_str, body, rule_name)
            else:
                logger.error(f"Unknown channel type: {self.channel.type}")
                return False
        except Exception as e:
            logger.error(f"Failed to send notification via {self.channel.type}: {e}")
            return False

    def _send_telegram(
        self,
        subject: str,
        sender: str,
        date_str: str,
        body: str,
        rule_name: Optional[str]
    ) -> bool:
        """ส่ง notification ผ่าน Telegram"""
        bot_token = self.config.get('bot_token')
        chat_id = self.config.get('chat_id')

        if not bot_token or not chat_id:
            logger.error(f"Missing bot_token or chat_id for {self.channel.name}")
            return False

        text = f"📧 <b>New Email</b>\n\n"

        if rule_name:
            text += f"🏷️ <b>Filter:</b> {rule_name}\n"

        text += (
            f"<b>From:</b> {sender}\n"
            f"<b>Subject:</b> {subject}\n"
            f"<b>Date:</b> {date_str}\n"
        )

        if body:
            clean_body = clean_html_tags(body)
            text += f"\n<b>Preview:</b>\n<pre>{clean_body}</pre>"

        try:
            resp = requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={
                    'chat_id': chat_id,
                    'text': text,
                    'parse_mode': 'HTML',
                    'disable_web_page_preview': True
                },
                timeout=10
            )

            if resp.status_code == 200:
                logger.info(f"✅ Sent to Telegram {chat_id}: {subject}")
                return True
            else:
                logger.error(f"❌ Telegram API error: {resp.status_code} - {resp.text}")
                return False

        except requests.RequestException as e:
            logger.error(f"❌ Telegram request failed: {e}")
            return False

    def _send_line(
        self,
        subject: str,
        sender: str,
        date_str: str,
        body: str,
        rule_name: Optional[str]
    ) -> bool:
        """ส่ง notification ผ่าน LINE Notify"""
        access_token = self.config.get('access_token')

        if not access_token:
            logger.error(f"Missing access_token for {self.channel.name}")
            return False

        message = f"📧 New Email\n\n"

        if rule_name:
            message += f"🏷️ Filter: {rule_name}\n"

        message += (
            f"From: {sender}\n"
            f"Subject: {subject}\n"
            f"Date: {date_str}\n"
        )

        if body:
            clean_body = clean_html_tags(body)
            message += f"\nPreview:\n{clean_body}"

        try:
            resp = requests.post(
                'https://notify-api.line.me/api/notify',
                headers={
                    'Authorization': f'Bearer {access_token}',
                },
                data={
                    'message': message
                },
                timeout=10
            )

            if resp.status_code == 200:
                logger.info(f"✅ Sent to LINE: {subject}")
                return True
            else:
                logger.error(f"❌ LINE API error: {resp.status_code} - {resp.text}")
                return False

        except requests.RequestException as e:
            logger.error(f"❌ LINE request failed: {e}")
            return False

    def _send_webhook(
        self,
        subject: str,
        sender: str,
        date_str: str,
        body: str,
        rule_name: Optional[str]
    ) -> bool:
        """ส่ง notification ผ่าน Webhook"""
        url = self.config.get('url')
        method = self.config.get('method', 'POST').upper()
        headers = self.config.get('headers', {})

        if not url:
            logger.error(f"Missing url for {self.channel.name}")
            return False

        payload = {
            'subject': subject,
            'from': sender,
            'date': date_str,
            'body': body,
            'rule_name': rule_name,
            'timestamp': datetime.utcnow().isoformat()
        }

        try:
            if method == 'POST':
                resp = requests.post(url, json=payload, headers=headers, timeout=10)
            elif method == 'GET':
                resp = requests.get(url, params=payload, headers=headers, timeout=10)
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return False

            if resp.status_code in [200, 201, 202, 204]:
                logger.info(f"✅ Sent to webhook {url}: {subject}")
                return True
            else:
                logger.error(f"❌ Webhook error: {resp.status_code} - {resp.text}")
                return False

        except requests.RequestException as e:
            logger.error(f"❌ Webhook request failed: {e}")
            return False
