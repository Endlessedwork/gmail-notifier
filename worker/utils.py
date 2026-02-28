"""
Utility functions for worker
"""

import re
from email.header import decode_header
import logging

logger = logging.getLogger(__name__)


def decode_mime_header(header_value: str) -> str:
    """
    ถอดรหัส MIME header (รองรับภาษาไทยและภาษาอื่นๆ)

    Args:
        header_value: Raw header value

    Returns:
        Decoded string
    """
    if header_value is None:
        return ""

    try:
        decoded_parts = decode_header(header_value)
        result = []

        for part, charset in decoded_parts:
            if isinstance(part, bytes):
                result.append(part.decode(charset or 'utf-8', errors='replace'))
            else:
                result.append(part)

        return ''.join(result)
    except Exception as e:
        logger.error(f"Failed to decode header: {e}")
        return str(header_value)


def get_email_body(msg, max_length: int = 300) -> str:
    """
    ดึงเนื้อหาอีเมล (รองรับทั้ง text/plain และ text/html)

    Args:
        msg: Email message object
        max_length: Maximum body length

    Returns:
        Email body text
    """
    body = ""
    html_body = ""

    try:
        if msg.is_multipart():
            # หา text/plain ก่อน (prefer plain text)
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    try:
                        charset = part.get_content_charset() or 'utf-8'
                        body = part.get_payload(decode=True).decode(charset, errors='replace')
                        break
                    except Exception:
                        continue
                elif content_type == "text/html" and not html_body:
                    # เก็บ HTML ไว้เป็น fallback
                    try:
                        charset = part.get_content_charset() or 'utf-8'
                        html_body = part.get_payload(decode=True).decode(charset, errors='replace')
                    except Exception:
                        continue
        else:
            try:
                charset = msg.get_content_charset() or 'utf-8'
                payload = msg.get_payload(decode=True).decode(charset, errors='replace')
                content_type = msg.get_content_type()

                if content_type == "text/plain":
                    body = payload
                elif content_type == "text/html":
                    html_body = payload
            except Exception:
                body = "[ไม่สามารถอ่านเนื้อหาได้]"

        # ถ้าไม่มี text/plain ให้ใช้ HTML แล้วลบ tags
        if not body and html_body:
            body = clean_html_tags(html_body)

        body = body.strip()
        if max_length > 0 and len(body) > max_length:
            body = body[:max_length] + "..."

        return body
    except Exception as e:
        logger.error(f"Failed to extract email body: {e}")
        return "[ไม่สามารถอ่านเนื้อหาได้]"


def clean_html_tags(text: str) -> str:
    """
    ลบ HTML tags ออกจาก text

    Args:
        text: Text with HTML tags

    Returns:
        Clean text
    """
    return re.sub(r'<[^>]+>', '', text)


def match_filter(field_value: str, match_type: str, match_value: str) -> bool:
    """
    ตรวจสอบว่า field value ตรงกับ filter rule หรือไม่

    Args:
        field_value: ค่าที่จะเช็ค
        match_type: ประเภทการ match (contains, regex, equals)
        match_value: ค่าที่ต้องการ match

    Returns:
        True ถ้า match
    """
    try:
        if match_type == "equals":
            return field_value.lower() == match_value.lower()
        elif match_type == "regex":
            return bool(re.search(match_value, field_value, re.IGNORECASE))
        else:  # contains (default)
            return match_value.lower() in field_value.lower()
    except re.error as e:
        logger.error(f"Invalid regex pattern '{match_value}': {e}")
        # Fallback to contains
        return match_value.lower() in field_value.lower()
    except Exception as e:
        logger.error(f"Error matching filter: {e}")
        return False
