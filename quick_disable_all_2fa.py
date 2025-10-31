#!/usr/bin/env python3
"""Quick script to disable 2FA for ALL users"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "ev_booking_db"

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    
    print("🔄 Disabling 2FA for all users...")
    
    result = users_collection.update_many(
        {},  # All users
        {
            "$set": {"two_factor_enabled": False},
            "$unset": {
                "two_factor_secret": "",
                "two_factor_secret_temp": "",
                "backup_codes": "",
                "backup_codes_temp": ""
            }
        }
    )
    
    print(f"✅ Disabled 2FA for {result.modified_count} user(s)")
    print("📱 You can now login normally!")
    
    client.close()
except Exception as e:
    print(f"❌ Error: {e}")

