#!/usr/bin/env python3
"""
Add Tata Power EV Charging Stations to the database
This script adds 10 Tata Power EV charging stations across Mumbai
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

# Load environment variables
load_dotenv()

def add_tata_power_stations():
    """Add Tata Power EV charging stations in Mumbai"""
    
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
        
        # Tata Power EV Charging Stations in Mumbai
        tata_power_stations = [
            {
                "name": "Tata Power Charging Station - Bandra",
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
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 150.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 18.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CHAdeMO"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Café", "Restroom", "WiFi", "Parking", "Security", "Waiting Area"],
                "operating_hours": {
                    "monday": "06:00-23:00",
                    "tuesday": "06:00-23:00",
                    "wednesday": "06:00-23:00",
                    "thursday": "06:00-23:00",
                    "friday": "06:00-23:00",
                    "saturday": "06:00-23:00",
                    "sunday": "06:00-23:00"
                },
                "contact_number": "+91-22-2659-1234",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Andheri",
                "address": "Andheri West, Near Link Road, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8364, 19.1197]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400058",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 200.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 20.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    }
                ],
                "amenities": ["Parking", "Security", "Restroom", "Convenience Store"],
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
                "name": "Tata Power Charging Station - Powai",
                "address": "Powai, Near IIT Bombay, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.9086, 19.1334]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400076",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_SLOW",
                        "power_kw": 7.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 8.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Parking", "WiFi", "Restroom", "Food Court"],
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
            },
            {
                "name": "Tata Power Charging Station - Goregaon",
                "address": "Goregaon East, Near Aarey Milk Colony, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8695, 19.1608]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400063",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CHAdeMO"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Parking", "Security", "Restroom"],
                "operating_hours": {
                    "monday": "07:00-21:00",
                    "tuesday": "07:00-21:00",
                    "wednesday": "07:00-21:00",
                    "thursday": "07:00-21:00",
                    "friday": "07:00-21:00",
                    "saturday": "07:00-21:00",
                    "sunday": "07:00-21:00"
                },
                "contact_number": "+91-22-2680-1234",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Vashi",
                "address": "Vashi, Navi Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.9976, 19.0759]
                },
                "city": "Navi Mumbai",
                "state": "Maharashtra",
                "pincode": "400703",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 150.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 18.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Mall Access", "Food Court", "Parking", "WiFi", "Restroom"],
                "operating_hours": {
                    "monday": "09:00-22:00",
                    "tuesday": "09:00-22:00",
                    "wednesday": "09:00-22:00",
                    "thursday": "09:00-22:00",
                    "friday": "09:00-22:00",
                    "saturday": "09:00-22:00",
                    "sunday": "09:00-22:00"
                },
                "contact_number": "+91-22-2781-5678",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Chembur",
                "address": "Chembur, Near Diamond Garden, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.9021, 19.0564]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400071",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CHAdeMO"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Parking", "Security", "Restroom", "Café"],
                "operating_hours": {
                    "monday": "06:00-22:00",
                    "tuesday": "06:00-22:00",
                    "wednesday": "06:00-22:00",
                    "thursday": "06:00-22:00",
                    "friday": "06:00-22:00",
                    "saturday": "06:00-22:00",
                    "sunday": "06:00-22:00"
                },
                "contact_number": "+91-22-2521-9012",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Worli",
                "address": "Worli Sea Face, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8156, 19.0079]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400018",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 150.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 18.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Sea View", "Parking", "Restroom", "Security", "WiFi"],
                "operating_hours": {
                    "monday": "06:00-23:00",
                    "tuesday": "06:00-23:00",
                    "wednesday": "06:00-23:00",
                    "thursday": "06:00-23:00",
                    "friday": "06:00-23:00",
                    "saturday": "06:00-23:00",
                    "sunday": "06:00-23:00"
                },
                "contact_number": "+91-22-2490-1234",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Kurla",
                "address": "Kurla West, Near Phoenix Marketcity, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8786, 19.0638]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400070",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 200.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 20.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CHAdeMO"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Mall Access", "Food Court", "Parking", "WiFi", "Restroom", "Shopping"],
                "operating_hours": {
                    "monday": "10:00-22:00",
                    "tuesday": "10:00-22:00",
                    "wednesday": "10:00-22:00",
                    "thursday": "10:00-22:00",
                    "friday": "10:00-22:00",
                    "saturday": "10:00-22:00",
                    "sunday": "10:00-22:00"
                },
                "contact_number": "+91-22-2620-5678",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Thane",
                "address": "Thane West, Near Viviana Mall, Thane",
                "location": {
                    "type": "Point",
                    "coordinates": [72.9708, 19.1949]
                },
                "city": "Thane",
                "state": "Maharashtra",
                "pincode": "400601",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_ULTRA_FAST",
                        "power_kw": 150.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 18.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Mall Access", "Food Court", "Parking", "WiFi", "Restroom", "Entertainment"],
                "operating_hours": {
                    "monday": "10:00-22:00",
                    "tuesday": "10:00-22:00",
                    "wednesday": "10:00-22:00",
                    "thursday": "10:00-22:00",
                    "friday": "10:00-22:00",
                    "saturday": "10:00-22:00",
                    "sunday": "10:00-22:00"
                },
                "contact_number": "+91-22-2548-9012",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tata Power Charging Station - Malad",
                "address": "Malad West, Near Inorbit Mall, Mumbai",
                "location": {
                    "type": "Point",
                    "coordinates": [72.8336, 19.1795]
                },
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400064",
                "charging_slots": [
                    {
                        "slot_number": 1,
                        "charger_type": "DC_FAST",
                        "power_kw": 50.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 15.0,
                        "connector_type": "CCS"
                    },
                    {
                        "slot_number": 2,
                        "charger_type": "AC_FAST",
                        "power_kw": 22.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 12.0,
                        "connector_type": "Type 2"
                    },
                    {
                        "slot_number": 3,
                        "charger_type": "AC_SLOW",
                        "power_kw": 7.0,
                        "status": "AVAILABLE",
                        "price_per_kwh": 8.0,
                        "connector_type": "Type 2"
                    }
                ],
                "amenities": ["Mall Access", "Food Court", "Parking", "WiFi", "Restroom", "Cinema"],
                "operating_hours": {
                    "monday": "10:00-22:00",
                    "tuesday": "10:00-22:00",
                    "wednesday": "10:00-22:00",
                    "thursday": "10:00-22:00",
                    "friday": "10:00-22:00",
                    "saturday": "10:00-22:00",
                    "sunday": "10:00-22:00"
                },
                "contact_number": "+91-22-2801-1234",
                "is_24_7": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert Tata Power stations
        print("\n🔋 Adding Tata Power EV Charging Stations...")
        result = db.stations.insert_many(tata_power_stations)
        print(f"✅ Added {len(result.inserted_ids)} Tata Power stations")
        
        # List all stations
        total_stations = db.stations.count_documents({})
        print(f"📊 Total stations in database: {total_stations}")
        
        # Display added stations
        print("\n📍 Added Tata Power Stations:")
        for station in tata_power_stations:
            print(f"  • {station['name']} - {station['city']}")
        
        print("\n🎉 Tata Power stations added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    add_tata_power_stations()

