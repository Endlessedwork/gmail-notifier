import { useState } from 'react'
import { Bell, Plus, Edit, Trash2, Loader2, Send, MessageSquare, Webhook } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ChannelDialog } from './ChannelDialog'
import { useNotificationChannels, useDeleteNotificationChannel } from '@/hooks/useNotificationChannels'
import type { NotificationChannel } from '@/types'

const CHANNEL_ICONS = {
  telegram: Send,
  line: MessageSquare,
  webhook: Webhook,
}

const CHANNEL_COLORS = {
  telegram: 'bg-blue-500',
  line: 'bg-green-500',
  webhook: 'bg-purple-500',
}

export function ChannelManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | undefined>()

  const { data, isLoading, error } = useNotificationChannels()
  const deleteChannel = useDeleteNotificationChannel()

  const channels = data?.channels || []

  const handleCreate = () => {
    setEditingChannel(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel)
    setDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`ต้องการลบ Channel "${name}" หรือไม่?`)) return
    deleteChannel.mutate(id)
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-6 text-center">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Notification Channels</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการช่องทางการแจ้งเตือน (Telegram, LINE, Webhook)
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2" disabled={isLoading}>
            <Plus className="w-4 h-4" />
            เพิ่ม Channel
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Channels Grid */}
        {!isLoading && channels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.type as keyof typeof CHANNEL_ICONS] || Bell
              const colorClass = CHANNEL_COLORS[channel.type as keyof typeof CHANNEL_COLORS] || 'bg-gray-500'

              return (
                <div
                  key={channel.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colorClass} text-white flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{channel.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {channel.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                      {channel.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>

                  {/* Channel Config Info */}
                  <div className="space-y-2 text-sm">
                    {channel.type === 'telegram' && channel.config.chat_id && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Chat ID</span>
                        <span className="text-xs font-mono">{channel.config.chat_id}</span>
                      </div>
                    )}
                    {channel.type === 'webhook' && channel.config.url && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Webhook URL</span>
                        <span className="text-xs font-mono truncate max-w-[150px]">
                          {channel.config.url}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleEdit(channel)}
                    >
                      <Edit className="w-3 h-3" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(channel.id, channel.name)}
                      disabled={deleteChannel.isPending}
                    >
                      {deleteChannel.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      ลบ
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && channels.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มี Notification Channel</h3>
            <p className="text-muted-foreground mb-6">
              เพิ่ม Channel เพื่อเริ่มรับการแจ้งเตือน
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม Channel แรก
            </Button>
          </div>
        )}
      </div>

      {/* Channel Dialog */}
      <ChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        channel={editingChannel}
      />
    </>
  )
}
