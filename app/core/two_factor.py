"""
Two-Factor Authentication (2FA) Utilities
Handles TOTP generation, QR code creation, and backup codes
"""

import pyotp
import qrcode
import secrets
import hashlib
import io
import base64
from typing import List, Tuple
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_totp_secret() -> str:
    """
    Generate a random TOTP secret key
    Returns: Base32 encoded secret string
    """
    return pyotp.random_base32()


def generate_qr_code(email: str, secret: str, issuer: str = "EV Charging App") -> str:
    """
    Generate QR code for Google Authenticator
    Args:
        email: User's email address
        secret: TOTP secret key
        issuer: App name
    Returns: Base64 encoded QR code image
    """
    # Create TOTP provisioning URI
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=email,
        issuer_name=issuer
    )
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return img_str


def verify_totp_code(secret: str, code: str) -> bool:
    """
    Verify a TOTP code
    Args:
        secret: TOTP secret key
        code: 6-digit code to verify
    Returns: True if valid, False otherwise
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)  # Allow 1 window (30 seconds) tolerance


def generate_backup_codes(count: int = 10) -> Tuple[List[str], List[str]]:
    """
    Generate backup codes for account recovery
    Args:
        count: Number of backup codes to generate
    Returns: Tuple of (plain codes, hashed codes)
    """
    plain_codes = []
    hashed_codes = []
    
    for _ in range(count):
        # Generate 8-character alphanumeric code
        code = secrets.token_hex(4).upper()  # 8 characters
        plain_codes.append(code)
        
        # Hash the code for storage
        hashed_code = pwd_context.hash(code)
        hashed_codes.append(hashed_code)
    
    return plain_codes, hashed_codes


def verify_backup_code(code: str, hashed_codes: List[str]) -> Tuple[bool, List[str]]:
    """
    Verify a backup code and remove it from the list
    Args:
        code: Backup code to verify
        hashed_codes: List of hashed backup codes
    Returns: Tuple of (is_valid, updated_hashed_codes)
    """
    for i, hashed_code in enumerate(hashed_codes):
        if pwd_context.verify(code, hashed_code):
            # Code is valid, remove it from the list
            updated_codes = hashed_codes[:i] + hashed_codes[i+1:]
            return True, updated_codes
    
    return False, hashed_codes


def hash_secret(secret: str) -> str:
    """
    Simple hash for storing TOTP secret (basic encryption)
    In production, use proper encryption like Fernet
    """
    return hashlib.sha256(secret.encode()).hexdigest()


def verify_secret_hash(secret: str, secret_hash: str) -> bool:
    """
    Verify a hashed secret
    """
    return hashlib.sha256(secret.encode()).hexdigest() == secret_hash

