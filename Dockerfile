FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY notifier.py .

# ไม่ต้องเปิด port เพราะเป็น background worker
CMD ["python", "-u", "notifier.py"]
