import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  Settings,
  ShieldCheck,
  Webhook,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.7 13.7 0 0 1 10.96 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A22 22 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.05 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.13l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75Z"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      toast.error('กรุณากรอก Username/Email และ Password')
      return
    }

    setIsLoading(true)
    try {
      await login(username.trim(), password)
      toast.success('เข้าสู่ระบบสำเร็จ')
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/google/login'
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#0e0e0c] [font-family:'IBM_Plex_Sans_Thai','IBM_Plex_Sans',ui-sans-serif,system-ui,sans-serif]">
      <header className="sticky top-0 z-40 border-b border-[#1b1b1726] bg-[#f7f5ef]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-[-0.01em]">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-[conic-gradient(from_220deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] font-mono text-sm font-bold text-white shadow-[inset_0_0_0_2px_#f7f5ef] after:absolute after:right-[-2px] after:top-[-2px] after:h-2 after:w-2 after:rounded-full after:bg-[#34a853] after:ring-2 after:ring-[#f7f5ef]">
              G
            </span>
            <span>Gmail Notifier</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6b675c] transition-colors hover:text-[#0e0e0c]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแนะนำ
          </Link>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative order-2 overflow-hidden border-t border-[#1b1b1726] px-5 py-10 sm:px-8 sm:py-12 lg:order-1 lg:border-r lg:border-t-0 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(26,115,232,.14),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(234,67,53,.13),transparent_36%),radial-gradient(circle_at_88%_82%,rgba(251,188,4,.16),transparent_36%),radial-gradient(circle_at_12%_78%,rgba(52,168,83,.13),transparent_34%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(27,27,23,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(27,27,23,.15)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_30%_50%,#000_20%,transparent_70%)]" />

          <div className="relative z-10 flex min-h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b675c] before:h-[3px] before:w-11 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
                ยินดีต้อนรับกลับ
              </div>

              <h1 className="mt-6 max-w-xl text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#0e0e0c] sm:text-[44px] lg:text-[52px]">
                <span className="[font-family:'Instrument_Serif',ui-serif,Georgia,serif] italic">
                  เข้าสู่ระบบ
                </span>
                <br />
                เพื่อจัดการ{' '}
                <span className="bg-[linear-gradient(95deg,#1a73e8,#ea4335_38%,#fbbc04_66%,#34a853)] bg-clip-text text-transparent">
                  notifier
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#1b1b17] sm:text-[17px]">
                Worker ยังตรวจอีเมลอยู่ กฎยังทำงานอยู่ เข้าสู่ระบบเพื่อจัดการบัญชี Gmail,
                ช่องทางแจ้งเตือน, filter rules และ log ล่าสุดจากที่เดียว
              </p>
            </div>

            <div className="max-w-[540px] overflow-hidden rounded-[18px] border border-[#1b1b1726] bg-white shadow-[0_1px_0_rgba(27,27,23,.08),0_24px_50px_-28px_rgba(27,27,23,.35)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#1b1b1726] bg-gradient-to-b from-[#fcfbf6] to-[#f5f3ec] px-4 py-3 font-mono text-[11px] text-[#6b675c]">
                <span>notifier.local / system</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#34a85316] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1f8f47]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34a853]" />
                  normal
                </span>
              </div>

              <div>
                {[
                  {
                    icon: Mail,
                    label: '3 Gmail accounts',
                    sub: 'last check / 14s ago',
                    status: 'connected',
                    className: 'bg-[#ea4335]',
                  },
                  {
                    icon: Send,
                    label: '5 channels / 12 active rules',
                    sub: 'avg latency / 281 ms',
                    status: 'healthy',
                    className: 'bg-[#229ed9]',
                  },
                  {
                    icon: Webhook,
                    label: '1,284 emails scanned today',
                    sub: '147 matched / 312 delivered',
                    status: '99.4%',
                    className: 'bg-[#7c4dff]',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-dashed border-[#1b1b1726] px-4 py-3 first:border-t-0"
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-[9px] text-white ${item.className}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#1b1b17]">{item.label}</div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-[#6b675c]">{item.sub}</div>
                    </div>
                    <div className="rounded-full bg-[#34a85316] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#1f8f47]">
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#6b675c]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1a73e8]" />
                Encrypted at rest
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ea4335]" />
                App Password only
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#fbbc04]" />
                Self-hosted
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#34a853]" />
                MIT licensed
              </span>
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center bg-white px-5 py-10 sm:px-8 lg:order-2 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1b1b1726] bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b675c] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#1a73e8]">
                Step 01 / Sign in
              </div>
              <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#0e0e0c]">
                เข้าสู่แดชบอร์ดของคุณ
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6b675c]">
                ใช้ Username หรือ Email ของแอดมิน ถ้าเชื่อม Google OAuth ไว้แล้วสามารถเข้าสู่ระบบด้วย Google ได้ทันที
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1b1b17] bg-white px-5 py-3.5 text-sm font-semibold text-[#0e0e0c] transition hover:-translate-y-0.5 hover:bg-[#fafafa]"
            >
              <GoogleIcon />
              เข้าสู่ระบบด้วย Google
            </button>

            <div className="my-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b675c] before:h-px before:flex-1 before:bg-[#1b1b1726] after:h-px after:flex-1 after:bg-[#1b1b1726]">
              หรือใช้อีเมล
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-[#1b1b17]">
                  Username หรือ Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b675c]" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#1b1b17] bg-white py-3.5 pl-11 pr-4 text-sm text-[#0e0e0c] outline-none transition placeholder:text-[#9c9789] focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e822]"
                    placeholder="admin หรือ you@gmail.com"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1b1b17]">
                    Password
                  </label>
                  <span className="font-mono text-[11px] text-[#6b675c]">local admin</span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b675c]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#1b1b17] bg-white py-3.5 pl-11 pr-12 text-sm text-[#0e0e0c] outline-none transition placeholder:text-[#9c9789] focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e822]"
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#6b675c] transition hover:bg-[#efece2] hover:text-[#0e0e0c]"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0e0e0c] px-5 py-3.5 text-sm font-semibold text-[#f7f5ef] transition before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_18px_36px_-18px_rgba(27,27,23,.55)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f7f5ef55] border-t-[#f7f5ef]" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                {!isLoading && <ArrowUpRight className="h-4 w-4" />}
              </button>

              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 font-mono text-[11px] text-[#6b675c]">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Fernet-encrypted
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  No third party
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  2FA ready
                </span>
              </div>
            </form>

            <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[14px] border border-dashed border-[#1b1b17] bg-[#f7f5ef] p-4">
              <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[conic-gradient(from_220deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] text-white">
                <Settings className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1b1b17]">ยังไม่มีบัญชี?</div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-[#6b675c]">
                  สร้าง admin account แรก
                </div>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1b1b17] px-3 py-2 text-xs font-semibold text-[#0e0e0c] transition hover:bg-[#0e0e0c] hover:text-[#f7f5ef]"
              >
                สมัคร
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-6 border-t border-[#1b1b1726] pt-5 text-center text-sm text-[#6b675c]">
              ต้องการความช่วยเหลือ?{' '}
              <a
                href="https://github.com/Endlessedwork/gmail-notifier/issues"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#0e0e0c] underline decoration-[#1a73e8] decoration-2 underline-offset-4 hover:decoration-[#ea4335]"
              >
                เปิด issue บน GitHub
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
