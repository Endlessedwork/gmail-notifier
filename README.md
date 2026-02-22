# 📧 Gmail Notifier

ระบบแจ้งเตือนอีเมลจาก Gmail ไปยัง Telegram, LINE, และ Webhook โดยอัตโนมัติ พร้อม Web UI สำหรับจัดการ

## ✨ Features

- ✅ **หลาย Gmail Accounts** - รองรับหลายบัญชีพร้อมกัน
- ✅ **หลาย Notification Channels** - Telegram, LINE Notify, Webhook
- ✅ **Filter Rules** - กรองอีเมลตาม from/subject/body ด้วย regex
- ✅ **Priority-Based Matching** - กำหนดลำดับความสำคัญของ rules
- ✅ **Web Dashboard** - จัดการผ่าน Web UI (React)
- ✅ **Real-time Logs** - ดู notification history แบบ real-time
- ✅ **Hot-Reload** - เปลี่ยน config ไม่ต้อง restart
- ✅ **Docker Ready** - Deploy ง่ายด้วย Docker Compose

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Container                  │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Nginx   │→ │ FastAPI  │  │  Worker   │ │
│  │ :80     │  │ :8000    │  │ (Python)  │ │
│  └─────────┘  └────┬─────┘  └─────┬─────┘ │
│                    │               │        │
│              ┌─────▼───────────────▼─────┐ │
│              │   SQLite Database         │ │
│              └───────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Components:**
- **Nginx**: Serve frontend + proxy API requests
- **FastAPI**: REST API backend (Python)
- **Worker**: Background email checker (multi-account)
- **SQLite**: Database (accounts, channels, rules, logs)
- **React**: Frontend UI (Vite + TypeScript + shadcn/ui)

## 📋 Prerequisites

- Docker & Docker Compose
- หรือ Python 3.11+ และ Node.js 18+ (สำหรับ development)

## 🚀 Quick Start (Docker)

### 1. Clone Repository

```bash
git clone https://github.com/Endlessedwork/gmail-notifier.git
cd gmail-notifier
```

### 2. สร้าง Environment Variables

```bash
cp .env.example .env
```

แก้ไข `.env`:
```bash
# สร้าง encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# ใส่ใน .env
ENCRYPTION_KEY=<generated_key>
```

### 3. Build และ Run

```bash
docker-compose up -d --build
```

### 4. Initialize Database

```bash
docker exec -it gmail-notifier python -c "from backend.core.database import init_db; init_db()"
```

### 5. เข้าใช้งาน

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## 📱 การใช้งาน

### 1. เพิ่ม Gmail Account

1. เปิด Web UI → **Gmail Accounts**
2. คลิก **Add Account**
3. กรอก:
   - Email: `your-email@gmail.com`
   - App Password: [สร้างจาก Google](https://myaccount.google.com/apppasswords)
4. บันทึก

### 2. เพิ่ม Notification Channel

**Telegram:**
1. Web UI → **Notification Channels** → **Add Channel**
2. เลือก Type: `Telegram`
3. กรอก:
   - Name: `My Telegram`
   - Bot Token: `123456:ABC...` (จาก [@BotFather](https://t.me/BotFather))
   - Chat ID: `-1001234567890` (จาก [@getidsbot](https://t.me/getidsbot))
4. บันทึก

**LINE Notify:**
1. Type: `LINE`
2. [สร้าง Token](https://notify-bot.line.me/my/)
3. กรอก Access Token

**Webhook:**
1. Type: `Webhook`
2. กรอก URL และ Method (POST/GET)

### 3. สร้าง Filter Rule

1. Web UI → **Filter Rules** → **Add Rule**
2. กรอก:
   - Gmail Account: เลือก account
   - Rule Name: `Banking Alerts`
   - Field: `from` (หรือ `subject`, `body`)
   - Match Type: `contains` (หรือ `regex`, `equals`)
   - Match Value: `bank.com`
   - Channel: เลือก notification channel
   - Priority: `10` (เลขน้อย = ลำดับสูง)
3. บันทึก

### 4. ดู Logs

Web UI → **Dashboard** → Recent Logs

## 🛠️ Development

### Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Frontend dependencies
cd frontend
npm install

# 3. Initialize database
sqlite3 data/data.db < migrations/001_init.sql
```

### Run Services (3 terminals)

```bash
# Terminal 1: Backend API
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Worker
python -m worker.main

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Access

- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
gmail-notifier/
├── backend/                 # FastAPI Backend
│   ├── core/               # Database, Config, Security
│   ├── models/             # SQLAlchemy Models
│   ├── schemas/            # Pydantic Schemas
│   ├── services/           # Business Logic
│   ├── routes/             # API Endpoints
│   └── main.py             # FastAPI App
│
├── worker/                  # Background Worker
│   ├── main.py             # Orchestrator
│   ├── email_checker.py    # IMAP Logic
│   ├── notification_sender.py  # Send Notifications
│   └── config_watcher.py   # Hot-Reload Handler
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── api/            # API Clients
│   │   ├── components/     # React Components
│   │   ├── hooks/          # React Query Hooks
│   │   └── types/          # TypeScript Types
│   └── package.json
│
├── docker/
│   ├── nginx.conf          # Nginx Configuration
│   └── supervisord.conf    # Process Manager
│
├── migrations/
│   └── 001_init.sql        # Database Schema
│
├── data/                    # Runtime Data (gitignored)
│   └── data.db             # SQLite Database
│
├── logs/                    # Application Logs (gitignored)
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

## 🗄️ Database Schema

**5 Tables:**
- `gmail_accounts` - Gmail account configs
- `notification_channels` - Telegram/LINE/Webhook configs
- `filter_rules` - Email filtering rules
- `notification_logs` - Notification history
- `config_settings` - System settings (key-value)

## 🔧 Configuration

### Environment Variables

```bash
# Encryption (Required)
ENCRYPTION_KEY=your-fernet-key-here

# Database
DATABASE_URL=sqlite:///app/data/data.db

# Worker Settings
CHECK_INTERVAL=60          # Check emails every N seconds
MAX_BODY_LENGTH=300       # Email preview length

# Timezone
TZ=Asia/Bangkok
```

### Gmail App Password

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. ใช้รหัส 16 หลักที่ได้

### Telegram Bot Setup

1. สร้าง bot กับ [@BotFather](https://t.me/BotFather)
2. ใช้คำสั่ง `/newbot` และตั้งชื่อ
3. คัดลอก Bot Token
4. เพิ่ม bot เข้า group/channel
5. หา Chat ID จาก [@getidsbot](https://t.me/getidsbot)

## 📊 API Endpoints

**Base URL:** `/api/v1`

```
# Gmail Accounts
GET    /gmail-accounts           # List accounts
POST   /gmail-accounts           # Create account
GET    /gmail-accounts/{id}      # Get account
PUT    /gmail-accounts/{id}      # Update account
DELETE /gmail-accounts/{id}      # Delete account

# Notification Channels
GET    /notification-channels    # List channels
POST   /notification-channels    # Create channel
GET    /notification-channels/{id}
PUT    /notification-channels/{id}
DELETE /notification-channels/{id}

# Filter Rules
GET    /filter-rules             # List rules
POST   /filter-rules             # Create rule
GET    /filter-rules/{id}
PUT    /filter-rules/{id}
DELETE /filter-rules/{id}

# Notification Logs
GET    /notification-logs        # List logs (pagination)
GET    /notification-logs/stats  # Statistics

# Config Settings
GET    /config-settings          # List settings
PUT    /config-settings/{key}    # Update setting
```

**API Documentation:** http://localhost:8000/docs (Swagger UI)

## 🐛 Troubleshooting

### Database Errors

```bash
# Reset database
rm data/data.db
sqlite3 data/data.db < migrations/001_init.sql
```

### Gmail Connection Failed

- ตรวจสอบ App Password ถูกต้อง
- Enable "Less secure app access" (ถ้าใช้ personal Gmail)
- ตรวจสอบ IMAP enabled: Settings → Forwarding and POP/IMAP

### Telegram Notifications Not Sent

- ตรวจสอบ Bot Token ถูกต้อง
- Bot ต้องเป็นสมาชิกใน group/channel
- Chat ID ต้องขึ้นต้นด้วย `-` (สำหรับ groups)

### Worker Not Running

```bash
# Check logs
docker logs gmail-notifier

# หรือ
tail -f logs/worker.log
```

## 🔒 Security

- ✅ Password encryption ด้วย Fernet (symmetric)
- ✅ Input validation ด้วย Pydantic
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ CORS middleware
- ⚠️ สำหรับ production ควรใช้ HTTPS
- ⚠️ ตั้ง `ENCRYPTION_KEY` ที่แข็งแรงและเก็บเป็นความลับ

## 📝 License

MIT License

## 🤝 Contributing

Pull requests are welcome!

## 👨‍💻 Author

Created with ❤️ using Claude Code

---

## 📚 Additional Documentation

- [Backend API Documentation](backend/README.md)
- [Worker Documentation](worker/README.md)
- [Frontend API Integration](frontend/API_INTEGRATION.md)
- [Deployment Guide](DEPLOY.md)
