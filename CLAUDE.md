# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gmail Notifier - ระบบแจ้งเตือนอีเมลผ่าน Telegram/LINE/Webhook โดยตรวจสอบ Gmail ผ่าน IMAP แล้ว match กับ filter rules ที่ตั้งไว้ ส่ง notification ไปยัง channels ที่กำหนด

## Commands

### Backend (FastAPI)
```bash
# Start API server (dev)
source venv/bin/activate
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Start worker (background email checker)
PYTHONPATH=. python -m worker.main
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Dev server on :3000, proxies /api to :8000
npm run build    # tsc && vite build
npm run lint     # ESLint
```

### Docker
```bash
docker compose up --build   # Single container: Nginx(:80) + FastAPI + Worker
```

### First-time Setup
```bash
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
# Or use: ./run-dev.sh
```

## Architecture

Three processes share a single SQLite database:

1. **FastAPI API** (`backend/`) - REST API สำหรับ CRUD accounts, channels, rules, logs, settings
2. **Worker** (`worker/`) - Background loop ที่ poll IMAP ทุก N วินาที, match rules, ส่ง notifications
3. **React Frontend** (`frontend/`) - Dashboard สำหรับจัดการทุกอย่างผ่าน UI

### Worker Flow
```
Worker loop (configurable interval)
  → config_watcher: อ่าน accounts/rules/channels จาก DB
  → email_checker: connect IMAP, fetch UNSEEN emails, parse MIME
  → orchestrator: match emails กับ filter rules (contains/regex/equals)
  → notification_sender: ส่งไป Telegram/LINE/Webhook
  → log ผลลัพธ์ลง notification_logs
```

### Backend Layers
- `routes/` → `services/` → SQLAlchemy models → SQLite
- `schemas/` = Pydantic request/response validation
- `core/auth.py` = JWT middleware, `core/security.py` = Fernet encryption for app passwords
- `routes/compat.py` = Legacy routes (`/api/health`, `/api/config`, `/api/metrics`)

### Frontend Stack
- React 18 + TypeScript + Vite
- TanStack React Query for data fetching (hooks in `src/hooks/`)
- shadcn/ui (Radix) components in `src/components/ui/`
- Path alias: `@/` maps to `frontend/src/`
- Auth via JWT tokens stored in AuthContext

### Database
SQLite at `data/data.db`. Migrations in `migrations/` (run automatically via `backend/core/database.py`).

Key tables: `users`, `gmail_accounts` (encrypted passwords), `notification_channels` (Telegram/LINE/Webhook config as JSON), `filter_rules` (with `channel_ids` JSON array), `notification_logs`, `config_settings` (key-value).

### Docker Production
Single container managed by Supervisor:
- Nginx serves frontend static files and proxies `/api` to FastAPI
- FastAPI on internal port 8000
- Worker runs as separate process

## Key Design Decisions

- Gmail App Passwords are encrypted with Fernet (symmetric) before storing in DB
- `channel_ids` in filter_rules is a JSON array of channel IDs (not a join table)
- Worker reads config from DB on each iteration (no restart needed for config changes)
- Multi-user: all resources scoped by `user_id` foreign key
- Legacy compat routes exist at `/api/*` alongside versioned `/api/v1/*`
- Timezone: defaults to `Asia/Bangkok` via `TZ` env var

## Environment Variables

Required: `ENCRYPTION_KEY` (Fernet key), `SECRET_KEY` (JWT signing)
Optional: `DATABASE_URL`, `CHECK_INTERVAL`, `MAX_BODY_LENGTH`, `TZ`, `GOOGLE_CLIENT_ID/SECRET` (OAuth)

Generate keys:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
