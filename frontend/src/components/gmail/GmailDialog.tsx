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

interface GmailAccount {
  id: string
  email: string
  password: string
  enabled: boolean
}

interface GmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (account: Partial<GmailAccount>) => void
  account?: GmailAccount
  isLoading?: boolean
}

export function GmailDialog({
  open,
  onOpenChange,
  onSubmit,
  account,
  isLoading,
}: GmailDialogProps) {
  const [formData, setFormData] = useState<Partial<GmailAccount>>({
    email: '',
    password: '',
    enabled: true,
  })

  useEffect(() => {
    if (account) {
      setFormData(account)
    } else {
      setFormData({
        email: '',
        password: '',
        enabled: true,
      })
    }
  }, [account, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'แก้ไขบัญชี Gmail' : 'เพิ่มบัญชี Gmail'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลบัญชี Gmail สำหรับรับอีเมล
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {account ? 'App Password (เว้นว่างถ้าไม่เปลี่ยน)' : 'App Password'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!account}
            />
            <p className="text-xs text-muted-foreground">
              ใช้ App Password จาก Google Account Security Settings
            </p>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">เปิดใช้งาน</Label>
              <p className="text-xs text-muted-foreground">
                เปิด/ปิดการตรวจสอบอีเมลจากบัญชีนี้
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
              {isLoading ? 'กำลังบันทึก...' : account ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
