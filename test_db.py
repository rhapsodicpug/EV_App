#!/usr/bin/env python3
"""
Test MongoDB connection
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ev_booking_db")
DATABASE_NAME = "ev_booking_db"

def test_mongodb_connection():
    """Test MongoDB connection"""
    try:
        print(f"🔄 Testing MongoDB connection...")
        print(f"URI: {MONGO_URI}")
        
        # Create client
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Test database access
        db = client[DATABASE_NAME]
        collections = db.list_collection_names()
        print(f"✅ Database '{DATABASE_NAME}' accessible")
        print(f"✅ Collections: {collections}")
        
        client.close()
        return True
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False
    except OperationFailure as e:
        print(f"❌ MongoDB operation failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
