"""
Configuration management using Pydantic Settings
Load environment variables for the application
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Configuration
    APP_NAME: str = "EV Charging App"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "ev_charging_app"
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Razorpay Configuration (Critical for Production)
    RAZORPAY_KEY_ID: str  # Your Razorpay Key ID (live or test)
    RAZORPAY_KEY_SECRET: str  # Your Razorpay Key Secret (live or test)
    RAZORPAY_WEBHOOK_SECRET: str  # Webhook secret from Razorpay Dashboard
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    # Payment Configuration
    CURRENCY: str = "INR"
    PAYMENT_TIMEOUT_MINUTES: int = 15
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


# Create a global settings instance
settings = Settings()

