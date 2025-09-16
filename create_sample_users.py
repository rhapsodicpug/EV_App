#!/usr/bin/env python3
"""
Create sample users for testing authentication
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from passlib.context import CryptContext

# Load environment variables
load_dotenv('config.env')

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_sample_users():
    """Create sample users for testing"""
    
    # Get MongoDB connection
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        print("❌ MONGO_URI not found in environment variables")
        return
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client["ev_booking_db"]
        
        print("🔌 Connected to MongoDB successfully!")
        
        # Sample users
        sample_users = [
            {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+91-9876543210",
                "hashed_password": pwd_context.hash("password123"),
                "vehicle_info": {
                    "make": "Tesla",
                    "model": "Model 3",
                    "year": 2023,
                    "battery_capacity": 75,
                    "connector_type": "Type 2",
                    "license_plate": "MH01AB1234"
                },
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Jane Smith",
                "email": "jane@example.com",
                "phone": "+91-9876543211",
                "hashed_password": pwd_context.hash("password123"),
                "vehicle_info": {
                    "make": "BMW",
                    "model": "iX3",
                    "year": 2022,
                    "battery_capacity": 80,
                    "connector_type": "CCS",
                    "license_plate": "MH02CD5678"
                },
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+91-9876543212",
                "hashed_password": pwd_context.hash("test123"),
                "vehicle_info": {
                    "make": "Nissan",
                    "model": "Leaf",
                    "year": 2021,
                    "battery_capacity": 40,
                    "connector_type": "CHAdeMO",
                    "license_plate": "MH03EF9012"
                },
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Clear existing users (for testing)
        print("\n🗑️  Clearing existing users...")
        db.users.delete_many({})
        print(f"✅ Cleared existing users")
        
        # Insert sample users
        print("\n👥 Creating sample users...")
        result = db.users.insert_many(sample_users)
        print(f"✅ Created {len(result.inserted_ids)} sample users")
        
        # Verify the users were created
        total_users = db.users.count_documents({})
        print(f"📊 Total users in database: {total_users}")
        
        # List created users
        print("\n👤 Created users:")
        for user in sample_users:
            print(f"  - {user['name']} ({user['email']}) - Password: {user['email'].split('@')[0]}123")
        
        print("\n🎉 Sample users creation completed successfully!")
        print("\n📝 Test credentials:")
        print("  - john@example.com / password123")
        print("  - jane@example.com / password123")
        print("  - test@example.com / test123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    create_sample_users()
