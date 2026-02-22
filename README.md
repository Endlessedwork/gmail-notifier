# 📧 Gmail-Telegram Notifier

แจ้งเตือนอีเมลใหม่จาก Gmail ไปยัง Telegram แบบ real-time

## ✨ Features

- ตรวจสอบอีเมลใหม่อัตโนมัติ
- รองรับภาษาไทยและ Unicode
- แสดง preview เนื้อหาอีเมล
- ส่งข้อความทดสอบตอนเริ่มทำงาน
- Graceful shutdown
- Auto-restart เมื่อเกิดข้อผิดพลาด

## 🔧 Setup

### 1. สร้าง Gmail App Password

1. ไปที่ https://myaccount.google.com/apppasswords
2. สร้าง App Password สำหรับ "Mail"
3. เก็บ password 16 ตัวที่ได้

> ⚠️ ต้องเปิด 2-Step Verification ก่อนถึงจะสร้าง App Password ได้

### 2. สร้าง Telegram Bot

1. คุยกับ [@BotFather](https://t.me/BotFather)
2. ส่ง `/newbot` → ตั้งชื่อ
3. เก็บ **Bot Token** ที่ได้
4. เปิดแชทกับ bot แล้วส่งข้อความอะไรก็ได้
5. เปิด `https://api.telegram.org/bot<TOKEN>/getUpdates` → หา `chat.id`

### 3. Deploy

#### Docker Compose (Local/Server)

```bash
# แก้ไขค่าใน docker-compose.yml ก่อน
docker-compose up -d
```

#### Easypanel

1. สร้าง App ใหม่ → เลือก Docker
2. ใส่ Dockerfile path
3. ตั้ง Environment Variables:
   - `BOT_TOKEN` = Bot token จาก BotFather
   - `CHAT_ID` = Chat ID ของคุณ
   - `EMAIL_USER` = อีเมล Gmail
   - `EMAIL_PASS` = App Password 16 ตัว
   - `CHECK_INTERVAL` = 60 (วินาที)
4. Deploy!

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| BOT_TOKEN | ✅ | - | Telegram Bot Token |
| CHAT_ID | ✅ | - | Telegram Chat ID |
| EMAIL_USER | ✅ | - | Gmail address |
| EMAIL_PASS | ✅ | - | Gmail App Password |
| IMAP_SERVER | ❌ | imap.gmail.com | IMAP server |
| IMAP_PORT | ❌ | 993 | IMAP port |
| CHECK_INTERVAL | ❌ | 60 | Check interval (seconds) |
| MAX_BODY_LENGTH | ❌ | 300 | Email preview length |

## 📝 Notes

- Script จะ mark email เป็น "read" หลังส่งแจ้งเตือนแล้ว
- ใช้ `BODY.PEEK[]` ในการอ่าน เพื่อไม่ให้เปลี่ยนสถานะก่อนส่งแจ้งเตือนสำเร็จ
- รองรับ multiple email accounts โดยรัน container หลายตัว
