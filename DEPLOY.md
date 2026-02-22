# 🚀 Deploy บน Easypanel (ใช้ Environment Variables)

## ✅ วิธีง่ายๆ แบบธรรมดา - ใช้ ENV

### ขั้นตอนที่ 1: เข้า Easypanel

1. Login เข้า Easypanel Dashboard
2. เลือก Project
3. คลิก **"Create Service"**

### ขั้นตอนที่ 2: ตั้งค่า Service

**Service Type:** App

**Source:**
- Repository: `https://github.com/Endlessedwork/gmail-notifier.git`
- Branch: `main`

**Build:**
- Build Method: **Docker**
- Dockerfile Path: `./Dockerfile`
- Build Context: `.`

**Port:**
- Internal Port: **80**
- Public: เปิดให้ public

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables (สำคัญ!)

ใน **Environment Variables** ให้ใส่:

```bash
# Telegram Bot
BOT_TOKEN=7891234567:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Gmail Account
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

# Settings
CHECK_INTERVAL=60
MAX_BODY_LENGTH=300
CHAT_ID=-1001234567890

# Filter Rules (JSON - ใส่ทั้งบรรทัดเลย)
FILTER_RULES=[{"name":"All Emails","field":"from","match":"*","chat_id":"-1001234567890","priority":99,"enabled":true}]

# Timezone
TZ=Asia/Bangkok
```

### ขั้นตอนที่ 4: Deploy!

คลิก **"Deploy"** แล้วรอ 2-5 นาที

### ขั้นตอนที่ 5: เข้าใช้งาน

เปิดบราวเซอร์:
```
https://your-app.easypanel.host
```

---

## 📝 วิธีหาค่าต่างๆ

### 1. หา BOT_TOKEN

1. เปิด Telegram แล้วคุยกับ [@BotFather](https://t.me/BotFather)
2. ส่ง `/newbot`
3. ตั้งชื่อ bot
4. คัดลอก **Bot Token** ที่ได้ (รูปแบบ: `1234567890:AAHxxxxxxxxxx`)

### 2. หา CHAT_ID

**วิธีที่ 1: ใช้ @getidsbot**
1. เปิด Telegram คุยกับ [@getidsbot](https://t.me/getidsbot)
2. ส่ง `/start`
3. คัดลอก **Chat ID** (เลขติดลบ เช่น `-1001234567890`)

**วิธีที่ 2: ใช้ API**
1. เพิ่ม bot เข้า channel/group
2. ส่งข้อความในกลุ่ม
3. เปิด: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. หา `"chat":{"id":-100xxxxxxxxx}`

### 3. หา Gmail App Password

1. ไปที่ https://myaccount.google.com/apppasswords
2. สร้าง App Password ใหม่
3. คัดลอก password 16 ตัว (ใส่แบบมีเว้นวรรคหรือไม่มีก็ได้)

**หมายเหตุ:** ต้องเปิด 2-Step Verification ก่อน

---

## 🔧 การเพิ่ม Filter Rules

Format ของ `FILTER_RULES`:
```json
[
  {
    "name": "ชื่อ rule",
    "field": "from",
    "match": "keyword",
    "chat_id": "-1001234567890",
    "priority": 1,
    "enabled": true
  }
]
```

**ตัวอย่าง:**

```bash
# Rule เดียว
FILTER_RULES=[{"name":"Banking","field":"from","match":"bank","chat_id":"-100111111111"}]

# หลาย Rules
FILTER_RULES=[{"name":"Banking","field":"from","match":"bank","chat_id":"-100111111111"},{"name":"Invoice","field":"subject","match":"invoice","chat_id":"-100222222222"}]
```

**คำอธิบาย:**
- `field`: `"from"` = กรองจากผู้ส่ง, `"subject"` = กรองจากหัวข้อ
- `match`: คำที่ต้องการกรอง (เช่น `"bank"`, `"@gmail.com"`)
- `chat_id`: Telegram Chat ID ที่จะส่งไป
- `priority`: เลขน้อยจะเช็คก่อน (1-99)

---

## 🐛 Troubleshooting

### ปัญหา: Build Failed

**เช็ค:**
- Dockerfile Path ต้องเป็น `./Dockerfile`
- Build Context ต้องเป็น `.`

### ปัญหา: Container Crash

**เช็ค ENV:**
- `BOT_TOKEN` ถูกต้องหรือไม่?
- `EMAIL_USER` และ `EMAIL_PASS` ถูกต้องหรือไม่?
- `FILTER_RULES` เป็น JSON ที่ valid หรือไม่?

**ดู Logs:**
```bash
# ใน Easypanel → Logs
# หรือ
docker logs gmail-notifier
```

### ปัญหา: Frontend ไม่แสดง

**เช็ค:**
- Port 80 เปิดหรือไม่?
- Nginx running หรือไม่?

### ปัญหา: ไม่มี Notification

**เช็ค:**
1. Bot Token ถูกต้องหรือไม่? ทดสอบ: `https://api.telegram.org/bot<TOKEN>/getMe`
2. Chat ID ถูกต้องหรือไม่?
3. เพิ่ม bot เข้า channel/group แล้วหรือยัง?
4. Gmail App Password ถูกต้องหรือไม่?

---

## 🔄 การอัปเดต

### Auto Deploy (แนะนำ)

ใน Easypanel:
1. Settings → **Auto Deploy**
2. เลือก Branch: `main`
3. เปิด Auto Deploy

ทุกครั้งที่ push ไป GitHub จะ deploy อัตโนมัติ!

### Manual Deploy

1. ไปที่ Service
2. คลิก **Rebuild** หรือ **Redeploy**

---

## ✅ สรุป

**ไม่ต้องยุ่งกับ config.json หรือ Volume!**

แค่ตั้งค่า ENV Variables ใน Easypanel:
- BOT_TOKEN
- EMAIL_USER
- EMAIL_PASS
- CHAT_ID
- FILTER_RULES (JSON)

แล้ว Deploy! 🚀
