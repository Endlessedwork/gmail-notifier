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
import { Loader2, Wifi } from 'lucide-react'
import { useCreateNotificationChannel, useUpdateNotificationChannel } from '@/hooks/useNotificationChannels'
import { notificationChannelsApi } from '@/api'
import { toast } from 'sonner'
import type {
  NotificationChannel,
  ChannelType,
  ChannelConfig,
  NotificationChannelCreate,
  NotificationChannelUpdate,
} from '@/types'

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

  const [testLoading, setTestLoading] = useState(false)
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

  const buildChannelConfig = (): ChannelConfig => {
    switch (formData.type) {
      case 'telegram':
        return {
          bot_token: String(formData.config.bot_token ?? ''),
          chat_id: String(formData.config.chat_id ?? ''),
        }
      case 'line':
        return {
          access_token: String(formData.config.access_token ?? ''),
        }
      case 'webhook':
        return {
          url: String(formData.config.url ?? ''),
        }
    }
  }

  const buildChannelPayload = (): NotificationChannelCreate => ({
    type: formData.type,
    name: formData.name,
    enabled: formData.enabled,
    config: buildChannelConfig(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (channel) {
      const data: NotificationChannelUpdate = buildChannelPayload()
      updateChannel.mutate(
        { id: channel.id, data },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
    } else {
      createChannel.mutate(buildChannelPayload(), {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type: type as ChannelType,
      config: {},
    })
  }

  const handleTestWebhook = async () => {
    if (!formData.config.url) {
      toast.error('กรอก Webhook URL ก่อนทดสอบ')
      return
    }

    setTestLoading(true)
    try {
      const result = await notificationChannelsApi.testWebhook({
        url: formData.config.url,
        headers: formData.config.headers || {}
      })
      toast.success(result.message || '✅ ส่งสำเร็จ!', {
        description: `HTTP ${result.status_code}${result.response_text ? `: ${result.response_text.slice(0, 100)}` : ''}`
      })
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || '❌ ทดสอบล้มเหลว')
    } finally {
      setTestLoading(false)
    }
  }

  const handleTestTelegram = async () => {
    if (!formData.config.bot_token || !formData.config.chat_id) {
      toast.error('กรอก Bot Token และ Chat ID ก่อนทดสอบ')
      return
    }

    setTestLoading(true)
    try {
      const result = await notificationChannelsApi.testTelegram({
        bot_token: formData.config.bot_token,
        chat_id: formData.config.chat_id
      })
      toast.success(result.message || '✅ ส่งสำเร็จ!', {
        description: 'ตรวจสอบ Telegram ของคุณ'
      })
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || '❌ ทดสอบล้มเหลว')
    } finally {
      setTestLoading(false)
    }
  }

  const handleTestLine = async () => {
    if (!formData.config.access_token) {
      toast.error('กรอก Access Token ก่อนทดสอบ')
      return
    }

    setTestLoading(true)
    try {
      const result = await notificationChannelsApi.testLine({
        access_token: formData.config.access_token
      })
      toast.success(result.message || '✅ ส่งสำเร็จ!', {
        description: 'ตรวจสอบ LINE ของคุณ'
      })
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || '❌ ทดสอบล้มเหลว')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1b1b1726] bg-[#f7f5ef] p-0 sm:max-w-[520px]">
        <DialogHeader>
          <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <div className="mb-1 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b675c] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#34a853]">
              Channel / {channel ? 'edit' : 'new'}
            </div>
            <DialogTitle className="text-xl font-semibold text-[#0e0e0c]">
              {channel ? 'แก้ไข Notification Channel' : 'เพิ่ม Notification Channel'}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#6b675c]">
              ตั้งค่าปลายทางสำหรับส่งแจ้งเตือนจาก rules ที่ match
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Channel Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-sm font-semibold text-[#1b1b17]">Channel Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
              disabled={!!channel}
            >
              <SelectTrigger className="rounded-[10px] border-[#1b1b17] bg-white focus:ring-[#1a73e822]">
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
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-[#1b1b17]">Channel Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="ตั้งชื่อ Channel"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
              required
            />
          </div>

          {/* Telegram Config */}
          {formData.type === 'telegram' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="bot_token" className="text-sm font-semibold text-[#1b1b17]">Bot Token</Label>
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
                  className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chat_id" className="text-sm font-semibold text-[#1b1b17]">Chat ID</Label>
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
                  className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                  required
                />
              </div>

              {/* Test Telegram */}
              <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#1b1b1726] bg-white p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-[#1b1b17]">ทดสอบ Telegram</Label>
                  <p className="text-xs text-muted-foreground">
                    ส่ง mock notification เพื่อทดสอบว่า Bot ทำงานได้
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-[10px] border-[#1b1b17] bg-[#fbfaf3] font-semibold"
                  onClick={handleTestTelegram}
                  disabled={testLoading || !formData.config.bot_token || !formData.config.chat_id}
                >
                  {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Wifi className="w-4 h-4 mr-2" />
                  ทดสอบ
                </Button>
              </div>
            </>
          )}

          {/* LINE Config */}
          {formData.type === 'line' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="access_token" className="text-sm font-semibold text-[#1b1b17]">LINE Notify Access Token</Label>
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
                  className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  รับ Token จาก notify-bot.line.me
                </p>
              </div>

              {/* Test LINE */}
              <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#1b1b1726] bg-white p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-[#1b1b17]">ทดสอบ LINE Notify</Label>
                  <p className="text-xs text-muted-foreground">
                    ส่ง mock notification เพื่อทดสอบว่า Token ทำงานได้
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-[10px] border-[#1b1b17] bg-[#fbfaf3] font-semibold"
                  onClick={handleTestLine}
                  disabled={testLoading || !formData.config.access_token}
                >
                  {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Wifi className="w-4 h-4 mr-2" />
                  ทดสอบ
                </Button>
              </div>
            </>
          )}

          {/* Webhook Config */}
          {formData.type === 'webhook' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="webhook_url" className="text-sm font-semibold text-[#1b1b17]">Webhook URL</Label>
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
                  className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                  required
                />
              </div>

              {/* Test Webhook */}
              <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#1b1b1726] bg-white p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-[#1b1b17]">ทดสอบ Webhook</Label>
                  <p className="text-xs text-muted-foreground">
                    ส่ง mock notification เพื่อทดสอบว่า URL ทำงานได้
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-[10px] border-[#1b1b17] bg-[#fbfaf3] font-semibold"
                  onClick={handleTestWebhook}
                  disabled={testLoading || !formData.config.url}
                >
                  {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Wifi className="w-4 h-4 mr-2" />
                  ทดสอบ
                </Button>
              </div>
            </>
          )}

          {/* Enabled */}
          <div className="flex items-center justify-between rounded-[10px] border border-[#1b1b1726] bg-white p-3">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-sm font-semibold text-[#1b1b17]">เปิดใช้งาน</Label>
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

          </div>

          <DialogFooter className="border-t border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-[10px] border-[#1b1b17] bg-white font-semibold"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-[10px] bg-[#0e0e0c] font-semibold text-[#f7f5ef] hover:bg-black">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {channel ? 'บันทึกการแก้ไข' : 'เพิ่ม Channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
