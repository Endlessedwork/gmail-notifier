import { useState, useEffect } from 'react'
import type { FilterRule, GmailAccount, NotificationChannel, FilterField, MatchType } from '@/types'
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
import { Loader2 } from 'lucide-react'
import { useCreateFilterRule, useUpdateFilterRule } from '@/hooks/useFilterRules'

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: FilterRule
  accounts: GmailAccount[]
  channels: NotificationChannel[]
}

export function FilterDialog({
  open,
  onOpenChange,
  rule,
  accounts,
  channels,
}: FilterDialogProps) {
  const [formData, setFormData] = useState({
    gmail_account_id: 0,
    name: '',
    field: 'from' as FilterField,
    match_type: 'contains' as MatchType,
    match_value: '',
    channel_id: 0,
    priority: 50,
    enabled: true,
  })

  const createRule = useCreateFilterRule()
  const updateRule = useUpdateFilterRule()

  const isLoading = createRule.isPending || updateRule.isPending

  useEffect(() => {
    if (rule) {
      setFormData({
        gmail_account_id: rule.gmail_account_id,
        name: rule.name,
        field: rule.field,
        match_type: rule.match_type,
        match_value: rule.match_value,
        channel_id: rule.channel_id,
        priority: rule.priority,
        enabled: rule.enabled,
      })
    } else {
      setFormData({
        gmail_account_id: accounts[0]?.id || 0,
        name: '',
        field: 'from',
        match_type: 'contains',
        match_value: '',
        channel_id: channels[0]?.id || 0,
        priority: 50,
        enabled: true,
      })
    }
  }, [rule, open, accounts, channels])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rule) {
      updateRule.mutate(
        { id: rule.id, data: formData },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
    } else {
      createRule.mutate(formData, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'แก้ไข Filter Rule' : 'สร้าง Filter Rule ใหม่'}
          </DialogTitle>
          <DialogDescription>
            กำหนดเงื่อนไขการกรองอีเมลและส่งไปยังช่องทางการแจ้งเตือน
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

          {/* Gmail Account */}
          <div className="space-y-2">
            <Label htmlFor="gmail_account_id">Gmail Account</Label>
            <Select
              value={formData.gmail_account_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, gmail_account_id: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Gmail Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field */}
          <div className="space-y-2">
            <Label htmlFor="field">กรองจาก Field</Label>
            <Select
              value={formData.field}
              onValueChange={(value) =>
                setFormData({ ...formData, field: value as FilterField })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="from">From (ผู้ส่ง)</SelectItem>
                <SelectItem value="subject">Subject (หัวข้อ)</SelectItem>
                <SelectItem value="body">Body (เนื้อหา)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Type */}
          <div className="space-y-2">
            <Label htmlFor="match_type">รูปแบบการตรวจสอบ</Label>
            <Select
              value={formData.match_type}
              onValueChange={(value) =>
                setFormData({ ...formData, match_type: value as MatchType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains (มีคำนี้)</SelectItem>
                <SelectItem value="equals">Equals (เหมือนกันทุกตัว)</SelectItem>
                <SelectItem value="regex">Regex (รูปแบบ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Value */}
          <div className="space-y-2">
            <Label htmlFor="match_value">ค่าที่ต้องการตรวจสอบ</Label>
            <Input
              id="match_value"
              placeholder="เช่น: support@example.com"
              value={formData.match_value}
              onChange={(e) =>
                setFormData({ ...formData, match_value: e.target.value })
              }
              required
            />
            {formData.match_type === 'regex' && (
              <p className="text-xs text-muted-foreground">
                ใช้ Regular Expression เช่น: ^.*@example\.com$
              </p>
            )}
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <Label htmlFor="channel_id">ส่งไปที่ Channel</Label>
            <Select
              value={formData.channel_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, channel_id: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id.toString()}>
                    {channel.name} ({channel.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">ลำดับความสำคัญ (0-100)</Label>
            <Input
              id="priority"
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              เลขน้อย = ความสำคัญสูง (จะถูกตรวจสอบก่อน)
            </p>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">เปิดใช้งาน</Label>
              <p className="text-xs text-muted-foreground">
                เปิด/ปิดการใช้งาน rule นี้
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
              {rule ? 'บันทึกการแก้ไข' : 'สร้าง Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
