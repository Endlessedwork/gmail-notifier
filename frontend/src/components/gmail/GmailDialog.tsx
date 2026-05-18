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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check, Eye, EyeOff, Loader2, Wifi } from 'lucide-react'
import { useCreateGmailAccount, useUpdateGmailAccount } from '@/hooks/useGmailAccounts'
import { gmailAccountsApi } from '@/api'
import { toast } from 'sonner'
import type { GmailAccount, SyncMode } from '@/types'

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
    sync_mode: 'new_only' as SyncMode,
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
        sync_mode: account.sync_mode || 'new_only',
      })
    } else {
      setFormData({
        email: '',
        password: '',
        imap_server: 'imap.gmail.com',
        imap_port: 993,
        enabled: true,
        sync_mode: 'new_only',
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
        sync_mode: formData.sync_mode,
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
      <DialogContent className="border-[#1b1b1726] bg-[#f7f5ef] p-0 sm:max-w-[520px]">
        <DialogHeader>
          <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <div className="mb-1 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b675c] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#1a73e8]">
              Account / {account ? 'edit' : 'new'}
            </div>
            <DialogTitle className="text-xl font-semibold text-[#0e0e0c]">
              {account ? 'แก้ไขบัญชี Gmail' : 'เพิ่มบัญชี Gmail'}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#6b675c]">
              กรอก Gmail App Password สำหรับให้ worker ตรวจอีเมลผ่าน IMAP
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-[#1b1b17]">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-sm font-semibold text-[#1b1b17]">
                {account ? 'App Password (เว้นว่างถ้าไม่เปลี่ยน)' : 'App Password'}
              </Label>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-[#1a73e8] underline underline-offset-2"
              >
                สร้างจาก Google
              </a>
            </div>
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
                className="rounded-[10px] border-[#1b1b17] bg-white pr-10 focus-visible:ring-[#1a73e822]"
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
            <div className="space-y-1.5">
              <Label htmlFor="imap_server" className="text-sm font-semibold text-[#1b1b17]">IMAP Server</Label>
              <Input
                id="imap_server"
                type="text"
                value={formData.imap_server}
                onChange={(e) =>
                  setFormData({ ...formData, imap_server: e.target.value })
                }
                className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imap_port" className="text-sm font-semibold text-[#1b1b17]">IMAP Port</Label>
              <Input
                id="imap_port"
                type="number"
                value={formData.imap_port}
                onChange={(e) =>
                  setFormData({ ...formData, imap_port: parseInt(e.target.value) })
                }
                className="rounded-[10px] border-[#1b1b17] bg-white focus-visible:ring-[#1a73e822]"
                required
              />
            </div>
          </div>

          {/* Test Connection */}
          <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#1b1b1726] bg-white p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-[#1b1b17]">ทดสอบการเชื่อมต่อ</Label>
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
              className="rounded-[10px] border-[#1b1b1726] bg-white"
            >
              {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Wifi className="w-4 h-4 mr-2" />
              ทดสอบ
            </Button>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between rounded-[10px] border border-[#1b1b1726] bg-white p-3">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-sm font-semibold text-[#1b1b17]">เปิดใช้งาน</Label>
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

          {/* Sync Mode */}
          {!account && (
            <div className="space-y-3 rounded-[10px] border border-[#1b1b1726] bg-[#fbfaf3] p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-[#1b1b17]">ดึงอีเมลครั้งแรก</Label>
                <p className="text-xs text-muted-foreground">
                  เลือกว่าจะดึงอีเมลย้อนหลังหรือไม่ตอนเริ่มใช้งาน
                </p>
              </div>
              <RadioGroup
                value={formData.sync_mode}
                onValueChange={(value) =>
                  setFormData({ ...formData, sync_mode: value as SyncMode })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new_only" id="new_only" />
                  <Label htmlFor="new_only" className="font-normal cursor-pointer">
                    เฉพาะอีเมลใหม่ (หลังจากเปิดใช้งาน) - แนะนำ ✨
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today" className="font-normal cursor-pointer">
                    อีเมลวันนี้ (UNSEEN ของวันนี้เท่านั้น)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_unseen" id="all_unseen" />
                  <Label htmlFor="all_unseen" className="font-normal cursor-pointer">
                    ทั้งหมด (UNSEEN ย้อนหลังทุกฉบับ)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          </div>

          <DialogFooter className="border-t border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-[10px] border-[#ea433566] bg-transparent text-[#ea4335] hover:bg-[#ea433512] hover:text-[#ea4335]"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-[10px] bg-[#0e0e0c] text-[#f7f5ef] hover:bg-black">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!isLoading && <Check className="w-4 h-4 mr-2" />}
              {account ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
