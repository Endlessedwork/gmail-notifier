# 🚀 Gmail Notifier Deployment Guide

คู่มือการ deploy Gmail Notifier ไปยัง production servers

## 📦 Deployment Options

- [Easypanel](#-easypanel-deployment) (Recommended ⭐)
- [Docker Compose](#-docker-compose-deployment)
- [Manual Deployment](#%EF%B8%8F-manual-deployment)

---

## 🎯 Easypanel Deployment

Easypanel เป็น control panel สำหรับจัดการ Docker containers บน VPS แบบง่ายๆ

### Prerequisites

- Easypanel account และ server ที่ติดตั้ง Easypanel แล้ว
- GitHub repository access
- Domain name (optional, สามารถใช้ domain ของ Easypanel ได้)

---

### Step 1: เตรียม Encryption Key

**สร้าง ENCRYPTION_KEY** (สำคัญมาก! ใช้สำหรับเข้ารหัส Gmail passwords):

```bash
# วิธี 1: ใช้ Python
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# วิธี 2: ใช้ OpenSSL
openssl rand -base64 32
```

ตัวอย่างผลลัพธ์: `5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=`

⚠️ **เก็บ key นี้ไว้เป็นความลับ** และจะใช้ในขั้นตอนต่อไป

---

### Step 2: สร้าง App ใน Easypanel

1. **Login เข้า Easypanel Dashboard**

2. **เลือก Project → คลิก "Create Service"**

3. **Service Type:** App

4. **ตั้งค่า Source:**
   - **Source Type:** Git Repository
   - **Repository URL:** `https://github.com/Endlessedwork/gmail-notifier.git`
   - **Branch:** `main`

5. **ตั้งค่า Build:**
   - **Build Method:** Dockerfile
   - **Dockerfile Path:** `Dockerfile` (default)
   - **Context Path:** `.` (default)

---

### Step 3: Configure Environment Variables

ใน Easypanel → App Settings → **Environment** (หรือ Environment Variables):

**คลิก "Add Environment Variable"** และเพิ่ม:

**ค่าที่จำเป็น (REQUIRED):**

| Key | Value | คำอธิบาย |
|-----|-------|----------|
| `ENCRYPTION_KEY` | `<key-จากขั้นตอนที่-1>` | **จำเป็นมาก** - ใช้เข้ารหัส Gmail passwords |

**ตัวอย่าง:**
```
Key: ENCRYPTION_KEY
Value: 5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=
```

**ค่าเสริม (OPTIONAL)** - มีค่าเริ่มต้นแล้ว ไม่ต้องใส่ก็ได้:

| Key | Value | คำอธิบาย |
|-----|-------|----------|
| `DATABASE_URL` | `sqlite:///app/data/data.db` | เส้นทาง database (ใช้ค่าเริ่มต้น) |
| `CHECK_INTERVAL` | `60` | ตรวจสอบอีเมลทุกกี่วินาที (default: 60) |
| `MAX_BODY_LENGTH` | `300` | ความยาว email preview (default: 300) |
| `TZ` | `Asia/Bangkok` | Timezone (default: Asia/Bangkok) |
| `PYTHONUNBUFFERED` | `1` | สำหรับ logging (แนะนำให้ใส่) |

**สรุป:**
- ✅ **จำเป็นต้องใส่แค่ `ENCRYPTION_KEY` เท่านั้น**
- ✅ ค่าอื่นๆ มีค่าเริ่มต้นแล้ว (ใส่เพิ่มได้ถ้าต้องการปรับแต่ง)
- ✅ **ไม่ต้องใส่ Gmail/Telegram ใน ENV** จะตั้งค่าผ่าน Web UI แทน

⚠️ **ENCRYPTION_KEY ต้องเก็บเป็นความลับ** - อย่า commit ลง git หรือแชร์ให้คนอื่น

---

### Step 4: Configure Volumes (Persistent Storage)

**สำคัญมาก:** ต้องสร้าง Volume เพื่อเก็บ database ไม่ให้หายเมื่อ restart container

ใน Easypanel → App Settings → **Mounts** (หรือ Volumes):

**คลิก "เพิ่ม Volume Mount"** และกรอก:

| ฟิลด์ | ค่า | คำอธิบาย |
|------|-----|----------|
| **ชื่อ** | `data` | ชื่อ volume (ตั้งอะไรก็ได้) |
| **เส้นทางเชื่อมต่อ** | `/app/data` | **ต้องเป็นค่านี้เท่านั้น** |

**หมายเหตุ:**
- ✅ ใช้ **Volume Mount** (ไม่ใช่ Bind Mount หรือ File Mount)
- ✅ **เส้นทางเชื่อมต่อ** ต้องเป็น `/app/data` (ตรงกับที่ Docker ตั้งไว้)
- ✅ **ชื่อ** ตั้งอะไรก็ได้ (แนะนำใช้ `data` เพื่อความชัดเจน)
- ⚠️ **Volume นี้จำเป็นมาก** - เก็บ SQLite database ทั้งหมด
- 📌 สามารถเพิ่ม `/app/logs` volume ได้ (optional) ถ้าต้องการเก็บ logs

**ตัวอย่างการกรอก:**
```
ชื่อ: data
เส้นทางเชื่อมต่อ: /app/data
```

หรือถ้าต้องการเก็บ logs ด้วย:
```
ชื่อ: logs
เส้นทางเชื่อมต่อ: /app/logs
```

---

### Step 5: Configure Port & Domain

**Port Mapping:**
- **Container Port:** `80`
- **Protocol:** HTTP
- **Public:** เปิดให้ public

**Domain:**
- ใช้ Easypanel subdomain: `your-app.easypanel.host`
- หรือตั้ง Custom Domain ของคุณเอง

**SSL/HTTPS:**
- เปิด "Auto SSL" เพื่อใช้ HTTPS อัตโนมัติ ✅

---

### Step 6: Deploy!

1. **คลิก "Deploy"**
2. รอ build process (ประมาณ 3-5 นาที)
3. ตรวจสอบ Logs เพื่อดู deployment status

---

### Step 7: Initialize Database

**หลัง deployment สำเร็จ** ต้อง initialize database ก่อนใช้งาน:

**วิธีที่ 1: ผ่าน Easypanel Shell**
1. ไปที่ App → **Shell** หรือ **Terminal**
2. รันคำสั่ง:
   ```bash
   python -c "from backend.core.database import init_db; init_db()"
   ```

**วิธีที่ 2: ผ่าน Docker Exec** (ถ้า deploy บน VPS)
```bash
docker exec -it <container-name> python -c "from backend.core.database import init_db; init_db()"
```

**ตรวจสอบว่า database สร้างสำเร็จ:**
```bash
sqlite3 data/data.db ".tables"
```

ต้องเห็น 5 tables:
- `gmail_accounts`
- `notification_channels`
- `filter_rules`
- `notification_logs`
- `config_settings`

---

### Step 8: เข้าใช้งาน Web UI

เปิดเว็บไปที่ domain ที่ตั้งค่าไว้:

- **Frontend:** `https://your-app.easypanel.host`
- **API Docs:** `https://your-app.easypanel.host/api/docs`

ตอนนี้จะเห็น **Gmail Notifier Dashboard** แล้ว! 🎉

---

### Step 9: การตั้งค่าผ่าน Web UI

**ไม่ต้องแก้ไข ENV variables อีก** ตั้งค่าทุกอย่างผ่าน Web UI:

#### 1. เพิ่ม Gmail Account

1. ไปที่ **Gmail Accounts** → **Add Account**
2. กรอก:
   - **Email:** `your-email@gmail.com`
   - **App Password:** [สร้างจาก Google](https://myaccount.google.com/apppasswords)
   - **IMAP Server:** `imap.gmail.com` (default)
   - **IMAP Port:** `993` (default)
3. คลิก **Save**

**วิธีสร้าง Gmail App Password:**
1. ไปที่ https://myaccount.google.com/apppasswords
2. สร้าง App Password ใหม่ (ต้องเปิด 2-Step Verification ก่อน)
3. คัดลอก password 16 ตัว

---

#### 2. เพิ่ม Notification Channel

**สำหรับ Telegram:**

1. ไปที่ **Notification Channels** → **Add Channel**
2. เลือก **Type:** `Telegram`
3. กรอก:
   - **Name:** `My Telegram` (ชื่ออะไรก็ได้)
   - **Bot Token:** `123456:ABC...` (จาก [@BotFather](https://t.me/BotFather))
   - **Chat ID:** `-1001234567890` (จาก [@getidsbot](https://t.me/getidsbot))
4. คลิก **Save**

**วิธีหา Telegram Bot Token:**
1. คุยกับ [@BotFather](https://t.me/BotFather)
2. ส่ง `/newbot`
3. ตั้งชื่อ bot
4. คัดลอก **Bot Token**

**วิธีหา Chat ID:**
1. เพิ่ม bot เข้า group/channel
2. คุยกับ [@getidsbot](https://t.me/getidsbot)
3. ส่ง `/start`
4. คัดลอก **Chat ID** (เลขติดลบ สำหรับ groups)

**สำหรับ LINE Notify:**
1. Type: `LINE`
2. [สร้าง Token](https://notify-bot.line.me/my/)
3. กรอก Access Token

**สำหรับ Webhook:**
1. Type: `Webhook`
2. กรอก URL และ Method (POST/GET)

---

#### 3. สร้าง Filter Rule

1. ไปที่ **Filter Rules** → **Add Rule**
2. กรอก:
   - **Gmail Account:** เลือก account ที่สร้างไว้
   - **Rule Name:** `Banking Alerts` (ชื่ออะไรก็ได้)
   - **Field:** `from` (หรือ `subject`, `body`)
   - **Match Type:** `contains` (หรือ `regex`, `equals`)
   - **Match Value:** `bank.com` (คำที่ต้องการกรอง)
   - **Channel:** เลือก notification channel
   - **Priority:** `10` (เลขน้อย = ลำดับสูง)
3. คลิก **Save**

**ตัวอย่าง Filter Rules:**

| Rule Name | Field | Match Type | Match Value | Priority |
|-----------|-------|------------|-------------|----------|
| Banking | from | contains | bank | 10 |
| Invoice | subject | contains | invoice | 20 |
| All Gmail | from | contains | @gmail.com | 50 |
| Default | from | contains | * | 99 |

---

#### 4. ดู Notification Logs

ไปที่ **Dashboard** → **Recent Logs** เพื่อดู:
- อีเมลที่ได้รับ
- Rule ที่ match
- Notification ที่ส่งไป
- Status (sent/failed)

---

## 🐳 Docker Compose Deployment

สำหรับการ deploy บน VPS ทั่วไป (ไม่ใช้ Easypanel)

### Prerequisites

- Docker และ Docker Compose ติดตั้งแล้ว
- Server with public IP
- Domain name (optional)

---

### Setup Steps

**1. Clone repository**
```bash
git clone https://github.com/Endlessedwork/gmail-notifier.git
cd gmail-notifier
```

**2. สร้าง .env file**
```bash
cp .env.example .env
nano .env
```

**3. แก้ไข .env และเปลี่ยน ENCRYPTION_KEY**
```bash
# สร้าง key ใหม่
openssl rand -base64 32

# ใส่ใน .env
ENCRYPTION_KEY=<your-generated-key>
```

**4. Build และ Run**
```bash
docker-compose up -d --build
```

**5. Initialize Database**
```bash
docker exec -it gmail-notifier python -c "from backend.core.database import init_db; init_db()"
```

**6. ตรวจสอบ Logs**
```bash
docker logs -f gmail-notifier
```

**7. เข้าใช้งาน**
- Frontend: http://YOUR_SERVER_IP:3000
- API Docs: http://YOUR_SERVER_IP:3000/api/docs

---

### Nginx Reverse Proxy (Optional)

ถ้าต้องการใช้ custom domain กับ HTTPS:

**/etc/nginx/sites-available/gmail-notifier**
```nginx
server {
    listen 80;
    server_name gmail-notifier.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site และติดตั้ง SSL:
```bash
sudo ln -s /etc/nginx/sites-available/gmail-notifier /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL with Certbot
sudo certbot --nginx -d gmail-notifier.yourdomain.com
```

---

## 🛠️ Manual Deployment

สำหรับการ deploy โดยไม่ใช้ Docker (Advanced)

### Prerequisites

- Python 3.11+
- Node.js 18+
- Nginx
- SQLite3
- Supervisor (process manager)

---

### Backend Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Setup .env
cp .env.example .env
nano .env  # เปลี่ยน ENCRYPTION_KEY

# 3. Initialize database
mkdir -p data logs
sqlite3 data/data.db < migrations/001_init.sql

# 4. Test backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

### Worker Setup

```bash
# Test worker
python -m worker.main
```

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Build production
npm run build

# 3. Copy build to nginx
sudo mkdir -p /var/www/gmail-notifier
sudo cp -r dist/* /var/www/gmail-notifier/
```

---

### Nginx Configuration

**/etc/nginx/sites-available/gmail-notifier**
```nginx
server {
    listen 80;
    server_name gmail-notifier.yourdomain.com;

    root /var/www/gmail-notifier;
    index index.html;

    # API Proxy (FastAPI Backend)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/gmail-notifier /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Supervisor Configuration

**/etc/supervisor/conf.d/gmail-notifier.conf**
```ini
[program:gmail-notifier-api]
command=uvicorn backend.main:app --host 0.0.0.0 --port 8000
directory=/path/to/gmail-notifier
user=www-data
autostart=true
autorestart=true
stdout_logfile=/path/to/gmail-notifier/logs/api.log
stderr_logfile=/path/to/gmail-notifier/logs/api_err.log
environment=PYTHONUNBUFFERED="1"

[program:gmail-notifier-worker]
command=python -m worker.main
directory=/path/to/gmail-notifier
user=www-data
autostart=true
autorestart=true
stdout_logfile=/path/to/gmail-notifier/logs/worker.log
stderr_logfile=/path/to/gmail-notifier/logs/worker_err.log
environment=PYTHONUNBUFFERED="1"
stopwaitsecs=10
```

Start services:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start gmail-notifier-api
sudo supervisorctl start gmail-notifier-worker
```

---

## 🔍 Troubleshooting

### Database Errors

```bash
# Reset database
rm data/data.db
sqlite3 data/data.db < migrations/001_init.sql
```

---

### Check Logs

**Easypanel:**
- ไปที่ App → **Logs**

**Docker Compose:**
```bash
docker logs -f gmail-notifier
```

**Manual Deployment:**
```bash
tail -f logs/api.log
tail -f logs/worker.log
```

---

### Build Failed

**เช็ค Easypanel:**
- Dockerfile Path: `Dockerfile`
- Build Context: `.`
- Repository URL ถูกต้อง

**เช็ค Docker:**
```bash
docker build -t gmail-notifier .
```

---

### Port Conflicts

แก้ไขใน `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # เปลี่ยนจาก 3000 เป็น 8080
```

---

### Permission Issues

```bash
chmod 755 data logs
chown -R 1000:1000 data logs  # ถ้าใช้ Docker
```

---

### Gmail Connection Failed

**เช็ค:**
1. Gmail App Password ถูกต้อง (16 ตัว)
2. 2-Step Verification เปิดแล้ว
3. IMAP enabled ใน Gmail Settings

**ทดสอบ IMAP:**
```bash
telnet imap.gmail.com 993
```

---

### Notification Not Sent

**เช็ค Telegram:**
1. Bot Token ถูกต้อง: `https://api.telegram.org/bot<TOKEN>/getMe`
2. Chat ID ถูกต้อง
3. Bot เป็นสมาชิกใน group/channel

**เช็ค LINE:**
1. LINE Notify Token ถูกต้อง
2. Token ยังไม่ expired

**เช็ค Webhook:**
1. URL accessible
2. Endpoint รับ POST request

---

## 📊 Monitoring

### Health Check

```bash
# ตรวจสอบ API ทำงาน
curl http://your-domain/api/v1/config-settings

# ตรวจสอบ database
sqlite3 data/data.db "SELECT COUNT(*) FROM gmail_accounts;"
```

---

### Database Backup

**Manual Backup:**
```bash
# SQLite backup
sqlite3 data/data.db ".backup backup-$(date +%Y%m%d).db"

# หรือใช้ cp
cp data/data.db backups/data-$(date +%Y%m%d-%H%M%S).db
```

**Automated Backup (Cron):**
```bash
# เพิ่มใน crontab
0 2 * * * cd /path/to/gmail-notifier && sqlite3 data/data.db ".backup backups/data-$(date +\%Y\%m\%d).db"
```

---

### Log Rotation

สร้าง `/etc/logrotate.d/gmail-notifier`:
```
/path/to/gmail-notifier/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    copytruncate
}
```

---

## 🔄 Updates & Maintenance

### Update via Easypanel

**Auto Deploy (Recommended):**
1. Settings → **Auto Deploy**
2. เลือก Branch: `main`
3. เปิด Auto Deploy

ทุกครั้งที่ push ไป GitHub จะ deploy อัตโนมัติ!

**Manual Rebuild:**
1. ไปที่ Service
2. คลิก **Rebuild**

---

### Update via Docker Compose

```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

### Database Migration

ถ้ามี migration ใหม่:
```bash
# Run migration scripts
sqlite3 data/data.db < migrations/002_new_migration.sql
```

---

## 🔐 Security Best Practices

### Production Checklist

- ✅ ใช้ HTTPS เสมอ (Auto SSL ใน Easypanel หรือ Certbot)
- ✅ เก็บ `ENCRYPTION_KEY` เป็นความลับ (อย่า commit ลง git)
- ✅ Backup database เป็นประจำ (daily recommended)
- ✅ ตั้ง firewall (เปิดแค่ port 80, 443)
- ✅ อัปเดต dependencies เป็นประจำ
- ✅ Monitor logs สำหรับ errors
- ✅ ใช้ strong Gmail App Passwords
- ✅ ตรวจสอบ notification channels เป็นประจำ

---

### Environment Variables Security

**ใน Easypanel:**
- ตั้งค่า ENV ผ่าน UI (ไม่แสดงใน logs)
- ใช้ Secret Management ถ้ามี

**ใน .env file:**
```bash
# ต้อง .gitignore
echo ".env" >> .gitignore

# Permission
chmod 600 .env
```

---

## 📞 Support & Resources

- **GitHub Issues:** https://github.com/Endlessedwork/gmail-notifier/issues
- **Documentation:** [README.md](README.md)
- **API Documentation:** http://your-domain/api/docs
- **Frontend Integration:** [frontend/API_INTEGRATION.md](frontend/API_INTEGRATION.md)

---

## ✅ Quick Summary

### สำหรับ Easypanel (Recommended)

**7 ขั้นตอนง่ายๆ:**

1. **สร้าง ENCRYPTION_KEY:**
   ```bash
   openssl rand -base64 32
   ```
   (เก็บ key ไว้ใช้ในขั้นตอนต่อไป)

2. **Create App** → Git Repository:
   - URL: `https://github.com/Endlessedwork/gmail-notifier.git`
   - Branch: `main`
   - Build Method: Dockerfile

3. **ตั้งค่า Environment Variable:**
   - Key: `ENCRYPTION_KEY`
   - Value: `<key-ที่สร้างในขั้นตอนที่-1>`
   - (แค่นี้ตัวเดียว!)

4. **ตั้งค่า Volume Mount:**
   - Type: Volume Mount
   - ชื่อ: `data`
   - เส้นทางเชื่อมต่อ: `/app/data`

5. **Deploy!** (รอ 3-5 นาที)

6. **Initialize Database** (ผ่าน Shell):
   ```bash
   python -c "from backend.core.database import init_db; init_db()"
   ```

7. **เข้า Web UI** → ตั้งค่า Gmail/Telegram/Rules

**ง่ายมาก!** ไม่ต้องแก้ไข code หรือ config files เลย ตั้งค่าทุกอย่างผ่าน Web UI! 🎉

---

### จำไว้ว่า:
- ✅ ENV ใส่แค่ `ENCRYPTION_KEY` ตัวเดียว
- ✅ Volume Mount ต้องเป็น `/app/data` (เก็บ database)
- ✅ Gmail/Telegram/Rules ตั้งค่าผ่าน Web UI (ไม่ใช่ ENV)

---

**Happy Deploying! 🚀**
