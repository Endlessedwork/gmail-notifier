import { useEffect, useState } from 'react'
import { FileText, Save, Server, ShieldCheck, Zap } from 'lucide-react'
import { useConfig, useUpdateConfig } from '@/hooks/useConfig'

export function Settings() {
  const { data: config, isLoading } = useConfig()
  const updateConfig = useUpdateConfig()
  const [formData, setFormData] = useState({
    imap_server: 'imap.gmail.com',
    imap_port: 993,
    check_interval: 60,
    max_body_length: 300,
    default_chat_id: '',
    log_level: 'INFO' as 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR',
  })

  useEffect(() => {
    if (config?.settings) {
      setFormData({
        imap_server: config.settings.imap_server || 'imap.gmail.com',
        imap_port: config.settings.imap_port || 993,
        check_interval: config.settings.check_interval || 60,
        max_body_length: config.settings.max_body_length ?? 300,
        default_chat_id: config.settings.default_chat_id || '',
        log_level: config.settings.log_level || 'INFO',
      })
    }
  }, [config])

  const reset = () => {
    if (!config?.settings) return
    setFormData({
      imap_server: config.settings.imap_server || 'imap.gmail.com',
      imap_port: config.settings.imap_port || 993,
      check_interval: config.settings.check_interval || 60,
      max_body_length: config.settings.max_body_length ?? 300,
      default_chat_id: config.settings.default_chat_id || '',
      log_level: config.settings.log_level || 'INFO',
    })
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!config) return
    await updateConfig.mutateAsync({ ...config, settings: { ...config.settings, ...formData } })
  }

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[14px] border border-[#1b1b1726] bg-white" />
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
            self-hosted / hot reload
          </div>
          <h1 className="text-2xl font-semibold text-[#0e0e0c]">การตั้งค่า</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b675c]">ตั้งค่าระบบ, IMAP defaults, worker interval และ log behavior</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} disabled={updateConfig.isPending} className="rounded-[10px] border border-[#1b1b1726] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#efece2] disabled:opacity-60">ยกเลิก</button>
          <button type="submit" disabled={updateConfig.isPending} className="inline-flex items-center gap-2 rounded-[10px] bg-[#0e0e0c] px-3.5 py-2 text-sm font-semibold text-[#f7f5ef] hover:bg-black disabled:opacity-60">
            <Save className="h-4 w-4" />
            {updateConfig.isPending ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1 lg:sticky lg:top-24 lg:self-start">
          {[
            ['General', Server],
            ['Worker', Zap],
            ['Security', ShieldCheck],
            ['Defaults', FileText],
          ].map(([label, Icon]) => (
            <a key={label as string} href={`#${String(label).toLowerCase()}`} className="flex items-center gap-2 rounded-[10px] border border-transparent px-3 py-2 text-sm font-semibold text-[#6b675c] hover:bg-white">
              <Icon className="h-4 w-4" />
              {label as string}
            </a>
          ))}
        </aside>

        <div className="space-y-6">
          <section id="general" className="rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
              <h2 className="font-semibold">IMAP defaults</h2>
              <p className="mt-1 text-sm text-[#6b675c]">ค่าเริ่มต้นสำหรับ Gmail accounts ใหม่</p>
            </div>
            <div className="divide-y divide-[#1b1b1726] px-5">
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">IMAP Server</div><div className="mt-1 text-sm text-[#6b675c]">ค่า Gmail มาตรฐานคือ imap.gmail.com</div></div>
                <input className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.imap_server} onChange={(e) => setFormData({ ...formData, imap_server: e.target.value })} />
              </div>
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">IMAP Port</div><div className="mt-1 text-sm text-[#6b675c]">TLS default port คือ 993</div></div>
                <input type="number" className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.imap_port} onChange={(e) => setFormData({ ...formData, imap_port: Number(e.target.value) })} />
              </div>
            </div>
          </section>

          <section id="worker" className="rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
              <h2 className="font-semibold">Worker behavior</h2>
              <p className="mt-1 text-sm text-[#6b675c]">ควบคุมความถี่และความยาวข้อความที่ส่งต่อ</p>
            </div>
            <div className="divide-y divide-[#1b1b1726] px-5">
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">CHECK_INTERVAL</div><div className="mt-1 text-sm text-[#6b675c]">แนะนำ 30-120 วินาที เพื่อเลี่ยง IMAP throttling</div></div>
                <input type="number" min="10" max="3600" className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.check_interval} onChange={(e) => setFormData({ ...formData, check_interval: Number(e.target.value) })} />
              </div>
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">MAX_BODY_LENGTH</div><div className="mt-1 text-sm text-[#6b675c]">จำกัด preview body ใน notification</div></div>
                <input type="number" min="0" max="5000" className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.max_body_length} onChange={(e) => setFormData({ ...formData, max_body_length: Number(e.target.value) })} />
              </div>
            </div>
          </section>

          <section id="defaults" className="rounded-[14px] border border-[#1b1b1726] bg-white">
            <div className="border-b border-[#1b1b1726] bg-[#fbfaf3] px-5 py-4">
              <h2 className="font-semibold">Default settings</h2>
            </div>
            <div className="divide-y divide-[#1b1b1726] px-5">
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">Default Chat ID</div><div className="mt-1 text-sm text-[#6b675c]">fallback Telegram chat ID สำหรับอีเมลที่ไม่เข้า rule</div></div>
                <input className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.default_chat_id} onChange={(e) => setFormData({ ...formData, default_chat_id: e.target.value })} />
              </div>
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_280px]">
                <div><div className="font-semibold">Log Level</div><div className="mt-1 text-sm text-[#6b675c]">ระดับ log ที่ backend/worker ใช้</div></div>
                <select className="rounded-[10px] border border-[#1b1b17] bg-white px-3 py-2 text-sm" value={formData.log_level} onChange={(e) => setFormData({ ...formData, log_level: e.target.value as typeof formData.log_level })}>
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
            </div>
          </section>

          <section id="security" className="rounded-[14px] border border-[#1b1b1726] bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#34a853] text-white"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="font-semibold">Security</h2>
                <p className="mt-1 text-sm leading-6 text-[#6b675c]">Gmail App Passwords ถูกเข้ารหัสด้วย Fernet ก่อนเก็บ และ JWT ใช้ `SECRET_KEY` สำหรับ session signing</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
