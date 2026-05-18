import { useState } from 'react'
import { ArrowRight, Edit, Filter, Loader2, Mail, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { FilterDialog } from './FilterDialog'
import { useDeleteFilterRule, useFilterRules, useUpdateFilterRule } from '@/hooks/useFilterRules'
import { useGmailAccounts } from '@/hooks/useGmailAccounts'
import { useNotificationChannels } from '@/hooks/useNotificationChannels'
import type { ChannelType, FilterRule } from '@/types'

const priorityColors = ['#1a73e8', '#ea4335', '#fbbc04', '#34a853', '#6b675c']

function channelClass(type?: ChannelType) {
  if (type === 'telegram') return 'bg-[#229ed918] text-[#1b80b0]'
  if (type === 'line') return 'bg-[#06c75518] text-[#048a3d]'
  if (type === 'webhook') return 'bg-[#7c4dff18] text-[#5b34d3]'
  return 'bg-[#1b1b170f] text-[#6b675c]'
}

export function FilterManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<FilterRule | undefined>()
  const { data: rulesData, isLoading, error } = useFilterRules()
  const { data: accountsData } = useGmailAccounts()
  const { data: channelsData } = useNotificationChannels()
  const deleteRule = useDeleteFilterRule()
  const updateRule = useUpdateFilterRule()
  const rules = [...(rulesData?.rules || [])].sort((a, b) => a.priority - b.priority)
  const accounts = accountsData?.accounts || []
  const channels = channelsData?.channels || []
  const active = rules.filter((rule) => rule.enabled).length

  const getAccountEmail = (id: number) => accounts.find((account) => account.id === id)?.email || `Account #${id}`
  const getChannel = (id: number) => channels.find((channel) => channel.id === id)

  const openCreate = () => {
    setEditingRule(undefined)
    setDialogOpen(true)
  }

  const openEdit = (rule: FilterRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`ต้องการลบ filter rule "${name}" หรือไม่?`)) return
    deleteRule.mutate(id)
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-[#ea433566] bg-[#ea433512] p-6 text-center text-[#c43127]">
        <p className="font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="mt-2 text-sm">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
              {rules.length} rules / sorted by priority
            </div>
            <h1 className="text-2xl font-semibold text-[#0e0e0c]">กฎกรองอีเมล</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">
              Rules ทำงานตาม priority จากเลขน้อยไปมาก และส่งไปยัง channels ที่เลือกไว้
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#0e0e0c] bg-[#0e0e0c] px-3.5 py-2 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            เพิ่มกฎ
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Total Rules', rules.length, '#1a73e8'],
            ['Active', active, '#34a853'],
            ['Disabled', rules.length - active, '#6b675c'],
          ].map(([label, value, color]) => (
            <div key={label} className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
              <div className="h-0.5" style={{ backgroundColor: color as string }} />
              <div className="p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">{label}</div>
                <div className="mt-2 text-[28px] font-semibold leading-none">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[14px] border border-[#1b1b1726] bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6b675c]" />
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-12 text-center">
            <Filter className="mx-auto mb-4 h-14 w-14 text-[#6b675c]" />
            <h3 className="text-lg font-semibold">ยังไม่มี Filter Rules</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6b675c]">สร้าง rule เพื่อจับอีเมลที่สำคัญแล้วส่งต่อไปยัง channels</p>
            <button type="button" onClick={openCreate} className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#0e0e0c] px-4 py-2.5 text-sm font-semibold text-[#f7f5ef]">
              <Plus className="h-4 w-4" />
              สร้าง Rule แรก
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="hidden grid-cols-[70px_1.2fr_1.8fr_1fr_1.2fr_90px_90px] gap-3 border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c] lg:grid">
              <span>Priority</span><span>Rule</span><span>Match</span><span>Account</span><span>Channels</span><span>Active</span><span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-[#1b1b1726]">
              {rules.map((rule, index) => {
                const FieldIcon = rule.field === 'from' ? Mail : MessageSquare
                return (
                  <div key={rule.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[70px_1.2fr_1.8fr_1fr_1.2fr_90px_90px] lg:items-center">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg font-mono text-xs font-bold text-white" style={{ backgroundColor: priorityColors[index % priorityColors.length], color: priorityColors[index % priorityColors.length] === '#fbbc04' ? '#1b1b17' : '#fff' }}>
                        {rule.priority}
                      </span>
                      <span className="font-mono text-[11px] text-[#6b675c] lg:hidden">priority</span>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[#0e0e0c]">{rule.name}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">rule #{rule.id}</div>
                    </div>
                    <div className="inline-flex min-w-0 items-center gap-2 rounded-md border border-[#1b1b1726] bg-[#fbfaf3] px-2 py-1 font-mono text-[11px] text-[#1b1b17]">
                      <FieldIcon className="h-3.5 w-3.5 shrink-0 text-[#1a73e8]" />
                      <span className="text-[#1a73e8]">{rule.field}</span>
                      <span className="text-[#6b675c]">{rule.match_type}</span>
                      <span className="truncate">{rule.match_value}</span>
                    </div>
                    <div className="truncate font-mono text-[11px] text-[#6b675c]">{getAccountEmail(rule.gmail_account_id)}</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-[#6b675c]" />
                      {rule.channel_ids.map((id) => {
                        const channel = getChannel(id)
                        return (
                          <span key={id} className={`rounded-md px-2 py-1 font-mono text-[10px] ${channelClass(channel?.type)}`}>
                            {channel?.name || `#${id}`}
                          </span>
                        )
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateRule.mutate({ id: rule.id, data: { enabled: !rule.enabled } })}
                      className={`relative h-5 w-9 rounded-full transition ${rule.enabled ? 'bg-[#34a853]' : 'bg-[#1b1b1722]'}`}
                      disabled={updateRule.isPending}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(rule)} className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] hover:bg-[#1b1b170d] hover:text-[#0e0e0c]">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(rule.id, rule.name)} disabled={deleteRule.isPending} className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] hover:bg-[#ea433512] hover:text-[#ea4335] disabled:opacity-60">
                        {deleteRule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <FilterDialog open={dialogOpen} onOpenChange={setDialogOpen} rule={editingRule} accounts={accounts} channels={channels} />
    </>
  )
}
