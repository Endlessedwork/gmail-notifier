import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Database, RefreshCw, Settings, XCircle } from 'lucide-react'

interface WorkerStatusData {
  timestamp: string
  worker: {
    running: boolean
    process_id: string | null
    check_method: string | null
  }
  gmail_accounts: {
    total: number
    enabled: number
    last_checked: string | null
    accounts: Array<{
      id: number
      email: string
      enabled: boolean
      last_checked_at: string | null
      sync_mode: string
    }>
  }
  database: {
    path: string | null
    notification_logs_count: number
  }
  environment: {
    check_interval: string
    database_url: string
  }
}

function relativeTime(value: string | null) {
  if (!value) return 'ไม่เคยเช็ค'
  const date = new Date(value)
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'เมื่อสักครู่'
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  return `${Math.floor(hours / 24)} วันที่แล้ว`
}

export function WorkerStatus() {
  const [status, setStatus] = useState<WorkerStatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch('/api/worker-status', { headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      setStatus(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  if (error) {
    return (
      <div className="rounded-[14px] border border-[#ea433566] bg-[#ea433512] p-6 text-[#c43127]">
        <div className="flex items-center gap-3">
          <XCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">เกิดข้อผิดพลาด</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button onClick={fetchStatus} className="mt-4 rounded-[10px] bg-[#ea4335] px-4 py-2 text-sm font-semibold text-white">ลองอีกครั้ง</button>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center rounded-[14px] border border-[#1b1b1726] bg-white py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-[#6b675c]" />
      </div>
    )
  }

  const isRunning = status.worker.running

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
            worker / diagnostics
          </div>
          <h1 className="text-2xl font-semibold text-[#0e0e0c]">Worker Status</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">ตรวจ process, Gmail polling, database และ environment ที่ worker ใช้งานอยู่</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#6b675c]">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto refresh 10s
          </label>
          <button onClick={fetchStatus} disabled={loading} className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#efece2] disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Worker', isRunning ? 'running' : 'offline', isRunning ? '#34a853' : '#ea4335'],
          ['Accounts', `${status.gmail_accounts.enabled}/${status.gmail_accounts.total}`, '#1a73e8'],
          ['Logs', status.database.notification_logs_count.toLocaleString(), '#7c4dff'],
          ['Interval', `${status.environment.check_interval}s`, '#fbbc04'],
        ].map(([label, value, color]) => (
          <div key={label} className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="h-0.5" style={{ backgroundColor: color as string }} />
            <div className="p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">{label}</div>
              <div className="mt-2 text-[26px] font-semibold leading-none">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center gap-3 border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <div className={`grid h-9 w-9 place-items-center rounded-[9px] text-white ${isRunning ? 'bg-[#34a853]' : 'bg-[#ea4335]'}`}>
              {isRunning ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="font-semibold">Worker Process</h2>
              <p className={`text-sm ${isRunning ? 'text-[#1f8f47]' : 'text-[#c43127]'}`}>{isRunning ? 'ทำงานปกติ' : 'ไม่ได้ทำงาน'}</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div><div className="text-sm text-[#6b675c]">Process ID</div><div className="font-mono text-sm">{status.worker.process_id || 'N/A'}</div></div>
            <div><div className="text-sm text-[#6b675c]">Check Method</div><div className="font-mono text-sm">{status.worker.check_method || 'N/A'}</div></div>
          </div>
        </section>

        <section className="rounded-[14px] border border-[#1b1b1726] bg-white">
          <div className="flex items-center gap-3 border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <Clock className="h-6 w-6 text-[#1a73e8]" />
            <div>
              <h2 className="font-semibold">Gmail Accounts</h2>
              <p className="text-sm text-[#6b675c]">ล่าสุด {relativeTime(status.gmail_accounts.last_checked)}</p>
            </div>
          </div>
          <div className="divide-y divide-[#1b1b1726]">
            {status.gmail_accounts.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{account.email}</div>
                  <div className="font-mono text-[11px] text-[#6b675c]">{account.sync_mode} / {relativeTime(account.last_checked_at)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${account.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                  {account.enabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[14px] border border-[#1b1b1726] bg-white p-5">
          <div className="mb-4 flex items-center gap-3"><Database className="h-6 w-6 text-[#7c4dff]" /><h2 className="font-semibold">Database</h2></div>
          <div className="font-mono text-xs leading-6 text-[#6b675c]">{status.database.path || 'N/A'}</div>
        </section>
        <section className="rounded-[14px] border border-[#1b1b1726] bg-white p-5">
          <div className="mb-4 flex items-center gap-3"><Settings className="h-6 w-6 text-[#fbbc04]" /><h2 className="font-semibold">Environment</h2></div>
          <div className="space-y-2 font-mono text-xs text-[#6b675c]">
            <div>DATABASE_URL: {status.environment.database_url}</div>
            <div>Last updated: {new Date(status.timestamp).toLocaleString('th-TH')}</div>
          </div>
        </section>
      </div>
    </div>
  )
}
