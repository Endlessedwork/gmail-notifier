import imaplib
import email
from email.header import decode_header
import requests
import time
import os
import json
import re
import logging
import signal
import sys

# ตั้งค่า logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ดึงค่าจาก environment variables
BOT_TOKEN = os.environ.get('BOT_TOKEN', '')
CHAT_ID = os.environ.get('CHAT_ID', '')  # default chat id
IMAP_SERVER = os.environ.get('IMAP_SERVER', 'imap.gmail.com')
IMAP_PORT = int(os.environ.get('IMAP_PORT', '993'))
EMAIL_USER = os.environ.get('EMAIL_USER', '')
EMAIL_PASS = os.environ.get('EMAIL_PASS', '')
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL', '60'))
MAX_BODY_LENGTH = int(os.environ.get('MAX_BODY_LENGTH', '300'))

# =============================================
# FILTER RULES - ตั้งค่าผ่าน Environment Variable
# =============================================
# รูปแบบ JSON array:
# FILTER_RULES=[
#   {"name": "ชื่อ rule", "field": "from|subject", "match": "keyword", "chat_id": "กลุ่ม/แชท id"},
#   ...
# ]
#
# ตัวอย่าง:
# FILTER_RULES=[{"name":"Banking","field":"from","match":"@scb.co.th","chat_id":"-100123456"},{"name":"Invoice","field":"subject","match":"invoice","chat_id":"-100789012"}]
#
# field: "from" = เช็คผู้ส่ง, "subject" = เช็คหัวข้อ
# match: keyword ที่ต้องการ (case-insensitive, รองรับ regex)
# chat_id: Telegram chat/group ID ที่จะส่งไป
#
# ถ้าไม่ตรง rule ไหนเลย จะส่งไป CHAT_ID (default)
# =============================================

FILTER_RULES_RAW = os.environ.get('FILTER_RULES', '[]')

running = True


def signal_handler(sig, frame):
    global running
    logger.info("Shutting down gracefully...")
    running = False
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def load_filter_rules():
    """โหลด filter rules จาก ENV"""
    try:
        rules = json.loads(FILTER_RULES_RAW)
        if not isinstance(rules, list):
            logger.error("FILTER_RULES must be a JSON array")
            return []
        logger.info(f"📋 Loaded {len(rules)} filter rule(s)")
        for r in rules:
            logger.info(f"   → {r.get('name', 'unnamed')}: {r.get('field')} contains '{r.get('match')}' → chat_id: {r.get('chat_id')}")
        return rules
    except json.JSONDecodeError as e:
        logger.error(f"❌ Invalid FILTER_RULES JSON: {e}")
        return []


def decode_mime_header(header_value):
    """ถอดรหัส MIME header (รองรับภาษาไทยและภาษาอื่นๆ)"""
    if header_value is None:
        return ""
    decoded_parts = decode_header(header_value)
    result = []
    for part, charset in decoded_parts:
        if isinstance(part, bytes):
            result.append(part.decode(charset or 'utf-8', errors='replace'))
        else:
            result.append(part)
    return ''.join(result)


def get_email_body(msg):
    """ดึงเนื้อหาอีเมล"""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == "text/plain":
                try:
                    charset = part.get_content_charset() or 'utf-8'
                    body = part.get_payload(decode=True).decode(charset, errors='replace')
                    break
                except Exception:
                    continue
    else:
        try:
            charset = msg.get_content_charset() or 'utf-8'
            body = msg.get_payload(decode=True).decode(charset, errors='replace')
        except Exception:
            body = "[ไม่สามารถอ่านเนื้อหาได้]"

    body = body.strip()
    if len(body) > MAX_BODY_LENGTH:
        body = body[:MAX_BODY_LENGTH] + "..."

    return body


def send_telegram(chat_id, subject, sender, date_str, body="", rule_name=None):
    """ส่งข้อความแจ้งเตือนไปยัง Telegram"""
    text = f"📧 <b>New Email</b>\n\n"

    if rule_name:
        text += f"🏷️ <b>Filter:</b> {rule_name}\n"

    text += (
        f"<b>From:</b> {sender}\n"
        f"<b>Subject:</b> {subject}\n"
        f"<b>Date:</b> {date_str}\n"
    )

    if body:
        clean_body = re.sub(r'<[^>]+>', '', body)
        text += f"\n<b>Preview:</b>\n<pre>{clean_body[:MAX_BODY_LENGTH]}</pre>"

    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': text,
                'parse_mode': 'HTML',
                'disable_web_page_preview': True
            },
            timeout=10
        )
        if resp.status_code == 200:
            logger.info(f"✅ Sent to {chat_id}: {subject}")
        else:
            logger.error(f"❌ Telegram API error: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"❌ Failed to send Telegram message: {e}")


def find_matching_rule(subject, sender, rules):
    """หา rule ที่ match และคืน chat_id + rule name"""
    for rule in rules:
        field = rule.get('field', '').lower()
        match = rule.get('match', '')
        target_chat_id = rule.get('chat_id', '')
        rule_name = rule.get('name', 'unnamed')

        if not match or not target_chat_id:
            continue

        check_value = ''
        if field == 'from':
            check_value = sender
        elif field == 'subject':
            check_value = subject

        try:
            if re.search(match, check_value, re.IGNORECASE):
                return target_chat_id, rule_name
        except re.error:
            if match.lower() in check_value.lower():
                return target_chat_id, rule_name

    return CHAT_ID, None


def check_emails(rules):
    """ตรวจสอบอีเมลใหม่ที่ยังไม่ได้อ่าน"""
    mail = None
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select('INBOX')

        status, messages = mail.search(None, 'UNSEEN')

        if status != 'OK':
            logger.error("Failed to search emails")
            return

        email_ids = messages[0].split()

        if not email_ids:
            logger.debug("No new emails")
            return

        logger.info(f"📬 Found {len(email_ids)} new email(s)")

        for email_id in email_ids:
            try:
                status, data = mail.fetch(email_id, '(BODY.PEEK[])')

                if status != 'OK':
                    continue

                msg = email.message_from_bytes(data[0][1])

                subject = decode_mime_header(msg['Subject'])
                sender = decode_mime_header(msg['From'])
                date_str = msg['Date'] or ''
                body = get_email_body(msg)

                # หา chat_id ที่ตรงกับ filter rule
                target_chat_id, rule_name = find_matching_rule(subject, sender, rules)

                send_telegram(target_chat_id, subject, sender, date_str, body, rule_name)

                # Mark as SEEN
                mail.store(email_id, '+FLAGS', '\\Seen')

            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue

    except imaplib.IMAP4.error as e:
        logger.error(f"IMAP error: {e}")
    except Exception as e:
        logger.error(f"Error checking emails: {e}")
    finally:
        if mail:
            try:
                mail.close()
                mail.logout()
            except Exception:
                pass


def main():
    """Main loop"""
    if not all([BOT_TOKEN, CHAT_ID, EMAIL_USER, EMAIL_PASS]):
        logger.error("❌ Missing required environment variables!")
        logger.error("Required: BOT_TOKEN, CHAT_ID, EMAIL_USER, EMAIL_PASS")
        sys.exit(1)

    # โหลด filter rules
    rules = load_filter_rules()

    logger.info("🚀 Gmail-Telegram Notifier started")
    logger.info(f"📧 Monitoring: {EMAIL_USER}")
    logger.info(f"⏱️  Check interval: {CHECK_INTERVAL}s")
    logger.info(f"📋 Filter rules: {len(rules)}")

    # ส่งข้อความทดสอบ
    try:
        rules_text = ""
        if rules:
            rules_text = "\n\n<b>📋 Active Filter Rules:</b>\n"
            for i, r in enumerate(rules, 1):
                rules_text += f"{i}. <b>{r.get('name', 'unnamed')}</b>: {r.get('field')} = \"{r.get('match')}\" → {r.get('chat_id')}\n"
        else:
            rules_text = "\n\n📋 No filter rules (all emails → default chat)"

        resp = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            json={
                'chat_id': CHAT_ID,
                'text': f'🟢 Gmail-Telegram Notifier is now running!\n'
                        f'Monitoring: {EMAIL_USER}\n'
                        f'Check interval: {CHECK_INTERVAL}s'
                        f'{rules_text}',
                'parse_mode': 'HTML'
            },
            timeout=10
        )
        if resp.status_code == 200:
            logger.info("✅ Startup notification sent")
        else:
            logger.warning(f"⚠️ Could not send startup notification: {resp.text}")
    except Exception as e:
        logger.warning(f"⚠️ Could not send startup notification: {e}")

    # Main loop
    while running:
        try:
            check_emails(rules)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")

        time.sleep(CHECK_INTERVAL)


if __name__ == '__main__':
    main()
