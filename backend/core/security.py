from cryptography.fernet import Fernet
import os
from pathlib import Path

# ใช้ encryption key จาก environment หรือสร้างใหม่
ENCRYPTION_KEY_FILE = Path(__file__).resolve().parent.parent.parent / "data" / ".encryption_key"


def get_encryption_key() -> bytes:
    """ดึง encryption key หรือสร้างใหม่"""
    if ENCRYPTION_KEY_FILE.exists():
        with open(ENCRYPTION_KEY_FILE, "rb") as f:
            return f.read()

    # สร้าง key ใหม่
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
