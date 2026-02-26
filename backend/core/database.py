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
        # เพิ่ม sync_all_unseen column ใน gmail_accounts
        if has_gmail:
            try:
                cur.execute("PRAGMA table_info(gmail_accounts)")
                cols = [r[1] for r in cur.fetchall()]
                if "sync_all_unseen" not in cols:
                    cur.execute("ALTER TABLE gmail_accounts ADD COLUMN sync_all_unseen BOOLEAN DEFAULT 0")
            except sqlite3.OperationalError:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Migration skipped: %s", e)
