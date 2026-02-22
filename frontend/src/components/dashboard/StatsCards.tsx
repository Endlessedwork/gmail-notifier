import { useMetrics } from '@/hooks/useLogs'
import { Mail, Send, AlertCircle, TrendingUp } from 'lucide-react'

const stats = [
  {
    name: 'Emails Processed',
    icon: Mail,
    getValue: (metrics: any) => metrics?.total_emails_processed || 0,
  },
  {
    name: 'Notifications Sent',
    icon: Send,
    getValue: (metrics: any) => metrics?.total_notifications_sent || 0,
  },
  {
    name: 'Errors',
    icon: AlertCircle,
    getValue: (metrics: any) => metrics?.errors_count || 0,
  },
  {
    name: 'Success Rate',
    icon: TrendingUp,
    getValue: (metrics: any) => {
      const total = metrics?.total_emails_processed || 0
      const errors = metrics?.errors_count || 0
      return total > 0 ? ((total - errors) / total * 100).toFixed(1) + '%' : '0%'
    },
  },
]

export function StatsCards() {
  const { data: metrics } = useMetrics()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <stat.icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-3xl font-semibold mb-1">
              {stat.getValue(metrics)}
            </p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
