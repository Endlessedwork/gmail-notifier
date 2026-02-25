# 🔌 API Documentation - Gmail Notifier

## 📋 ภาพรวม

Gmail Notifier API เป็น RESTful API ที่พัฒนาด้วย FastAPI สำหรับจัดการระบบแจ้งเตือนอีเมลจาก Gmail

**Base URL:** `http://localhost:3000/api` (production) หรือ `http://localhost:8000` (development)

**API Documentation (Swagger UI):** `http://localhost:3000/api/docs`

---

## 🔐 Authentication

ปัจจุบัน API ไม่มีการ authenticate (เหมาะสำหรับ internal use)

> ⚠️ **Production Warning:** ควรเพิ่ม authentication (JWT, API Key) ก่อน deploy ใน public

---

## 📡 API Endpoints

### 1. Gmail Accounts

#### 1.1 List Gmail Accounts

**Endpoint:** `GET /gmail-accounts`

**Description:** ดึงรายการ Gmail accounts ทั้งหมด

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Offset for pagination |
| `limit` | integer | 100 | Maximum number of items to return |

**Response 200:**
```json
{
  "total": 2,
  "accounts": [
    {
      "id": 1,
      "name": "Work Email",
      "email": "work@gmail.com",
      "imap_server": "imap.gmail.com",
      "imap_port": 993,
      "enabled": true,
      "created_at": "2025-02-25T10:00:00",
      "updated_at": "2025-02-25T10:00:00"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/gmail-accounts?skip=0&limit=10"
```

---

#### 1.2 Get Gmail Account by ID

**Endpoint:** `GET /gmail-accounts/{account_id}`

**Description:** ดึงข้อมูล Gmail account ตาม ID

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_id` | integer | Yes | Gmail account ID |

**Response 200:**
```json
{
  "id": 1,
  "name": "Work Email",
  "email": "work@gmail.com",
  "imap_server": "imap.gmail.com",
  "imap_port": 993,
  "enabled": true,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T10:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Gmail account 1 not found"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/gmail-accounts/1"
```

---

#### 1.3 Create Gmail Account

**Endpoint:** `POST /gmail-accounts`

**Description:** สร้าง Gmail account ใหม่

**Request Body:**
```json
{
  "name": "Personal Email",
  "email": "personal@gmail.com",
  "password": "abcd efgh ijkl mnop",
  "imap_server": "imap.gmail.com",
  "imap_port": 993,
  "enabled": true
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | ชื่อเรียกบัญชี |
| `email` | string | Yes | Gmail address |
| `password` | string | Yes | Gmail App Password (16 characters) |
| `imap_server` | string | No | IMAP server (default: imap.gmail.com) |
| `imap_port` | integer | No | IMAP port (default: 993) |
| `enabled` | boolean | No | Enable/disable account (default: true) |

**Response 201:**
```json
{
  "id": 2,
  "name": "Personal Email",
  "email": "personal@gmail.com",
  "imap_server": "imap.gmail.com",
  "imap_port": 993,
  "enabled": true,
  "created_at": "2025-02-25T11:00:00",
  "updated_at": "2025-02-25T11:00:00"
}
```

**Response 400:**
```json
{
  "detail": "Email already exists"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Personal Email",
    "email": "personal@gmail.com",
    "password": "abcd efgh ijkl mnop",
    "enabled": true
  }'
```

---

#### 1.4 Test Gmail Connection

**Endpoint:** `POST /gmail-accounts/test-connection`

**Description:** ทดสอบการเชื่อมต่อ IMAP โดยไม่บันทึกข้อมูล

**Request Body:**
```json
{
  "email": "test@gmail.com",
  "password": "abcd efgh ijkl mnop",
  "imap_server": "imap.gmail.com",
  "imap_port": 993
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "เชื่อมต่อสำเร็จ"
}
```

**Response 400:**
```json
{
  "detail": "IMAP error: [AUTHENTICATIONFAILED] Invalid credentials"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts/test-connection" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "abcd efgh ijkl mnop",
    "imap_server": "imap.gmail.com",
    "imap_port": 993
  }'
```

---

#### 1.5 Test Existing Account Connection

**Endpoint:** `POST /gmail-accounts/{account_id}/test-connection`

**Description:** ทดสอบการเชื่อมต่อ IMAP ของ account ที่มีอยู่แล้ว

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_id` | integer | Yes | Gmail account ID |

**Response 200:**
```json
{
  "success": true,
  "message": "เชื่อมต่อสำเร็จ"
}
```

**Response 404:**
```json
{
  "detail": "Account not found"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts/1/test-connection"
```

---

#### 1.6 Check Emails Now

**Endpoint:** `POST /gmail-accounts/{account_id}/check-now`

**Description:** ดึงอีเมลทันทีสำหรับ account นี้ (ไม่รอรอบปกติ)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_id` | integer | Yes | Gmail account ID |

**Response 200:**
```json
{
  "success": true,
  "message": "ตรวจสอบอีเมลเรียบร้อย"
}
```

**Response 404:**
```json
{
  "detail": "Account not found"
}
```

**Response 500:**
```json
{
  "detail": "IMAP connection failed"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts/1/check-now"
```

---

#### 1.7 Update Gmail Account

**Endpoint:** `PUT /gmail-accounts/{account_id}`

**Description:** อัพเดท Gmail account

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_id` | integer | Yes | Gmail account ID |

**Request Body:** (ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข)
```json
{
  "name": "Updated Name",
  "password": "new app password",
  "enabled": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "email": "work@gmail.com",
  "imap_server": "imap.gmail.com",
  "imap_port": 993,
  "enabled": false,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T12:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Gmail account 1 not found"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/gmail-accounts/1" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

---

#### 1.8 Delete Gmail Account

**Endpoint:** `DELETE /gmail-accounts/{account_id}`

**Description:** ลบ Gmail account (จะลบ filter rules ที่เกี่ยวข้องด้วย)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_id` | integer | Yes | Gmail account ID |

**Response 204:** No Content

**Response 404:**
```json
{
  "detail": "Gmail account 1 not found"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/gmail-accounts/1"
```

---

### 2. Notification Channels

#### 2.1 List Notification Channels

**Endpoint:** `GET /notification-channels`

**Description:** ดึงรายการ notification channels ทั้งหมด

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Offset for pagination |
| `limit` | integer | 100 | Maximum number of items to return |

**Response 200:**
```json
{
  "total": 3,
  "channels": [
    {
      "id": 1,
      "type": "telegram",
      "name": "Work Telegram",
      "config": {
        "bot_token": "123456789:ABC...",
        "chat_id": "-1001234567890"
      },
      "enabled": true,
      "created_at": "2025-02-25T10:00:00",
      "updated_at": "2025-02-25T10:00:00"
    },
    {
      "id": 2,
      "type": "line",
      "name": "LINE Notify",
      "config": {
        "access_token": "abc123..."
      },
      "enabled": true,
      "created_at": "2025-02-25T10:05:00",
      "updated_at": "2025-02-25T10:05:00"
    },
    {
      "id": 3,
      "type": "webhook",
      "name": "Custom Webhook",
      "config": {
        "url": "https://api.example.com/webhook",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer xxx"
        }
      },
      "enabled": true,
      "created_at": "2025-02-25T10:10:00",
      "updated_at": "2025-02-25T10:10:00"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/notification-channels"
```

---

#### 2.2 Get Notification Channel by ID

**Endpoint:** `GET /notification-channels/{channel_id}`

**Description:** ดึงข้อมูล notification channel ตาม ID

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel_id` | integer | Yes | Notification channel ID |

**Response 200:**
```json
{
  "id": 1,
  "type": "telegram",
  "name": "Work Telegram",
  "config": {
    "bot_token": "123456789:ABC...",
    "chat_id": "-1001234567890"
  },
  "enabled": true,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T10:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Notification channel 1 not found"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/notification-channels/1"
```

---

#### 2.3 Create Notification Channel

**Endpoint:** `POST /notification-channels`

**Description:** สร้าง notification channel ใหม่

**Request Body Examples:**

**Telegram:**
```json
{
  "type": "telegram",
  "name": "My Telegram",
  "config": {
    "bot_token": "123456789:ABC-DEF...",
    "chat_id": "-1001234567890"
  },
  "enabled": true
}
```

**LINE:**
```json
{
  "type": "line",
  "name": "LINE Notify",
  "config": {
    "access_token": "abc123xyz..."
  },
  "enabled": true
}
```

**Webhook:**
```json
{
  "type": "webhook",
  "name": "Custom Webhook",
  "config": {
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token123"
    }
  },
  "enabled": true
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Channel type: `telegram`, `line`, `webhook` |
| `name` | string | Yes | Channel name |
| `config` | object | Yes | Channel-specific configuration (see below) |
| `enabled` | boolean | No | Enable/disable channel (default: true) |

**Config Field by Type:**

| Type | Required Fields | Optional Fields |
|------|----------------|-----------------|
| `telegram` | `bot_token`, `chat_id` | - |
| `line` | `access_token` | - |
| `webhook` | `url`, `method` | `headers` |

**Response 201:**
```json
{
  "id": 1,
  "type": "telegram",
  "name": "My Telegram",
  "config": {
    "bot_token": "123456789:ABC...",
    "chat_id": "-1001234567890"
  },
  "enabled": true,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T10:00:00"
}
```

**Response 400:**
```json
{
  "detail": "Invalid channel configuration"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/notification-channels" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "telegram",
    "name": "Work Telegram",
    "config": {
      "bot_token": "123456789:ABC...",
      "chat_id": "-1001234567890"
    },
    "enabled": true
  }'
```

---

#### 2.4 Update Notification Channel

**Endpoint:** `PUT /notification-channels/{channel_id}`

**Description:** อัพเดท notification channel

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel_id` | integer | Yes | Notification channel ID |

**Request Body:** (ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข)
```json
{
  "name": "Updated Name",
  "enabled": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "type": "telegram",
  "name": "Updated Name",
  "config": {
    "bot_token": "123456789:ABC...",
    "chat_id": "-1001234567890"
  },
  "enabled": false,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T12:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Notification channel 1 not found"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/notification-channels/1" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

---

#### 2.5 Delete Notification Channel

**Endpoint:** `DELETE /notification-channels/{channel_id}`

**Description:** ลบ notification channel (จะลบ filter rules ที่ใช้ channel นี้ด้วย)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel_id` | integer | Yes | Notification channel ID |

**Response 204:** No Content

**Response 404:**
```json
{
  "detail": "Notification channel 1 not found"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/notification-channels/1"
```

---

### 3. Filter Rules

#### 3.1 List Filter Rules

**Endpoint:** `GET /filter-rules`

**Description:** ดึงรายการ filter rules ทั้งหมด

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Offset for pagination |
| `limit` | integer | 100 | Maximum number of items to return |
| `account_id` | integer | - | Filter by Gmail account ID |

**Response 200:**
```json
{
  "total": 2,
  "rules": [
    {
      "id": 1,
      "gmail_account_id": 1,
      "notification_channel_id": 1,
      "name": "Banking Alerts",
      "field": "from",
      "match_type": "contains",
      "match_value": "bank.com",
      "priority": 10,
      "enabled": true,
      "created_at": "2025-02-25T10:00:00",
      "updated_at": "2025-02-25T10:00:00"
    }
  ]
}
```

**Example:**
```bash
# Get all rules
curl -X GET "http://localhost:3000/api/filter-rules"

# Get rules for specific account
curl -X GET "http://localhost:3000/api/filter-rules?account_id=1"
```

---

#### 3.2 Get Filter Rule by ID

**Endpoint:** `GET /filter-rules/{rule_id}`

**Description:** ดึงข้อมูล filter rule ตาม ID

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | integer | Yes | Filter rule ID |

**Response 200:**
```json
{
  "id": 1,
  "gmail_account_id": 1,
  "notification_channel_id": 1,
  "name": "Banking Alerts",
  "field": "from",
  "match_type": "contains",
  "match_value": "bank.com",
  "priority": 10,
  "enabled": true,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T10:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Filter rule 1 not found"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/filter-rules/1"
```

---

#### 3.3 Create Filter Rule

**Endpoint:** `POST /filter-rules`

**Description:** สร้าง filter rule ใหม่

**Request Body:**
```json
{
  "gmail_account_id": 1,
  "notification_channel_id": 1,
  "name": "Important Invoices",
  "field": "subject",
  "match_type": "contains",
  "match_value": "invoice",
  "priority": 5,
  "enabled": true
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gmail_account_id` | integer | Yes | Gmail account ID to monitor |
| `notification_channel_id` | integer | Yes | Channel ID to send notifications |
| `name` | string | Yes | Rule name |
| `field` | string | Yes | Email field to match: `from`, `subject`, `body` |
| `match_type` | string | Yes | Match type: `contains`, `equals`, `regex` |
| `match_value` | string | Yes | Value to match against |
| `priority` | integer | Yes | Priority (lower = higher priority) |
| `enabled` | boolean | No | Enable/disable rule (default: true) |

**Match Type Examples:**

| Match Type | Example | Description |
|-----------|---------|-------------|
| `contains` | `bank.com` | Field contains "bank.com" |
| `equals` | `noreply@bank.com` | Field exactly equals "noreply@bank.com" |
| `regex` | `^invoice-\d+$` | Field matches regex pattern |

**Response 201:**
```json
{
  "id": 2,
  "gmail_account_id": 1,
  "notification_channel_id": 1,
  "name": "Important Invoices",
  "field": "subject",
  "match_type": "contains",
  "match_value": "invoice",
  "priority": 5,
  "enabled": true,
  "created_at": "2025-02-25T11:00:00",
  "updated_at": "2025-02-25T11:00:00"
}
```

**Response 400:**
```json
{
  "detail": "Invalid field or match_type"
}
```

**Response 404:**
```json
{
  "detail": "Gmail account or notification channel not found"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/filter-rules" \
  -H "Content-Type: application/json" \
  -d '{
    "gmail_account_id": 1,
    "notification_channel_id": 1,
    "name": "Banking Alerts",
    "field": "from",
    "match_type": "contains",
    "match_value": "bank.com",
    "priority": 10,
    "enabled": true
  }'
```

---

#### 3.4 Update Filter Rule

**Endpoint:** `PUT /filter-rules/{rule_id}`

**Description:** อัพเดท filter rule

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | integer | Yes | Filter rule ID |

**Request Body:** (ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข)
```json
{
  "priority": 1,
  "enabled": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "gmail_account_id": 1,
  "notification_channel_id": 1,
  "name": "Banking Alerts",
  "field": "from",
  "match_type": "contains",
  "match_value": "bank.com",
  "priority": 1,
  "enabled": false,
  "created_at": "2025-02-25T10:00:00",
  "updated_at": "2025-02-25T12:00:00"
}
```

**Response 404:**
```json
{
  "detail": "Filter rule 1 not found"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/filter-rules/1" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": 1
  }'
```

---

#### 3.5 Delete Filter Rule

**Endpoint:** `DELETE /filter-rules/{rule_id}`

**Description:** ลบ filter rule

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | integer | Yes | Filter rule ID |

**Response 204:** No Content

**Response 404:**
```json
{
  "detail": "Filter rule 1 not found"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/filter-rules/1"
```

---

### 4. Notification Logs

#### 4.1 List Notification Logs

**Endpoint:** `GET /notification-logs`

**Description:** ดึงรายการ notification logs พร้อม filtering และ pagination

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | integer | 0 | Offset for pagination |
| `limit` | integer | 100 | Maximum number of items (max: 500) |
| `account_id` | integer | - | Filter by Gmail account ID |
| `status` | string | - | Filter by status: `pending`, `sent`, `failed` |

**Response 200:**
```json
{
  "total": 150,
  "logs": [
    {
      "id": 1,
      "gmail_account_id": 1,
      "notification_channel_id": 1,
      "filter_rule_id": 1,
      "email_from": "noreply@bank.com",
      "email_subject": "Transaction Alert",
      "email_body": "Your account balance is...",
      "status": "sent",
      "sent_at": "2025-02-25T10:30:00",
      "error_message": null,
      "created_at": "2025-02-25T10:30:00"
    },
    {
      "id": 2,
      "gmail_account_id": 1,
      "notification_channel_id": 2,
      "filter_rule_id": 2,
      "email_from": "invoice@company.com",
      "email_subject": "Invoice #12345",
      "email_body": "Please find attached...",
      "status": "failed",
      "sent_at": null,
      "error_message": "Telegram API error: Bot token invalid",
      "created_at": "2025-02-25T10:35:00"
    }
  ]
}
```

**Example:**
```bash
# Get all logs
curl -X GET "http://localhost:3000/api/notification-logs"

# Get logs with pagination
curl -X GET "http://localhost:3000/api/notification-logs?offset=0&limit=50"

# Get only failed logs
curl -X GET "http://localhost:3000/api/notification-logs?status=failed"

# Get logs for specific account
curl -X GET "http://localhost:3000/api/notification-logs?account_id=1"
```

---

#### 4.2 Get Notification Log by ID

**Endpoint:** `GET /notification-logs/{log_id}`

**Description:** ดึงข้อมูล notification log ตาม ID

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `log_id` | integer | Yes | Notification log ID |

**Response 200:**
```json
{
  "id": 1,
  "gmail_account_id": 1,
  "notification_channel_id": 1,
  "filter_rule_id": 1,
  "email_from": "noreply@bank.com",
  "email_subject": "Transaction Alert",
  "email_body": "Your account balance is...",
  "status": "sent",
  "sent_at": "2025-02-25T10:30:00",
  "error_message": null,
  "created_at": "2025-02-25T10:30:00"
}
```

**Response 404:**
```json
{
  "detail": "Notification log 1 not found"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/notification-logs/1"
```

---

#### 4.3 Get Notification Stats

**Endpoint:** `GET /notification-logs/stats`

**Description:** ดึงสถิติการส่ง notification

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `account_id` | integer | - | Filter by Gmail account ID |

**Response 200:**
```json
{
  "total": 150,
  "sent": 142,
  "failed": 8,
  "pending": 0,
  "success_rate": 94.67,
  "by_channel": {
    "1": {
      "channel_name": "Telegram Work",
      "total": 80,
      "sent": 78,
      "failed": 2
    },
    "2": {
      "channel_name": "LINE Notify",
      "total": 70,
      "sent": 64,
      "failed": 6
    }
  },
  "by_account": {
    "1": {
      "account_name": "Work Email",
      "total": 100,
      "sent": 95,
      "failed": 5
    },
    "2": {
      "account_name": "Personal Email",
      "total": 50,
      "sent": 47,
      "failed": 3
    }
  }
}
```

**Example:**
```bash
# Get overall stats
curl -X GET "http://localhost:3000/api/notification-logs/stats"

# Get stats for specific account
curl -X GET "http://localhost:3000/api/notification-logs/stats?account_id=1"
```

---

## 🔄 Common Response Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## 📝 Error Response Format

**Standard Error Response:**
```json
{
  "detail": "Error message here"
}
```

**Validation Error Response (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "priority"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## 🧪 Testing API with cURL

### Complete Workflow Example

**1. Create Gmail Account:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Account",
    "email": "test@gmail.com",
    "password": "abcd efgh ijkl mnop"
  }'
```

**2. Create Telegram Channel:**
```bash
curl -X POST "http://localhost:3000/api/notification-channels" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "telegram",
    "name": "Test Telegram",
    "config": {
      "bot_token": "123456789:ABC...",
      "chat_id": "-1001234567890"
    }
  }'
```

**3. Create Filter Rule:**
```bash
curl -X POST "http://localhost:3000/api/filter-rules" \
  -H "Content-Type: application/json" \
  -d '{
    "gmail_account_id": 1,
    "notification_channel_id": 1,
    "name": "Test Rule",
    "field": "subject",
    "match_type": "contains",
    "match_value": "test",
    "priority": 10
  }'
```

**4. Trigger Email Check:**
```bash
curl -X POST "http://localhost:3000/api/gmail-accounts/1/check-now"
```

**5. Check Logs:**
```bash
curl -X GET "http://localhost:3000/api/notification-logs?limit=10"
```

---

## 🔍 Advanced Query Examples

### Pagination

```bash
# Get first page (20 items)
curl -X GET "http://localhost:3000/api/notification-logs?limit=20&offset=0"

# Get second page
curl -X GET "http://localhost:3000/api/notification-logs?limit=20&offset=20"

# Get third page
curl -X GET "http://localhost:3000/api/notification-logs?limit=20&offset=40"
```

### Combined Filters

```bash
# Get failed logs for account 1, limit 50
curl -X GET "http://localhost:3000/api/notification-logs?account_id=1&status=failed&limit=50"
```

---

## 🛠️ Development Tools

### Swagger UI (Interactive API Docs)

Access at: `http://localhost:3000/api/docs`

**Features:**
- Try out endpoints directly in browser
- View request/response schemas
- Auto-generated examples
- Authentication testing

### ReDoc (Alternative API Docs)

Access at: `http://localhost:3000/api/redoc`

**Features:**
- Clean, readable documentation
- Schema visualization
- Code examples in multiple languages

---

## 📦 Data Models

### GmailAccount

```typescript
{
  id: number
  name: string
  email: string
  // password: encrypted, not exposed in responses
  imap_server: string
  imap_port: number
  enabled: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### NotificationChannel

```typescript
{
  id: number
  type: "telegram" | "line" | "webhook"
  name: string
  config: {
    // Telegram
    bot_token?: string
    chat_id?: string

    // LINE
    access_token?: string

    // Webhook
    url?: string
    method?: "GET" | "POST"
    headers?: Record<string, string>
  }
  enabled: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### FilterRule

```typescript
{
  id: number
  gmail_account_id: number
  notification_channel_id: number
  name: string
  field: "from" | "subject" | "body"
  match_type: "contains" | "equals" | "regex"
  match_value: string
  priority: number
  enabled: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### NotificationLog

```typescript
{
  id: number
  gmail_account_id: number
  notification_channel_id: number
  filter_rule_id: number
  email_from: string
  email_subject: string
  email_body: string
  status: "pending" | "sent" | "failed"
  sent_at: string | null (ISO 8601)
  error_message: string | null
  created_at: string (ISO 8601)
}
```

---

## 🔐 Security Best Practices

### Production Deployment

**1. Add Authentication:**
```python
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key
```

**2. Enable HTTPS:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

**3. Rate Limiting:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/gmail-accounts")
@limiter.limit("100/minute")
async def list_accounts():
    ...
```

**4. CORS Configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

## 💬 Support

- **API Documentation:** http://localhost:3000/api/docs
- **GitHub Issues:** https://github.com/Endlessedwork/gmail-notifier/issues
- **Email:** support@example.com

---

**สร้างด้วย ❤️ โดย Claude Code**
