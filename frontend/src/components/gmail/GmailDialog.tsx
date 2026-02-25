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
import { Loader2, Wifi, Eye, EyeOff } from 'lucide-react'
import { useCreateGmailAccount, useUpdateGmailAccount } from '@/hooks/useGmailAccounts'
import { gmailAccountsApi } from '@/api'
import { toast } from 'sonner'
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

  const [testLoading, setTestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const createAccount = useCreateGmailAccount()
  const updateAccount = useUpdateGmailAccount()

  const isLoading = createAccount.isPending || updateAccount.isPending

  const handleTestConnection = async () => {
    // ถ้ามี password ในฟอร์ม (กรณีเพิ่มใหม่ หรือแก้ไขและใส่รหัสใหม่) → ใช้ข้อมูลจากฟอร์ม
    const useFormData = !!formData.password
    if (useFormData) {
      if (!formData.email || !formData.password) {
        toast.error('กรอก Email และ App Password ก่อนทดสอบ')
        return
      }
      setTestLoading(true)
      try {
        const password = formData.password.replace(/\s/g, '')
        await gmailAccountsApi.testConnection({
          email: formData.email,
          password,
          imap_server: formData.imap_server,
          imap_port: formData.imap_port,
        })
        toast.success('เชื่อมต่อสำเร็จ')
      } catch (err: any) {
        toast.error(err?.data?.detail || err?.message || 'เชื่อมต่อล้มเหลว')
      } finally {
        setTestLoading(false)
      }
    } else {
      // ไม่มี password ในฟอร์ม → ใช้ข้อมูลที่บันทึกไว้ (กรณีแก้ไขและไม่เปลี่ยนรหัส)
      if (!account) {
        toast.error('กรอก App Password ก่อนทดสอบ')
        return
      }
      setTestLoading(true)
      try {
        await gmailAccountsApi.testExistingConnection(account.id)
        toast.success('เชื่อมต่อสำเร็จ')
      } catch (err: any) {
        toast.error(err?.data?.detail || err?.message || 'เชื่อมต่อล้มเหลว')
      } finally {
        setTestLoading(false)
      }
    }
  }

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="16 ตัว (มีหรือไม่มีช่องว่างก็ได้)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!account}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ใช้ App Password จาก myaccount.google.com/apppasswords — 16 ตัวอักษร
              ใส่แบบมีหรือไม่มีช่องว่างก็ได้ (ระบบจะลบช่องว่างให้อัตโนมัติ)
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

          {/* Test Connection */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>ทดสอบการเชื่อมต่อ</Label>
              <p className="text-xs text-muted-foreground">
                {account
                  ? formData.password
                    ? 'ทดสอบด้วยรหัสที่ใส่ในฟอร์ม'
                    : 'ทดสอบด้วยข้อมูลที่บันทึกไว้ (หรือใส่รหัสใหม่เพื่อทดสอบก่อนบันทึก)'
                  : 'กรอกข้อมูลด้านบนก่อน แล้วกดทดสอบ'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={
                testLoading ||
                (!formData.email || (!formData.password && !account))
              }
            >
              {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Wifi className="w-4 h-4 mr-2" />
              ทดสอบ
            </Button>
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
