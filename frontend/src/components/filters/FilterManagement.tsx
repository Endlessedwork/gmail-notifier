import { useState, useEffect } from 'react'
import { Filter, Plus, Edit, Trash2, Mail, MessageSquare, ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FilterDialog } from './FilterDialog'
import { FilterRule } from '@/types'

const STORAGE_KEY = 'gmail-notifier-rules'

// Load rules from localStorage
const loadRules = (): FilterRule[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Save rules to localStorage
const saveRules = (rules: FilterRule[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  } catch (error) {
    console.error('Failed to save rules:', error)
  }
}

export function FilterManagement() {
  const [rules, setRules] = useState<FilterRule[]>(loadRules)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<FilterRule | undefined>()

  // Save to localStorage whenever rules change
  useEffect(() => {
    saveRules(rules)
  }, [rules])

  const handleCreate = () => {
    setEditingRule(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (rule: FilterRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleSubmit = (ruleData: Partial<FilterRule>) => {
    if (editingRule) {
      // Update existing rule
      setRules(rules.map(r =>
        r.id === editingRule.id
          ? { ...r, ...ruleData }
          : r
      ))
    } else {
      // Create new rule
      const newRule: FilterRule = {
        id: `rule_${Date.now()}`,
        name: ruleData.name || '',
        field: ruleData.field || 'from',
        match: ruleData.match || '',
        chat_id: ruleData.chat_id || '',
        priority: ruleData.priority || 1,
        enabled: ruleData.enabled ?? true,
      }
      setRules([...rules, newRule])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ต้องการลบ filter rule "${name}" หรือไม่?`)) return
    setRules(rules.filter(r => r.id !== id))
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Filter Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการกฎการกรองอีเมลและส่งไปยัง Telegram channels ต่างๆ
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            สร้าง Filter Rule
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Total Rules</span>
            </div>
            <p className="text-2xl font-semibold">{rules.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Filter className="w-4 h-4 text-green-600" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-semibold text-green-600">
              {rules.filter((r) => r.enabled).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Disabled</span>
            </div>
            <p className="text-2xl font-semibold text-muted-foreground">
              {rules.filter((r) => !r.enabled).length}
            </p>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">ยังไม่มี Filter Rules</h3>
              <p className="text-muted-foreground mb-6">
                สร้าง filter rule เพื่อกรองและส่งอีเมลไปยัง Telegram channels ที่ต้องการ
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                สร้าง Rule แรก
              </Button>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        #{rule.priority}
                      </span>
                    </div>
                  </div>

                  {/* Rule Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{rule.name}</h3>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    {/* Match Pattern */}
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      {rule.field === 'from' ? (
                        <Mail className="w-4 h-4 text-primary" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-muted-foreground capitalize">
                        {rule.field}
                      </span>
                      <span className="text-muted-foreground">contains</span>
                      <code className="px-2 py-1 rounded bg-muted font-mono text-xs text-foreground">
                        {rule.match}
                      </code>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Send to</span>
                      <code className="px-2 py-1 rounded bg-muted font-mono text-xs text-primary">
                        {rule.chat_id}
                      </code>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit className="w-3 h-3" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(rule.id, rule.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                      ลบ
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        rule={editingRule}
      />
    </>
  )
}
