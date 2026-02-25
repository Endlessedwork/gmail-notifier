# 📖 คู่มือการใช้งาน Gmail Notifier

## 🎯 ภาพรวม

Gmail Notifier คือระบบแจ้งเตือนอีเมลจาก Gmail ไปยัง Telegram, LINE, และ Webhook โดยอัตโนมัติ พร้อม Web UI สำหรับจัดการที่ใช้งานง่าย

## 🚀 เริ่มต้นใช้งาน

### การเข้าสู่ระบบ

1. เปิดเว็บเบราว์เซอร์ไปที่ `http://localhost:3000` (หรือ URL ที่คุณ deploy)
2. คุณจะเห็นหน้าแดชบอร์ดหลัก

## 📱 การใช้งานหน้าต่างๆ

### 1. หน้า Dashboard (หน้าหลัก)

**จุดเด่น:**
- แสดงจำนวน Gmail accounts ที่เชื่อมต่อ
- แสดงจำนวน Notification channels
- แสดงจำนวน Filter rules ที่ทำงานอยู่
- แสดง Log การแจ้งเตือนล่าสุด

**การใช้งาน:**
- ดูภาพรวมระบบได้ทันที
- ตรวจสอบว่าระบบทำงานปกติหรือไม่
- เห็นการแจ้งเตือนที่เกิดขึ้นล่าสุด

---

## 📧 การจัดการ Gmail Accounts

### เพิ่ม Gmail Account ใหม่

1. **คลิกที่เมนู "Gmail Accounts"**
2. **คลิกปุ่ม "+ Add Gmail Account"**
3. **กรอกข้อมูลตามฟอร์ม:**

   | ฟิลด์ | คำอธิบาย | ตัวอย่าง |
   |------|---------|---------|
   | Account Name | ชื่อเรียกบัญชี (ตั้งเองได้) | "อีเมลงาน", "อีเมลส่วนตัว" |
   | Email Address | อีเมล Gmail ของคุณ | `yourname@gmail.com` |
   | App Password | รหัส App Password จาก Google | `abcd efgh ijkl mnop` |
   | IMAP Server | เซิร์ฟเวอร์ IMAP | `imap.gmail.com` (default) |
   | IMAP Port | พอร์ต IMAP | `993` (default) |

4. **คลิกปุ่ม "Test Connection"** เพื่อทดสอบการเชื่อมต่อ
5. **ถ้าเชื่อมต่อสำเร็จ คลิก "Save"**

### 📝 วิธีสร้าง Gmail App Password

**สำคัญ:** ห้ามใช้รหัสผ่านปกติของ Gmail โดยตรง!

1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. เปิด **2-Step Verification** (ต้องเปิดก่อน)
3. ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
4. เลือก **App**: "Mail"
5. เลือก **Device**: "Other (Custom name)" พิมพ์ "Gmail Notifier"
6. คลิก **Generate**
7. **คัดลอกรหัส 16 หลัก** (รูปแบบ: `xxxx xxxx xxxx xxxx`)
8. นำรหัสมาใส่ในช่อง "App Password"

> 💡 **เคล็ดลับ:** ระบบจะลบช่องว่างอัตโนมัติ คุณสามารถคัดลอกแบบมีช่องว่างได้เลย

### แก้ไขและลบ Gmail Account

**แก้ไข:**
1. คลิกปุ่ม **"Edit" (ไอคอนดินสอ)** ที่แถวของ account ที่ต้องการ
2. แก้ไขข้อมูล
3. คลิก "Test Connection" (ถ้าเปลี่ยนรหัสผ่าน)
4. คลิก "Save"

**ลบ:**
1. คลิกปุ่ม **"Delete" (ไอคอนถังขยะ)** ที่แถวของ account
2. ยืนยันการลบ
3. **หมายเหตุ:** การลบ account จะลบ rules ที่เกี่ยวข้องด้วย

### ดึงอีเมลทันที

**ใช้เมื่อ:** ต้องการตรวจสอบอีเมลทันทีโดยไม่รอรอบปกติ

1. คลิกปุ่ม **"Check Now" (ไอคอนรีเฟรช)** ที่แถวของ account
2. ระบบจะดึงอีเมลใหม่และส่งการแจ้งเตือนทันที
3. ดูผลลัพธ์ได้ที่หน้า "Logs"

---

## 🔔 การจัดการ Notification Channels

### เพิ่ม Notification Channel

คลิกเมนู **"Notification Channels"** → **"+ Add Channel"**

### ตัวเลือก Channel Types

#### 1️⃣ Telegram

**ขั้นตอนการตั้งค่า:**

1. **สร้าง Telegram Bot:**
   - เปิด Telegram แล้วค้นหา [@BotFather](https://t.me/BotFather)
   - ส่งคำสั่ง `/newbot`
   - ตั้งชื่อ bot (เช่น "My Gmail Notifier")
   - ตั้ง username (ต้องลงท้ายด้วย "bot" เช่น "mynotifier_bot")
   - **คัดลอก Bot Token** (รูปแบบ: `123456789:ABC-DEF1234...`)

2. **หา Chat ID:**
   - **สำหรับ Private Chat:**
     - แชทกับ bot ที่สร้างมา (ส่งข้อความ `/start`)
     - เปิด [@getidsbot](https://t.me/getidsbot) ส่งข้อความใดๆ
     - คัดลอก **Your Telegram ID** (เช่น `123456789`)

   - **สำหรับ Group/Channel:**
     - เพิ่ม bot เข้า group/channel
     - เพิ่ม [@getidsbot](https://t.me/getidsbot) เข้า group ชั่วคราว
     - ส่งข้อความใน group
     - คัดลอก **Chat ID** (รูปแบบ: `-1001234567890` ขึ้นต้นด้วย `-`)

3. **กรอกข้อมูลในฟอร์ม:**
   - **Channel Name**: ตั้งชื่อ (เช่น "แจ้งเตือนงาน")
   - **Bot Token**: วาง token จาก BotFather
   - **Chat ID**: วาง chat ID ที่ได้
   - คลิก **"Test"** เพื่อทดสอบ
   - ถ้าได้รับข้อความทดสอบ คลิก **"Save"**

#### 2️⃣ LINE Notify

**ขั้นตอนการตั้งค่า:**

1. ไปที่ [LINE Notify](https://notify-bot.line.me/my/)
2. ล็อกอินด้วยบัญชี LINE
3. คลิก **"Generate token"**
4. ตั้งชื่อ token (เช่น "Gmail Notifier")
5. เลือกกลุ่มที่จะส่งการแจ้งเตือน (หรือ "1-on-1 chat with LINE Notify")
6. คัดลอก **Access Token**
7. กรอกข้อมูลในฟอร์ม:
   - **Channel Name**: ตั้งชื่อ
   - **Access Token**: วาง token ที่คัดลอก
   - คลิก **"Test"** → **"Save"**

#### 3️⃣ Webhook

**ขั้นตอนการตั้งค่า:**

1. เตรียม URL endpoint ที่จะรับข้อมูล (เช่น API ของระบบอื่น)
2. กรอกข้อมูล:
   - **Channel Name**: ตั้งชื่อ
   - **URL**: URL ของ webhook endpoint
   - **Method**: เลือก GET หรือ POST
   - **Headers** (optional): เพิ่ม headers เช่น `Authorization: Bearer xxx`
3. คลิก **"Test"** → **"Save"**

**รูปแบบข้อมูลที่ส่ง (POST):**
```json
{
  "subject": "หัวข้ออีเมล",
  "from": "sender@example.com",
  "body": "เนื้อหาอีเมล...",
  "received_at": "2025-02-25T10:30:00"
}
```

### แก้ไขและลบ Channel

**แก้ไข:**
1. คลิกปุ่ม **"Edit"** ที่แถวของ channel
2. แก้ไขข้อมูล → คลิก "Test" → "Save"

**ลบ:**
1. คลิกปุ่ม **"Delete"** ที่แถวของ channel
2. ยืนยันการลบ
3. **คำเตือน:** การลบ channel จะลบ rules ที่ใช้ channel นี้ด้วย

---

## 🔍 การสร้าง Filter Rules

### ความเข้าใจเบื้องต้น

**Filter Rule** คือกฎที่กำหนดว่า:
- อีเมลไหนควรแจ้งเตือน (กรองจากเงื่อนไข)
- ส่งการแจ้งเตือนไปที่ช่องทางไหน

### เพิ่ม Filter Rule

1. คลิกเมนู **"Filter Rules"** → **"+ Add Rule"**
2. กรอกข้อมูล:

| ฟิลด์ | คำอธิบาย | ตัวอย่าง |
|------|---------|---------|
| **Rule Name** | ชื่อกฎ (ตั้งเองได้) | "แจ้งเตือนธนาคาร", "อีเมลงานสำคัญ" |
| **Gmail Account** | เลือกบัญชี Gmail | "อีเมลงาน" |
| **Notification Channel** | เลือกช่องทางแจ้งเตือน | "Telegram Work" |
| **Priority** | ลำดับความสำคัญ (เลขน้อย = ลำดับสูง) | `10` |
| **Field** | ส่วนของอีเมลที่จะกรอง | `from`, `subject`, `body` |
| **Match Type** | วิธีการจับคู่ | `contains`, `equals`, `regex` |
| **Match Value** | ค่าที่ต้องการจับคู่ | `bank.com`, `[ใบแจ้งหนี้]` |

3. คลิก **"Save"**

### ตัวอย่าง Filter Rules

#### ตัวอย่างที่ 1: แจ้งเตือนอีเมลจากธนาคาร

```
Rule Name: "ธนาคารออมสิน"
Gmail Account: "อีเมลส่วนตัว"
Channel: "LINE Notify"
Field: from
Match Type: contains
Match Value: gsb.or.th
Priority: 10
```

#### ตัวอย่างที่ 2: แจ้งเตือนหัวข้อที่มีคำว่า "ใบแจ้งหนี้"

```
Rule Name: "ใบแจ้งหนี้"
Gmail Account: "อีเมลงาน"
Channel: "Telegram"
Field: subject
Match Type: contains
Match Value: ใบแจ้งหนี้
Priority: 5
```

#### ตัวอย่างที่ 3: ใช้ Regular Expression

```
Rule Name: "อีเมลจาก CEO"
Gmail Account: "อีเมลงาน"
Channel: "Telegram VIP"
Field: from
Match Type: regex
Match Value: ^ceo@company\.com$
Priority: 1
```

### เข้าใจ Priority

- **Priority ต่ำ (1-5)**: สำคัญมาก ตรวจสอบก่อน
- **Priority ปานกลาง (6-15)**: สำคัญปกติ
- **Priority สูง (16+)**: สำคัญน้อย

**หลักการทำงาน:**
1. ระบบตรวจสอบ rules จากลำดับ priority ต่ำไปสูง
2. ถ้าอีเมลตรงกับ rule ไหน จะส่งการแจ้งเตือนและหยุดตรวจสอบ rules ถัดไป
3. ถ้าไม่ตรงกับ rule ใดเลย จะไม่แจ้งเตือน

**เคล็ดลับ:**
- ใส่ rules ที่ต้องการแจ้งเตือนก่อน (priority ต่ำ)
- ใส่ rules ที่เป็น "catch-all" ไว้ท้ายสุด (priority สูง)

### แก้ไขและลบ Rule

**แก้ไข:**
1. คลิก **"Edit"** ที่แถวของ rule → แก้ไข → "Save"

**ลบ:**
1. คลิก **"Delete"** ที่แถวของ rule → ยืนยัน

**เปิด/ปิดการใช้งาน:**
- คลิก **สวิตช์ "Enabled"** เพื่อเปิด/ปิด rule ชั่วคราว

---

## 📊 การดู Logs

### หน้า Logs

คลิกเมนู **"Logs"** เพื่อดูประวัติการแจ้งเตือน

**ข้อมูลที่แสดง:**
- **วันเวลา**: เมื่อส่งการแจ้งเตือน
- **Gmail Account**: บัญชีที่ตรวจพบอีเมล
- **From**: ผู้ส่งอีเมล
- **Subject**: หัวข้ออีเมล
- **Channel**: ช่องทางที่ส่งการแจ้งเตือนไป
- **Status**: สำเร็จ (success) หรือล้มเหลว (failed)

**การค้นหาและกรอง:**
- **Filter by Status**: เลือกดูเฉพาะ Success หรือ Failed
- **Search**: ค้นหาจาก subject หรือ from
- **Pagination**: เลื่อนดูหน้าถัดไป/ก่อนหน้า

**อ่าน Log อย่างมีประสิทธิภาพ:**
- เช็คว่า rules ทำงานถูกต้องหรือไม่
- เช็คว่ามีการแจ้งเตือนซ้ำหรือไม่
- ดูว่า channel ไหนส่งล้มเหลว (เพื่อแก้ไข config)

---

## ⚙️ การตั้งค่าระบบ

### การตั้งค่าเวลาตรวจสอบ

**แก้ไขใน Environment Variables:**
```bash
CHECK_INTERVAL=60  # ตรวจสอบทุก 60 วินาที (1 นาที)
```

**การเปลี่ยนค่า:**
1. แก้ไขไฟล์ `.env`
2. Restart Docker container:
   ```bash
   docker-compose restart
   ```

### การตั้งค่า Timezone

```bash
TZ=Asia/Bangkok  # เวลาประเทศไทย
```

---

## 🐛 แก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Gmail ไม่สามารถเชื่อมต่อได้

**สาเหตุและแก้ไข:**
- ❌ **ใช้รหัสผ่าน Gmail ปกติ**
  - ✅ ต้องใช้ **App Password** เท่านั้น (ตามขั้นตอนข้างต้น)

- ❌ **ไม่ได้เปิด IMAP**
  - ✅ ไปที่ [Gmail Settings](https://mail.google.com/mail/u/0/#settings/fwdandpop)
  - เปิด "Enable IMAP"

- ❌ **App Password ผิด**
  - ✅ สร้าง App Password ใหม่แล้วใส่ให้ถูกต้อง

#### 2. Telegram ไม่ได้รับการแจ้งเตือน

**สาเหตุและแก้ไข:**
- ❌ **Bot Token ผิด**
  - ✅ คัดลอก token จาก [@BotFather](https://t.me/BotFather) ใหม่

- ❌ **Chat ID ผิด**
  - ✅ ตรวจสอบว่า Chat ID ขึ้นต้นด้วย `-` (สำหรับ group)

- ❌ **Bot ไม่อยู่ใน Group**
  - ✅ เชิญ bot เข้า group อีกครั้ง

#### 3. LINE Notify ไม่ได้รับการแจ้งเตือน

**สาเหตุและแก้ไข:**
- ❌ **Access Token หมดอายุ**
  - ✅ สร้าง token ใหม่ที่ [LINE Notify](https://notify-bot.line.me/my/)

- ❌ **Token ผิด**
  - ✅ คัดลอก token ใหม่และอัพเดทใน channel

#### 4. Filter Rule ไม่ทำงาน

**ตรวจสอบ:**
- ✅ Rule เปิดใช้งานอยู่หรือไม่ (Enabled)
- ✅ Priority ถูกต้องหรือไม่ (ถ้ามี rule อื่นที่ priority ต่ำกว่า อาจจะถูกจับคู่ก่อน)
- ✅ Match Value ถูกต้องหรือไม่ (ตรวจสอบที่หน้า Logs)
- ✅ Gmail account เชื่อมต่อได้หรือไม่

#### 5. ระบบไม่ตรวจสอบอีเมลอัตโนมัติ

**ตรวจสอบ:**
- ✅ Worker process ทำงานหรือไม่:
  ```bash
  docker logs gmail-notifier
  ```
- ✅ ดู log ว่ามี error หรือไม่
- ✅ Restart container:
  ```bash
  docker-compose restart
  ```

---

## 💡 เคล็ดลับการใช้งาน

### เคล็ดลับที่ 1: จัดกลุ่ม Rules ด้วย Priority

```
Priority 1-10   : อีเมลสำคัญมาก (CEO, ธนาคาร)
Priority 11-20  : อีเมลงานปกติ
Priority 21-30  : อีเมลทั่วไป
Priority 31+    : อีเมลอื่นๆ
```

### เคล็ดลับที่ 2: ใช้ Regex สำหรับการกรองซับซ้อน

**ตัวอย่าง Regex:**
```regex
^(invoice|receipt|billing)  # ขึ้นต้นด้วย invoice, receipt, หรือ billing
bank\.(com|co\.th)$         # ลงท้ายด้วย bank.com หรือ bank.co.th
\d{6,}                      # มีตัวเลข 6 หลักขึ้นไป
```

### เคล็ดลับที่ 3: ทดสอบก่อนใช้งานจริง

1. สร้าง channel ทดสอบ (Telegram private chat)
2. สร้าง rule ทดสอบ
3. ส่งอีเมลทดสอบ
4. ตรวจสอบที่หน้า Logs
5. ถ้าทำงานถูกต้อง แก้ channel เป็นช่องทางจริง

### เคล็ดลับที่ 4: ใช้ "Check Now" เพื่อทดสอบทันที

- ไม่ต้องรอรอบปกติ (60 วินาที)
- คลิก "Check Now" หลังตั้ง rule ใหม่
- เห็นผลทันทีที่หน้า Logs

---

## 📞 ติดต่อและช่วยเหลือ

### ติดปัญหาหรือต้องการความช่วยเหลือ?

1. ตรวจสอบที่หัวข้อ **"แก้ไขปัญหา"** ก่อน
2. ดู Logs ของระบบ:
   ```bash
   docker logs gmail-notifier
   ```
3. เปิด Issue ที่ [GitHub Repository](https://github.com/Endlessedwork/gmail-notifier/issues)

---

## 🔄 การอัพเดทระบบ

### อัพเดทเวอร์ชันใหม่

```bash
# 1. Pull code ใหม่
git pull origin main

# 2. Rebuild และ restart
docker-compose up -d --build

# 3. ตรวจสอบว่าทำงานปกติ
docker logs gmail-notifier
```

---

**สร้างด้วย ❤️ โดย Claude Code**
