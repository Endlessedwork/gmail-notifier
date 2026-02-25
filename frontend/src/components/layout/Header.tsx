import { Bell, Sun, Moon, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMetrics } from '@/hooks/useLogs'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: metrics } = useMetrics()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xs sm:text-sm font-medium text-muted-foreground hidden md:block">
          {new Date().toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
        <h2 className="text-xs sm:text-sm font-medium text-muted-foreground md:hidden">
          {new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Quick Stats (hidden on mobile) */}
        {metrics && (
          <div className="hidden sm:flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <Bell className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <span className="font-medium">
                {metrics.total_notifications_sent.toLocaleString()}
              </span>
              <span className="text-muted-foreground hidden md:inline">sent</span>
            </div>

            {metrics.errors_count > 0 && (
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-md bg-destructive/10 text-destructive">
                <span className="text-xs md:text-sm font-medium">
                  {metrics.errors_count}
                </span>
                <span className="hidden md:inline">errors</span>
              </div>
            )}
          </div>
        )}

        {/* User info & Logout */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 ml-2 pl-2 sm:pl-4 border-l border-border">
            <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm">
              <User className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive h-8 w-8 md:h-9 md:w-9"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
