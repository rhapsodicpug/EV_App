#!/usr/bin/env python3
"""
Utility script to disable 2FA for a user account
Usage: python disable_2fa.py
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "ev_booking_db"

def disable_2fa_for_user():
    """Disable 2FA for a user account"""
    
    if not MONGO_URI:
        print("❌ MONGO_URI not found in .env file")
        return
    
    try:
        # Connect to MongoDB
        print("🔄 Connecting to MongoDB...")
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        users_collection = db["users"]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB!")
        
        # Get user email
        email = input("\n📧 Enter the email address of the account to disable 2FA: ").strip()
        
        if not email:
            print("❌ Email is required")
            return
        
        # Find user
        user = users_collection.find_one({"email": email})
        
        if not user:
            print(f"❌ No user found with email: {email}")
            return
        
        # Check if 2FA is enabled
        if not user.get("two_factor_enabled", False):
            print(f"ℹ️  2FA is already disabled for {email}")
            return
        
        # Disable 2FA
        print(f"\n🔄 Disabling 2FA for {email}...")
        
        result = users_collection.update_one(
            {"email": email},
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
        
        if result.modified_count > 0:
            print(f"✅ Successfully disabled 2FA for {email}")
            print("\n📱 You can now login normally without 2FA!")
        else:
            print(f"⚠️  No changes made")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 50)
    print("🔐 2FA Disable Utility")
    print("=" * 50)
    disable_2fa_for_user()

