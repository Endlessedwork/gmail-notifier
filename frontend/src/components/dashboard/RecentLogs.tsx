import { useLogs } from '@/hooks/useLogs'
import { formatRelativeTime, getLogLevelColor } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react'

const levelIcons = {
  ERROR: AlertCircle,
  WARNING: AlertTriangle,
  INFO: Info,
  DEBUG: Bug,
}

export function RecentLogs() {
  const { data: logsData, isLoading } = useLogs({ limit: 50 })

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="animate-shimmer w-48 h-6 rounded-md bg-muted" />
      </div>
    )
  }

  const logs = logsData?.logs || []

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Logs</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          ล่าสุด {logs.length} รายการ
        </p>
      </div>

      <ScrollArea className="h-96">
        <div className="divide-y divide-border">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              ไม่มี logs
            </div>
          ) : (
            logs.map((log, index) => {
              const Icon = levelIcons[log.level] || Info
              return (
                <div
                  key={log.timestamp + index}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 ${getLogLevelColor(log.level)}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={log.level === 'ERROR' ? 'destructive' : 'secondary'}>
                          {log.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm mb-1">{log.message}</p>

                      {log.subject && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">Subject:</span> {log.subject}
                        </p>
                      )}

                      {log.sender && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">From:</span> {log.sender}
                        </p>
                      )}

                      {log.error && (
                        <p className="text-xs text-destructive mt-1">
                          {log.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
