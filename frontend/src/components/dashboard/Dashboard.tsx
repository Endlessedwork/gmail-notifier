import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  RefreshCw,
  Send,
  ServerCog,
  Webhook,
} from 'lucide-react'
import { useConfig, useRules } from '@/hooks/useConfig'
import { useGmailAccounts } from '@/hooks/useGmailAccounts'
import { useHealthCheck, useMetrics } from '@/hooks/useLogs'
import { useNotificationChannels } from '@/hooks/useNotificationChannels'
import { useNotificationLogs } from '@/hooks/useNotificationLogs'
import type { ChannelType, NotificationLog, NotificationStatus } from '@/types'

const statusClasses: Record<NotificationStatus, string> = {
  sent: 'bg-[#34a85318] text-[#1f8f47]',
  failed: 'bg-[#ea433518] text-[#c43127]',
  pending: 'bg-[#fbbc0428] text-[#9a7a00]',
}

const channelClasses: Record<ChannelType, string> = {
  telegram: 'bg-[#229ed9] text-white',
  line: 'bg-[#06c755] text-white',
  webhook: 'bg-[#7c4dff] text-white',
}

function formatDate(value?: string | null) {
  if (!value) return 'ยังไม่มีข้อมูล'
  return new Date(value).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(value?: string | null) {
  if (!value) return '--:--'
  return new Date(value).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LogStatusIcon({ status }: { status: NotificationStatus }) {
  if (status === 'sent') return <CheckCircle2 className="h-4 w-4 text-[#1f8f47]" />
  if (status === 'failed') return <AlertCircle className="h-4 w-4 text-[#c43127]" />
  return <Clock className="h-4 w-4 text-[#9a7a00]" />
}

export function Dashboard() {
  const queryClient = useQueryClient()
  const { data: metrics } = useMetrics()
  const { data: health } = useHealthCheck()
  const { data: config } = useConfig()
  const { data: rulesData } = useRules()
  const { data: accountsData } = useGmailAccounts()
  const { data: channelsData } = useNotificationChannels()
  const { data: logsData, isLoading: logsLoading } = useNotificationLogs({ limit: 5 })

  const accounts = accountsData?.accounts || []
  const channels = channelsData?.channels || []
  const rules = rulesData?.rules || []
  const activeRules = rules.filter((rule) => rule.enabled)
  const logs = logsData?.logs || []
  const sent = metrics?.total_notifications_sent || 0
  const processed = metrics?.total_emails_processed || 0
  const errors = metrics?.errors_count || 0
  const successRate = processed > 0 ? (((processed - errors) / processed) * 100).toFixed(1) : '0.0'
  const isHealthy = health?.status === 'healthy'

  const reloadDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['metrics'] })
    queryClient.invalidateQueries({ queryKey: ['health'] })
    queryClient.invalidateQueries({ queryKey: ['config'] })
    queryClient.invalidateQueries({ queryKey: ['rules'] })
    queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
    queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
    queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
  }

  const kpis = [
    {
      label: 'Emails scanned',
      value: processed.toLocaleString(),
      detail: `${accounts.filter((account) => account.enabled).length}/${accounts.length} accounts enabled`,
      icon: Mail,
      color: '#1a73e8',
    },
    {
      label: 'Matched rules',
      value: activeRules.length.toLocaleString(),
      detail: `${rules.length.toLocaleString()} rules total`,
      icon: Filter,
      color: '#ea4335',
    },
    {
      label: 'Notifications sent',
      value: sent.toLocaleString(),
      detail: errors > 0 ? `${errors.toLocaleString()} errors` : 'no errors reported',
      icon: Send,
      color: '#fbbc04',
    },
    {
      label: 'Success rate',
      value: `${successRate}%`,
      detail: isHealthy ? 'worker online' : 'worker offline',
      icon: Activity,
      color: '#34a853',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
            {new Date().toLocaleDateString('th-TH', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-[#0e0e0c]">
            ยินดีต้อนรับ <span className="[font-family:'Instrument_Serif',ui-serif,Georgia,serif] italic">Admin</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">
            สรุปสถานะ Gmail worker, notification channels, filter rules และ log ล่าสุดจากระบบจริง
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reloadDashboard}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold text-[#0e0e0c] transition hover:-translate-y-0.5 hover:bg-[#efece2]"
          >
            <RefreshCw className="h-4 w-4" />
            รีโหลดข้อมูล
          </button>
          <Link
            to="/dashboard/filters"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#0e0e0c] bg-[#0e0e0c] px-3.5 py-2 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black"
          >
            <Filter className="h-4 w-4" />
            เพิ่มกฎ
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="h-0.5" style={{ backgroundColor: kpi.color }} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">{kpi.label}</div>
                <kpi.icon className="h-4 w-4 text-[#6b675c]" />
              </div>
              <div className="mt-2 text-[28px] font-semibold leading-none text-[#0e0e0c]">{kpi.value}</div>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[#6b675c]">
                <ArrowDown className={errors > 0 && kpi.label === 'Notifications sent' ? 'h-3 w-3 text-[#ea4335]' : 'h-3 w-3 rotate-180 text-[#34a853]'} />
                {kpi.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-4">
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
          <div className={`grid h-10 w-10 place-items-center rounded-full text-white ${isHealthy ? 'bg-[#34a853]' : 'bg-[#ea4335]'}`}>
            <ServerCog className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-[#0e0e0c]">
              {isHealthy ? 'Worker ทำงานปกติ' : 'Worker ยังไม่พร้อมใช้งาน'}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">
              polling every {config?.settings?.check_interval || 60}s / IMAP {config?.settings?.imap_server || 'imap.gmail.com'}
            </div>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${isHealthy ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#ea433518] text-[#c43127]'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {isHealthy ? 'running' : 'offline'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
            <h2 className="text-sm font-semibold">การแจ้งเตือนล่าสุด</h2>
            <Link to="/dashboard/logs" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a73e8]">
              ดูทั้งหมด <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1b1b1726]">
            {logsLoading ? (
              <div className="p-8 text-center text-sm text-[#6b675c]">กำลังโหลด log ล่าสุด...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6b675c]">ยังไม่มี notification log</div>
            ) : (
              logs.map((log: NotificationLog) => (
                <div key={log.id} className="grid grid-cols-[54px_1fr_auto] items-center gap-3 px-4 py-3">
                  <div className="font-mono text-[11px] text-[#6b675c]">{formatTime(log.created_at)}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#1b1b17]">
                      {log.email_subject || 'ไม่มีหัวข้ออีเมล'}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[11px] text-[#6b675c]">
                      {log.email_from || 'unknown sender'} / channel #{log.channel_id}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${statusClasses[log.status]}`}>
                    <LogStatusIcon status={log.status} />
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
            <h2 className="text-sm font-semibold">สถานะช่องทาง</h2>
            <Link to="/dashboard/channels" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a73e8]">
              จัดการ <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1b1b1726]">
            {channels.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6b675c]">ยังไม่มี notification channel</div>
            ) : (
              channels.slice(0, 5).map((channel) => {
                const Icon = channel.type === 'webhook' ? Webhook : channel.type === 'telegram' ? Send : Bell
                return (
                  <div key={channel.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                    <div className={`grid h-8 w-8 place-items-center rounded-lg ${channelClasses[channel.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#1b1b17]">{channel.name}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">{channel.type} / channel #{channel.id}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${channel.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                      {channel.enabled ? 'ok' : 'idle'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
            <h2 className="text-sm font-semibold">Connected Gmail accounts</h2>
            <Link to="/dashboard/gmail" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a73e8]">
              จัดการ <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1b1b1726] bg-[#fbfaf3] text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Last check</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#6b675c]">
                      ยังไม่มี Gmail account
                    </td>
                  </tr>
                ) : (
                  accounts.slice(0, 5).map((account) => (
                    <tr key={account.id} className="border-b border-[#1b1b1726] last:border-0 hover:bg-[#fbfaf3aa]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#0e0e0c]">{account.email}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">
                          {account.imap_server} / {account.imap_port}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${account.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {account.enabled ? 'active' : 'off'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#6b675c]">{account.sync_mode}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#6b675c]">{formatDate(account.last_checked_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
            <h2 className="text-sm font-semibold">Delivery by channel</h2>
          </div>
          <div className="p-4">
            {(['telegram', 'line', 'webhook'] as ChannelType[]).map((type) => {
              const count = channels.filter((channel) => channel.type === type).length
              const total = Math.max(channels.length, 1)
              const percent = Math.round((count / total) * 100)
              const color = type === 'telegram' ? '#229ed9' : type === 'line' ? '#06c755' : '#7c4dff'

              return (
                <div key={type} className="grid grid-cols-[84px_1fr_54px] items-center gap-3 border-b border-[#1b1b1726] py-3 last:border-0">
                  <div className="flex items-center gap-2 text-sm capitalize">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
                    {type}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efece2]">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
                  </div>
                  <div className="text-right font-mono text-[11px] text-[#6b675c]">{count} / {percent}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
