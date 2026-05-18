import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Bell,
  Check,
  Clock3,
  Code2,
  Database,
  Filter,
  Github,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageCircle,
  Radio,
  RefreshCcw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Webhook,
} from 'lucide-react'

const features = [
  {
    icon: Mail,
    label: 'Multi-account',
    title: 'หลาย Gmail inbox ใน feed เดียว',
    text: 'เชื่อม personal, work และ shared inbox ได้ แยก rules, channels และ history ตามบัญชี',
    color: 'bg-[#1a73e8]',
  },
  {
    icon: Filter,
    label: 'Filter rules',
    title: 'Regex, equals, contains',
    text: 'Match จาก from, subject หรือ body พร้อม priority ชัดเจนว่า rule ไหนควรทำงานก่อน',
    color: 'bg-[#ea4335]',
  },
  {
    icon: Radio,
    label: 'Hot reload',
    title: 'แก้ config ไม่ต้อง restart',
    text: 'Worker อ่าน config จาก database ในแต่ละรอบ เปลี่ยน rule หรือ channel แล้วใช้ได้ทันที',
    color: 'bg-[#fbbc04] text-[#1b1b17]',
  },
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    title: 'จัดการผ่าน UI ทั้งหมด',
    text: 'เพิ่มบัญชี Gmail, ตั้ง channel, เขียน rules และดู logs โดยไม่ต้องแก้ไฟล์ config เอง',
    color: 'bg-[#34a853]',
  },
  {
    icon: ShieldCheck,
    label: 'Security',
    title: 'เข้ารหัส App Password',
    text: 'Gmail App Password ถูกเข้ารหัสด้วย Fernet ก่อนเก็บลง SQLite และ key อยู่ใน env ของคุณ',
    color: 'bg-[#1a73e8]',
  },
  {
    icon: Server,
    label: 'Self-hosted',
    title: 'Docker พร้อมใช้งาน',
    text: 'Nginx, FastAPI, Worker และ SQLite อยู่ใน deploy flow เดียว เหมาะกับ VPS หรือ homelab',
    color: 'bg-[#ea4335]',
  },
]

const steps = [
  ['01', 'Connect Gmail', 'เพิ่มบัญชี Gmail ด้วย App Password และ IMAP server'],
  ['02', 'Add channels', 'เลือก Telegram, LINE หรือ Webhook endpoint'],
  ['03', 'Write rules', 'กำหนด contains / equals / regex และ priority'],
  ['04', 'Watch it fly', 'Worker poll เมลใหม่ ส่ง notification และบันทึก logs'],
]

const channels = [
  { icon: Send, name: 'Telegram', text: 'ส่งเข้า private chat, group หรือ channel ผ่าน bot token', color: '#229ed9' },
  { icon: MessageCircle, name: 'LINE', text: 'เหมาะกับทีมในไทยหรือกลุ่มครอบครัวที่ใช้ LINE เป็นหลัก', color: '#06c755' },
  { icon: Webhook, name: 'Webhook', text: 'ส่งต่อเข้า Slack, Discord, n8n, Zapier หรือ internal ops tool', color: '#7c4dff' },
]

const faqs = [
  ['เป็น official Google product ไหม?', 'ไม่ใช่ เป็น open-source tool ที่เชื่อม Gmail ผ่าน IMAP ด้วย App Password'],
  ['เก็บ App Password ยังไง?', 'เข้ารหัสด้วย Fernet ก่อนเก็บลง database และใช้ encryption key จาก environment'],
  ['รันบน homelab ได้ไหม?', 'ได้ เพราะใช้ SQLite และ worker เบา เหมาะกับ VPS ขนาดเล็กหรือเครื่องในบ้าน'],
  ['เช็กเมลถี่แค่ไหน?', 'ค่าเริ่มต้นคือ 60 วินาที ปรับได้ผ่าน CHECK_INTERVAL หรือ Settings'],
]

function BrandMark() {
  return (
    <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-[conic-gradient(from_220deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)] font-mono text-sm font-bold text-white shadow-[inset_0_0_0_2px_#f7f5ef] after:absolute after:right-[-2px] after:top-[-2px] after:h-2 after:w-2 after:rounded-full after:bg-[#34a853] after:ring-2 after:ring-[#f7f5ef]">
      G
    </span>
  )
}

function GoogleStripe() {
  return (
    <span className="inline-flex h-[3px] w-16 overflow-hidden rounded-full">
      <i className="flex-1 bg-[#1a73e8]" />
      <i className="flex-1 bg-[#ea4335]" />
      <i className="flex-1 bg-[#fbbc04]" />
      <i className="flex-1 bg-[#34a853]" />
    </span>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#0e0e0c] [font-family:'IBM_Plex_Sans_Thai','IBM_Plex_Sans',ui-sans-serif,system-ui,sans-serif]">
      <header className="sticky top-0 z-50 border-b border-[#1b1b1726] bg-[#f7f5ef]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3 font-semibold tracking-[-0.01em]">
            <BrandMark />
            <span>Gmail Notifier</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#1b1b17] md:flex">
            <a href="#features" className="hover:text-[#1a73e8]">ฟีเจอร์</a>
            <a href="#how" className="hover:text-[#1a73e8]">วิธีทำงาน</a>
            <a href="#channels" className="hover:text-[#1a73e8]">ช่องทาง</a>
            <a href="#quickstart" className="hover:text-[#1a73e8]">ติดตั้ง</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full border border-[#1b1b17] px-4 py-2 text-sm font-semibold text-[#1b1b17] transition hover:bg-white sm:inline-flex">
              Sign in
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-[#0e0e0c] bg-[#0e0e0c] px-4 py-2 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black">
              เริ่มใช้งาน
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[#1b1b1726]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(26,115,232,.16),transparent_30%),radial-gradient(circle_at_86%_10%,rgba(234,67,53,.13),transparent_34%),radial-gradient(circle_at_74%_88%,rgba(251,188,4,.18),transparent_36%),radial-gradient(circle_at_10%_88%,rgba(52,168,83,.14),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6b675c]">
                <GoogleStripe />
                v1.0 · Open Source · Self-hosted
              </div>
              <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0e0e0c] sm:text-[64px] lg:text-[82px]">
                ส่งอีเมลสำคัญจาก Gmail ไปยัง{' '}
                <span className="[font-family:'Instrument_Serif',ui-serif,Georgia,serif] italic">chat</span>{' '}
                ในไม่กี่วินาที
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#1b1b17] sm:text-xl">
                Self-hosted notifier ที่ตรวจ Gmail ผ่าน IMAP, match ด้วย filter rules แล้วส่งต่อไป Telegram, LINE หรือ Webhook โดยไม่ต้องพึ่ง SaaS ภายนอก
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-[#0e0e0c] bg-[#0e0e0c] px-5 py-3 text-sm font-semibold text-[#f7f5ef] transition hover:-translate-y-0.5 hover:bg-black">
                  Sign in to start
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a href="#quickstart" className="inline-flex items-center gap-2 rounded-full border border-[#0e0e0c] px-5 py-3 text-sm font-semibold text-[#0e0e0c] transition hover:-translate-y-0.5 hover:bg-white">
                  Deploy with Docker
                  <Code2 className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#6b675c]">
                {['Multi-account Gmail', 'Regex filter rules', 'Hot-reload config', 'MIT licensed'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#34a853] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="absolute -right-4 -top-5 z-20 hidden rounded-[14px] border border-[#1b1b1726] bg-white px-3 py-2 shadow-[0_18px_35px_-20px_rgba(27,27,23,.55)] sm:flex sm:items-center sm:gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#34a853] text-white">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">3 channels online</span>
                  <span className="block font-mono text-[10px] text-[#6b675c]">latency 281ms</span>
                </span>
              </div>
              <div className="overflow-hidden rounded-[18px] border border-[#1b1b1726] bg-white shadow-[0_30px_60px_-32px_rgba(27,27,23,.45)]">
                <div className="flex items-center gap-2 border-b border-[#1b1b1726] bg-gradient-to-b from-[#fcfbf6] to-[#f5f3ec] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 rounded-md border border-[#1b1b1726] bg-white px-3 py-1 font-mono text-[11px] text-[#6b675c]">notifier.local / flow</span>
                </div>
                <div className="bg-[#fbfaf3] p-5">
                  {[
                    ['gm', Mail, 'SCB Banking Alert · ฿24,500 transferred', 'from alerts@scb.co.th · subject regex /transfer|โอนเงิน/i', 'matched'],
                    ['tg', Send, 'Telegram · Finance room', 'bot delivered · markdown message', 'sent'],
                    ['ln', MessageCircle, 'LINE · Family group', 'notify token accepted', 'sent'],
                    ['wh', Webhook, 'Webhook · Ops endpoint', 'POST /incoming · 202 accepted', 'sent'],
                  ].map(([key, Icon, title, sub, status]) => (
                    <div key={key as string} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-dashed border-[#1b1b1726] py-3 first:border-t-0">
                      <span className={`grid h-10 w-10 place-items-center rounded-[10px] text-white ${key === 'gm' ? 'bg-[#ea4335]' : key === 'tg' ? 'bg-[#229ed9]' : key === 'ln' ? 'bg-[#06c755]' : 'bg-[#7c4dff]'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{title as string}</span>
                        <span className="block truncate font-mono text-[11px] text-[#6b675c]">{sub as string}</span>
                      </span>
                      <span className="rounded-full bg-[#34a85316] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1f8f47]">
                        {status as string}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-[#1b1b1726] px-4 py-3 font-mono text-[11px] text-[#6b675c]">
                  <span>worker · running</span>
                  <span>checked 14s ago</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#1b1b1726] bg-[#0e0e0c] py-5 text-[#f7f5ef]">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-3 px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#faf8f2bf] sm:px-8">
            <span>Gmail IMAP</span>
            <span>Filter Rules</span>
            <span>Telegram</span>
            <span>LINE</span>
            <span>Webhook</span>
            <span>SQLite</span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid overflow-hidden rounded-[18px] border border-[#1b1b1726] bg-white sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['60', 'sec', 'Check Interval'],
              ['3', 'types', 'Channel Types'],
              ['∞', '', 'Gmail Accounts'],
              ['0', 'restart', 'Config Change'],
            ].map(([num, unit, label], index) => (
              <div key={label} className={`border-[#1b1b1726] p-7 ${index > 0 ? 'sm:border-l' : ''} ${index > 1 ? 'border-t lg:border-t-0' : ''}`}>
                <div className="text-5xl font-semibold tracking-[-0.04em]">
                  {num}
                  {unit && <span className="ml-1 align-middle font-mono text-lg font-medium text-[#1a73e8]">{unit}</span>}
                </div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b675c]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="border-t border-[#1b1b1726] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                  <GoogleStripe />
                  01 / Features
                </div>
                <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Built for people who live in chat.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#6b675c]">
                Email คือที่ที่เรื่องสำคัญมักจมหาย Gmail Notifier เปลี่ยนเมลที่ต้องตอบสนองเป็น notification ในช่องทางที่ทีมเช็กอยู่แล้ว
              </p>
            </div>
            <div className="grid border-l border-t border-[#1b1b1726] md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="border-b border-r border-[#1b1b1726] p-7 transition hover:bg-white">
                  <div className={`mb-5 grid h-10 w-10 place-items-center rounded-[10px] text-white ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6b675c]">{feature.label}</div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b675c]">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-[#1b1b1726] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                  <GoogleStripe />
                  02 / Workflow
                </div>
                <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Four steps. No magic.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#6b675c]">
                Worker fetch เมลใหม่จาก IMAP, run ผ่าน rules, fan out ไปทุก matched channel แล้วเก็บ history ใน SQLite
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              {steps.map(([num, title, text]) => (
                <div key={num} className="rounded-[16px] border border-[#1b1b1726] bg-[#f7f5ef] p-6">
                  <div className="mb-8 grid h-11 w-11 place-items-center rounded-[10px] bg-[#0e0e0c] font-mono text-xs font-bold text-[#f7f5ef]">{num}</div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b675c]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="channels" className="border-t border-[#1b1b1726] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                <GoogleStripe />
                03 / Channels
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Push to where people actually are.</h2>
              <p className="mt-5 text-base leading-7 text-[#6b675c]">หนึ่ง rule ส่งได้หลายช่องทางพร้อมกัน ครอบคลุม chat, group และ automation endpoint</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {channels.map((channel) => (
                <article key={channel.name} className="overflow-hidden rounded-[18px] border border-[#1b1b1726] bg-white">
                  <div className="h-1.5" style={{ backgroundColor: channel.color }} />
                  <div className="p-6">
                    <div className="mb-8 grid h-12 w-12 place-items-center rounded-[12px] text-white" style={{ backgroundColor: channel.color }}>
                      <channel.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-semibold">{channel.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#6b675c]">{channel.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="dashboard" className="border-t border-[#1b1b1726] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                  <GoogleStripe />
                  04 / Dashboard
                </div>
                <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">A control room for your inbox.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#6b675c]">
                React UI สำหรับ accounts, channels, rules และ logs โดยยังมี REST API สำหรับ automation ภายนอก
              </p>
            </div>
            <div className="overflow-hidden rounded-[20px] border border-[#1b1b1726] bg-[#f7f5ef] shadow-[0_30px_80px_-48px_rgba(27,27,23,.45)]">
              <div className="grid lg:grid-cols-[230px_1fr]">
                <aside className="hidden border-r border-[#1b1b1726] bg-[#fbfaf3] p-4 lg:block">
                  <div className="mb-6 flex items-center gap-2 font-semibold"><BrandMark /> Gmail Notifier</div>
                  {['Dashboard', 'Gmail accounts', 'Channels', 'Filter rules', 'Logs', 'Settings'].map((item, index) => (
                    <div key={item} className={`mb-2 flex items-center justify-between rounded-[10px] px-3 py-2 text-sm ${index === 0 ? 'bg-[#1b1b170d] font-semibold' : 'text-[#6b675c]'}`}>
                      <span>{item}</span>
                      <span className="font-mono text-[10px]">{index === 0 ? '⌘1' : index + 2}</span>
                    </div>
                  ))}
                </aside>
                <div className="p-5">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">Overview</h3>
                      <p className="mt-1 text-sm text-[#6b675c]">Last 24 hours · 3 accounts active</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#34a85316] px-3 py-1.5 font-mono text-[11px] text-[#1f8f47]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#34a853]" />
                      All systems
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['1,284', 'Emails Scanned', '↑ 18%'],
                      ['147', 'Matched', '↑ 12%'],
                      ['312', 'Delivered', '99.4% ok'],
                      ['281ms', 'Avg latency', '↓ 42ms'],
                    ].map(([value, label, delta]) => (
                      <div key={label} className="rounded-[14px] border border-[#1b1b1726] bg-white p-4">
                        <div className="text-3xl font-semibold tracking-[-0.03em]">{value}</div>
                        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b675c]">{label}</div>
                        <div className="mt-4 text-xs font-semibold text-[#1f8f47]">{delta}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-white">
                    {[
                      ['09:41', 'SCB · Transfer ฿24,500', 'Telegram, LINE', 'sent'],
                      ['09:36', 'Stripe · payout 412.00 USD', 'Webhook', 'sent'],
                      ['09:20', 'GitHub · Pull request #482 ready', 'Telegram', 'sent'],
                    ].map(([time, subject, channel, status]) => (
                      <div key={subject} className="grid gap-2 border-b border-[#1b1b1726] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[80px_1fr_160px_70px]">
                        <span className="font-mono text-xs text-[#6b675c]">{time}</span>
                        <span className="font-semibold">{subject}</span>
                        <span className="text-[#6b675c]">{channel}</span>
                        <span className="font-mono text-xs text-[#1f8f47]">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="quickstart" className="border-t border-[#1b1b1726] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                <GoogleStripe />
                05 / Quickstart
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">From zero to alerts in 5 minutes.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#6b675c]">Clone, configure `.env`, run Docker แล้วเปิด dashboard เพื่อเพิ่ม inbox แรก</p>
            </div>
            <div className="overflow-hidden rounded-[18px] border border-[#1b1b1726] bg-[#10100e] text-[#f7f5ef]">
              <div className="border-b border-white/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#d8d2c0]">terminal</div>
              <pre className="overflow-x-auto p-5 text-sm leading-7">{`git clone https://github.com/Endlessedwork/gmail-notifier
cd gmail-notifier
cp .env.example .env
docker compose up --build`}</pre>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-[#1b1b1726] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6b675c]">
                <GoogleStripe />
                06 / FAQ
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Honest answers.</h2>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {faqs.map(([question, answer]) => (
                <div key={question} className="rounded-[16px] border border-[#1b1b1726] bg-[#f7f5ef] p-5">
                  <h3 className="text-lg font-semibold">{question}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b675c]">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[24px] bg-[#0e0e0c] p-8 text-[#f7f5ef] sm:p-12">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#eae6dabf]">
                <Sparkles className="h-4 w-4 text-[#fbbc04]" />
                Open source · MIT
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Stop missing the important ones.</h2>
              <p className="mt-5 text-base leading-7 text-[#eae6dabf]">ตั้ง rule แรก แล้วให้เมลถัดไปที่สำคัญเข้า chat แทนการจมอยู่ใน unread count</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-[#f7f5ef] bg-[#f7f5ef] px-5 py-3 text-sm font-semibold text-[#0e0e0c]">
                  Sign in
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a href="https://github.com/Endlessedwork/gmail-notifier" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#f7f5ef66] px-5 py-3 text-sm font-semibold text-[#f7f5ef]">
                  View on GitHub
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1b1b1726] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-[#6b675c]">
          <div className="flex items-center gap-3 text-[#0e0e0c]"><BrandMark /> Gmail Notifier</div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1"><LockKeyhole className="h-4 w-4" /> Fernet encrypted</span>
            <span className="inline-flex items-center gap-1"><Database className="h-4 w-4" /> SQLite</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> 60s polling</span>
            <span className="inline-flex items-center gap-1"><RefreshCcw className="h-4 w-4" /> hot reload</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
