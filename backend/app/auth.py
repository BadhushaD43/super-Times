from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os, random, smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/token")

SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", 5))

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")

ADMIN_CREDENTIALS = {
    os.getenv("ADMIN_USERNAME", "admin"): os.getenv("ADMIN_PASSWORD", "admin123")
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory OTP store: {username: (otp_code, expiry_datetime)}
_otp_store: dict = {}


class TokenData(BaseModel):
    username: Optional[str] = None


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return TokenData(username=username)
    except JWTError:
        raise credentials_exception


def generate_and_send_otp(username: str) -> bool:
    """Generate a 6-digit OTP, store it, and email it to ADMIN_EMAIL. Returns True on success."""
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    _otp_store[username] = (otp, expiry)

    if not SMTP_USER or not SMTP_PASS or not ADMIN_EMAIL:
        # Dev fallback: print OTP to console
        print(f"[DEV OTP] {username}: {otp}")
        return True

    try:
        msg = MIMEText(
            f"Your admin login OTP is: {otp}\n\nValid for {OTP_EXPIRE_MINUTES} minutes.",
            "plain"
        )
        msg["Subject"] = "Admin Login OTP"
        msg["From"] = SMTP_USER
        msg["To"] = ADMIN_EMAIL
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, ADMIN_EMAIL, msg.as_string())
        return True
    except Exception as e:
        print(f"OTP email failed: {e}")
        return False


def validate_otp(username: str, otp: str) -> bool:
    """Returns True if OTP matches and is not expired, then clears it."""
    entry = _otp_store.get(username)
    if not entry:
        return False
    stored_otp, expiry = entry
    if datetime.now(timezone.utc) > expiry:
        _otp_store.pop(username, None)
        return False
    if stored_otp != otp:
        return False
    _otp_store.pop(username, None)
    return True
