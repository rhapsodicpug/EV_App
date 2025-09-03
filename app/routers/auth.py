"""
Authentication and user-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from datetime import timedelta

from app.models import (
    UserCreate, UserLogin, UserResponse, Token
)
from app.core.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user
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
            created_at=user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

# Include both routers
routers = [router, user_router]
