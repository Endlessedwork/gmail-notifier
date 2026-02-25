#!/usr/bin/env python3
"""
สคริปต์สำหรับสร้าง default admin user และ migrate ข้อมูลเดิมให้เป็นของ admin
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.core.database import engine, SessionLocal
from backend.core.auth import hash_password
from backend.models import User, GmailAccount, NotificationChannel, FilterRule
from sqlalchemy.orm import Session


def generate_secure_password(length=16):
    """Generate a secure random password"""
    import string
    import secrets as sec
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(sec.choice(alphabet) for _ in range(length))


def create_admin_user(db: Session) -> User:
    """สร้าง default admin user"""
    # Check if admin already exists
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        print("✅ Admin user already exists")
        return admin

    # Get password from env or generate random
    password = os.environ.get("ADMIN_PASSWORD")
    if not password:
        password = generate_secure_password()
        print("⚠️  ADMIN_PASSWORD not set in environment, using random password")

    # Create admin user
    admin = User(
        username="admin",
        email="admin@gmail-notifier.local",
        hashed_password=hash_password(password),
        is_active=True,
        is_admin=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print(f"✅ Created admin user (id={admin.id})")
    print(f"   Username: admin")
    print(f"   Password: {password}")
    print(f"   ⚠️  SAVE THIS PASSWORD! Change it after first login!")

    return admin


def migrate_data_to_admin(db: Session, admin_id: int):
    """Migrate ข้อมูลเดิมที่ไม่มี user_id ให้เป็นของ admin"""
    # Migrate Gmail Accounts
    gmail_count = (
        db.query(GmailAccount)
        .filter(GmailAccount.user_id == None)
        .update({"user_id": admin_id})
    )

    # Migrate Notification Channels
    channel_count = (
        db.query(NotificationChannel)
        .filter(NotificationChannel.user_id == None)
        .update({"user_id": admin_id})
    )

    # Migrate Filter Rules
    rule_count = (
        db.query(FilterRule)
        .filter(FilterRule.user_id == None)
        .update({"user_id": admin_id})
    )

    db.commit()

    print(f"\n📦 Migrated data to admin user:")
    print(f"   - {gmail_count} Gmail accounts")
    print(f"   - {channel_count} Notification channels")
    print(f"   - {rule_count} Filter rules")


def main():
    print("🚀 Starting admin user creation and data migration...\n")

    db = SessionLocal()
    try:
        # Create admin user
        admin = create_admin_user(db)

        # Migrate existing data
        migrate_data_to_admin(db, admin.id)

        print("\n✨ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Login with username: admin, password: admin123")
        print("2. Change your password immediately")
        print("3. Create additional users as needed")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
