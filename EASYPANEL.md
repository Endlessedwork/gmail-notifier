# 🚀 Deploy Gmail Notifier บน Easypanel

คู่มือการ deploy แบบละเอียดตาม [Easypanel Official Documentation](https://easypanel.io/docs/services/app)

---

## ขั้นตอนที่ 1: สร้าง Encryption Key

เปิด Terminal รันคำสั่ง:

```bash
openssl rand -base64 32
```

จะได้ผลลัพธ์เช่น:
```
5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=
```

**เก็บ key นี้ไว้** จะใช้ในขั้นตอนที่ 3

---

## ขั้นตอนที่ 2: สร้าง App Service

1. Login เข้า Easypanel
2. เลือก Project ของคุณ
3. คลิก **Create Service**
4. เลือก **App**

---

## ขั้นตอนที่ 3: Configure Source (GitHub)

ในแท็บ **Source**:

**GitHub Repository:**
- เลือก repository: `Endlessedwork/gmail-notifier`
- Branch: `main`
- Auto Deploy: เปิด (ถ้าต้องการ deploy อัตโนมัติเมื่อ push)

**Build:**
- Easypanel จะตรวจพบ Dockerfile อัตโนมัติ
- ไม่ต้องตั้งค่าอะไรเพิ่ม

---

## ขั้นตอนที่ 4: Environment Variables

ในแท็บ **Environment**:

คลิก **Add Variable**

จะมี 2 ช่อง:
- **ช่องซ้าย (Key)**: ใส่ `ENCRYPTION_KEY`
- **ช่องขวา (Value)**: ใส่ key ที่ได้จากขั้นตอนที่ 1

**ตัวอย่าง:**
```
ช่อง Key:     ENCRYPTION_KEY
ช่อง Value:   5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=
```

**หมายเหตุ:** ใส่แค่ตัวแปรเดียวนี้พอ ส่วน Gmail/Telegram จะตั้งค่าผ่าน Web UI ภายหลัง

---

## ขั้นตอนที่ 5: Mounts (Persistent Storage)

ในแท็บ **Mounts**:

คลิก **Add Mount** → เลือก **Volume**

กรอก:
- **Name**: `data`
- **Mount Path**: `/app/data`

**คำอธิบาย:** Volume นี้เก็บ SQLite database ป้องกันข้อมูลหายเมื่อ container restart

---

## ขั้นตอนที่ 6: Domains (Optional แต่แนะนำ)

ในแท็บ **Domains**:

คลิก **Add Domain**

กรอก:
- **Domain**: `your-app-name.easypanel.host` (หรือ custom domain ของคุณ)
- **Port**: `80`

Easypanel จะ setup HTTPS (Let's Encrypt) อัตโนมัติ

---

## ขั้นตอนที่ 7: Deploy

1. คลิกปุ่ม **Deploy** ที่มุมขวาบน
2. รอ build process (ประมาณ 3-5 นาที)
3. ดู Logs ใน **Logs** tab เพื่อตรวจสอบ deployment

---

## ขั้นตอนที่ 8: Initialize Database

**หลัง deployment สำเร็จ** ให้ไปที่แท็บ **Console**

รันคำสั่ง:

```bash
python -c "from backend.core.database import init_db; init_db()"
```

กด Enter และรอจนเสร็จ

---

## ขั้นตอนที่ 9: เข้าใช้งาน Web UI

เปิดเบราว์เซอร์ไปที่:

```
https://your-app-name.easypanel.host
```

จะเห็น Gmail Notifier Dashboard

---

## ขั้นตอนที่ 10: ตั้งค่าผ่าน Web UI

### เพิ่ม Gmail Account

1. ไปที่ **Gmail Accounts** → **Add Account**
2. กรอก:
   - Email: `your-email@gmail.com`
   - App Password: สร้างจาก [Google App Passwords](https://myaccount.google.com/apppasswords)
   - IMAP Server: `imap.gmail.com`
   - IMAP Port: `993`
3. คลิก **Save**

### เพิ่ม Telegram Channel

1. ไปที่ **Notification Channels** → **Add Channel**
2. เลือก Type: **Telegram**
3. กรอก:
   - Name: `My Telegram`
   - Bot Token: สร้างจาก [@BotFather](https://t.me/BotFather)
   - Chat ID: หาจาก [@getidsbot](https://t.me/getidsbot)
4. คลิก **Save**

### สร้าง Filter Rule

1. ไปที่ **Filter Rules** → **Add Rule**
2. กรอก:
   - Gmail Account: เลือก account ที่สร้างไว้
   - Rule Name: `Banking Alerts`
   - Field: `from`
   - Match Type: `contains`
   - Match Value: `bank.com`
   - Channel: เลือก Telegram channel
   - Priority: `10`
3. คลิก **Save**

**เสร็จแล้ว!** ระบบจะเริ่มตรวจสอบอีเมลและส่ง notification อัตโนมัติ

---

## 🔧 Troubleshooting

### Build Failed

ตรวจสอบใน **Logs** tab:
- Repository URL ถูกต้องหรือไม่
- Branch `main` มีอยู่จริงหรือไม่

### Container Crash

ตรวจสอบ:
- `ENCRYPTION_KEY` ตั้งค่าครบหรือไม่
- Volume mount `/app/data` ถูกต้องหรือไม่

### Database Error

รันใน **Console**:

```bash
rm -f /app/data/data.db
python -c "from backend.core.database import init_db; init_db()"
```

---

## 📚 เอกสารอ้างอิง

- [Easypanel App Service Documentation](https://easypanel.io/docs/services/app)
- [Easypanel Quickstart Guides](https://easypanel.io/docs/quickstarts)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Telegram Bot Setup](https://core.telegram.org/bots#6-botfather)

---

**ทำตามขั้นตอนนี้แล้วจะ deploy สำเร็จแน่นอน! 🚀**
