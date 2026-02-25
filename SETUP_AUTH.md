# Gmail Notifier - Multi-User Authentication Setup

## 📋 Overview

ระบบ Gmail Notifier ได้รับการอัปเกรดให้รองรับการใช้งานแบบหลาย user โดยแต่ละ user จะมีข้อมูลแยกจากกันโดยสิ้นเชิง:
- Gmail accounts แยกต่างหาก
- Notification channels แยกต่างหาก
- Filter rules แยกต่างหาก

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. รัน Database Migrations

```bash
# ต้องรัน migrations ใหม่ (003_add_oauth_refresh_token.sql)
python -m backend.core.database
```

หรือใช้ SQL โดยตรง:

```bash
sqlite3 data/gmail_notifier.db < migrations/003_add_oauth_refresh_token.sql
```

### 3. สร้าง Admin User และ Migrate ข้อมูลเดิม

```bash
python scripts/create_admin_and_migrate.py
```

คำสั่งนี้จะ:
- สร้าง admin user (username: `admin`, password: `admin123`)
- Migrate ข้อมูลเดิมทั้งหมดให้เป็นของ admin
- แสดงสรุปข้อมูลที่ migrate

⚠️ **สำคัญ:** เปลี่ยนรหัสผ่าน admin ทันทีหลังจาก login ครั้งแรก!

### 4. (Optional) ตั้งค่า Google OAuth

ถ้าต้องการให้ user login ด้วย Google:

1. สร้าง OAuth 2.0 Client ID ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. เพิ่ม Authorized redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
3. เพิ่มค่าเหล่านี้ใน `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
```

### 5. รัน Backend

```bash
cd backend
uvicorn main:app --reload
```

### 6. รัน Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Authentication Methods

### 1. Username/Password Login

- User สามารถสมัครสมาชิกด้วย username, email, password
- Password ต้องมีอย่างน้อย 6 ตัวอักษร
- Login ได้ด้วย username หรือ email

### 2. Google OAuth Login

- User สามารถ login/สมัครด้วย Google account
- ถ้า email ซ้ำกับ user ที่มีอยู่แล้ว จะ link Google account เข้ากับ user เดิม
- ไม่ต้องตั้งรหัสผ่าน

## 🔒 Security Features

- **JWT Tokens**: Access token (1 ชม.) + Refresh token (7 วัน)
- **Password Hashing**: bcrypt with salt
- **Token Refresh**: Auto-refresh เมื่อ access token หมดอายุ
- **Protected Routes**: ทุก API endpoint ต้อง authentication ยกเว้น `/auth/*`

## 📱 Responsive Design

UI รองรับ 3 breakpoints:
- **Mobile** (< 768px): Hamburger menu + Drawer
- **Tablet** (768px - 1024px): Collapsible sidebar
- **Desktop** (> 1024px): Full sidebar

## 🗄️ Database Schema Changes

### New Columns in `users` table:
- `google_id` (TEXT, UNIQUE): Google OAuth user ID
- `refresh_token` (TEXT): Refresh token for session management

### Foreign Keys Added:
- `gmail_accounts.user_id` → `users.id`
- `notification_channels.user_id` → `users.id`
- `filter_rules.user_id` → `users.id`

## 📝 API Changes

### New Endpoints:

**Authentication:**
- `POST /api/v1/auth/register` - สมัครสมาชิก
- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - ดูข้อมูล user ปัจจุบัน
- `GET /api/v1/auth/google/login` - Redirect to Google OAuth
- `GET /api/v1/auth/google/callback` - Handle Google OAuth callback

**Existing Endpoints:**
- ทุก endpoint ต้องส่ง `Authorization: Bearer <access_token>` header
- API จะ filter ข้อมูลตาม user_id ของ user ที่ login อัตโนมัติ

## 🔧 Troubleshooting

### ปัญหา: "Invalid or expired token"
- Refresh token หมดอายุ → Login ใหม่
- Token ถูก revoke → Login ใหม่

### ปัญหา: Google OAuth ไม่ทำงาน
- ตรวจสอบ `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` ใน `.env`
- ตรวจสอบ Authorized redirect URIs ใน Google Cloud Console

### ปัญหา: Migration ล้มเหลว
- ตรวจสอบว่ารัน migration 003 แล้ว
- ตรวจสอบว่า database มี write permission

## 📚 Additional Resources

- [Google OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)

## 🤝 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ logs ใน backend console
2. ตรวจสอบ browser console สำหรับ frontend errors
3. ตรวจสอบ network tab สำหรับ API errors
