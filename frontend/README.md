# Gmail Notifier Dashboard

Modern, production-grade Web UI for managing Gmail-Telegram Notifier system.

## 🎨 Design Concept: "Command Center Aesthetic"

A professional dashboard that feels like a mission control center for email notifications management.

### Design Pillars
- **Typography**: IBM Plex Mono (headings) + Inter Variable (body)
- **Color Palette**: Deep navy blue + electric cyan accents + warm amber
- **Motion**: Spring animations, stagger reveals
- **Layout**: Card-based modular grid with glass morphism
- **Details**: Custom gradient borders, animated status indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Backend API running on port 8000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000` with API proxy to `localhost:8000`

### Build

```bash
npm run build
```

Output: `dist/` directory

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── dashboard/          # Dashboard widgets
│   ├── gmail/              # Gmail account management
│   ├── telegram/           # Telegram channel management
│   ├── filters/            # Filter rules management
│   ├── settings/           # System settings
│   └── layout/             # Layout components (Sidebar, Header)
├── lib/
│   ├── api.ts             # API client
│   └── utils.ts           # Utility functions
├── hooks/
│   ├── useConfig.ts       # Config & rules hooks
│   └── useLogs.ts         # Logs & metrics hooks
├── types/
│   └── index.ts           # TypeScript types
├── App.tsx                # Main app with routing
└── main.tsx               # Entry point
```

## 🎯 Features

### ✅ Implemented
- ✅ Project structure & build config
- ✅ TypeScript setup with strict mode
- ✅ Tailwind CSS with custom theme
- ✅ React Router v6 with layouts
- ✅ TanStack Query for data fetching
- ✅ Framer Motion for animations
- ✅ API client with error handling
- ✅ Custom hooks for config/logs/metrics
- ✅ Layout components (Sidebar, Header)
- ✅ Dashboard skeleton

### 🚧 To Be Completed
- [ ] Dashboard components (RecentLogs, ActiveFilters, SystemStatus)
- [ ] Gmail Management (CRUD)
- [ ] Telegram Management (CRUD)
- [ ] Filter Rules Management (Visual builder)
- [ ] Settings page
- [ ] UI components (Card, Input, Select, Dialog, etc.)
- [ ] Form validation with Zod
- [ ] Error boundaries
- [ ] Loading states

## 🔧 Next Steps

1. **Complete Dashboard Components**
   ```bash
   src/components/dashboard/
   ├── RecentLogs.tsx
   ├── ActiveFilters.tsx
   └── SystemStatus.tsx
   ```

2. **Add UI Components**
   - Install shadcn/ui components
   - Create custom Card, Input, Select components

3. **Implement CRUD Pages**
   - Gmail accounts table with add/edit/delete
   - Telegram channels table with add/edit/delete
   - Filter rules with visual builder

4. **Add Forms & Validation**
   - React Hook Form + Zod schemas
   - Input validation feedback
   - Error handling

## 📦 Dependencies

### Core
- React 18.3
- TypeScript 5.2
- Vite 5.1

### UI & Styling
- Tailwind CSS 3.4
- Framer Motion 11.0
- Lucide React (icons)

### Data Management
- TanStack Query 5.20
- React Router DOM 6.22
- Zod 3.22 (validation)

### Utilities
- date-fns (date formatting)
- sonner (toast notifications)
- clsx + tailwind-merge

## 🎨 Design Tokens

### Colors
```css
--primary: 189 70% 56%        /* Cyan */
--secondary: 217 91% 60%      /* Blue */
--accent: 45 98% 56%          /* Amber */
--background: 222 47% 11%     /* Dark Navy */
--card: 222 47% 14%           /* Slightly lighter Navy */
```

### Typography
- Headings: IBM Plex Mono (mono font)
- Body: Inter Variable (sans-serif)

### Animations
- `slide-in`: Entrance animation
- `pulse-glow`: Status indicator
- `shimmer`: Loading effect

## 🔒 Security
- No hardcoded secrets
- API tokens masked in UI
- HTTPS recommended for production

## 📝 License
Private - Internal use only
