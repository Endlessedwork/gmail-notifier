import { useState } from 'react'
import { Bell, Edit, Loader2, MessageSquare, Plus, Send, Trash2, Webhook } from 'lucide-react'
import { ChannelDialog } from './ChannelDialog'
import { useDeleteNotificationChannel, useNotificationChannels } from '@/hooks/useNotificationChannels'
import type { ChannelType, NotificationChannel } from '@/types'

const channelMeta: Record<ChannelType, { icon: typeof Send; accent: string; soft: string; label: string }> = {
  telegram: { icon: Send, accent: '#229ed9', soft: 'bg-[#e8f4fb]', label: 'Telegram' },
  line: { icon: MessageSquare, accent: '#06c755', soft: 'bg-[#e6f8ee]', label: 'LINE' },
  webhook: { icon: Webhook, accent: '#7c4dff', soft: 'bg-[#efebff]', label: 'Webhook' },
}

function configSummary(channel: NotificationChannel) {
  if (channel.type === 'telegram') return `chat_id / ${channel.config.chat_id || '-'}`
  if (channel.type === 'line') return `token / ${channel.config.access_token ? 'configured' : '-'}`
  return `url / ${channel.config.url || '-'}`
}

export function ChannelManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | undefined>()
  const { data, isLoading, error } = useNotificationChannels()
  const deleteChannel = useDeleteNotificationChannel()
  const channels = data?.channels || []
  const active = channels.filter((channel) => channel.enabled).length

  const openCreate = () => {
    setEditingChannel(undefined)
    setDialogOpen(true)
  }

  const openEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel)
    setDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`ต้องการลบ Channel "${name}" หรือไม่?`)) return
    deleteChannel.mutate(id)
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
              {channels.length} channels / {active} active
            </div>
            <h1 className="text-2xl font-semibold text-[#0e0e0c]">ช่องทางแจ้งเตือน</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">
              ปลายทางสำหรับส่งแจ้งเตือน รองรับ Telegram, LINE และ Webhook โดยแต่ละ rule ส่งได้หลายช่องทาง
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#0e0e0c] bg-[#0e0e0c] px-3.5 py-2 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            เพิ่มช่องทาง
          </button>
        </div>

        <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#6b675c]">Quick add</div>
            {(['telegram', 'line', 'webhook'] as ChannelType[]).map((type) => {
              const meta = channelMeta[type]
              const Icon = meta.icon
              return (
                <button
                  key={type}
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3 py-2 text-sm font-semibold text-[#0e0e0c] transition hover:bg-[#efece2]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md text-white" style={{ backgroundColor: meta.accent }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[14px] border border-[#1b1b1726] bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6b675c]" />
          </div>
        ) : channels.length === 0 ? (
          <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-12 text-center">
            <Bell className="mx-auto mb-4 h-14 w-14 text-[#6b675c]" />
            <h3 className="text-lg font-semibold">ยังไม่มี Notification Channel</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6b675c]">เพิ่มช่องทางแรกเพื่อให้ rules ส่ง notification ออกไปได้</p>
            <button type="button" onClick={openCreate} className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#0e0e0c] px-4 py-2.5 text-sm font-semibold text-[#f7f5ef]">
              <Plus className="h-4 w-4" />
              เพิ่มช่องทางแรก
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => {
              const meta = channelMeta[channel.type]
              const Icon = meta.icon
              return (
                <div key={channel.id} className={`rounded-[14px] border border-[#1b1b1726] p-4 ${meta.soft}`}>
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] text-white" style={{ backgroundColor: meta.accent }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-[#0e0e0c]">{channel.name}</h3>
                      <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">id #{channel.id} / {channel.type}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${channel.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                      {channel.enabled ? 'ok' : 'idle'}
                    </span>
                  </div>

                  <div className="mt-4 divide-y divide-[#1b1b1726] rounded-[10px] bg-white/72 px-3">
                    <div className="flex justify-between gap-3 py-2 font-mono text-[11px] text-[#6b675c]">
                      <span>config</span>
                      <span className="truncate text-[#1b1b17]">{configSummary(channel)}</span>
                    </div>
                    <div className="flex justify-between gap-3 py-2 font-mono text-[11px] text-[#6b675c]">
                      <span>status</span>
                      <span className="text-[#1b1b17]">{channel.enabled ? 'enabled' : 'disabled'}</span>
                    </div>
                    <div className="flex justify-between gap-3 py-2 font-mono text-[11px] text-[#6b675c]">
                      <span>created</span>
                      <span className="text-[#1b1b17]">{new Date(channel.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-[#1b1b1726] pt-3">
                    <button type="button" onClick={() => openEdit(channel)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3 py-2 text-sm font-semibold text-[#0e0e0c] hover:bg-[#efece2]">
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </button>
                    <button type="button" onClick={() => handleDelete(channel.id, channel.name)} disabled={deleteChannel.isPending} className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#ea433566] bg-white px-3 py-2 text-sm font-semibold text-[#ea4335] hover:bg-[#ea433512] disabled:opacity-60">
                      {deleteChannel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )
            })}

            <button type="button" onClick={openCreate} className="min-h-[220px] rounded-[14px] border border-dashed border-[#1b1b17] bg-transparent p-4 text-[#6b675c] transition hover:bg-white/60">
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-[#1b1b1726] bg-white text-[#0e0e0c]">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="font-semibold text-[#0e0e0c]">เพิ่มช่องทางใหม่</span>
              </div>
            </button>
          </div>
        )}
      </div>

      <ChannelDialog open={dialogOpen} onOpenChange={setDialogOpen} channel={editingChannel} />
    </>
  )
}
