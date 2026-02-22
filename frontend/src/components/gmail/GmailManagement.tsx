import { useState, useEffect } from 'react'
import { Mail, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GmailDialog } from './GmailDialog'

interface GmailAccount {
  id: string
  email: string
  password: string
  enabled: boolean
  last_check?: string
}

const STORAGE_KEY = 'gmail-notifier-accounts'

const loadAccounts = (): GmailAccount[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : [{
      id: '1',
      email: 'user@gmail.com',
      password: '',
      enabled: true,
      last_check: new Date().toISOString(),
    }]
  } catch {
    return []
  }
}

const saveAccounts = (accounts: GmailAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    console.error('Failed to save accounts:', error)
  }
}

export function GmailManagement() {
  const [accounts, setAccounts] = useState<GmailAccount[]>(loadAccounts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<GmailAccount | undefined>()

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  const handleCreate = () => {
    setEditingAccount(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (account: GmailAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleSubmit = (accountData: Partial<GmailAccount>) => {
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(acc =>
        acc.id === editingAccount.id
          ? { ...acc, ...accountData }
          : acc
      ))
    } else {
      // Create new account
      const newAccount: GmailAccount = {
        id: `account_${Date.now()}`,
        email: accountData.email || '',
        password: accountData.password || '',
        enabled: accountData.enabled ?? true,
        last_check: new Date().toISOString(),
      }
      setAccounts([...accounts, newAccount])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string, email: string) => {
    if (!confirm(`ต้องการลบบัญชี "${email}" หรือไม่?`)) return
    setAccounts(accounts.filter(acc => acc.id !== id))
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
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            เพิ่มบัญชี Gmail
          </Button>
        </div>

        {/* Accounts Grid */}
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
                    <p className="text-xs text-muted-foreground">Gmail Account</p>
                  </div>
                </div>
                <Badge variant={account.enabled ? 'default' : 'secondary'}>
                  {account.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              {account.last_check && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Last Check</span>
                    <span className="text-xs">
                      {new Date(account.last_check).toLocaleTimeString('th-TH')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleEdit(account)}
                >
                  <Edit className="w-3 h-3" />
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(account.id, account.email)}
                >
                  <Trash2 className="w-3 h-3" />
                  ลบ
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && (
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
        onSubmit={handleSubmit}
        account={editingAccount}
      />
    </>
  )
}
