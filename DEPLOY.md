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

รันคำสั่งนี้:

```bash
openssl rand -base64 32
```

จะได้ key ออกมา เช่น: `5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=`

**เก็บไว้ใช้ขั้นตอนต่อไป**

---

### Step 2: สร้าง App ใน Easypanel

1. Login → เลือก Project → **Create Service**

2. **Service Type:** App

3. **Source:**
   ```
   Source Type: Git Repository
   Repository URL: https://github.com/Endlessedwork/gmail-notifier.git
   Branch: main
   ```

4. **Build:**
   ```
   Build Method: Dockerfile
   Dockerfile Path: Dockerfile
   Context Path: .
   ```

---

### Step 3: Configure Environment Variables

ไปที่ **Environment** → **Add Environment Variable**

**ใส่แค่ตัวเดียว:**

```
Key: ENCRYPTION_KEY
Value: <key-ที่สร้างจากขั้นตอนที่-1>
```

**ตัวอย่าง:**
```
ENCRYPTION_KEY=5P1yDhydES1grYjM9UShBmSKDMtRUkBM7USQNsIKh80=
```

**จบ!** ไม่ต้องใส่อะไรเพิ่ม

(Gmail/Telegram ตั้งค่าผ่าน Web UI ภายหลัง)

---

### Step 4: Configure Volumes (Persistent Storage)

ไปที่ **Mounts** → **เพิ่ม Volume Mount**

กรอกข้อมูล:

```
ชื่อ: data
เส้นทางเชื่อมต่อ: /app/data
```

**จบ!** (เก็บ database ไม่ให้หาย)

---

### Step 5: Configure Port & Domain

**Port:**
```
Container Port: 80
Protocol: HTTP
Public: ✓ เปิด
```

**Domain:** ใช้ของ Easypanel หรือตั้งเอง

**SSL:** เปิด Auto SSL

---

### Step 6: Deploy!

1. **คลิก "Deploy"**
2. รอ build process (ประมาณ 3-5 นาที)
3. ตรวจสอบ Logs เพื่อดู deployment status

---

### Step 7: Initialize Database

**หลัง deploy สำเร็จ** ไปที่ App → **Shell**

รันคำสั่ง:

```bash
python -c "from backend.core.database import init_db; init_db()"
```

เสร็จ!

---

### Step 8: เข้าใช้งาน

เปิด: `https://your-app.easypanel.host`

จะเห็น Dashboard แล้ว! 🎉

---

### Step 9: ตั้งค่าผ่าน Web UI

**1. เพิ่ม Gmail Account:**

Gmail Accounts → Add Account → กรอก:
```
Email: your-email@gmail.com
App Password: <สร้างจาก https://myaccount.google.com/apppasswords>
IMAP Server: imap.gmail.com
IMAP Port: 993
```

**2. เพิ่ม Telegram Channel:**

Notification Channels → Add Channel → กรอก:
```
Type: Telegram
Name: My Telegram
Bot Token: <จาก @BotFather>
Chat ID: <จาก @getidsbot>
```

**3. สร้าง Filter Rule:**

Filter Rules → Add Rule → กรอก:
```
Gmail Account: <เลือก account>
Rule Name: Banking Alerts
Field: from
Match Type: contains
Match Value: bank.com
Channel: <เลือก channel>
Priority: 10
```

**เสร็จ!** ระบบจะเริ่มตรวจสอบและส่ง notification อัตโนมัติ

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

## ✅ สรุปสั้นๆ

### Deploy บน Easypanel

1. **สร้าง key:**
   ```bash
   openssl rand -base64 32
   ```

2. **Create App:**
   - Git: `https://github.com/Endlessedwork/gmail-notifier.git`
   - Branch: `main`

3. **ENV:**
   ```
   ENCRYPTION_KEY=<key-จากขั้นตอนที่-1>
   ```

4. **Volume Mount:**
   ```
   ชื่อ: data
   เส้นทางเชื่อมต่อ: /app/data
   ```

5. **Deploy** (รอ 3-5 นาที)

6. **Init DB** (ผ่าน Shell):
   ```bash
   python -c "from backend.core.database import init_db; init_db()"
   ```

7. **เข้า Web UI** → ตั้งค่า Gmail/Telegram

**จบ!** 🚀

---

**Happy Deploying! 🚀**
