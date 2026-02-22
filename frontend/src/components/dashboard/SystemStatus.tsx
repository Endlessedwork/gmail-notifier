import { useHealthCheck, useMetrics } from '@/hooks/useLogs'
import { useConfig } from '@/hooks/useConfig'
import { Activity } from 'lucide-react'
import { Badge } from '../ui/badge'

export function SystemStatus() {
  const { data: health } = useHealthCheck()
  const { data: metrics } = useMetrics()
  const { data: config } = useConfig()

  const isHealthy = health?.status === 'healthy'

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className={isHealthy ? 'text-green-600' : 'text-muted-foreground'} />
          System Status
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Service</span>
          <Badge variant={isHealthy ? 'default' : 'destructive'}>
            {isHealthy ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Check Interval */}
        {config?.settings && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Check Interval</span>
            <span className="font-medium">
              {config.settings.check_interval}s
            </span>
          </div>
        )}

        {/* IMAP Server */}
        {config?.settings && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">IMAP Server</span>
            <span className="text-xs font-mono">
              {config.settings.imap_server}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processed</span>
            <span className="font-medium">
              {metrics?.total_emails_processed?.toLocaleString() || 0}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sent</span>
            <span className="font-medium">
              {metrics?.total_notifications_sent?.toLocaleString() || 0}
            </span>
          </div>

          {metrics && metrics.errors_count > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Errors</span>
              <span className="font-medium text-destructive">
                {metrics.errors_count.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
