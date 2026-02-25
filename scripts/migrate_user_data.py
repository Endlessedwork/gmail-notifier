#!/usr/bin/env python3
"""
ย้ายข้อมูลจาก user หนึ่งไปยังอีก user
ใช้: python scripts/migrate_user_data.py --from-email seopbnmiddle@gmail.com --to-email endlessedwork@gmail.com
"""
import sys
import os
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.core.database import SessionLocal
from backend.models import User, GmailAccount, NotificationChannel, FilterRule


def migrate_user_data(from_email: str, to_email: str, dry_run: bool = False):
    """ย้ายข้อมูลจาก from_email ไปยัง to_email"""
    db = SessionLocal()
    try:
        target_user = db.query(User).filter(User.email == to_email).first()
        if not target_user:
            print(f"❌ ไม่พบ user ปลายทาง: {to_email}")
            return False

        source_user = db.query(User).filter(User.email == from_email).first()

        if source_user:
            # กรณี: from_email เป็น User - ย้ายข้อมูลทั้งหมด
            gmail_count = db.query(GmailAccount).filter(GmailAccount.user_id == source_user.id).update(
                {"user_id": target_user.id}
            )
            channel_count = db.query(NotificationChannel).filter(
                NotificationChannel.user_id == source_user.id
            ).update({"user_id": target_user.id})
            rule_count = db.query(FilterRule).filter(FilterRule.user_id == source_user.id).update(
                {"user_id": target_user.id}
            )
            print(f"📦 ย้ายข้อมูลจาก user '{from_email}' (id={source_user.id}) → '{to_email}' (id={target_user.id})")
        else:
            # กรณี: from_email เป็น GmailAccount - ย้าย account และ rules, channels ที่เกี่ยวข้อง
            accounts = db.query(GmailAccount).filter(GmailAccount.email == from_email).all()
            if not accounts:
                print(f"❌ ไม่พบ user หรือ gmail_account: {from_email}")
                return False

            gmail_count = 0
            channel_count = 0
            rule_count = 0
            moved_channel_ids = set()

            for acc in accounts:
                acc.user_id = target_user.id
                gmail_count += 1
                rules = db.query(FilterRule).filter(FilterRule.gmail_account_id == acc.id).all()
                for r in rules:
                    r.user_id = target_user.id
                    rule_count += 1
                    if r.channel_id and r.channel_id not in moved_channel_ids:
                        ch = db.query(NotificationChannel).filter(
                            NotificationChannel.id == r.channel_id
                        ).first()
                        if ch and ch.user_id != target_user.id:
                            ch.user_id = target_user.id
                            moved_channel_ids.add(ch.id)
                            channel_count += 1

            print(f"📦 ย้าย gmail_account '{from_email}' และข้อมูลที่เกี่ยวข้อง → user '{to_email}'")

        print(f"   - Gmail accounts: {gmail_count}")
        print(f"   - Notification channels: {channel_count}")
        print(f"   - Filter rules: {rule_count}")

        if dry_run:
            print("\n⚠️  Dry run - ไม่ได้ commit ไม่มีการเปลี่ยนแปลง")
            db.rollback()
        else:
            db.commit()
            print("\n✅ Migration สำเร็จ")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def list_data():
    """แสดง users และ gmail_accounts ในระบบ"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("👤 Users:")
        for u in users:
            ga = db.query(GmailAccount).filter(GmailAccount.user_id == u.id).count()
            ch = db.query(NotificationChannel).filter(NotificationChannel.user_id == u.id).count()
            fr = db.query(FilterRule).filter(FilterRule.user_id == u.id).count()
            print(f"   {u.email} (id={u.id}) | gmail: {ga}, channels: {ch}, rules: {fr}")

        orphans = db.query(GmailAccount).filter(GmailAccount.user_id.is_(None)).all()
        if orphans:
            print("\n📧 Gmail accounts ที่ยังไม่มี user:")
            for a in orphans:
                print(f"   {a.email} (id={a.id})")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="ย้ายข้อมูลจาก user หนึ่งไปยังอีก user")
    parser.add_argument("--from-email", help="Email ของ user ที่มีข้อมูลเดิม")
    parser.add_argument("--to-email", help="Email ของ user ปลายทาง")
    parser.add_argument("--dry-run", action="store_true", help="แสดงผลอย่างเดียว ไม่ commit")
    parser.add_argument("--list", action="store_true", help="แสดง users และ accounts ในระบบ")
    args = parser.parse_args()

    if args.list:
        list_data()
        return

    if not args.from_email or not args.to_email:
        parser.error("ต้องระบุ --from-email และ --to-email (หรือใช้ --list เพื่อดูข้อมูล)")

    print(f"🔄 Migrate: {args.from_email} → {args.to_email}\n")
    migrate_user_data(args.from_email, args.to_email, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
