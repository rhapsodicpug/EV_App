"""
Authentication and user-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from datetime import timedelta

from app.models import (
    UserCreate, UserLogin, UserResponse, Token,
    TwoFactorSetup, TwoFactorEnable, TwoFactorVerify, TwoFactorDisable
)
from app.core.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user
)
from app.core.two_factor import (
    generate_totp_secret, generate_qr_code, verify_totp_code,
    generate_backup_codes, verify_backup_code
)
from app.db.database import get_collections

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user with hashed password
        from app.models import User
        user_data = User(
            name=user.name,
            email=user.email,
            phone=user.phone,
            hashed_password=get_password_hash(user.password),
            vehicle_info=user.vehicle_info
        )
        
        result = users_collection.insert_one(user_data.dict(by_alias=True, exclude={"id"}))
        user_data.id = result.inserted_id
        
        # Return user data without password
        return UserResponse(
            id=str(user_data.id),
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            vehicle_info=user_data.vehicle_info,
            is_active=user_data.is_active,
            is_verified=user_data.is_verified,
            two_factor_enabled=user_data.two_factor_enabled,
            created_at=user_data.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@router.post("/token", response_model=Token)
async def login_for_access_token(user_credentials: UserLogin):
    """Login user and return access token"""
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Find user by email
        user = users_collection.find_one({"email": user_credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(status_code=400, detail="Inactive user")
        
        # Check if 2FA is enabled
        if user.get("two_factor_enabled", False):
            # Return a special response indicating 2FA is required
            return {
                "access_token": "2FA_REQUIRED",
                "token_type": "2fa_required",
                "expires_in": 0,
                "two_factor_required": True,
                "email": user["email"]
            }
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60  # 30 minutes in seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

# User-related endpoints
user_router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@user_router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """Get current user information"""
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            phone=user["phone"],
            vehicle_info=user.get("vehicle_info"),
            is_active=user.get("is_active", True),
            is_verified=user.get("is_verified", False),
            two_factor_enabled=user.get("two_factor_enabled", False),
            created_at=user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")


# 2FA endpoints
@router.post("/2fa/setup", response_model=TwoFactorSetup)
async def setup_two_factor(current_user: dict = Depends(get_current_active_user)):
    """
    Generate TOTP secret and QR code for 2FA setup
    User must verify the code before it's enabled
    """
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Check if 2FA is already enabled
        user = users_collection.find_one({"email": current_user["email"]})
        if user and user.get("two_factor_enabled", False):
            raise HTTPException(status_code=400, detail="2FA is already enabled")
        
        # Generate TOTP secret
        secret = generate_totp_secret()
        
        # Generate QR code
        qr_code = generate_qr_code(current_user["email"], secret)
        
        # Generate backup codes
        plain_codes, hashed_codes = generate_backup_codes()
        
        # Store the secret temporarily (will be activated after verification)
        users_collection.update_one(
            {"email": current_user["email"]},
            {"$set": {
                "two_factor_secret_temp": secret,
                "backup_codes_temp": hashed_codes
            }}
        )
        
        return {
            "secret": secret,
            "qr_code": qr_code,
            "backup_codes": plain_codes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting up 2FA: {str(e)}")


@router.post("/2fa/enable")
async def enable_two_factor(
    request: TwoFactorEnable,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Enable 2FA after verifying the TOTP code
    """
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Get user with temp secret
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("two_factor_secret_temp"):
            raise HTTPException(
                status_code=400,
                detail="No 2FA setup in progress. Please call /2fa/setup first"
            )
        
        # Verify the TOTP code
        if not verify_totp_code(user["two_factor_secret_temp"], request.code):
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Enable 2FA and move temp data to permanent
        users_collection.update_one(
            {"email": current_user["email"]},
            {
                "$set": {
                    "two_factor_enabled": True,
                    "two_factor_secret": user["two_factor_secret_temp"],
                    "backup_codes": user.get("backup_codes_temp", [])
                },
                "$unset": {
                    "two_factor_secret_temp": "",
                    "backup_codes_temp": ""
                }
            }
        )
        
        return {"message": "2FA enabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enabling 2FA: {str(e)}")


@router.post("/2fa/verify", response_model=Token)
async def verify_two_factor(request: TwoFactorVerify):
    """
    Verify 2FA code during login and return access token
    """
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Find user
        user = users_collection.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not user.get("two_factor_enabled", False):
            raise HTTPException(status_code=400, detail="2FA is not enabled for this account")
        
        # Try to verify TOTP code first
        is_valid = False
        if user.get("two_factor_secret"):
            is_valid = verify_totp_code(user["two_factor_secret"], request.code)
        
        # If TOTP fails, try backup code
        if not is_valid and user.get("backup_codes"):
            is_valid, updated_codes = verify_backup_code(
                request.code,
                user["backup_codes"]
            )
            if is_valid:
                # Update backup codes (remove used code)
                users_collection.update_one(
                    {"email": request.email},
                    {"$set": {"backup_codes": updated_codes}}
                )
        
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid verification code")
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60  # 30 minutes in seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying 2FA: {str(e)}")


@router.post("/2fa/disable")
async def disable_two_factor(
    request: TwoFactorDisable,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Disable 2FA (requires password confirmation)
    """
    collections = get_collections()
    users_collection = collections["users"]
    
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Get user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify password
        if not verify_password(request.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Incorrect password")
        
        # Disable 2FA
        users_collection.update_one(
            {"email": current_user["email"]},
            {
                "$set": {"two_factor_enabled": False},
                "$unset": {
                    "two_factor_secret": "",
                    "backup_codes": "",
                    "two_factor_secret_temp": "",
                    "backup_codes_temp": ""
                }
            }
        )
        
        return {"message": "2FA disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error disabling 2FA: {str(e)}")


# Include both routers
routers = [router, user_router]
