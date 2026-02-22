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

interface TelegramChannel {
  id: string
  name: string
  chat_id: string
  enabled: boolean
}

interface TelegramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (channel: Partial<TelegramChannel>) => void
  channel?: TelegramChannel
  isLoading?: boolean
}

export function TelegramDialog({
  open,
  onOpenChange,
  onSubmit,
  channel,
  isLoading,
}: TelegramDialogProps) {
  const [formData, setFormData] = useState<Partial<TelegramChannel>>({
    name: '',
    chat_id: '',
    enabled: true,
  })

  useEffect(() => {
    if (channel) {
      setFormData(channel)
    } else {
      setFormData({
        name: '',
        chat_id: '',
        enabled: true,
      })
    }
  }, [channel, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? 'แก้ไข Telegram Channel' : 'เพิ่ม Telegram Channel'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูล Telegram channel สำหรับรับการแจ้งเตือน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ Channel</Label>
            <Input
              id="name"
              placeholder="เช่น: Main Channel, Banking Alerts"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Chat ID */}
          <div className="space-y-2">
            <Label htmlFor="chat_id">Chat ID</Label>
            <Input
              id="chat_id"
              placeholder="เช่น: -1001234567890"
              value={formData.chat_id}
              onChange={(e) =>
                setFormData({ ...formData, chat_id: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              ใช้ @getidsbot เพื่อหา Chat ID ของ channel
            </p>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">เปิดใช้งาน</Label>
              <p className="text-xs text-muted-foreground">
                เปิด/ปิดการส่งข้อความไป channel นี้
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
              {isLoading ? 'กำลังบันทึก...' : channel ? 'บันทึกการแก้ไข' : 'เพิ่ม Channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
