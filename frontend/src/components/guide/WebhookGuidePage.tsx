import { Webhook, Code, Shield } from 'lucide-react'

export function WebhookGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Webhook className="w-7 h-7" />
          วิธีการใช้งาน Webhook
        </h1>
        <p className="text-muted-foreground mt-1">
          คู่มือการตั้งค่าและรับข้อมูลจาก Webhook เมื่อมีอีเมลเข้า
        </p>
      </div>

      <div className="grid gap-6">
        {/* ขั้นตอนการตั้งค่า */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold">ขั้นตอนการตั้งค่า</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">ทำตามลำดับเพื่อให้ Webhook ทำงาน</p>
          <div className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <strong>เพิ่ม Gmail Account</strong> — ไปที่เมนู Gmail Accounts → เพิ่มบัญชี → กรอก Email และ App Password
              </li>
              <li>
                <strong>เพิ่ม Notification Channel</strong> — ไปที่ Notification Channels → เพิ่ม Channel → เลือกประเภท <strong>Webhook</strong> → กรอก URL ของ endpoint ที่จะรับข้อมูล
              </li>
              <li>
                <strong>สร้าง Filter Rule</strong> — ไปที่ Filter Rules → เพิ่ม Rule → เลือก Gmail account, Channel (Webhook ที่สร้าง), กำหนดเงื่อนไข (from/subject/body)
              </li>
            </ol>
          </div>
        </div>

        {/* รูปแบบ Payload */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="w-5 h-5" />
            รูปแบบข้อมูลที่ส่ง
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">ระบบส่งข้อมูลแบบ JSON ผ่าน HTTP POST</p>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "subject": "หัวข้ออีเมล",
  "from": "sender@example.com",
  "date": "Mon, 22 Feb 2025 10:30:00 +0700",
  "body": "เนื้อหาอีเมล (ตัดตาม max_body_length)...",
  "rule_name": "ชื่อ Filter Rule ที่ match",
  "timestamp": "2025-02-22T03:30:00.000000"
}`}</pre>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">ฟิลด์</th>
                  <th className="text-left py-2 font-medium">คำอธิบาย</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">subject</td>
                  <td className="py-2">หัวข้ออีเมล</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">from</td>
                  <td className="py-2">ผู้ส่ง (อีเมล)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">date</td>
                  <td className="py-2">วันที่อีเมล (raw string)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">body</td>
                  <td className="py-2">เนื้อหาอีเมล (จำกัดความยาวตาม Settings)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">rule_name</td>
                  <td className="py-2">ชื่อ Filter Rule ที่ match</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-mono">timestamp</td>
                  <td className="py-2">เวลาที่ส่ง webhook (ISO 8601)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Response ที่รับรอง */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold">Response ที่รับรอง</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Endpoint ควร return HTTP status 200, 201, 202 หรือ 204 เพื่อให้ระบบถือว่าส่งสำเร็จ</p>
          <p className="text-sm text-muted-foreground">
            ถ้า return status อื่น (เช่น 4xx, 5xx) ระบบจะบันทึกเป็น failed และแสดงใน Logs
          </p>
        </div>

        {/* ตัวอย่างโค้ด */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold">ตัวอย่างรับ Webhook</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Node.js (Express) และ Python (FastAPI)</p>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Node.js (Express)</p>
              <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                <pre>{`app.post('/webhook', (req, res) => {
  const { subject, from, body, rule_name, timestamp } = req.body
  console.log('Email:', subject, 'from', from)
  // ประมวลผลต่อ...
  res.status(200).json({ received: true })
})`}</pre>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Python (FastAPI)</p>
              <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                <pre>{`@app.post("/webhook")
async def webhook(request: Request):
    data = await request.json()
    subject = data.get("subject")
    sender = data.get("from")
    body = data.get("body")
    # ประมวลผลต่อ...
    return {"received": True}`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* ข้อควรระวัง */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            ข้อควรระวัง
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground mt-4">
            <ul className="list-disc list-inside space-y-1">
              <li>ใช้ <strong>HTTPS</strong> สำหรับ production เพื่อความปลอดภัย</li>
              <li>สามารถเพิ่ม <strong>Headers</strong> (เช่น Authorization) ใน Channel config ได้</li>
              <li>Timeout การส่งอยู่ที่ 10 วินาที — endpoint ควรตอบกลับเร็ว</li>
              <li>body อาจถูกตัดตาม max_body_length ใน Settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
