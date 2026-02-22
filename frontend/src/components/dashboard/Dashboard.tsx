import { StatsCards } from './StatsCards'
import { RecentLogs } from './RecentLogs'
import { ActiveFilters } from './ActiveFilters'
import { SystemStatus } from './SystemStatus'

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ภาพรวมระบบ Gmail Notification Management
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="lg:col-span-1">
          <SystemStatus />
        </div>

        {/* Recent Logs */}
        <div className="lg:col-span-2">
          <RecentLogs />
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters />
    </div>
  )
}
