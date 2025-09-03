#!/usr/bin/env python3
"""
Setup MongoDB indexes for EV Slot Booking App
This script creates necessary indexes for optimal performance
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import OperationFailure

# Load environment variables
load_dotenv()

def setup_indexes():
    """Create necessary indexes for the EV booking app"""
    
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
        
        # Create geospatial index on stations collection
        print("\n📍 Creating geospatial index on stations collection...")
        try:
            db.stations.create_index([("location", "2dsphere")])
            print("✅ Geospatial index created successfully!")
        except OperationFailure as e:
            if "already exists" in str(e):
                print("ℹ️  Geospatial index already exists")
            else:
                print(f"❌ Error creating geospatial index: {e}")
        
        # Create compound index for station queries
        print("\n🔍 Creating compound indexes for stations...")
        try:
            # Index for city and pincode queries
            db.stations.create_index([("city", 1), ("pincode", 1)])
            print("✅ City + Pincode index created")
            
            # Index for operating hours queries
            db.stations.create_index([("is_24_7", 1)])
            print("✅ 24/7 availability index created")
            
            # Index for charger type queries
            db.stations.create_index([("charging_slots.charger_type", 1)])
            print("✅ Charger type index created")
            
        except OperationFailure as e:
            print(f"❌ Error creating compound indexes: {e}")
        
        # Create indexes for users collection
        print("\n👤 Creating indexes for users collection...")
        try:
            db.users.create_index([("email", 1)], unique=True)
            print("✅ Email unique index created")
            
            db.users.create_index([("phone", 1)])
            print("✅ Phone index created")
            
        except OperationFailure as e:
            print(f"❌ Error creating user indexes: {e}")
        
        # Create indexes for bookings collection
        print("\n📅 Creating indexes for bookings collection...")
        try:
            # Index for user bookings
            db.bookings.create_index([("user_id", 1)])
            print("✅ User ID index created")
            
            # Index for station bookings
            db.bookings.create_index([("station_id", 1)])
            print("✅ Station ID index created")
            
            # Index for booking time queries
            db.bookings.create_index([("start_time", 1), ("end_time", 1)])
            print("✅ Time range index created")
            
            # Index for status queries
            db.bookings.create_index([("status", 1)])
            print("✅ Status index created")
            
        except OperationFailure as e:
            print(f"❌ Error creating booking indexes: {e}")
        
        # List all indexes
        print("\n📊 Current indexes in collections:")
        for collection_name in ["stations", "users", "bookings"]:
            collection = db[collection_name]
            indexes = list(collection.list_indexes())
            print(f"\n{collection_name.upper()} collection:")
            for idx in indexes:
                print(f"  - {idx['name']}: {idx['key']}")
        
        print("\n🎉 Index setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    setup_indexes()
