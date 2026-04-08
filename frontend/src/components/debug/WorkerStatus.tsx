import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock, Database, Settings } from 'lucide-react'

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
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch('/api/worker-status', { headers })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setStatus(data)
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
    const interval = setInterval(fetchStatus, 10000) // refresh ทุก 10 วินาที
    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'ไม่เคยเช็ค'
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'เมื่อสักครู่'
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} วันที่แล้ว`
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <XCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">เกิดข้อผิดพลาด</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ลองอีกครั้ง
        </button>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">กำลังโหลดสถานะ...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Worker Status</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto Refresh (10s)
          </label>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Worker Status Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${status.worker.running ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            {status.worker.running ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Worker Process
            </h3>
            <p className={`text-sm ${status.worker.running ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {status.worker.running ? '✓ ทำงานปกติ' : '✗ ไม่ได้ทำงาน'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Process ID</p>
            <p className="font-mono">{status.worker.process_id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check Method</p>
            <p className="font-mono">{status.worker.check_method || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Gmail Accounts Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Gmail Accounts</h3>
            <p className="text-sm text-muted-foreground">
              {status.gmail_accounts.enabled} / {status.gmail_accounts.total} accounts เปิดใช้งาน
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">เช็คล่าสุด</p>
          <p className="font-medium">
            {formatDate(status.gmail_accounts.last_checked)}
          </p>
        </div>

        {status.gmail_accounts.accounts.length > 0 && (
          <div className="space-y-2">
            {status.gmail_accounts.accounts.map((account) => (
              <div
                key={account.id}
                className={`p-3 rounded-lg border ${
                  account.enabled ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Mode: {account.sync_mode} • Last: {formatDate(account.last_checked_at)}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      account.enabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {account.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Database</h3>
            <p className="text-sm text-muted-foreground">
              {status.database.notification_logs_count} notification logs
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Database Path</p>
            <p className="font-mono text-xs break-all">{status.database.path}</p>
          </div>
        </div>
      </div>

      {/* Environment Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold">Environment</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Check Interval</p>
            <p className="font-mono">{status.environment.check_interval}s</p>
          </div>
          <div>
            <p className="text-muted-foreground">Database URL</p>
            <p className="font-mono text-xs truncate">{status.environment.database_url}</p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated: {new Date(status.timestamp).toLocaleString('th-TH')}
      </div>
    </div>
  )
}
