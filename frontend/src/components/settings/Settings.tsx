import { useState, useEffect } from 'react'
import { useConfig, useUpdateConfig } from '@/hooks/useConfig'
import { Save, Server, Zap, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export function Settings() {
  const { data: config, isLoading } = useConfig()
  const updateConfig = useUpdateConfig()

  const [formData, setFormData] = useState<{
    imap_server: string
    imap_port: number
    check_interval: number
    max_body_length: number
    default_chat_id: string
    log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
  }>({
    imap_server: 'imap.gmail.com',
    imap_port: 993,
    check_interval: 60,
    max_body_length: 300,
    default_chat_id: '',
    log_level: 'INFO',
  })

  useEffect(() => {
    if (config?.settings) {
      setFormData({
        imap_server: config.settings.imap_server || 'imap.gmail.com',
        imap_port: config.settings.imap_port || 993,
        check_interval: config.settings.check_interval || 60,
        max_body_length: config.settings.max_body_length || 300,
        default_chat_id: config.settings.default_chat_id || '',
        log_level: config.settings.log_level || 'INFO',
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!config) return

    try {
      await updateConfig.mutateAsync({
        ...config,
        settings: {
          ...config.settings,
          ...formData,
        },
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleReset = () => {
    if (config?.settings) {
      setFormData({
        imap_server: config.settings.imap_server || 'imap.gmail.com',
        imap_port: config.settings.imap_port || 993,
        check_interval: config.settings.check_interval || 60,
        max_body_length: config.settings.max_body_length || 300,
        default_chat_id: config.settings.default_chat_id || '',
        log_level: config.settings.log_level || 'INFO',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse w-64 h-8 rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ตั้งค่าระบบ Gmail Notifier
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* IMAP Settings */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            IMAP Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imap_server">IMAP Server</Label>
              <Input
                id="imap_server"
                type="text"
                value={formData.imap_server}
                onChange={(e) =>
                  setFormData({ ...formData, imap_server: e.target.value })
                }
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
              />
            </div>
          </div>
        </div>

        {/* Check Settings */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Check Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_interval">Check Interval (seconds)</Label>
              <Input
                id="check_interval"
                type="number"
                min="10"
                max="3600"
                value={formData.check_interval}
                onChange={(e) =>
                  setFormData({ ...formData, check_interval: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                ระยะเวลาตรวจสอบอีเมลใหม่ (แนะนำ 30-120 วินาที)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_body_length">Max Body Length</Label>
              <Input
                id="max_body_length"
                type="number"
                min="100"
                max="4000"
                value={formData.max_body_length}
                onChange={(e) =>
                  setFormData({ ...formData, max_body_length: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                ความยาวสูงสุดของเนื้อหาอีเมลที่จะส่ง
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Settings */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Default Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_chat_id">Default Chat ID</Label>
              <Input
                id="default_chat_id"
                type="text"
                placeholder="เช่น: -1001234567890"
                value={formData.default_chat_id}
                onChange={(e) =>
                  setFormData({ ...formData, default_chat_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Telegram chat ID สำหรับอีเมลที่ไม่ตรงกับ filter rules ใดๆ
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log_level">Log Level</Label>
              <Select
                value={formData.log_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, log_level: value as 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updateConfig.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="gap-2"
            disabled={updateConfig.isPending}
          >
            <Save className="w-4 h-4" />
            {updateConfig.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-card border border-border rounded-lg p-6 border-l-4 border-l-primary">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span>ℹ️</span>
          หมายเหตุ
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีโดยไม่ต้อง restart container</li>
          <li>• ระบบจะ hot-reload config.json อัตโนมัติเมื่อมีการเปลี่ยนแปลง</li>
          <li>• Check interval ที่เหมาะสมคือ 30-120 วินาที</li>
        </ul>
      </div>
    </div>
  )
}
