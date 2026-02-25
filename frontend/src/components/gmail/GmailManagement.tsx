import { useState } from 'react'
import { Mail, Plus, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GmailDialog } from './GmailDialog'
import { useQueryClient } from '@tanstack/react-query'
import { useGmailAccounts, useDeleteGmailAccount } from '@/hooks/useGmailAccounts'
import { gmailAccountsApi } from '@/api'
import { toast } from 'sonner'
import type { GmailAccount } from '@/types'

export function GmailManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<GmailAccount | undefined>()
  const [checkingId, setCheckingId] = useState<number | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useGmailAccounts()
  const deleteAccount = useDeleteGmailAccount()

  const accounts = data?.accounts || []

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

  const handleCheckNow = async (account: GmailAccount) => {
    setCheckingId(account.id)
    try {
      await gmailAccountsApi.checkNow(account.id)
      toast.success(`ดึงอีเมล ${account.email} เรียบร้อย`)
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || 'ดึงอีเมลล้มเหลว')
    } finally {
      setCheckingId(null)
    }
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-6 text-center">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Gmail Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการบัญชี Gmail ที่ใช้ในการรับอีเมล
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2" disabled={isLoading}>
            <Plus className="w-4 h-4" />
            เพิ่มบัญชี Gmail
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Accounts Grid */}
        {!isLoading && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{account.email}</h3>
                      <p className="text-xs text-muted-foreground">
                        {account.imap_server}:{account.imap_port}
                      </p>
                    </div>
                  </div>
                  <Badge variant={account.enabled ? 'default' : 'secondary'}>
                    {account.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>

                {account.last_checked_at && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Last Check</span>
                      <span className="text-xs">
                        {new Date(account.last_checked_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-4 pt-4 border-t border-border">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCheckNow(account)}
                    disabled={checkingId === account.id}
                    title="ดึงอีเมลทันที"
                  >
                    {checkingId === account.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(account)}
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(account.id, account.email)}
                    disabled={deleteAccount.isPending}
                    title="ลบ"
                  >
                    {deleteAccount.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && accounts.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีบัญชี Gmail</h3>
            <p className="text-muted-foreground mb-6">
              เพิ่มบัญชี Gmail เพื่อเริ่มรับการแจ้งเตือนอีเมล
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มบัญชีแรก
            </Button>
          </div>
        )}
      </div>

      {/* Gmail Dialog */}
      <GmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editingAccount}
      />
    </>
  )
}
