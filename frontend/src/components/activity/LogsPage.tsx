import { useState } from 'react'
import { useNotificationLogs } from '@/hooks/useNotificationLogs'
import { useGmailAccounts } from '@/hooks/useGmailAccounts'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const statusConfig = {
  sent: { icon: CheckCircle, color: 'text-green-600', badge: 'default' as const },
  failed: { icon: AlertCircle, color: 'text-red-600', badge: 'destructive' as const },
  pending: { icon: Loader2, color: 'text-yellow-600', badge: 'secondary' as const },
}

export function LogsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [accountFilter, setAccountFilter] = useState<number | undefined>()
  const [offset, setOffset] = useState(0)
  const limit = 50

  const { data: logsData, isLoading, refetch } = useNotificationLogs({
    limit,
    offset,
    status: statusFilter,
    account_id: accountFilter,
  })
  const { data: accountsData } = useGmailAccounts()

  const logs = logsData?.logs || []
  const total = logsData?.total ?? 0
  const accounts = accountsData?.accounts || []
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ดูประวัติการแจ้งเตือนอีเมล
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter ?? ''}
              onChange={(e) => {
                setStatusFilter(e.target.value || undefined)
                setOffset(0)
              }}
            >
              <option value="">ทุกสถานะ</option>
              <option value="sent">ส่งสำเร็จ</option>
              <option value="failed">ส่งล้มเหลว</option>
              <option value="pending">รอดำเนินการ</option>
            </select>
          </div>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={accountFilter ?? ''}
            onChange={(e) => {
              setAccountFilter(e.target.value ? Number(e.target.value) : undefined)
              setOffset(0)
            }}
          >
            <option value="">ทุกบัญชี</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.email}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            รวม {total} รายการ
            {statusFilter && ` (สถานะ: ${statusFilter})`}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              ก่อนหน้า
            </Button>
            <span>{currentPage} / {totalPages || 1}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              ถัดไป
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.pending
                const Icon = config.icon

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color} ${
                          log.status === 'pending' ? 'animate-spin' : ''
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={config.badge}>{log.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', {
                              locale: th,
                            })}
                          </span>
                        </div>
                        {log.email_subject && (
                          <p className="text-sm font-medium mb-1 truncate">
                            {log.email_subject}
                          </p>
                        )}
                        {log.email_from && (
                          <p className="text-xs text-muted-foreground truncate">
                            จาก: {log.email_from}
                          </p>
                        )}
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-2">
                            {log.error_message}
                          </p>
                        )}
                        {log.sent_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ส่งเมื่อ: {format(new Date(log.sent_at), 'dd MMM HH:mm', {
                              locale: th,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
