# 🚀 Quick Start Guide

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

เปิด browser ที่ `http://localhost:3000`

## Build for Production

```bash
npm run build
```

Output: `dist/` directory

## Project Status

### ✅ ทำเสร็จแล้ว

**Foundation (100%)**
- ✅ Project structure & configuration
- ✅ TypeScript setup (strict mode)
- ✅ Tailwind CSS + custom theme
- ✅ Vite bundler + dev server
- ✅ React Router v6
- ✅ TanStack Query (data fetching)
- ✅ Framer Motion (animations)

**API Layer (100%)**
- ✅ API client (`src/lib/api.ts`)
- ✅ Custom hooks (`useConfig`, `useLogs`, etc.)
- ✅ TypeScript types
- ✅ Error handling

**Layout (100%)**
- ✅ Main Layout with Sidebar
- ✅ Header with stats
- ✅ Navigation
- ✅ Responsive design

**Dashboard (100%)**
- ✅ Stats Cards (metrics overview)
- ✅ Recent Logs viewer (50 entries, auto-refresh)
- ✅ Active Filters widget
- ✅ System Status panel

**Management Pages (100%)**
- ✅ Gmail Accounts page
- ✅ Telegram Channels page
- ✅ Filter Rules page (with delete functionality)
- ✅ Settings page

**UI Components (100%)**
- ✅ Button with variants
- ✅ Badge
- ✅ ScrollArea
- ✅ Glass morphism utilities

### 🚧 ยังต้องเพิ่ม (Optional Enhancements)

**Forms & Dialogs**
- [ ] Add/Edit Gmail Account dialog
- [ ] Add/Edit Telegram Channel dialog
- [ ] Add/Edit Filter Rule dialog (with visual builder)
- [ ] Form validation (React Hook Form + Zod)

**UI Components**
- [ ] Dialog/Modal component
- [ ] Input component
- [ ] Select component
- [ ] Table component
- [ ] Loading skeleton components

**Features**
- [ ] Test notification button
- [ ] Filter rule priority drag-and-drop
- [ ] Bulk operations (enable/disable multiple rules)
- [ ] Export/Import config
- [ ] Dark/Light theme toggle

**Quality**
- [ ] Error boundaries
- [ ] Loading states for all mutations
- [ ] Optimistic updates
- [ ] Unit tests
- [ ] E2E tests

## Design System

### Colors
- **Primary (Cyan)**: `#38bec9` - Main actions, active states
- **Secondary (Blue)**: `#3b82f6` - Secondary elements
- **Accent (Amber)**: `#f0b429` - Success states, highlights
- **Background**: `#102a43` - Dark navy base
- **Card**: `#1a3a52` - Card backgrounds

### Typography
- **Headings**: IBM Plex Mono (monospace)
- **Body**: Inter Variable (sans-serif)

### Special Effects
- **Glass Morphism**: `.glass` and `.glass-strong`
- **Gradient Borders**: `.gradient-border`
- **Animations**: Framer Motion spring animations
- **Noise Texture**: Subtle grain overlay

## API Endpoints

Dashboard connects to backend API at `http://localhost:8000/api`

**Config**
- `GET /api/config` - Get configuration
- `PUT /api/config` - Update configuration

**Filter Rules**
- `GET /api/rules` - List all rules
- `POST /api/rules` - Create rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

**Logs & Metrics**
- `GET /api/logs` - Get logs (limit, offset, level)
- `GET /api/metrics` - Get metrics
- `GET /api/health` - Health check

**Credentials**
- `GET /api/credentials` - Get credentials (masked)
- `PUT /api/credentials` - Update credentials

## Troubleshooting

### API Connection Failed
```bash
# Check if backend is running
curl http://localhost:8000/api/health
```

### Port 3000 Already in Use
```bash
# Change port in vite.config.ts
server: {
  port: 3001,  // Change this
}
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Start Backend API**
   ```bash
   cd ../api
   uvicorn main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
npm run dev
   ```

3. **Access Dashboard**
   Open `http://localhost:3000`

## Deployment

### Static Build
```bash
npm run build
# Output: dist/
```

### Docker
```bash
# In root directory
docker-compose up --build
```

Access at `http://localhost:8080`

---

**Happy coding! 🎨**
