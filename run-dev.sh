#!/bin/bash
# รัน Gmail Notifier สำหรับ development
# ใช้: chmod +x run-dev.sh && ./run-dev.sh

set -e
cd "$(dirname "$0")"

echo "=== Gmail Notifier Dev Server ==="

# สร้าง venv ถ้ายังไม่มี
if [ ! -d "venv" ]; then
  echo "📦 สร้าง venv และติดตั้ง dependencies (ครั้งแรกอาจใช้เวลา 1-2 นาที)..."
  python3 -m venv venv
  source venv/bin/activate
  pip install -q -r requirements.txt
else
  source venv/bin/activate
fi

echo ""
echo "🚀 Backend: http://localhost:8000"
echo "🚀 Frontend: http://localhost:3000"
echo ""
echo "เปิด 2 terminal:"
echo "  Terminal 1: source venv/bin/activate && PYTHONPATH=. python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
