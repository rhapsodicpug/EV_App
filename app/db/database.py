"""
Database configuration and connection for EV Slot Booking App
"""

import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure, PyMongoError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ev_booking_db")
DATABASE_NAME = "ev_booking_db"

# Global variables for database connection
client = None
db = None
stations_collection = None
users_collection = None
bookings_collection = None

def connect_to_mongo():
    """Connect to MongoDB and initialize collections"""
    global client, db, stations_collection, users_collection, bookings_collection
    
    try:
        # Parse and modify MongoDB URI for better compatibility
        parsed_uri = urlparse(MONGO_URI)
        query_params = dict(parse_qsl(parsed_uri.query))
        
        # Add retryWrites if not present
        if 'retryWrites' not in query_params:
            query_params['retryWrites'] = 'true'
        if 'w' not in query_params:
            query_params['w'] = 'majority'
        
        new_query = urlencode(query_params)
        modified_uri = urlunparse((
            parsed_uri.scheme,
            parsed_uri.netloc,
            parsed_uri.path,
            parsed_uri.params,
            new_query,
            parsed_uri.fragment
        ))
        
        print(f"🔄 Connecting to MongoDB...")
        client = MongoClient(modified_uri, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        print("🎉 Successfully connected to MongoDB!")
        
    except (ConnectionFailure, OperationFailure) as e:
        print(f"ℹ️  Retrying MongoDB connection with authSource=admin ...")
        try:
            # Add authSource=admin for MongoDB Atlas
            parsed_uri = urlparse(MONGO_URI)
            query_params = dict(parse_qsl(parsed_uri.query))
            query_params['authSource'] = 'admin'
            query_params['retryWrites'] = 'true'
            query_params['w'] = 'majority'
            
            new_query = urlencode(query_params)
            modified_uri = urlunparse((
                parsed_uri.scheme,
                parsed_uri.netloc,
                parsed_uri.path,
                parsed_uri.params,
                new_query,
                parsed_uri.fragment
            ))
            
            client = MongoClient(modified_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client[DATABASE_NAME]
            print("🎉 Successfully connected to MongoDB!")
            
        except Exception as retry_error:
            print(f"🔥 Failed to connect to MongoDB: {retry_error}")
            client = None
            db = None
            
    except PyMongoError as e:
        print(f"🔥 MongoDB Error: {e}")
        client = None
        db = None
    except Exception as e:
        print(f"🔥 Unexpected error connecting to MongoDB: {e}")
        client = None
        db = None
    
    # Initialize collections
    if db is not None:
        stations_collection = db["stations"]
        users_collection = db["users"]
        bookings_collection = db["bookings"]
    else:
        stations_collection = None
        users_collection = None
        bookings_collection = None

def get_database():
    """Get the database instance"""
    return db

def get_collections():
    """Get all collections"""
    return {
        "stations": stations_collection,
        "users": users_collection,
        "bookings": bookings_collection
    }

def close_connection():
    """Close the MongoDB connection"""
    global client
    if client:
        client.close()
        print("📝 MongoDB connection closed")
