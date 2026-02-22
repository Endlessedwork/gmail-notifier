import { useNotificationLogs } from '@/hooks/useNotificationLogs'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react'

const statusIcons = {
  sent: CheckCircle,
  failed: AlertCircle,
  pending: Loader2,
}

const statusColors = {
  sent: 'text-green-600',
  failed: 'text-red-600',
  pending: 'text-yellow-600',
}

export function RecentLogs() {
  const { data: logsData, isLoading } = useNotificationLogs({ limit: 50 })

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const logs = logsData?.logs || []

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Notifications</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          ล่าสุด {logs.length} รายการ
        </p>
      </div>

      <ScrollArea className="h-96">
        <div className="divide-y divide-border">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              ไม่มีการแจ้งเตือนยังค่ะ
            </div>
          ) : (
            logs.map((log) => {
              const Icon = statusIcons[log.status] || Mail
              const colorClass = statusColors[log.status] || 'text-gray-600'

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 ${colorClass} ${log.status === 'pending' ? 'animate-spin' : ''}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            log.status === 'sent' ? 'default' :
                            log.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {log.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>

                      {log.email_subject && (
                        <p className="text-sm mb-1 truncate">
                          <span className="font-medium">หัวข้อ:</span> {log.email_subject}
                        </p>
                      )}

                      {log.email_from && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">จาก:</span> {log.email_from}
                        </p>
                      )}

                      {log.error_message && (
                        <p className="text-xs text-destructive mt-1">
                          {log.error_message}
                        </p>
                      )}

                      {log.sent_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ส่งเมื่อ: {new Date(log.sent_at).toLocaleString('th-TH')}
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
