"""
Database configuration and connection for EV Slot Booking App
"""

import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, OperationFailure, PyMongoError
except ImportError:
    print("⚠️  MongoDB not available - API will run in limited mode")
    MongoClient = None
    ConnectionFailure = Exception
    OperationFailure = Exception
    PyMongoError = Exception
try:
    from dotenv import load_dotenv
except ImportError:
    print("⚠️  python-dotenv not available - using environment variables only")
    def load_dotenv(*args, **kwargs):
        pass

# Load environment variables from config.env
load_dotenv('config.env')

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
    """Connect to MongoDB and initialize collections with enhanced error handling"""
    global client, db, stations_collection, users_collection, bookings_collection
    
    if not MONGO_URI:
        print("⚠️  MONGO_URI not found in environment variables")
        client = None
        db = None
        stations_collection = None
        users_collection = None
        bookings_collection = None
        return
    
    # Enhanced connection options for better reliability
    connection_options = {
        'serverSelectionTimeoutMS': 10000,  # 10 seconds
        'connectTimeoutMS': 10000,
        'socketTimeoutMS': 10000,
        'maxPoolSize': 10,
        'retryWrites': True,
        'w': 'majority'
    }
    
    try:
        # Parse and modify MongoDB URI for better compatibility
        parsed_uri = urlparse(MONGO_URI)
        query_params = dict(parse_qsl(parsed_uri.query))
        
        # Merge with our enhanced options
        query_params.update({k: str(v).lower() if isinstance(v, bool) else str(v) 
                           for k, v in connection_options.items()})
        
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
        client = MongoClient(modified_uri)
        
        # Test the connection with a more comprehensive ping
        client.admin.command('ping')
        # Also test database access
        db = client[DATABASE_NAME]
        # Try to list collections to verify database access
        list(db.list_collection_names(filter={"name": {"$regex": ".*"}}))
        print("🎉 Successfully connected to MongoDB!")
        
    except (ConnectionFailure, OperationFailure) as e:
        print(f"ℹ️  Retrying MongoDB connection with authSource=admin...")
        try:
            # Add authSource=admin for MongoDB Atlas
            parsed_uri = urlparse(MONGO_URI)
            query_params = dict(parse_qsl(parsed_uri.query))
            query_params['authSource'] = 'admin'
            query_params.update({k: str(v).lower() if isinstance(v, bool) else str(v) 
                               for k, v in connection_options.items()})
            
            new_query = urlencode(query_params)
            modified_uri = urlunparse((
                parsed_uri.scheme,
                parsed_uri.netloc,
                parsed_uri.path,
                parsed_uri.params,
                new_query,
                parsed_uri.fragment
            ))
            
            client = MongoClient(modified_uri)
            client.admin.command('ping')
            db = client[DATABASE_NAME]
            list(db.list_collection_names(filter={"name": {"$regex": ".*"}}))
            print("🎉 Successfully connected to MongoDB with authSource=admin!")
            
        except Exception as retry_error:
            print(f"🔥 Failed to connect to MongoDB (retry): {retry_error}")
            print(f"🔍 Check your MONGO_URI and network connectivity")
            client = None
            db = None
            
    except PyMongoError as e:
        print(f"🔥 MongoDB Error: {e}")
        print(f"🔍 This might be a credentials or network issue")
        client = None
        db = None
    except Exception as e:
        print(f"🔥 Unexpected error connecting to MongoDB: {e}")
        print(f"🔍 Check your internet connection and MongoDB URI format")
        client = None
        db = None
    
    # Initialize collections
    if db is not None:
        stations_collection = db["stations"]
        users_collection = db["users"]
        bookings_collection = db["bookings"]
        print(f"📊 Initialized collections: {DATABASE_NAME}")
    else:
        stations_collection = None
        users_collection = None
        bookings_collection = None
        print("⚠️  Running in limited mode without database")

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
