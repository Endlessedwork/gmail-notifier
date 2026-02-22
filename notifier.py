import imaplib
import email
from email.header import decode_header
import requests
import time
import os
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
CHAT_ID = os.environ.get('CHAT_ID', '')
IMAP_SERVER = os.environ.get('IMAP_SERVER', 'imap.gmail.com')
IMAP_PORT = int(os.environ.get('IMAP_PORT', '993'))
EMAIL_USER = os.environ.get('EMAIL_USER', '')
EMAIL_PASS = os.environ.get('EMAIL_PASS', '')
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL', '60'))  # วินาที
MAX_BODY_LENGTH = int(os.environ.get('MAX_BODY_LENGTH', '300'))  # ตัวอักษร

running = True

def signal_handler(sig, frame):
    global running
    logger.info("Shutting down gracefully...")
    running = False
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


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
    
    # ตัดให้สั้นลง
    body = body.strip()
    if len(body) > MAX_BODY_LENGTH:
        body = body[:MAX_BODY_LENGTH] + "..."
    
    return body


def escape_markdown(text):
    """Escape special characters สำหรับ Telegram MarkdownV2"""
    special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in special_chars:
        text = text.replace(char, f'\\{char}')
    return text


def send_telegram(subject, sender, date_str, body=""):
    """ส่งข้อความแจ้งเตือนไปยัง Telegram"""
    # ใช้ HTML parse mode แทน Markdown เพราะจัดการง่ายกว่า
    text = (
        f"📧 <b>New Email</b>\n\n"
        f"<b>From:</b> {sender}\n"
        f"<b>Subject:</b> {subject}\n"
        f"<b>Date:</b> {date_str}\n"
    )
    
    if body:
        # ตัด HTML tags ออก
        import re
        clean_body = re.sub(r'<[^>]+>', '', body)
        text += f"\n<b>Preview:</b>\n<pre>{clean_body[:MAX_BODY_LENGTH]}</pre>"
    
    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            json={
                'chat_id': CHAT_ID,
                'text': text,
                'parse_mode': 'HTML',
                'disable_web_page_preview': True
            },
            timeout=10
        )
        if resp.status_code == 200:
            logger.info(f"✅ Sent notification: {subject}")
        else:
            logger.error(f"❌ Telegram API error: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"❌ Failed to send Telegram message: {e}")


def check_emails():
    """ตรวจสอบอีเมลใหม่ที่ยังไม่ได้อ่าน"""
    mail = None
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select('INBOX')
        
        # ค้นหาอีเมลที่ยังไม่ได้อ่าน
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
                # ดึงข้อมูลอีเมลแบบ PEEK (ไม่เปลี่ยนสถานะ read)
                status, data = mail.fetch(email_id, '(BODY.PEEK[])')
                
                if status != 'OK':
                    continue
                
                msg = email.message_from_bytes(data[0][1])
                
                subject = decode_mime_header(msg['Subject'])
                sender = decode_mime_header(msg['From'])
                date_str = msg['Date'] or ''
                body = get_email_body(msg)
                
                send_telegram(subject, sender, date_str, body)
                
                # Mark as SEEN หลังส่งแจ้งเตือนแล้ว
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
    # ตรวจสอบ config
    if not all([BOT_TOKEN, CHAT_ID, EMAIL_USER, EMAIL_PASS]):
        logger.error("❌ Missing required environment variables!")
        logger.error("Required: BOT_TOKEN, CHAT_ID, EMAIL_USER, EMAIL_PASS")
        sys.exit(1)
    
    logger.info("🚀 Gmail-Telegram Notifier started")
    logger.info(f"📧 Monitoring: {EMAIL_USER}")
    logger.info(f"⏱️  Check interval: {CHECK_INTERVAL}s")
    
    # ส่งข้อความทดสอบ
    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            json={
                'chat_id': CHAT_ID,
                'text': '🟢 Gmail-Telegram Notifier is now running!\n'
                        f'Monitoring: {EMAIL_USER}\n'
                        f'Check interval: {CHECK_INTERVAL}s',
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
            check_emails()
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
        
        time.sleep(CHECK_INTERVAL)


if __name__ == '__main__':
    main()
