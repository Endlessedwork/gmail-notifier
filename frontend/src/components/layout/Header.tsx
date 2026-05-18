import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMetrics } from '@/hooks/useLogs'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { data: metrics } = useMetrics()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const routeLabel =
    [
      { path: '/', label: 'Dashboard' },
      { path: '/gmail', label: 'Gmail Accounts' },
      { path: '/channels', label: 'Channels' },
      { path: '/filters', label: 'Filter Rules' },
      { path: '/logs', label: 'Notification Logs' },
      { path: '/worker-status', label: 'Worker Status' },
      { path: '/webhook-guide', label: 'Webhook Guide' },
      { path: '/settings', label: 'Settings' },
    ].find((item) => item.path === location.pathname)?.label || 'Dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-[#1b1b1726] bg-[#f7f5ef]/90 px-4 backdrop-blur-md sm:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-[#6b675c]">
        <span className="hidden sm:inline">Workspace</span>
        <span className="hidden opacity-50 sm:inline">/</span>
        <span className="font-semibold text-[#0e0e0c]">{routeLabel}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden w-[280px] items-center rounded-[10px] border border-[#1b1b1726] bg-white pl-8 pr-2 lg:flex">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#6b675c]" />
          <input
            className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-[#8f8b7e]"
            placeholder="Search rules, accounts, logs..."
          />
          <span className="rounded border border-[#1b1b1726] bg-[#f7f5ef] px-1.5 py-0.5 font-mono text-[10px] text-[#6b675c]">
            cmd
          </span>
        </label>

        {metrics && (
          <div className="hidden items-center gap-3 rounded-[10px] border border-[#1b1b1726] bg-white px-3 py-2 text-xs sm:flex">
            <Bell className="h-4 w-4 text-[#6b675c]" />
            <span className="font-semibold">{metrics.total_notifications_sent.toLocaleString()}</span>
            <span className="text-[#6b675c]">sent</span>
            {metrics.errors_count > 0 && (
              <span className="rounded-full bg-[#ea433518] px-2 py-0.5 font-mono text-[10px] text-[#c43127]">
                {metrics.errors_count} errors
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#1b1b1726] bg-white text-[#1b1b17] transition hover:bg-[#efece2]"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#1b1b1726] bg-white text-[#6b675c] transition hover:bg-[#ea433512] hover:text-[#ea4335]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  )
}
