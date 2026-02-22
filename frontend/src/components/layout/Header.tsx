import { Bell } from 'lucide-react'
import { useMetrics } from '@/hooks/useLogs'

export function Header() {
  const { data: metrics } = useMetrics()

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {new Date().toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Quick Stats */}
        {metrics && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {metrics.total_notifications_sent.toLocaleString()}
              </span>
              <span className="text-muted-foreground">ส่งแล้ว</span>
            </div>

            {metrics.errors_count > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-destructive/10 text-destructive">
                <span className="text-sm font-medium">
                  {metrics.errors_count} errors
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
