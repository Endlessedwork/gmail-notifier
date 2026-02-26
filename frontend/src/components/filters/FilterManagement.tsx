import { useState } from 'react'
import { Filter, Plus, Edit, Trash2, Mail, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FilterDialog } from './FilterDialog'
import { useFilterRules, useDeleteFilterRule } from '@/hooks/useFilterRules'
import { useGmailAccounts } from '@/hooks/useGmailAccounts'
import { useNotificationChannels } from '@/hooks/useNotificationChannels'
import type { FilterRule } from '@/types'

const FIELD_ICONS = {
  from: Mail,
  subject: MessageSquare,
  body: MessageSquare,
}

export function FilterManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<FilterRule | undefined>()

  const { data: rulesData, isLoading: rulesLoading, error: rulesError } = useFilterRules()
  const { data: accountsData } = useGmailAccounts()
  const { data: channelsData } = useNotificationChannels()
  const deleteRule = useDeleteFilterRule()

  const rules = rulesData?.rules || []
  const accounts = accountsData?.accounts || []
  const channels = channelsData?.channels || []

  const handleCreate = () => {
    setEditingRule(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (rule: FilterRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`ต้องการลบ filter rule "${name}" หรือไม่?`)) return
    deleteRule.mutate(id)
  }

  const getAccountEmail = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.email || `Account #${accountId}`
  }

  const getChannelNames = (channelIds: number[]) => {
    return channelIds.map((id) => {
      const channel = channels.find((c) => c.id === id)
      return channel?.name || `Channel #${id}`
    })
  }

  if (rulesError) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-6 text-center">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-sm mt-2">{(rulesError as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Filter Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการกฎการกรองอีเมลและส่งไปยังช่องทางการแจ้งเตือนต่างๆ
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2" disabled={rulesLoading}>
            <Plus className="w-4 h-4" />
            สร้าง Filter Rule
          </Button>
        </div>

        {/* Stats */}
        {!rulesLoading && (
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
        )}

        {/* Loading State */}
        {rulesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Rules List */}
        {!rulesLoading && (
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">ยังไม่มี Filter Rules</h3>
                <p className="text-muted-foreground mb-6">
                  สร้าง filter rule เพื่อกรองและส่งอีเมลไปยังช่องทางการแจ้งเตือนที่ต้องการ
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้าง Rule แรก
                </Button>
              </div>
            ) : (
              rules.map((rule) => {
                const FieldIcon = FIELD_ICONS[rule.field] || Mail
                return (
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

                        {/* Account Info */}
                        <div className="flex items-center gap-2 mb-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Account:</span>
                          <span className="font-mono text-xs">
                            {getAccountEmail(rule.gmail_account_id)}
                          </span>
                        </div>

                        {/* Match Pattern */}
                        <div className="flex items-center gap-2 mb-2 text-sm">
                          <FieldIcon className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground capitalize">
                            {rule.field}
                          </span>
                          <span className="text-muted-foreground">{rule.match_type}</span>
                          <code className="px-2 py-1 rounded bg-muted font-mono text-xs text-foreground">
                            {rule.match_value}
                          </code>
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Send to</span>
                          {getChannelNames(rule.channel_ids).map((name, idx) => (
                            <code
                              key={idx}
                              className="px-2 py-1 rounded bg-muted font-mono text-xs text-primary"
                            >
                              {name}
                            </code>
                          ))}
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
                          disabled={deleteRule.isPending}
                        >
                          {deleteRule.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          ลบ
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        accounts={accounts}
        channels={channels}
      />
    </>
  )
}
