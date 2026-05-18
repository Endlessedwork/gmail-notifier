import { Code, Copy, Shield, Webhook } from 'lucide-react'

const payload = `{
  "subject": "หัวข้ออีเมล",
  "from": "sender@example.com",
  "date": "Mon, 22 Feb 2025 10:30:00 +0700",
  "body": "เนื้อหาอีเมล (ตัดตาม max_body_length)...",
  "rule_name": "ชื่อ Filter Rule ที่ match",
  "timestamp": "2025-02-22T03:30:00.000000"
}`

const nodeExample = `app.post('/webhook', (req, res) => {
  const { subject, from, body, rule_name, timestamp } = req.body
  console.log('Email:', subject, 'from', from)
  res.status(200).json({ received: true })
})`

const pythonExample = `@app.post("/webhook")
async def webhook(request: Request):
    data = await request.json()
    subject = data.get("subject")
    sender = data.get("from")
    body = data.get("body")
    return {"received": True}`

const fields = [
  ['subject', 'หัวข้ออีเมล'],
  ['from', 'ผู้ส่ง (อีเมล)'],
  ['date', 'วันที่อีเมลแบบ raw string'],
  ['body', 'เนื้อหาอีเมลตาม max_body_length'],
  ['rule_name', 'ชื่อ Filter Rule ที่ match'],
  ['timestamp', 'เวลาที่ส่ง webhook แบบ ISO 8601'],
]

const steps = [
  ['01', 'เพิ่ม Gmail Account', 'กรอก Email และ App Password เพื่อให้ worker อ่าน IMAP ได้'],
  ['02', 'เพิ่ม Webhook Channel', 'เลือกประเภท Webhook แล้วกรอก URL ของ endpoint ที่รับข้อมูล'],
  ['03', 'สร้าง Filter Rule', 'เลือก account, channel และเงื่อนไข from / subject / body'],
]

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#1b1b1726] bg-[#fbfaf3] text-[#0e0e0c]">
      <div className="flex items-center justify-between border-b border-[#1b1b1726] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b675c]">{title}</span>
        <Copy className="h-4 w-4 text-[#6b675c]" />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-[#1b1b17]">{code}</pre>
    </div>
  )
}

export function WebhookGuidePage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[20px] border border-[#1b1b1726] bg-[#f7f5ef] p-6 shadow-[0_20px_60px_rgba(27,27,23,0.08)] md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[80px] bg-[#1a73e81a]" />
        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[#6b675c] before:h-[3px] before:w-9 before:rounded-full before:bg-[linear-gradient(90deg,#1a73e8_0_25%,#ea4335_25%_50%,#fbbc04_50%_75%,#34a853_75%_100%)]">
            POST / webhook guide
          </div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.04em] text-[#0e0e0c] md:text-5xl">
            <Webhook className="h-9 w-9 text-[#1a73e8]" />
            วิธีใช้งาน Webhook
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6b675c] md:text-base">
            ระบบส่ง JSON ผ่าน HTTP POST เมื่ออีเมล match กับ rule ที่ตั้งไว้ ใช้กับ internal automation, CRM, ticketing หรือ workflow ภายนอกได้ทันที
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map(([number, title, detail]) => (
          <div key={number} className="rounded-[16px] border border-[#1b1b1726] bg-white p-5">
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-[10px] bg-[#0e0e0c] font-mono text-xs font-bold text-[#f7f5ef]">
              {number}
            </div>
            <h2 className="text-lg font-semibold text-[#0e0e0c]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b675c]">{detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-[#1b1b1726] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-[#ea4335]" />
            <h2 className="text-xl font-semibold text-[#0e0e0c]">Payload ที่ระบบส่ง</h2>
          </div>
          <CodeBlock title="application/json" code={payload} />
        </div>

        <div className="rounded-[18px] border border-[#1b1b1726] bg-white p-5">
          <h2 className="text-xl font-semibold text-[#0e0e0c]">Fields</h2>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-[#1b1b1726]">
            {fields.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[120px_1fr] border-b border-[#1b1b1726] last:border-b-0">
                <div className="bg-[#fbfaf3] px-3 py-3 font-mono text-xs text-[#1a73e8]">{name}</div>
                <div className="px-3 py-3 text-sm text-[#6b675c]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CodeBlock title="Node.js / Express" code={nodeExample} />
        <CodeBlock title="Python / FastAPI" code={pythonExample} />
      </section>

      <section className="rounded-[18px] border border-[#1b1b1726] bg-[#fbfaf3] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#34a853]" />
          <h2 className="text-xl font-semibold text-[#0e0e0c]">Production checklist</h2>
        </div>
        <div className="grid gap-3 text-sm text-[#6b675c] md:grid-cols-2">
          {[
            'ใช้ HTTPS สำหรับ endpoint จริง',
            'ตอบกลับ HTTP 200, 201, 202 หรือ 204 เพื่อให้ระบบนับว่าสำเร็จ',
            'endpoint ควรตอบกลับภายใน 10 วินาที',
            'ตั้ง Authorization header ใน Channel config เมื่อ endpoint ต้องยืนยันตัวตน',
          ].map((item) => (
            <div key={item} className="rounded-[12px] border border-[#1b1b1726] bg-white px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
