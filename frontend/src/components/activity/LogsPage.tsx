import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Download, Filter, Loader2, Mail, RefreshCw } from 'lucide-react'
import { useGmailAccounts } from '@/hooks/useGmailAccounts'
import { useNotificationLogs } from '@/hooks/useNotificationLogs'
import type { NotificationStatus } from '@/types'

const statusStyle: Record<NotificationStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  sent: { icon: CheckCircle2, className: 'bg-[#34a85318] text-[#1f8f47]', label: 'sent' },
  failed: { icon: AlertCircle, className: 'bg-[#ea433518] text-[#c43127]', label: 'failed' },
  pending: { icon: Clock, className: 'bg-[#fbbc0428] text-[#9a7a00]', label: 'pending' },
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LogsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [accountFilter, setAccountFilter] = useState<number | undefined>()
  const [offset, setOffset] = useState(0)
  const limit = 50
  const { data: logsData, isLoading, refetch } = useNotificationLogs({ limit, offset, status: statusFilter, account_id: accountFilter })
  const { data: accountsData } = useGmailAccounts()
  const logs = logsData?.logs || []
  const total = logsData?.total ?? 0
  const accounts = accountsData?.accounts || []
  const sentCount = logs.filter((log) => log.status === 'sent').length
  const failedCount = logs.filter((log) => log.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
            Live / {total.toLocaleString()} records
          </div>
          <h1 className="text-2xl font-semibold text-[#0e0e0c]">ประวัติการแจ้งเตือน</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">ทุกการ match, delivery, retry และ error จาก notification pipeline</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#efece2]">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button type="button" onClick={() => refetch()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#efece2] disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Current page', logs.length, '#1a73e8'],
          ['Delivered', sentCount, '#34a853'],
          ['Failures', failedCount, '#ea4335'],
          ['Total logs', total, '#fbbc04'],
        ].map(([label, value, color]) => (
          <div key={label} className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="h-0.5" style={{ backgroundColor: color as string }} />
            <div className="p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">{label}</div>
              <div className="mt-2 text-[28px] font-semibold leading-none">{Number(value).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[#6b675c]" />
          {[
            ['', 'ทั้งหมด'],
            ['sent', 'ส่งสำเร็จ'],
            ['failed', 'ล้มเหลว'],
            ['pending', 'รอดำเนินการ'],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setStatusFilter(value || undefined)
                setOffset(0)
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === (value || undefined) ? 'border-[#0e0e0c] bg-[#0e0e0c] text-[#f7f5ef]' : 'border-[#1b1b1726] bg-white text-[#1b1b17] hover:bg-[#efece2]'}`}
            >
              {label}
            </button>
          ))}
          <select
            className="ml-auto rounded-full border border-[#1b1b1726] bg-[#f7f5ef] px-3 py-1.5 text-xs text-[#1b1b17]"
            value={accountFilter ?? ''}
            onChange={(e) => {
              setAccountFilter(e.target.value ? Number(e.target.value) : undefined)
              setOffset(0)
            }}
          >
            <option value="">ทุกบัญชี</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
        <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
          <div className="font-mono text-[11px] text-[#6b675c]">page {Math.floor(offset / limit) + 1}</div>
          <div className="flex items-center gap-2 text-sm">
            <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-md px-2 py-1 text-[#6b675c] hover:bg-[#1b1b170d] disabled:opacity-40">ก่อนหน้า</button>
            <button type="button" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded-md px-2 py-1 text-[#6b675c] hover:bg-[#1b1b170d] disabled:opacity-40">ถัดไป</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#6b675c]" /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#6b675c]">
            <Mail className="mx-auto mb-4 h-12 w-12 opacity-60" />
            ยังไม่มีการแจ้งเตือน
          </div>
        ) : (
          <div className="divide-y divide-[#1b1b1726]">
            {logs.map((log) => {
              const status = statusStyle[log.status]
              const Icon = status.icon
              return (
                <div key={log.id} className="grid gap-3 px-4 py-3 hover:bg-[#fbfaf3aa] lg:grid-cols-[95px_1fr_150px_130px] lg:items-center">
                  <div className="font-mono text-[11px] text-[#6b675c]">{formatTime(log.created_at)}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{log.email_subject || 'ไม่มีหัวข้ออีเมล'}</div>
                    <div className="mt-1 truncate font-mono text-[11px] text-[#6b675c]">{log.email_from || 'unknown sender'} / account #{log.gmail_account_id}</div>
                    {log.error_message && <div className="mt-1 text-xs text-[#c43127]">{log.error_message}</div>}
                  </div>
                  <div className="font-mono text-[11px] text-[#6b675c]">channel #{log.channel_id}</div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${status.className}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
