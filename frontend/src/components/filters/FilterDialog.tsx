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
import { Checkbox } from '@/components/ui/checkbox'
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
    channel_ids: [] as number[],
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
        channel_ids: rule.channel_ids || [],
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
        channel_ids: [],
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
      <DialogContent className="border-[#1b1b1726] bg-[#f7f5ef] p-0 sm:max-w-[560px]">
        <DialogHeader>
          <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <div className="mb-1 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b675c] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#ea4335]">
              Rule / {rule ? 'edit' : 'new'}
            </div>
            <DialogTitle className="text-xl font-semibold text-[#0e0e0c]">
              {rule ? 'แก้ไข Filter Rule' : 'สร้าง Filter Rule ใหม่'}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#6b675c]">
              กำหนดเงื่อนไขการกรองอีเมลและส่งไปยังช่องทางการแจ้งเตือน
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-[#1b1b17]">ชื่อ Rule</Label>
            <Input
              id="name"
              placeholder="เช่น: แจ้งเตือนจากลูกค้า"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
              required
            />
          </div>

          {/* Gmail Account */}
          <div className="space-y-1.5">
            <Label htmlFor="gmail_account_id" className="text-sm font-semibold text-[#1b1b17]">Gmail Account</Label>
            <Select
              value={formData.gmail_account_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, gmail_account_id: parseInt(value) })
              }
            >
              <SelectTrigger className="rounded-[10px] border-[#1b1b17] bg-white focus:ring-[#1a73e822]">
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
          <div className="space-y-1.5">
            <Label htmlFor="field" className="text-sm font-semibold text-[#1b1b17]">กรองจาก Field</Label>
            <Select
              value={formData.field}
              onValueChange={(value) =>
                setFormData({ ...formData, field: value as FilterField })
              }
            >
              <SelectTrigger className="rounded-[10px] border-[#1b1b17] bg-white focus:ring-[#1a73e822]">
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
          <div className="space-y-1.5">
            <Label htmlFor="match_type" className="text-sm font-semibold text-[#1b1b17]">รูปแบบการตรวจสอบ</Label>
            <Select
              value={formData.match_type}
              onValueChange={(value) =>
                setFormData({ ...formData, match_type: value as MatchType })
              }
            >
              <SelectTrigger className="rounded-[10px] border-[#1b1b17] bg-white focus:ring-[#1a73e822]">
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
          <div className="space-y-1.5">
            <Label htmlFor="match_value" className="text-sm font-semibold text-[#1b1b17]">ค่าที่ต้องการตรวจสอบ</Label>
            <Input
              id="match_value"
              placeholder="เช่น: support@example.com"
              value={formData.match_value}
              onChange={(e) =>
                setFormData({ ...formData, match_value: e.target.value })
              }
              className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
              required
            />
            {formData.match_type === 'regex' && (
              <p className="text-xs text-muted-foreground">
                ใช้ Regular Expression เช่น: ^.*@example\.com$
              </p>
            )}
          </div>

          {/* Channels (Multi-select) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1b1b17]">ส่งไปที่ Channels (เลือกได้หลายช่องทาง)</Label>
            <div className="max-h-[200px] space-y-3 overflow-y-auto rounded-[10px] border border-[#1b1b1726] bg-white p-4">
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มี Channel กรุณาสร้าง Channel ก่อน
                </p>
              ) : (
                channels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={formData.channel_ids.includes(channel.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            channel_ids: [...formData.channel_ids, channel.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            channel_ids: formData.channel_ids.filter(
                              (id) => id !== channel.id
                            ),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={`channel-${channel.id}`}
                      className="cursor-pointer text-sm font-medium leading-none text-[#1b1b17] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {channel.name} ({channel.type})
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              เลือกช่องทางที่ต้องการรับการแจ้งเตือน (เลือกได้มากกว่า 1 ช่องทาง)
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor="priority" className="text-sm font-semibold text-[#1b1b17]">ลำดับความสำคัญ (0-100)</Label>
            <Input
              id="priority"
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
              required
            />
            <p className="text-xs text-muted-foreground">
              เลขน้อย = ความสำคัญสูง (จะถูกตรวจสอบก่อน)
            </p>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between rounded-[10px] border border-[#1b1b1726] bg-white p-3">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-sm font-semibold text-[#1b1b17]">เปิดใช้งาน</Label>
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
              {rule ? 'บันทึกการแก้ไข' : 'สร้าง Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
