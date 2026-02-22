# Frontend API Integration

## Overview
Frontend ได้เชื่อมต่อกับ Backend API แล้วค่ะ โดยใช้ React Query สำหรับจัดการ state และ caching

## API Client Structure

### `/src/api/`
- `client.ts` - Base API client และ error handling
- `gmail-accounts.ts` - Gmail Account API
- `notification-channels.ts` - Notification Channel API (Telegram, LINE, Webhook)
- `filter-rules.ts` - Filter Rule API
- `notification-logs.ts` - Notification Log API
- `index.ts` - Export all APIs

### `/src/hooks/`
- `useGmailAccounts.ts` - React Query hooks สำหรับ Gmail Accounts
- `useNotificationChannels.ts` - React Query hooks สำหรับ Channels
- `useFilterRules.ts` - React Query hooks สำหรับ Filter Rules
- `useNotificationLogs.ts` - React Query hooks สำหรับ Logs

## Updated Components

### Gmail Management
- `/src/components/gmail/GmailManagement.tsx` - ใช้ API แทน localStorage
- `/src/components/gmail/GmailDialog.tsx` - เพิ่ม IMAP settings และ loading states

### Channel Management (เดิมคือ TelegramManagement)
- `/src/components/channels/ChannelManagement.tsx` - รองรับ Telegram, LINE, Webhook
- `/src/components/channels/ChannelDialog.tsx` - Dynamic form ตาม channel type

### Filter Management
- `/src/components/filters/FilterManagement.tsx` - Multi-account และ multi-channel support
- `/src/components/filters/FilterDialog.tsx` - เลือก account และ channel ได้

### Dashboard
- `/src/components/dashboard/RecentLogs.tsx` - แสดง Notification Logs จาก API

## Features Implemented

### ✅ API Integration
- [x] Gmail Account CRUD
- [x] Notification Channel CRUD (Telegram, LINE, Webhook)
- [x] Filter Rule CRUD
- [x] Notification Logs (Read-only)
- [x] Loading states
- [x] Error handling
- [x] Auto-refresh สำหรับ logs (10 วินาที)

### ✅ Multi-Account Support
- [x] เพิ่ม Gmail accounts ได้หลายบัญชี
- [x] Filter rules เลือก account ได้
- [x] แสดง account email ในรายการ rules

### ✅ Multi-Channel Support
- [x] Telegram (bot_token + chat_id)
- [x] LINE (access_token)
- [x] Webhook (url + optional headers)
- [x] Channel icons และ colors

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## API Endpoints Used

```
GET    /api/v1/gmail-accounts
POST   /api/v1/gmail-accounts
PUT    /api/v1/gmail-accounts/:id
PATCH  /api/v1/gmail-accounts/:id
DELETE /api/v1/gmail-accounts/:id

GET    /api/v1/notification-channels
POST   /api/v1/notification-channels
PUT    /api/v1/notification-channels/:id
PATCH  /api/v1/notification-channels/:id
DELETE /api/v1/notification-channels/:id

GET    /api/v1/filter-rules
POST   /api/v1/filter-rules
PUT    /api/v1/filter-rules/:id
PATCH  /api/v1/filter-rules/:id
DELETE /api/v1/filter-rules/:id

GET    /api/v1/notification-logs
GET    /api/v1/notification-logs/:id
```

## Testing

### Prerequisites
1. Start Backend API: `cd backend && python -m uvicorn backend.main:app --reload`
2. Start Frontend: `cd frontend && npm run dev`

### Test Flow
1. เพิ่ม Gmail Account ใน Gmail Accounts page
2. เพิ่ม Notification Channel ใน Notification Channels page
3. สร้าง Filter Rule ใน Filter Rules page (เลือก account และ channel)
4. ตรวจสอบ Notification Logs ใน Dashboard

## Next Steps
- [ ] เชื่อม Dashboard metrics กับ API (ถ้ามี endpoint)
- [ ] Settings page integration
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Pagination สำหรับ logs
