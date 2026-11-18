import os
import time
import json
import hmac
import hashlib
import secrets
import base64
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "entrevision_jwt_secret_key_2026_super_secure_citrus_belt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 7 * 24 * 3600  # 7 days

security_scheme = HTTPBearer(auto_error=False)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding and padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes password using PBKDF2-HMAC-SHA256 with 100,000 iterations (OWASP standard)."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return hashed.hex(), salt


def verify_password(plain_password: str, password_hash: str, salt: str) -> bool:
    """Verifies plain password against stored PBKDF2 hash using constant-time comparison."""
    calculated_hash, _ = hash_password(plain_password, salt)
    return hmac.compare_digest(calculated_hash, password_hash)


def create_access_token(data: Dict[str, Any], expires_in: int = ACCESS_TOKEN_EXPIRE_SECONDS) -> str:
    """Generates an RFC 7519 compliant JSON Web Token (JWT) with HS256 signature."""
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = dict(data)
    payload["iat"] = now
    payload["exp"] = now + expires_in

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token, ensuring signature and expiration validity."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        if payload.get("exp", 0) < int(time.time()):
            return None  # Token expired

        return payload
    except Exception:
        return None


def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> Optional[dict]:
    """Extracts user claims from Authorization header if present, otherwise returns None."""
    if not auth or not auth.credentials:
        return None
    token = auth.credentials
    payload = decode_access_token(token)
    return payload


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> dict:
    """Strictly requires an authenticated user; raises 401 if missing or invalid."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(auth.credentials)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
