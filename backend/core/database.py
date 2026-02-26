from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
_default_path = BASE_DIR / "data" / "gmail_notifier.db"

# ใช้ DATABASE_URL จาก env (รองรับ production ที่ใช้ data.db)
_db_url = os.environ.get("DATABASE_URL", "").strip()
if _db_url and "sqlite" in _db_url:
    from urllib.parse import urlparse
    parsed = urlparse(_db_url)
    raw = parsed.path
    # sqlite:///app/data/data.db -> /app/data/data.db (absolute, ใช้เลย)
    # sqlite:///./data/x.db -> relative to BASE_DIR
    if raw.startswith("/./"):
        path = str(BASE_DIR / raw[3:])
    elif raw.startswith("./"):
        path = str(BASE_DIR / raw[2:])
    elif raw.startswith("/") and len(raw) > 1:
        path = raw  # absolute
    else:
        path = str(BASE_DIR / raw.lstrip("/")) if raw else str(_default_path)
    DATABASE_URL = f"sqlite:///{path}" if path else _db_url
else:
    _default_path.parent.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{_default_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """Dependency สำหรับ FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """Context manager สำหรับใช้นอก FastAPI"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def run_migrations():
    """รัน migrations ถ้าตารางมีอยู่แล้วแต่ขาด columns (user_id, google_id ฯลฯ)"""
    import sqlite3
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        return
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        has_users = cur.fetchone()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='gmail_accounts'")
        has_gmail = cur.fetchone()
        if not has_users and has_gmail:
            cur.executescript(open(BASE_DIR / "migrations" / "002_add_users.sql").read())
            has_users = True
        if has_users:
            for table, col in [("gmail_accounts", "user_id"), ("notification_channels", "user_id"), ("filter_rules", "user_id")]:
                try:
                    cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                    if cur.fetchone():
                        cur.execute(f"PRAGMA table_info({table})")
                        cols = [r[1] for r in cur.fetchall()]
                        if col not in cols:
                            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} INTEGER REFERENCES users(id)")
                except sqlite3.OperationalError:
                    pass
        if has_users:
            cur.execute("PRAGMA table_info(users)")
            cols = [r[1] for r in cur.fetchall()]
            if "google_id" not in cols:
                try:
                    cur.execute("ALTER TABLE users ADD COLUMN google_id TEXT")
                except sqlite3.OperationalError:
                    pass
            if "refresh_token" not in cols:
                try:
                    cur.execute("ALTER TABLE users ADD COLUMN refresh_token TEXT")
                except sqlite3.OperationalError:
                    pass
        # เพิ่ม sync_mode column ใน gmail_accounts (แทน sync_all_unseen)
        if has_gmail:
            try:
                cur.execute("PRAGMA table_info(gmail_accounts)")
                cols = [r[1] for r in cur.fetchall()]

                # ลบ sync_all_unseen ถ้ามี (migration เก่า)
                if "sync_all_unseen" in cols:
                    # SQLite ไม่รองรับ DROP COLUMN โดยตรง แต่เราไม่ต้องลบ
                    # แค่ไม่ใช้มันแล้วก็พอ (จะ ignore ได้)
                    pass

                # เพิ่ม sync_mode
                if "sync_mode" not in cols:
                    cur.execute("ALTER TABLE gmail_accounts ADD COLUMN sync_mode TEXT DEFAULT 'new_only'")
            except sqlite3.OperationalError:
                pass

        # Migration: channel_id → channel_ids ใน filter_rules
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='filter_rules'")
        has_filter_rules = cur.fetchone()
        if has_filter_rules:
            try:
                cur.execute("PRAGMA table_info(filter_rules)")
                cols = [r[1] for r in cur.fetchall()]

                # เพิ่ม channel_ids ถ้ายังไม่มี
                if "channel_ids" not in cols:
                    cur.execute("ALTER TABLE filter_rules ADD COLUMN channel_ids TEXT")

                    # แปลงข้อมูลเก่าจาก channel_id เป็น channel_ids (JSON array)
                    if "channel_id" in cols:
                        import json
                        cur.execute("SELECT id, channel_id FROM filter_rules WHERE channel_id IS NOT NULL")
                        rows = cur.fetchall()
                        for row_id, channel_id in rows:
                            channel_ids_json = json.dumps([channel_id])
                            cur.execute("UPDATE filter_rules SET channel_ids = ? WHERE id = ?", (channel_ids_json, row_id))

                    # ไม่ลบ channel_id column (SQLite ไม่รองรับ DROP COLUMN)
                    # แค่ไม่ใช้มันในโค้ดใหม่
            except sqlite3.OperationalError:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Migration skipped: %s", e)
