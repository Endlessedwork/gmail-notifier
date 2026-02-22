# Gmail Notifier Management Dashboard

ระบบแจ้งเตือนอีเมลจาก Gmail ไปยัง Telegram พร้อม Web UI สำหรับจัดการ

## Features

- ✅ รับการแจ้งเตือนอีเมลจาก Gmail แบบ Real-time
- ✅ ส่งข้อความไปยัง Telegram Channels ต่างๆ
- ✅ กรองอีเมลด้วย Filter Rules (From, Subject)
- ✅ Web UI สำหรับจัดการ Gmail Accounts, Telegram Channels, Filter Rules
- ✅ Dashboard แสดงสถิติและ Logs
- ✅ Hot-reload configuration (ไม่ต้อง restart)

## Tech Stack

**Backend:**
- Python 3.11
- IMAPlib (Gmail IMAP)
- Telegram Bot API

**Frontend:**
- React 18 + TypeScript
- Vite
- TanStack Query
- Tailwind CSS + shadcn/ui

**Deployment:**
- Docker + Docker Compose
- Nginx (serve frontend)
- Supervisor (process management)

## Deployment on Easypanel

1. **Create New Service:**
   - Service Type: Docker
   - Repository: <your-git-repo>
   - Branch: main

2. **Build Settings:**
   - Dockerfile Path: `./Dockerfile`
   - Build Context: `.`

3. **Port Mapping:**
   - Container Port: 80
   - Public Port: 80 (หรือ custom)

4. **Volumes:**
   - `./config.json` → `/app/config.json`
   - `./logs` → `/app/logs`

5. **Environment Variables:**
   - `TZ=Asia/Bangkok`

6. **Deploy!**

## Configuration

สร้างไฟล์ `config.json`:

```json
{
  "telegram": {
    "bot_token": "YOUR_BOT_TOKEN"
  },
  "credentials": [
    {
      "email": "your-email@gmail.com",
      "password": "your-app-password"
    }
  ],
  "rules": [
    {
      "id": "rule_1",
      "name": "All Emails",
      "field": "from",
      "match": "*",
      "chat_id": "-1001234567890",
      "priority": 99,
      "enabled": true
    }
  ],
  "settings": {
    "imap_server": "imap.gmail.com",
    "imap_port": 993,
    "check_interval": 60,
    "max_body_length": 300,
    "default_chat_id": "-1001234567890",
    "log_level": "INFO"
  }
}
```

## License

MIT
