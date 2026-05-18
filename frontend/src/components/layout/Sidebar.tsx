import { NavLink } from 'react-router-dom'
import {
  Activity,
  Bell,
  Code2,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings as SettingsIcon,
  Webhook,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navigationGroups = [
  {
    label: 'ภาพรวม',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: 'live', end: true },
      { name: 'Notification Logs', href: '/dashboard/logs', icon: FileText },
    ],
  },
  {
    label: 'ตั้งค่า',
    items: [
      { name: 'Gmail Accounts', href: '/dashboard/gmail', icon: Mail },
      { name: 'Channels', href: '/dashboard/channels', icon: Bell },
      { name: 'Filter Rules', href: '/dashboard/filters', icon: Filter },
    ],
  },
  {
    label: 'ระบบ',
    items: [
      { name: 'Worker Status', href: '/dashboard/worker-status', icon: Activity },
      { name: 'Webhook Guide', href: '/dashboard/webhook-guide', icon: Webhook },
      { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
    ],
  },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const initials = (user?.username || 'AD').slice(0, 2).toUpperCase()

  return (
    <aside className="flex h-full w-[240px] flex-col gap-4 border-r border-[#1b1b1726] bg-[#fbfaf3] px-3.5 py-4">
      <NavLink to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-2 py-1.5 font-semibold tracking-[-0.01em]">
        <span className="relative grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-[conic-gradient(from_220deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] font-mono text-xs font-bold text-white shadow-[inset_0_0_0_2px_#fbfaf3] after:absolute after:right-[-2px] after:top-[-2px] after:h-1.5 after:w-1.5 after:rounded-full after:bg-[#34a853] after:ring-2 after:ring-[#fbfaf3]">
          G
        </span>
        <span className="text-sm">Gmail Notifier</span>
      </NavLink>

      <nav className="flex-1 space-y-4 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b675c]">
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition',
                    isActive
                      ? 'bg-[#1b1b170f] text-[#0e0e0c] before:absolute before:-left-3.5 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-[#1a73e8]'
                      : 'text-[#6b675c] hover:bg-[#1b1b170a] hover:text-[#0e0e0c]'
                  )
                }
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </span>
                {item.badge && (
                  <span className="rounded-full bg-[#34a85318] px-2 py-0.5 font-mono text-[10px] text-[#1f8f47]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <a
          href="https://github.com/Endlessedwork/gmail-notifier/blob/main/API_DOCUMENTATION.md"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#6b675c] transition hover:bg-[#1b1b170a] hover:text-[#0e0e0c]"
        >
          <span className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4" />
            API docs
          </span>
          <span className="font-mono text-[10px]">open</span>
        </a>
      </nav>

      <div className="border-t border-[#1b1b1726] pt-3">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-[#1b1b1726] bg-white p-2">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[conic-gradient(from_220deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] font-mono text-[11px] font-bold text-white shadow-[inset_0_0_0_2px_#fff]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold leading-tight">{user?.username || 'Admin'}</div>
            <div className="truncate font-mono text-[11px] text-[#6b675c]">{user?.email || 'admin@local'}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#ea433512] hover:text-[#ea4335]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
