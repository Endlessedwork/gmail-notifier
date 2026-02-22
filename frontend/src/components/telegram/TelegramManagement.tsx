import { useState, useEffect } from 'react'
import { MessageCircle, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { TelegramDialog } from './TelegramDialog'

interface TelegramChannel {
  id: string
  name: string
  chat_id: string
  enabled: boolean
}

const STORAGE_KEY = 'gmail-notifier-channels'

const loadChannels = (): TelegramChannel[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Main Channel',
        chat_id: '-100123456789',
        enabled: true,
      },
      {
        id: '2',
        name: 'Banking Alerts',
        chat_id: '-100987654321',
        enabled: true,
      },
    ]
  } catch {
    return []
  }
}

const saveChannels = (channels: TelegramChannel[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(channels))
  } catch (error) {
    console.error('Failed to save channels:', error)
  }
}

export function TelegramManagement() {
  const [channels, setChannels] = useState<TelegramChannel[]>(loadChannels)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<TelegramChannel | undefined>()

  useEffect(() => {
    saveChannels(channels)
  }, [channels])

  const handleCreate = () => {
    setEditingChannel(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (channel: TelegramChannel) => {
    setEditingChannel(channel)
    setDialogOpen(true)
  }

  const handleSubmit = (channelData: Partial<TelegramChannel>) => {
    if (editingChannel) {
      // Update existing channel
      setChannels(channels.map(ch =>
        ch.id === editingChannel.id
          ? { ...ch, ...channelData }
          : ch
      ))
    } else {
      // Create new channel
      const newChannel: TelegramChannel = {
        id: `channel_${Date.now()}`,
        name: channelData.name || '',
        chat_id: channelData.chat_id || '',
        enabled: channelData.enabled ?? true,
      }
      setChannels([...channels, newChannel])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ต้องการลบ channel "${name}" หรือไม่?`)) return
    setChannels(channels.filter(ch => ch.id !== id))
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Telegram Channels</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการ Telegram channels ที่ใช้ในการส่งการแจ้งเตือน
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            เพิ่ม Channel
          </Button>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{channel.name}</h3>
                    <p className="text-xs text-muted-foreground">Telegram Channel</p>
                  </div>
                </div>
                <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                  {channel.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Chat ID</span>
                  <code className="text-xs px-2 py-1 rounded bg-muted text-primary">
                    {channel.chat_id}
                  </code>
                </div>
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
                >
                  <Trash2 className="w-3 h-3" />
                  ลบ
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {channels.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มี Telegram Channels</h3>
            <p className="text-muted-foreground mb-6">
              เพิ่ม Telegram channel เพื่อรับการแจ้งเตือนอีเมล
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม Channel แรก
            </Button>
          </div>
        )}
      </div>

      {/* Telegram Dialog */}
      <TelegramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        channel={editingChannel}
      />
    </>
  )
}
