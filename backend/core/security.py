from cryptography.fernet import Fernet
import os
from pathlib import Path

# ใช้ encryption key จาก environment หรือสร้างใหม่
ENCRYPTION_KEY_FILE = Path(__file__).resolve().parent.parent.parent / "data" / ".encryption_key"


def get_encryption_key() -> bytes:
    """ดึง encryption key จาก env, ไฟล์ หรือสร้างใหม่"""
    # 1. ใช้จาก env ถ้ามี (สำหรับ deploy ครั้งแรก)
    env_key = os.environ.get("ENCRYPTION_KEY", "").strip()
    if env_key:
        key_bytes = env_key.encode("utf-8") if isinstance(env_key, str) else env_key
        if len(key_bytes) >= 32:  # Fernet key ต้องเป็น base64 44 chars
            ENCRYPTION_KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
            if not ENCRYPTION_KEY_FILE.exists():
                with open(ENCRYPTION_KEY_FILE, "wb") as f:
                    f.write(key_bytes)
            return key_bytes

    # 2. ใช้จากไฟล์
    if ENCRYPTION_KEY_FILE.exists():
        with open(ENCRYPTION_KEY_FILE, "rb") as f:
            return f.read()

    # 3. สร้าง key ใหม่
    key = Fernet.generate_key()
    ENCRYPTION_KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(ENCRYPTION_KEY_FILE, "wb") as f:
        f.write(key)
    return key


def encrypt_password(password: str) -> str:
    """เข้ารหัสรหัสผ่าน"""
    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(password.encode())
    return encrypted.decode()


def decrypt_password(encrypted_password: str) -> str:
    """ถอดรหัสรหัสผ่าน"""
    key = get_encryption_key()
    f = Fernet(key)
    decrypted = f.decrypt(encrypted_password.encode())
    return decrypted.decode()
