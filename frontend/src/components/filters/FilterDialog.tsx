import { useState, useEffect } from 'react'
import { FilterRule } from '@/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rule: Partial<FilterRule>) => void
  rule?: FilterRule
  isLoading?: boolean
}

export function FilterDialog({
  open,
  onOpenChange,
  onSubmit,
  rule,
  isLoading,
}: FilterDialogProps) {
  const [formData, setFormData] = useState<Partial<FilterRule>>({
    name: '',
    field: 'from',
    match: '',
    chat_id: '',
    priority: 1,
    enabled: true,
  })

  useEffect(() => {
    if (rule) {
      setFormData(rule)
    } else {
      setFormData({
        name: '',
        field: 'from',
        match: '',
        chat_id: '',
        priority: 1,
        enabled: true,
      })
    }
  }, [rule, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'แก้ไข Filter Rule' : 'สร้าง Filter Rule ใหม่'}
          </DialogTitle>
          <DialogDescription>
            กำหนดเงื่อนไขการกรองอีเมลและส่งไปยัง Telegram channel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ Rule</Label>
            <Input
              id="name"
              placeholder="เช่น: แจ้งเตือนจากลูกค้า"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Field */}
          <div className="space-y-2">
            <Label htmlFor="field">กรองจาก Field</Label>
            <Select
              value={formData.field}
              onValueChange={(value) =>
                setFormData({ ...formData, field: value as 'from' | 'subject' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="from">From (ผู้ส่ง)</SelectItem>
                <SelectItem value="subject">Subject (หัวเรื่อง)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Pattern */}
          <div className="space-y-2">
            <Label htmlFor="match">ค้นหาคำที่มี</Label>
            <Input
              id="match"
              placeholder="เช่น: customer@example.com หรือ Payment"
              value={formData.match}
              onChange={(e) =>
                setFormData({ ...formData, match: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              ระบุคำหรือ email ที่ต้องการกรอง (ไม่ต้องใส่ *)
            </p>
          </div>

          {/* Chat ID */}
          <div className="space-y-2">
            <Label htmlFor="chat_id">Telegram Chat ID</Label>
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
              Chat ID ของ Telegram channel ที่จะส่งข้อความไป
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">ลำดับความสำคัญ (Priority)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              ค่าน้อยจะถูกตรวจสอบก่อน (เริ่มจาก 1)
            </p>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">เปิดใช้งาน</Label>
              <p className="text-xs text-muted-foreground">
                เปิด/ปิดการทำงานของ rule นี้
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
              {isLoading ? 'กำลังบันทึก...' : rule ? 'บันทึกการแก้ไข' : 'สร้าง Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
