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
import { Loader2 } from 'lucide-react'
import { useCreateGmailAccount, useUpdateGmailAccount } from '@/hooks/useGmailAccounts'
import type { GmailAccount } from '@/types'

interface GmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: GmailAccount
}

export function GmailDialog({
  open,
  onOpenChange,
  account,
}: GmailDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    imap_server: 'imap.gmail.com',
    imap_port: 993,
    enabled: true,
  })

  const createAccount = useCreateGmailAccount()
  const updateAccount = useUpdateGmailAccount()

  const isLoading = createAccount.isPending || updateAccount.isPending

  useEffect(() => {
    if (account) {
      setFormData({
        email: account.email,
        password: '',
        imap_server: account.imap_server,
        imap_port: account.imap_port,
        enabled: account.enabled,
      })
    } else {
      setFormData({
        email: '',
        password: '',
        imap_server: 'imap.gmail.com',
        imap_port: 993,
        enabled: true,
      })
    }
  }, [account, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (account) {
      const updateData: any = {
        email: formData.email,
        imap_server: formData.imap_server,
        imap_port: formData.imap_port,
        enabled: formData.enabled,
      }
      if (formData.password) {
        updateData.password = formData.password
      }

      updateAccount.mutate(
        { id: account.id, data: updateData },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
    } else {
      createAccount.mutate(formData, {
        onSuccess: () => onOpenChange(false),
      })
    }
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

          {/* IMAP Server */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imap_server">IMAP Server</Label>
              <Input
                id="imap_server"
                type="text"
                value={formData.imap_server}
                onChange={(e) =>
                  setFormData({ ...formData, imap_server: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imap_port">IMAP Port</Label>
              <Input
                id="imap_port"
                type="number"
                value={formData.imap_port}
                onChange={(e) =>
                  setFormData({ ...formData, imap_port: parseInt(e.target.value) })
                }
                required
              />
            </div>
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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {account ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
