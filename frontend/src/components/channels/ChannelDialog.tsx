import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useCreateNotificationChannel, useUpdateNotificationChannel } from '@/hooks/useNotificationChannels'
import type { NotificationChannel, ChannelType } from '@/types'

interface ChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel?: NotificationChannel
}

export function ChannelDialog({
  open,
  onOpenChange,
  channel,
}: ChannelDialogProps) {
  const [formData, setFormData] = useState<{
    type: ChannelType
    name: string
    enabled: boolean
    config: Record<string, any>
  }>({
    type: 'telegram',
    name: '',
    enabled: true,
    config: {},
  })

  const createChannel = useCreateNotificationChannel()
  const updateChannel = useUpdateNotificationChannel()

  const isLoading = createChannel.isPending || updateChannel.isPending

  useEffect(() => {
    if (channel) {
      setFormData({
        type: channel.type as ChannelType,
        name: channel.name,
        enabled: channel.enabled,
        config: channel.config || {},
      })
    } else {
      setFormData({
        type: 'telegram',
        name: '',
        enabled: true,
        config: {},
      })
    }
  }, [channel, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (channel) {
      updateChannel.mutate(
        { id: channel.id, data: formData },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
    } else {
      createChannel.mutate(formData as any, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const handleTypeChange = (type: ChannelType) => {
    setFormData({
      ...formData,
      type,
      config: {},
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? 'แก้ไข Notification Channel' : 'เพิ่ม Notification Channel'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลช่องทางการแจ้งเตือน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Channel Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
              disabled={!!channel}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภท Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="line">LINE</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="ตั้งชื่อ Channel"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Telegram Config */}
          {formData.type === 'telegram' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bot_token">Bot Token</Label>
                <Input
                  id="bot_token"
                  type="text"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={formData.config.bot_token || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, bot_token: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat_id">Chat ID</Label>
                <Input
                  id="chat_id"
                  type="text"
                  placeholder="-1001234567890"
                  value={formData.config.chat_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, chat_id: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </>
          )}

          {/* LINE Config */}
          {formData.type === 'line' && (
            <div className="space-y-2">
              <Label htmlFor="access_token">LINE Notify Access Token</Label>
              <Input
                id="access_token"
                type="text"
                placeholder="LINE Notify Token"
                value={formData.config.access_token || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, access_token: e.target.value },
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                รับ Token จาก notify-bot.line.me
              </p>
            </div>
          )}

          {/* Webhook Config */}
          {formData.type === 'webhook' && (
            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://example.com/webhook"
                value={formData.config.url || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, url: e.target.value },
                  })
                }
                required
              />
            </div>
          )}

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">เปิดใช้งาน</Label>
              <p className="text-xs text-muted-foreground">
                เปิด/ปิดการส่งการแจ้งเตือนผ่าน Channel นี้
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {channel ? 'บันทึกการแก้ไข' : 'เพิ่ม Channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
