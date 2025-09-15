#!/usr/bin/env python3
"""
Create sample EV charging stations for testing
This script adds sample data to test the geospatial queries and other endpoints
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

# Load environment variables
load_dotenv('config.env')

def create_sample_stations():
    """Create sample EV charging stations in Mumbai"""
    
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
        
        # Sample EV charging stations in Mumbai
        sample_stations = [
            {
                "name": "Bandra Kurla Complex EV Station",
                "address": "Bandra Kurla Complex, Bandra East, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8677, 19.0596]  # [longitude, latitude]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400051",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 8.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Café", "Restroom", "WiFi", "Parking"],
                "operating_hours": {
                    "monday": "06:00-22:00",
                    "tuesday": "06:00-22:00",
                    "wednesday": "06:00-22:00",
                    "thursday": "06:00-22:00",
                    "friday": "06:00-22:00",
                    "saturday": "06:00-22:00",
                    "sunday": "06:00-22:00"
                },
                "contact_number": "+91-22-2659-1234",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Andheri Metro Station EV Hub",
                "address": "Andheri Metro Station, Andheri West, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8364, 19.1197]  # [longitude, latitude]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400058",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 150.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "CHAdeMO"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_SLOW",
                        "power_kw": 7.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 5.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Metro Station", "Parking", "Security"],
                "operating_hours": {
                    "monday": "00:00-23:59",
                    "tuesday": "00:00-23:59",
                    "wednesday": "00:00-23:59",
                    "thursday": "00:00-23:59",
                    "friday": "00:00-23:59",
                    "saturday": "00:00-23:59",
                    "sunday": "00:00-23:59"
                },
                "contact_number": "+91-22-2670-5678",
                "is_24_7": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Juhu Beach EV Charging Station",
                "address": "Juhu Beach, Juhu, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8297, 19.0995]  # [longitude, latitude]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400049",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 8.0,
                        "connector_type": "Type 2"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_SLOW",
                        "power_kw": 7.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 5.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Beach Access", "Restaurant", "Parking", "Security"],
                "operating_hours": {
                    "monday": "06:00-22:00",
                    "tuesday": "06:00-22:00",
                    "wednesday": "06:00-22:00",
                    "thursday": "06:00-22:00",
                    "friday": "06:00-22:00",
                    "saturday": "06:00-22:00",
                    "sunday": "06:00-22:00"
                },
                "contact_number": "+91-22-2660-9012",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Clear existing stations (for testing)
        print("\n🗑️  Clearing existing stations...")
        db.stations.delete_many({})
        print(f"✅ Cleared {db.stations.count_documents({})} existing stations")
        
        # Insert sample stations
        print("\n📍 Creating sample EV charging stations...")
        result = db.stations.insert_many(sample_stations)
        print(f"✅ Created {len(result.inserted_ids)} sample stations")
        
        # Verify the stations were created
        total_stations = db.stations.count_documents({})
        print(f"📊 Total stations in database: {total_stations}")
        
        # Test geospatial query
        print("\n🧪 Testing geospatial query...")
        nearby_stations = list(db.stations.find({
            "location": {
                "$nearSphere": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [72.8777, 19.0760]  # Mumbai center
                    },
                    "$maxDistance": 10000  # 10 km
                }
            }
        }))
        
        print(f"📍 Found {len(nearby_stations)} stations within 10km of Mumbai center")
        for station in nearby_stations:
            print(f"  - {station['name']} ({station['city']})")
        
        print("\n🎉 Sample data creation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    create_sample_stations()
