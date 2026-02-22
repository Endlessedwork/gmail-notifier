import { useRules } from '@/hooks/useConfig'
import { Badge } from '../ui/badge'
import { Filter, Mail, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

export function ActiveFilters() {
  const { data: rulesData, isLoading } = useRules()

  if (isLoading) {
    return (
      <div className="glass-strong rounded-xl p-6 h-48 flex items-center justify-center">
        <div className="animate-shimmer w-64 h-6 rounded-md bg-muted" />
      </div>
    )
  }

  const rules = rulesData?.rules || []
  const activeRules = rules.filter((r) => r.enabled)

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-mono font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              Active Filter Rules
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeRules.length} rules กำลังทำงาน
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            ไม่มี filter rules ที่ active
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-lg p-4 gradient-border hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {rule.name}
                  </h3>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    #{rule.priority}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {rule.field === 'from' ? (
                      <Mail className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <MessageSquare className="w-3 h-3 text-blue-400" />
                    )}
                    <span className="capitalize">{rule.field}:</span>
                    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
                      {rule.match}
                    </code>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>→</span>
                    <span className="font-mono text-amber-400">
                      {rule.chat_id}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
