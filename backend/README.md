# Gmail Notifier - Backend API

FastAPI backend สำหรับจัดการ Gmail accounts, notification channels, และ filter rules

## โครงสร้าง

```
backend/
├── core/           # Database, config, security
├── models/         # SQLAlchemy models
├── schemas/        # Pydantic schemas
├── services/       # Business logic
├── routes/         # API endpoints
├── middlewares/    # CORS, logging
└── main.py         # FastAPI application
```

## Architecture

**Pragmatic Balance Pattern:**
- Models: SQLAlchemy ORM models
- Schemas: Pydantic validation schemas
- Services: Business logic layer
- Routes: API endpoints

## การรัน

```bash
# ติดตั้ง dependencies
pip install -r backend/requirements.txt

# รัน server
python -m backend.main

# หรือใช้ uvicorn
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Gmail Accounts
- `GET /api/v1/gmail-accounts` - ดึงรายการ accounts
- `GET /api/v1/gmail-accounts/{id}` - ดึงข้อมูล account
- `POST /api/v1/gmail-accounts` - สร้าง account ใหม่
- `PUT /api/v1/gmail-accounts/{id}` - อัพเดท account
- `DELETE /api/v1/gmail-accounts/{id}` - ลบ account

### Notification Channels
- `GET /api/v1/notification-channels` - ดึงรายการ channels
- `GET /api/v1/notification-channels/{id}` - ดึงข้อมูล channel
- `POST /api/v1/notification-channels` - สร้าง channel ใหม่
- `PUT /api/v1/notification-channels/{id}` - อัพเดท channel
- `DELETE /api/v1/notification-channels/{id}` - ลบ channel

### Filter Rules
- `GET /api/v1/filter-rules` - ดึงรายการ rules
- `GET /api/v1/filter-rules/{id}` - ดึงข้อมูล rule
- `POST /api/v1/filter-rules` - สร้าง rule ใหม่
- `PUT /api/v1/filter-rules/{id}` - อัพเดท rule
- `DELETE /api/v1/filter-rules/{id}` - ลบ rule

### Notification Logs
- `GET /api/v1/notification-logs` - ดึงรายการ logs
- `GET /api/v1/notification-logs/stats` - ดึงสถิติ
- `GET /api/v1/notification-logs/{id}` - ดึงข้อมูล log

### Config Settings
- `GET /api/v1/config-settings` - ดึง settings ทั้งหมด
- `GET /api/v1/config-settings/{key}` - ดึง setting ตาม key
- `PUT /api/v1/config-settings/{key}` - อัพเดท setting
- `DELETE /api/v1/config-settings/{key}` - ลบ setting

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security

- รหัสผ่าน Gmail เข้ารหัสด้วย Fernet (cryptography)
- Encryption key เก็บที่ `data/.encryption_key`
- CORS enabled สำหรับ frontend

## Database

- SQLite: `data/gmail_notifier.db`
- Auto-create tables on startup
- Migrations: `migrations/001_init.sql`
