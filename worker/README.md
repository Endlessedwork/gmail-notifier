# Gmail Notifier Worker

Worker service สำหรับตรวจสอบอีเมลจาก Gmail accounts และส่ง notifications ผ่านช่องทางต่างๆ

## Features

- ✅ รองรับหลาย Gmail accounts พร้อมกัน
- ✅ Database-driven configuration (SQLite)
- ✅ Multi-channel notifications (Telegram, LINE, Webhook)
- ✅ Filter rules พร้อม priority
- ✅ Notification logging
- ✅ Graceful shutdown
- ✅ Auto-reload เมื่อ config เปลี่ยน

## Architecture

```
worker/
├── __init__.py           # Package initialization
├── main.py              # Main orchestrator & entry point
├── email_checker.py     # IMAP email checking logic
├── notification_sender.py  # Multi-channel notification sender
├── config_watcher.py    # Database config watcher
├── utils.py            # Shared utilities
└── README.md           # Documentation
```

## Modules

### main.py
- `WorkerOrchestrator`: Main orchestration logic
- รัน main loop เพื่อ check emails ทุกๆ interval
- ประมวลผลหลาย accounts พร้อมกัน

### email_checker.py
- `EmailChecker`: IMAP email checking
- เชื่อมต่อ Gmail IMAP
- ดึงอีเมลใหม่ (UNSEEN)
- Mark as seen หลังประมวลผล

### notification_sender.py
- `NotificationSender`: Multi-channel sender
- รองรับ Telegram, LINE, Webhook
- Parse channel config จาก JSON
- Error handling & logging

### config_watcher.py
- `ConfigWatcher`: Database configuration monitoring
- ดึง active accounts
- ดึง filter rules (sorted by priority)
- ตรวจสอบ config changes

### utils.py
- Utility functions:
  - `decode_mime_header()`: Decode email headers
  - `get_email_body()`: Extract email body
  - `clean_html_tags()`: Remove HTML tags
  - `match_filter()`: Filter matching logic

## Usage

### วิธีรัน

```bash
# ตั้งค่า environment variable (optional)
export CHECK_INTERVAL=60  # seconds (default: 60)

# รัน worker
python -m worker.main
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECK_INTERVAL` | `60` | Interval between email checks (seconds) |

## Database Models

Worker ใช้ models จาก `backend/models/`:

- `GmailAccount`: Gmail account credentials
- `NotificationChannel`: Notification channel configs
- `FilterRule`: Email filter rules
- `NotificationLog`: Notification history

## Filter Rules

Filter rules ทำงานดังนี้:

1. เรียงตาม priority (ต่ำกว่า = สำคัญกว่า)
2. Match first rule ที่ตรงเงื่อนไข
3. ส่ง notification ไปตาม channel ของ rule นั้น

### Match Types

- `contains`: ตรวจสอบว่ามี keyword (case-insensitive)
- `regex`: ใช้ regex pattern
- `equals`: ตรงกันทุกตัวอักษร (case-insensitive)

### Fields

- `from`: ผู้ส่งอีเมล
- `subject`: หัวข้ออีเมล
- `body`: เนื้อหาอีเมล

## Notification Channels

### Telegram

Config:
```json
{
  "bot_token": "YOUR_BOT_TOKEN",
  "chat_id": "YOUR_CHAT_ID"
}
```

### LINE

Config:
```json
{
  "access_token": "YOUR_LINE_NOTIFY_TOKEN"
}
```

### Webhook

Config:
```json
{
  "url": "https://your-webhook.com/endpoint",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  }
}
```

## Error Handling

- ✅ IMAP connection errors → log & skip
- ✅ Notification send failures → log to database
- ✅ Invalid configs → log warning & skip
- ✅ Database errors → rollback & retry

## Logging

Log levels:
- `INFO`: Normal operations
- `WARNING`: Recoverable issues
- `ERROR`: Serious errors
- `DEBUG`: Detailed debugging info

## Security

- ⚠️ Database passwords ควร encrypt ก่อนเก็บ
- ⚠️ Webhook configs อาจมี sensitive data
- ⚠️ ใช้ HTTPS สำหรับ webhooks

## Future Improvements

- [ ] Async email checking (asyncio)
- [ ] Retry mechanism สำหรับ failed notifications
- [ ] Rate limiting สำหรับ notifications
- [ ] Email body caching
- [ ] Hot reload configuration
