import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Check,
  Edit,
  ExternalLink,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { GmailDialog } from './GmailDialog'
import {
  useDeleteGmailAccount,
  useGmailAccounts,
  useUpdateGmailAccount,
} from '@/hooks/useGmailAccounts'
import { gmailAccountsApi } from '@/api'
import type { GmailAccount } from '@/types'

function formatLastCheck(value: string | null) {
  if (!value) return 'ยังไม่เคยตรวจ'
  return new Date(value).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function accountMark(email: string) {
  return email.trim().charAt(0).toUpperCase() || 'G'
}

export function GmailManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<GmailAccount | undefined>()
  const [checkingId, setCheckingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useGmailAccounts()
  const deleteAccount = useDeleteGmailAccount()
  const updateAccount = useUpdateGmailAccount()
  const accounts = data?.accounts || []
  const activeCount = accounts.filter((account) => account.enabled).length

  const handleCreate = () => {
    setEditingAccount(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (account: GmailAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleDelete = (id: number, email: string) => {
    if (!confirm(`ต้องการลบบัญชี "${email}" หรือไม่?`)) return
    deleteAccount.mutate(id)
  }

  const handleToggle = (account: GmailAccount) => {
    setTogglingId(account.id)
    updateAccount.mutate(
      {
        id: account.id,
        data: {
          email: account.email,
          imap_server: account.imap_server,
          imap_port: account.imap_port,
          sync_mode: account.sync_mode,
          enabled: !account.enabled,
        },
      },
      {
        onSettled: () => setTogglingId(null),
      }
    )
  }

  const handleCheckNow = async (account: GmailAccount) => {
    setCheckingId(account.id)
    try {
      await gmailAccountsApi.checkNow(account.id)
      toast.success(`ดึงอีเมล ${account.email} เรียบร้อย`)
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || 'ดึงอีเมลล้มเหลว')
    } finally {
      setCheckingId(null)
    }
  }

  const handleRecheckAll = async () => {
    const enabledAccounts = accounts.filter((account) => account.enabled)
    if (enabledAccounts.length === 0) {
      toast.error('ไม่มีบัญชีที่เปิดใช้งาน')
      return
    }

    for (const account of enabledAccounts) {
      await handleCheckNow(account)
    }
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-[#ea433566] bg-[#ea433512] p-6 text-center text-[#c43127]">
        <AlertCircle className="mx-auto mb-3 h-8 w-8" />
        <p className="font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="mt-2 text-sm">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
              {activeCount} บัญชี active / {accounts.length} ทั้งหมด
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-[#0e0e0c]">บัญชี Gmail</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">
              แต่ละบัญชีถูกตรวจแยกอิสระพร้อม filter rules ของตัวเอง App Password ถูกเข้ารหัสก่อนเก็บ
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRecheckAll}
              disabled={isLoading || checkingId !== null}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold text-[#0e0e0c] transition hover:-translate-y-0.5 hover:bg-[#efece2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${checkingId !== null ? 'animate-spin' : ''}`} />
              ตรวจทั้งหมด
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#0e0e0c] bg-[#0e0e0c] px-3.5 py-2 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              เพิ่มบัญชี
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-[14px] border border-[#1b1b1726] bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <div className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#1a73e8] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0e0e0c]">ใช้ Google App Password แทนรหัสผ่านจริง</div>
            <div className="mt-0.5 text-xs leading-5 text-[#6b675c]">
              เปิด 2-Step Verification แล้วสร้างรหัส 16 หลักจาก Google จากนั้นใส่ในฟอร์มด้านล่าง
            </div>
          </div>
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-[#1b1b17] px-3 py-2 text-xs font-semibold text-[#0e0e0c] transition hover:bg-[#0e0e0c] hover:text-[#f7f5ef]"
          >
            สร้างรหัส
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[14px] border border-[#1b1b1726] bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6b675c]" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-[14px] border border-[#1b1b1726] bg-white p-12 text-center">
            <Mail className="mx-auto mb-4 h-14 w-14 text-[#6b675c]" />
            <h3 className="text-lg font-semibold">ยังไม่มีบัญชี Gmail</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6b675c]">
              เพิ่มบัญชี Gmail เพื่อให้ worker เริ่มตรวจอีเมลและส่ง notification ตาม rules
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#0e0e0c] px-4 py-2.5 text-sm font-semibold text-[#f7f5ef]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มบัญชีแรก
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="flex items-center justify-between border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 py-3">
              <h2 className="text-sm font-semibold">บัญชีทั้งหมด</h2>
              <div className="font-mono text-[11px] text-[#6b675c]">
                {activeCount} active / {accounts.length - activeCount} paused
              </div>
            </div>

            <div className="divide-y divide-[#1b1b1726] md:hidden">
              {accounts.map((account, index) => (
                <div key={account.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold text-white"
                      style={{ backgroundColor: ['#ea4335', '#1a73e8', '#fbbc04', '#34a853'][index % 4] }}
                    >
                      {accountMark(account.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[#0e0e0c]">{account.email}</div>
                      <div className="mt-1 font-mono text-[11px] text-[#6b675c]">
                        {account.imap_server} / {account.imap_port} / {account.sync_mode}
                      </div>
                      <div className="mt-2 font-mono text-[11px] text-[#6b675c]">
                        ตรวจล่าสุด: {formatLastCheck(account.last_checked_at)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${account.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {account.enabled ? 'connected' : 'paused'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggle(account)}
                        disabled={togglingId === account.id}
                        className={`relative h-5 w-9 rounded-full transition ${account.enabled ? 'bg-[#34a853]' : 'bg-[#1b1b1722]'}`}
                        aria-label={account.enabled ? 'หยุดตรวจบัญชีนี้' : 'เปิดตรวจบัญชีนี้'}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${account.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckNow(account)}
                        disabled={checkingId === account.id}
                        className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#1b1b170d] hover:text-[#0e0e0c] disabled:opacity-60"
                        title="ดึงอีเมลทันที"
                      >
                        {checkingId === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(account)}
                        className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#1b1b170d] hover:text-[#0e0e0c]"
                        title="แก้ไข"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id, account.email)}
                        disabled={deleteAccount.isPending}
                        className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#ea433512] hover:text-[#ea4335] disabled:opacity-60"
                        title="ลบ"
                      >
                        {deleteAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1b1b1726] bg-[#fbfaf3] text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">
                    <th className="px-4 py-3 font-medium">Account</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sync mode</th>
                    <th className="px-4 py-3 font-medium">Last check</th>
                    <th className="px-4 py-3 font-medium">Polling</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => (
                    <tr key={account.id} className="border-b border-[#1b1b1726] last:border-0 hover:bg-[#fbfaf3aa]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold text-white"
                            style={{ backgroundColor: ['#ea4335', '#1a73e8', '#fbbc04', '#34a853'][index % 4] }}
                          >
                            {accountMark(account.email)}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[#0e0e0c]">{account.email}</div>
                            <div className="mt-0.5 font-mono text-[11px] text-[#6b675c]">
                              {account.imap_server} / {account.imap_port} / TLS
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${account.enabled ? 'bg-[#34a85318] text-[#1f8f47]' : 'bg-[#1b1b170f] text-[#6b675c]'}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {account.enabled ? 'connected' : 'paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#6b675c]">{account.sync_mode}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#6b675c]">{formatLastCheck(account.last_checked_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(account)}
                          disabled={togglingId === account.id}
                          className={`relative h-5 w-9 rounded-full transition ${account.enabled ? 'bg-[#34a853]' : 'bg-[#1b1b1722]'}`}
                          aria-label={account.enabled ? 'หยุดตรวจบัญชีนี้' : 'เปิดตรวจบัญชีนี้'}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${account.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCheckNow(account)}
                            disabled={checkingId === account.id}
                            className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#1b1b170d] hover:text-[#0e0e0c] disabled:opacity-60"
                            title="ดึงอีเมลทันที"
                          >
                            {checkingId === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(account)}
                            className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#1b1b170d] hover:text-[#0e0e0c]"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id, account.email)}
                            disabled={deleteAccount.isPending}
                            className="grid h-8 w-8 place-items-center rounded-md text-[#6b675c] transition hover:bg-[#ea433512] hover:text-[#ea4335] disabled:opacity-60"
                            title="ลบ"
                          >
                            {deleteAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <GmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editingAccount}
      />
    </>
  )
}
