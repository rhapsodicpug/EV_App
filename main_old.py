import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from fastapi import FastAPI, HTTPException, Depends, Query, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import Field, BaseModel
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure, PyMongoError
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import razorpay
import httpx

# Import our models
from models import (
    EVStation, StationCreate, StationUpdate, 
    ChargingSlot, SlotCreate, 
    User, UserCreate, UserLogin, UserResponse, Token, TokenData,
    Booking, BookingCreate, BookingUpdate, BookingResponse, BookingWithStationResponse,
    ChargerType, ChargerStatus, BookingStatus
)

# Import authentication utilities
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user
)

# Load environment variables from .env file
load_dotenv()

# OpenChargeMap API Configuration
OCM_API_KEY = os.getenv("OCM_API_KEY")
OCM_API_URL = "https://api.openchargemap.io/v3/poi/"

# Debug logging for API key
if OCM_API_KEY:
    print(f"✅ OCM_API_KEY loaded successfully: {OCM_API_KEY[:10]}...")
else:
    print("❌ OCM_API_KEY not found in environment variables!")

# Payment Models
class PaymentOrderRequest(BaseModel):
    amount: float = Field(..., description="Amount in INR")
    booking_id: Optional[str] = Field(None, description="Optional booking ID for reference")

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str = "INR"
    key_id: str

class PaymentLinkRequest(BaseModel):
    amount: float = Field(..., description="Amount in INR")
    booking_id: Optional[str] = Field(None, description="Optional booking ID for reference")
    user_name: Optional[str] = Field(None, description="User name for payment link")
    user_email: Optional[str] = Field(None, description="User email for payment link")

class PaymentLinkResponse(BaseModel):
    payment_url: str
    amount: float
    currency: str = "INR"
    booking_id: Optional[str] = None

class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    booking_id: Optional[str] = None

class BookingWithUpdatedStationResponse(BaseModel):
    message: str
    booking: BookingResponse
    updated_station: dict

# Initialize Razorpay
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "your_webhook_secret_here")

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    print("🎉 Razorpay client initialized successfully!")
    print(f"🔑 Key ID: {RAZORPAY_KEY_ID}")
    print(f"🔐 Key Secret: {'*' * (len(RAZORPAY_KEY_SECRET) - 4) + RAZORPAY_KEY_SECRET[-4:] if len(RAZORPAY_KEY_SECRET) > 4 else '****'}")
else:
    razorpay_client = None
    print("⚠️  Razorpay credentials not found in environment variables")
    print(f"🔍 RAZORPAY_KEY_ID: {'Found' if RAZORPAY_KEY_ID else 'Missing'}")
    print(f"🔍 RAZORPAY_KEY_SECRET: {'Found' if RAZORPAY_KEY_SECRET else 'Missing'}")

# Create the FastAPI app instance
app = FastAPI(
    title="EV Slot Booking API",
    description="API for booking EV charging slots in Mumbai",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the MongoDB connection string from environment variables
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "ev_booking_db"

# Create a MongoDB client (if URI is provided)
client = None

def _with_auth_source_admin(uri: str) -> str:
    try:
        parsed = urlparse(uri)
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if 'authSource' not in query:
            query['authSource'] = 'admin'
        new_query = urlencode(query, doseq=True)
        return urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        ))
    except Exception:
        return uri

if not MONGO_URI:
    print("⚠️  MONGO_URI is not set in environment. Skipping DB connection.")
    db = None
else:
    try:
        client = MongoClient(MONGO_URI)
        # Cheap command to validate credentials/connectivity
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        print("🎉 Successfully connected to MongoDB!")
    except OperationFailure as exc:
        # Retry with authSource=admin which is common for Atlas users
        try:
            retry_uri = _with_auth_source_admin(MONGO_URI)
            if retry_uri != MONGO_URI:
                print("ℹ️  Retrying MongoDB connection with authSource=admin ...")
                client = MongoClient(retry_uri)
                client.admin.command('ping')
                db = client[DATABASE_NAME]
                print("🎉 Successfully connected to MongoDB (authSource=admin).")
            else:
                raise exc
        except Exception as inner_exc:
            print(f"🔥 Failed to connect to MongoDB: {inner_exc}")
            client = None
            db = None
    except (ConnectionFailure, PyMongoError) as exc:
        print(f"🔥 Failed to connect to MongoDB: {exc}")
        client = None
        db = None

# Database collections
stations_collection = db["stations"] if db is not None else None
users_collection = db["users"] if db is not None else None
bookings_collection = db["bookings"] if db is not None else None

# A simple root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the EV Slot Booking API!"}

# An endpoint to test the database connection
@app.get("/ping-db")
def ping_db():
    if client is None:
        raise HTTPException(status_code=500, detail="Database connection is not available.")
    try:
        # The 'ping' command is cheap and does not require auth.
        client.admin.command('ping')
        return {"status": "success", "message": "Database connection is healthy."}
    except ConnectionFailure:
        raise HTTPException(status_code=500, detail="Database connection failed.")

# ==================== EV STATIONS CRUD ENDPOINTS ====================

@app.post("/stations/", response_model=EVStation)
async def create_station(station: StationCreate):
    """Create a new EV charging station"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Convert to EVStation model
    station_data = EVStation(
        name=station.name,
        address=station.address,
        location={
            "type": "Point",
            "coordinates": [station.longitude, station.latitude]
        },
        pincode=station.pincode,
        amenities=station.amenities,
        operating_hours=station.operating_hours,
        contact_number=station.contact_number,
        is_24_7=station.is_24_7
    )
    
    result = stations_collection.insert_one(station_data.dict(by_alias=True, exclude={"id"}))
    station_data.id = result.inserted_id
    return station_data

@app.get("/stations/")
async def get_stations(
    latitude: Optional[float] = Query(None, description="User's latitude"),
    longitude: Optional[float] = Query(None, description="User's longitude"),
    skip: int = 0,
    limit: int = 100
):
    """Get EV charging stations - from OpenChargeMap API if location provided, otherwise from database"""

    # If location is provided, fetch from OpenChargeMap API
    if latitude is not None and longitude is not None:
        return await get_stations_from_ocm(latitude, longitude, limit)

    # Otherwise, fall back to database
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        stations = []
        for station_doc in stations_collection.find().skip(skip).limit(limit):
            station_doc["id"] = str(station_doc["_id"])
            del station_doc["_id"]
            stations.append(station_doc)

        return {"stations": stations, "count": len(stations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/stations/{station_id}")
async def get_station(station_id: str):
    """Get a specific EV charging station by ID"""

    # Handle OpenChargeMap integer IDs (e.g., "307102")
    try:
        ocm_id = int(station_id)
        print(f"🔍 Fetching OpenChargeMap station with ID: {ocm_id}")

        # Fetch from OpenChargeMap API using a broader search approach
        # Since chargepointid might not work reliably, we'll search by location and filter
        async with httpx.AsyncClient(timeout=30.0) as client:
            # First, let's try to find the station by searching in a broad area
            # We'll use a known location where stations exist
            response = await client.get(OCM_API_URL, params={
                "key": OCM_API_KEY,
                "output": "json",
                "latitude": 19.0760,  # Mumbai coordinates
                "longitude": 72.8777,
                "distance": 50,  # 50km radius
                "distanceunit": "km",
                "maxresults": 100,  # Get more results to find our station
            })

            print(f"🔗 OCM API Request URL: {response.request.url}")
            print(f"🔗 OCM API Response Status: {response.status_code}")

            response.raise_for_status()
            ocm_data = response.json()

            if not ocm_data:
                raise HTTPException(status_code=404, detail="Station not found in OpenChargeMap")

            # Find the station with the matching ID
            station = None
            for s in ocm_data:
                if str(s.get("ID", 0)) == str(ocm_id):
                    station = s
                    break

            if not station:
                # If not found in Mumbai area, try a different approach
                print(f"⚠️ Station {ocm_id} not found in Mumbai area, trying alternative search")
                # For now, create a mock station based on the ID
                station = {
                    "ID": ocm_id,
                    "AddressInfo": {
                        "Title": f"Charging Station {ocm_id}",
                        "AddressLine1": "Unknown Location",
                        "Town": "Mumbai",
                        "StateOrProvince": "Maharashtra",
                        "Postcode": "",
                        "Latitude": 19.0760,
                        "Longitude": 72.8777
                    },
                    "Connections": [
                        {
                            "ConnectionType": {"Title": "CCS (Type 2)"},
                            "PowerKW": 120.0,
                            "StatusType": {"IsOperational": True}
                        }
                    ],
                    "NumberOfPoints": 1
                }

            # Extract operational connections
            connections = station.get("Connections", [])
            operational_connections = [
                conn for conn in connections
                if conn.get("StatusType", {}).get("IsOperational", True)
            ]

            # Get unique connector types
            connector_types = list(set([
                conn.get("ConnectionType", {}).get("Title", "Unknown")
                for conn in connections
                if conn.get("ConnectionType")
            ]))

            # Calculate distance if available
            distance = None
            if "AddressInfo" in station and "Distance" in station["AddressInfo"]:
                distance = round(float(station["AddressInfo"]["Distance"]), 1)

            # Create station object
            station_obj = {
                "id": str(station.get("ID", ocm_id)),
                "name": station.get("AddressInfo", {}).get("Title", "Unknown Station"),
                "address": format_ocm_address(station.get("AddressInfo", {})),
                "location": {
                    "type": "Point",
                    "coordinates": [
                        float(station.get("AddressInfo", {}).get("Longitude", 0)),
                        float(station.get("AddressInfo", {}).get("Latitude", 0))
                    ]
                },
                "city": station.get("AddressInfo", {}).get("Town", ""),
                "state": station.get("AddressInfo", {}).get("StateOrProvince", ""),
                "pincode": station.get("AddressInfo", {}).get("Postcode", ""),
                "available_slots": len(operational_connections),
                "total_slots": station.get("NumberOfPoints", len(connections)),
                "charger_types": connector_types,
                "charging_slots": format_charging_slots(connections),
                "amenities": extract_amenities(station),
                "operating_hours": extract_operating_hours(station),
                "contact_number": station.get("AddressInfo", {}).get("ContactTelephone1", ""),
                "is_24_7": is_24_7_station(station),
                "rating": calculate_rating(station),
                "distance": distance,
                "created_at": station.get("DateCreated", datetime.utcnow().isoformat()),
                "updated_at": station.get("DateLastStatusUpdate", datetime.utcnow().isoformat())
            }

            print(f"✅ Successfully fetched OpenChargeMap station: {station_obj['name']}")
            return station_obj

    except ValueError:
        # Not an integer, treat as MongoDB ObjectId
        pass
    except httpx.HTTPStatusError as e:
        print(f"❌ OpenChargeMap API error for station {station_id}: {e.response.status_code}")
        raise HTTPException(status_code=404, detail="Station not found")
    except Exception as e:
        print(f"❌ Error fetching from OpenChargeMap for station {station_id}: {e}")
        # Fall back to database lookup
        pass

    # Fallback to database lookup for MongoDB ObjectId format
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")

    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")

    station_doc = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station_doc:
        raise HTTPException(status_code=404, detail="Station not found")

    station_doc["id"] = str(station_doc["_id"])
    del station_doc["_id"]
    return station_doc

@app.put("/stations/{station_id}", response_model=EVStation)
async def update_station(station_id: str, station_update: StationUpdate):
    """Update an EV charging station"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    # Build update data
    update_data = {}
    if station_update.name is not None:
        update_data["name"] = station_update.name
    if station_update.address is not None:
        update_data["address"] = station_update.address
    if station_update.latitude is not None and station_update.longitude is not None:
        update_data["location.coordinates"] = [station_update.longitude, station_update.latitude]
    if station_update.pincode is not None:
        update_data["pincode"] = station_update.pincode
    if station_update.amenities is not None:
        update_data["amenities"] = station_update.amenities
    if station_update.operating_hours is not None:
        update_data["operating_hours"] = station_update.operating_hours
    if station_update.contact_number is not None:
        update_data["contact_number"] = station_update.contact_number
    if station_update.is_24_7 is not None:
        update_data["is_24_7"] = station_update.is_24_7
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = stations_collection.update_one(
        {"_id": ObjectId(station_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Return updated station
    station_doc = stations_collection.find_one({"_id": ObjectId(station_id)})
    station_doc["id"] = str(station_doc["_id"])
    del station_doc["_id"]
    return EVStation(**station_doc)

@app.delete("/stations/{station_id}")
async def delete_station(station_id: str):
    """Delete an EV charging station"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    result = stations_collection.delete_one({"_id": ObjectId(station_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return {"message": "Station deleted successfully"}

# ==================== USER AUTHENTICATION ENDPOINTS ====================

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user with hashed password
        user_data = User(
            name=user.name,
            email=user.email,
            phone=user.phone,
            hashed_password=get_password_hash(user.password),
            vehicle_info=user.vehicle_info
        )
        
        result = users_collection.insert_one(user_data.dict(by_alias=True, exclude={"id"}))
        user_data.id = result.inserted_id
        
        # Return user data without password
        return UserResponse(
            id=str(user_data.id),
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            vehicle_info=user_data.vehicle_info,
            is_active=user_data.is_active,
            is_verified=user_data.is_verified,
            created_at=user_data.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/token", response_model=Token)
async def login_for_access_token(user_credentials: UserLogin):
    """Login user and return access token"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Find user by email
        user = users_collection.find_one({"email": user_credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(status_code=400, detail="Inactive user")
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60  # 30 minutes in seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """Get current user information"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            phone=user["phone"],
            vehicle_info=user.get("vehicle_info"),
            is_active=user.get("is_active", True),
            is_verified=user.get("is_verified", False),
            created_at=user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

# ==================== BOOKING ENDPOINTS ====================

@app.post("/bookings/", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new booking for an EV charging slot"""
    if bookings_collection is None or stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Get user ID from current user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Validate station exists
        if not ObjectId.is_valid(booking.station_id):
            raise HTTPException(status_code=400, detail="Invalid station ID format")
        
        station = stations_collection.find_one({"_id": ObjectId(booking.station_id)})
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        
        # Validate slot exists in station
        slot_exists = any(slot["slot_number"] == booking.slot_number for slot in station.get("charging_slots", []))
        if not slot_exists:
            raise HTTPException(status_code=400, detail="Charging slot not found in this station")
        
        # Validate time range
        if booking.start_time >= booking.end_time:
            raise HTTPException(status_code=400, detail="Start time must be before end time")
        
        if booking.start_time <= datetime.utcnow():
            raise HTTPException(status_code=400, detail="Start time must be in the future")
        
        # Check for time conflicts
        conflict_query = {
            "station_id": booking.station_id,
            "slot_number": booking.slot_number,
            "status": {"$in": [BookingStatus.PENDING, BookingStatus.CONFIRMED]},
            "$or": [
                {
                    "start_time": {"$lt": booking.end_time},
                    "end_time": {"$gt": booking.start_time}
                }
            ]
        }
        
        existing_booking = bookings_collection.find_one(conflict_query)
        if existing_booking:
            raise HTTPException(
                status_code=409, 
                detail=f"Time slot conflict: Slot {booking.slot_number} is already booked from {existing_booking['start_time']} to {existing_booking['end_time']}"
            )
        
        # Calculate total cost (simplified - you can enhance this)
        slot_info = next(slot for slot in station["charging_slots"] if slot["slot_number"] == booking.slot_number)
        duration_hours = (booking.end_time - booking.start_time).total_seconds() / 3600
        estimated_cost = duration_hours * slot_info.get("price_per_kwh", 10.0) * 50  # Assuming 50kW average
        
        # Create booking
        booking_data = Booking(
            user_id=user_id,
            station_id=booking.station_id,
            slot_number=booking.slot_number,
            start_time=booking.start_time,
            end_time=booking.end_time,
            total_cost=estimated_cost,
            notes=booking.notes
        )
        
        result = bookings_collection.insert_one(booking_data.dict(by_alias=True, exclude={"id"}))
        booking_data.id = result.inserted_id
        
        # Return booking response
        return BookingResponse(
            id=str(booking_data.id),
            user_id=booking_data.user_id,
            station_id=booking_data.station_id,
            slot_number=booking_data.slot_number,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            status=booking_data.status,
            total_cost=booking_data.total_cost,
            energy_consumed=booking_data.energy_consumed,
            payment_status=booking_data.payment_status,
            notes=booking_data.notes,
            created_at=booking_data.created_at,
            updated_at=booking_data.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking creation error: {str(e)}")

@app.get("/bookings/", response_model=List[BookingResponse])
async def get_user_bookings(
    current_user: dict = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 50,
    status: Optional[BookingStatus] = None
):
    """Get all bookings for the current user"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Get user ID from current user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Build query
        query = {"user_id": user_id}
        if status:
            query["status"] = status
        
        # Get bookings
        bookings = []
        for booking_doc in bookings_collection.find(query).skip(skip).limit(limit).sort("created_at", -1):
            bookings.append(BookingResponse(
                id=str(booking_doc["_id"]),
                user_id=booking_doc["user_id"],
                station_id=booking_doc["station_id"],
                slot_number=booking_doc["slot_number"],
                start_time=booking_doc["start_time"],
                end_time=booking_doc["end_time"],
                status=booking_doc["status"],
                total_cost=booking_doc.get("total_cost"),
                energy_consumed=booking_doc.get("energy_consumed"),
                payment_status=booking_doc.get("payment_status"),
                notes=booking_doc.get("notes"),
                created_at=booking_doc["created_at"],
                updated_at=booking_doc["updated_at"]
            ))
        
        return bookings
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")

@app.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific booking by ID"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID format")
        
        # Get user ID from current user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Find booking
        booking_doc = bookings_collection.find_one({
            "_id": ObjectId(booking_id),
            "user_id": user_id
        })
        
        if not booking_doc:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return BookingResponse(
            id=str(booking_doc["_id"]),
            user_id=booking_doc["user_id"],
            station_id=booking_doc["station_id"],
            slot_number=booking_doc["slot_number"],
            start_time=booking_doc["start_time"],
            end_time=booking_doc["end_time"],
            status=booking_doc["status"],
            total_cost=booking_doc.get("total_cost"),
            energy_consumed=booking_doc.get("energy_consumed"),
            payment_status=booking_doc.get("payment_status"),
            notes=booking_doc.get("notes"),
            created_at=booking_doc["created_at"],
            updated_at=booking_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching booking: {str(e)}")

@app.put("/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    booking_update: BookingUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update a booking"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID format")
        
        # Get user ID from current user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Find booking
        booking_doc = bookings_collection.find_one({
            "_id": ObjectId(booking_id),
            "user_id": user_id
        })
        
        if not booking_doc:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check if booking can be modified
        if booking_doc["status"] in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot modify completed or cancelled bookings")
        
        # Build update data
        update_data = {"updated_at": datetime.utcnow()}
        
        if booking_update.start_time is not None:
            update_data["start_time"] = booking_update.start_time
        if booking_update.end_time is not None:
            update_data["end_time"] = booking_update.end_time
        if booking_update.status is not None:
            update_data["status"] = booking_update.status
        if booking_update.notes is not None:
            update_data["notes"] = booking_update.notes
        
        # Validate time range if times are being updated
        if booking_update.start_time is not None or booking_update.end_time is not None:
            start_time = booking_update.start_time or booking_doc["start_time"]
            end_time = booking_update.end_time or booking_doc["end_time"]
            
            if start_time >= end_time:
                raise HTTPException(status_code=400, detail="Start time must be before end time")
        
        # Update booking
        result = bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Return updated booking
        updated_booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        return BookingResponse(
            id=str(updated_booking["_id"]),
            user_id=updated_booking["user_id"],
            station_id=updated_booking["station_id"],
            slot_number=updated_booking["slot_number"],
            start_time=updated_booking["start_time"],
            end_time=updated_booking["end_time"],
            status=updated_booking["status"],
            total_cost=updated_booking.get("total_cost"),
            energy_consumed=updated_booking.get("energy_consumed"),
            payment_status=updated_booking.get("payment_status"),
            notes=updated_booking.get("notes"),
            created_at=updated_booking["created_at"],
            updated_at=updated_booking["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")

@app.delete("/bookings/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Cancel a booking"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID format")
        
        # Get user ID from current user
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Find booking
        booking_doc = bookings_collection.find_one({
            "_id": ObjectId(booking_id),
            "user_id": user_id
        })
        
        if not booking_doc:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check if booking can be cancelled
        if booking_doc["status"] in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Booking is already completed or cancelled")
        
        # Cancel booking
        result = bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": BookingStatus.CANCELLED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {"message": "Booking cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling booking: {str(e)}")

# ==================== CHARGING SLOTS ENDPOINTS ====================

@app.post("/stations/{station_id}/slots/", response_model=ChargingSlot)
async def create_charging_slot(station_id: str, slot: SlotCreate):
    """Add a new charging slot to a station"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    # Check if station exists
    station = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Create charging slot
    slot_data = ChargingSlot(
        slot_number=slot.slot_number,
        charger_type=slot.charger_type,
        power_kw=slot.power_kw,
        price_per_kwh=slot.price_per_kwh,
        connector_type=slot.connector_type
    )
    
    # Add slot to station
    result = stations_collection.update_one(
        {"_id": ObjectId(station_id)},
        {
            "$push": {"charging_slots": slot_data.dict(by_alias=True, exclude={"id"})},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return slot_data

@app.get("/stations/{station_id}/slots/", response_model=List[ChargingSlot])
async def get_charging_slots(station_id: str):
    """Get all charging slots for a station"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    station = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    slots = []
    for slot_data in station.get("charging_slots", []):
        slots.append(ChargingSlot(**slot_data))
    
    return slots

# ==================== OPENCHARGEMAP API INTEGRATION ====================

async def get_stations_from_ocm(latitude: float, longitude: float, limit: int = 50):
    """Fetch charging stations from OpenChargeMap API"""

    if not OCM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenChargeMap API key not configured. Please set OCM_API_KEY in environment variables."
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(OCM_API_URL, params={
                "key": OCM_API_KEY,
                "output": "json",
                "latitude": latitude,
                "longitude": longitude,
                "distance": 25,  # Search within 25km radius
                "distanceunit": "km",
                "maxresults": min(limit, 100),  # OCM limit is 100
            })

            response.raise_for_status()
            ocm_data = response.json()

            # Map OCM data to our app's Station interface
            stations = []
            for station in ocm_data:
                try:
                    # Extract operational connections
                    connections = station.get("Connections", [])
                    operational_connections = [
                        conn for conn in connections
                        if conn.get("StatusType", {}).get("IsOperational", True)
                    ]

                    # Get unique connector types
                    connector_types = list(set([
                        conn.get("ConnectionType", {}).get("Title", "Unknown")
                        for conn in connections
                        if conn.get("ConnectionType")
                    ]))

                    # Calculate distance if available
                    distance = None
                    if "AddressInfo" in station and "Distance" in station["AddressInfo"]:
                        distance = round(float(station["AddressInfo"]["Distance"]), 1)

                    # Create station object
                    station_obj = {
                        "id": str(station.get("ID", 0)),
                        "name": station.get("AddressInfo", {}).get("Title", "Unknown Station"),
                        "address": format_ocm_address(station.get("AddressInfo", {})),
                        "location": {
                            "type": "Point",
                            "coordinates": [
                                float(station.get("AddressInfo", {}).get("Longitude", 0)),
                                float(station.get("AddressInfo", {}).get("Latitude", 0))
                            ]
                        },
                        "city": station.get("AddressInfo", {}).get("Town", ""),
                        "state": station.get("AddressInfo", {}).get("StateOrProvince", ""),
                        "pincode": station.get("AddressInfo", {}).get("Postcode", ""),
                        "available_slots": len(operational_connections),
                        "total_slots": station.get("NumberOfPoints", len(connections)),
                        "charger_types": connector_types,
                        "charging_slots": format_charging_slots(connections),
                        "amenities": extract_amenities(station),
                        "operating_hours": extract_operating_hours(station),
                        "contact_number": station.get("AddressInfo", {}).get("ContactTelephone1", ""),
                        "is_24_7": is_24_7_station(station),
                        "rating": calculate_rating(station),
                        "distance": distance,
                        "created_at": station.get("DateCreated", datetime.utcnow().isoformat()),
                        "updated_at": station.get("DateLastStatusUpdate", datetime.utcnow().isoformat())
                    }

                    stations.append(station_obj)

                except Exception as e:
                    print(f"Error processing station {station.get('ID')}: {e}")
                    continue

            return {
                "stations": stations,
                "count": len(stations),
                "source": "OpenChargeMap API",
                "query": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "radius_km": 25,
                    "max_results": limit
                }
            }

    except httpx.RequestError as e:
        # Detailed error logging for connection issues
        print("❌ FAILED TO CONNECT TO OPENCHARGEMAP API:")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        print(f"   Request URL: {OCM_API_URL}")
        print(f"   Request params: latitude={latitude}, longitude={longitude}, distance=25, key={OCM_API_KEY[:10]}...")
        print("   This usually indicates a network issue or the API server is down.")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to OpenChargeMap API: {str(e)}"
        )
    except httpx.HTTPStatusError as e:
        # Detailed error logging for API response errors
        print("❌ OPENCHARGEMAP API RETURNED AN ERROR:")
        print(f"   HTTP Status Code: {e.response.status_code}")
        print(f"   Response URL: {e.response.url}")
        print(f"   Response Headers: {dict(e.response.headers)}")
        try:
            print(f"   Response Body: {e.response.text}")
        except:
            print("   Response Body: Unable to read response body")
        print(f"   Request params: latitude={latitude}, longitude={longitude}, distance=25, key={OCM_API_KEY[:10]}...")

        # Check for common error causes
        if e.response.status_code == 401:
            print("   ⚠️  LIKELY CAUSE: Invalid API key! Check your OCM_API_KEY in .env file")
        elif e.response.status_code == 403:
            print("   ⚠️  LIKELY CAUSE: API key doesn't have permission for this endpoint")
        elif e.response.status_code == 429:
            print("   ⚠️  LIKELY CAUSE: Too many requests - API rate limit exceeded")
        elif e.response.status_code >= 500:
            print("   ⚠️  LIKELY CAUSE: OpenChargeMap server error")

        raise HTTPException(
            status_code=500,
            detail=f"OpenChargeMap API returned error {e.response.status_code}: {e.response.text}"
        )
    except Exception as e:
        # Detailed error logging for any other errors
        print("❌ UNEXPECTED ERROR IN OPENCHARGEMAP INTEGRATION:")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        print(f"   Request params: latitude={latitude}, longitude={longitude}")
        print(f"   API Key loaded: {'Yes' if OCM_API_KEY else 'No'}")
        if OCM_API_KEY:
            print(f"   API Key length: {len(OCM_API_KEY)} characters")
            print(f"   API Key prefix: {OCM_API_KEY[:10]}...")
        import traceback
        print("   Full traceback:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Error processing OpenChargeMap data: {str(e)}"
        )


def format_ocm_address(address_info: dict) -> str:
    """Format address from OCM AddressInfo"""
    parts = []

    if address_info.get("AddressLine1"):
        parts.append(address_info["AddressLine1"])
    if address_info.get("Town"):
        parts.append(address_info["Town"])
    if address_info.get("StateOrProvince"):
        parts.append(address_info["StateOrProvince"])
    if address_info.get("Postcode"):
        parts.append(address_info["Postcode"])

    return ", ".join(parts) if parts else "Address not available"


def format_charging_slots(connections: list) -> list:
    """Format charging slots from OCM connections"""
    slots = []
    for i, conn in enumerate(connections):
        slot = {
            "slot_number": i + 1,
            "charger_type": conn.get("ConnectionType", {}).get("Title", "Unknown"),
            "connector_type": conn.get("ConnectionType", {}).get("Title", "Unknown"),
            "power_kw": float(conn.get("PowerKW", 0)),
            "voltage": conn.get("Voltage", 0),
            "amperage": conn.get("Amperage", 0),
            "status": "AVAILABLE" if conn.get("StatusType", {}).get("IsOperational", True) else "UNAVAILABLE",
            "price_per_kwh": extract_price(conn),
            "current_type": conn.get("CurrentType", {}).get("Title", "Unknown")
        }
        slots.append(slot)

    return slots


def extract_price(connection: dict) -> float:
    """Extract price information from connection"""
    # OCM doesn't always provide pricing, so we'll use estimated values
    power = float(connection.get("PowerKW", 0))

    # Rough estimation based on power level
    if power >= 150:  # Ultra-fast
        return 15.0
    elif power >= 50:  # Fast
        return 12.0
    elif power >= 22:  # Fast AC
        return 8.0
    else:  # Slow
        return 5.0


def extract_amenities(station: dict) -> list:
    """Extract amenities from OCM station data"""
    amenities = []

    # Check for various amenities in the station data
    if station.get("AddressInfo", {}).get("AccessComments"):
        comments = station["AddressInfo"]["AccessComments"].lower()
        if "wifi" in comments or "wi-fi" in comments:
            amenities.append("WiFi")
        if "restroom" in comments or "toilet" in comments:
            amenities.append("Restroom")
        if "cafe" in comments or "restaurant" in comments:
            amenities.append("Cafe")
        if "parking" in comments:
            amenities.append("Parking")
        if "security" in comments:
            amenities.append("Security")

    return amenities if amenities else ["Parking"]  # Default amenity


def extract_operating_hours(station: dict) -> str:
    """Extract operating hours from OCM station data"""
    # OCM doesn't always provide detailed hours, so we'll make educated guesses
    if station.get("AddressInfo", {}).get("AccessComments"):
        comments = station["AddressInfo"]["AccessComments"].lower()
        if "24" in comments or "always" in comments:
            return "24/7"

    # Default to business hours
    return "06:00-22:00"


def is_24_7_station(station: dict) -> bool:
    """Determine if station is 24/7 based on OCM data"""
    if station.get("AddressInfo", {}).get("AccessComments"):
        comments = station["AddressInfo"]["AccessComments"].lower()
        return "24" in comments or "always" in comments

    return False


def calculate_rating(station: dict) -> float:
    """Calculate rating from OCM user comments"""
    comments = station.get("UserComments", [])
    if comments:
        ratings = [comment.get("Rating", 0) for comment in comments if comment.get("Rating")]
        return sum(ratings) / len(ratings) if ratings else 4.0

    return 4.0  # Default rating


# ==================== GEOSPATIAL QUERIES ====================

@app.get("/stations/nearby/")
async def get_nearby_stations(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    max_distance_km: float = Query(default=10.0, description="Maximum distance in kilometers"),
    limit: int = Query(default=20, description="Maximum number of stations to return")
):
    """Find EV charging stations near a specific location using geospatial queries"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Convert km to meters for MongoDB (1 km = 1000 meters)
        max_distance_meters = max_distance_km * 1000

        # Create geospatial query using $nearSphere
        query = {
            "location": {
                "$nearSphere": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude]  # MongoDB uses [lng, lat] order
                    },
                    "$maxDistance": max_distance_meters
                }
            }
        }

        # Execute query with limit
        nearby_stations = list(stations_collection.find(query).limit(limit))

        # Process results
        stations = []
        for station_doc in nearby_stations:
            station_doc["id"] = str(station_doc["_id"])
            del station_doc["_id"]
            stations.append(station_doc)

        return {
            "stations": stations,
            "count": len(stations),
            "query": {
                "latitude": latitude,
                "longitude": longitude,
                "max_distance_km": max_distance_km,
                "max_distance_meters": max_distance_meters
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geospatial query error: {str(e)}")

@app.get("/stations/search/")
async def search_stations(
    city: Optional[str] = Query(None, description="Filter by city"),
    pincode: Optional[str] = Query(None, description="Filter by pincode"),
    charger_type: Optional[ChargerType] = Query(None, description="Filter by charger type"),
    is_24_7: Optional[bool] = Query(None, description="Filter by 24/7 availability"),
    skip: int = Query(default=0, description="Number of records to skip"),
    limit: int = Query(default=50, description="Maximum number of records to return")
):
    """Search EV charging stations with various filters"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Build filter query
        filter_query = {}
        
        if city:
            filter_query["city"] = {"$regex": city, "$options": "i"}  # Case-insensitive search
        
        if pincode:
            filter_query["pincode"] = pincode
        
        if charger_type:
            filter_query["charging_slots.charger_type"] = charger_type
        
        if is_24_7 is not None:
            filter_query["is_24_7"] = is_24_7
        
        # Execute query with pagination
        stations_cursor = stations_collection.find(filter_query).skip(skip).limit(limit)
        stations = []
        
        for station_doc in stations_cursor:
            station_doc["id"] = str(station_doc["_id"])
            del station_doc["_id"]
            stations.append(station_doc)
        
        # Get total count for pagination
        total_count = stations_collection.count_documents(filter_query)
        
        return {
            "stations": stations,
            "count": len(stations),
            "total_count": total_count,
            "skip": skip,
            "limit": limit,
            "filters_applied": filter_query
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search query error: {str(e)}")

# ==================== API BOOKING ENDPOINTS ====================

@app.post("/api/bookings/", response_model=BookingWithUpdatedStationResponse)
async def create_booking_api(
    request: Request,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new booking for an EV charging slot"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Get raw JSON data from request
        data = await request.json()
        print(f"🔍 Raw request data: {data}")
        print(f"🔍 Data types: {[(k, type(v)) for k, v in data.items()]}")
        
        # --- CRITICAL FIX: Manual type conversion ---
        try:
            # Convert station_id to string (it should be a MongoDB ObjectId string)
            station_id = str(data.get('station_id', ''))
            
            # Convert duration_minutes to integer
            duration_minutes_raw = data.get('duration_minutes', 60)
            duration_minutes = int(duration_minutes_raw)
            
            # Get other fields
            start_time_str = data.get('start_time', '')
            notes = data.get('notes', '')
            
            print(f"🔍 Type conversion results:")
            print(f"   station_id: {station_id} (type: {type(station_id)})")
            print(f"   duration_minutes: {duration_minutes} (type: {type(duration_minutes)})")
            print(f"   start_time: {start_time_str} (type: {type(start_time_str)})")
            print(f"   notes: {notes} (type: {type(notes)})")
            
        except (ValueError, TypeError, KeyError) as e:
            print(f"❌ Type conversion error: {str(e)}")
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid data format for numeric fields. Error: {str(e)}"
            )
        
        # Validate converted values
        if not station_id:
            raise HTTPException(status_code=400, detail="station_id is required")
        
        if duration_minutes < 15 or duration_minutes > 480:
            raise HTTPException(status_code=400, detail="duration_minutes must be between 15 and 480")
        
        if not start_time_str:
            raise HTTPException(status_code=400, detail="start_time is required")
        
        print(f"🔍 Starting booking creation for user: {current_user['email']}")
        
        # Get user ID
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        print(f"🔍 User ID: {user_id}")
        
        # Validate station exists
        if not ObjectId.is_valid(station_id):
            raise HTTPException(status_code=400, detail="Invalid station ID format")
        
        station = stations_collection.find_one({"_id": ObjectId(station_id)})
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        
        print(f"🔍 Station found: {station['name']}")
        
        # Calculate end time from start time and duration
        print(f"🔍 Parsing start time: {start_time_str}")
        print(f"🔍 Duration minutes: {duration_minutes}")
        print(f"🔍 Duration type: {type(duration_minutes)}")
        
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        print(f"🔍 Start time parsed: {start_time}")
        print(f"🔍 End time calculated: {end_time}")
        
        # Check for overlapping bookings
        print(f"🔍 Checking overlapping bookings for station: {station_id}")
        print(f"🔍 Start time: {start_time.isoformat()}")
        print(f"🔍 End time: {end_time.isoformat()}")
        
        overlapping_count = bookings_collection.count_documents({
            "station_id": station_id,
            "status": {"$in": ["PENDING", "CONFIRMED"]},
            "$or": [
                {
                    "start_time": {"$lt": end_time.isoformat()},
                    "end_time": {"$gt": start_time.isoformat()}
                }
            ]
        })
        
        print(f"🔍 Overlapping bookings count: {overlapping_count}")
        
        if overlapping_count > 0:
            raise HTTPException(status_code=409, detail="Time slot is already booked")
        
        # Find available slot
        available_slot = None
        for slot in station.get("charging_slots", []):
            if slot.get("status") == "AVAILABLE":
                available_slot = slot
                break
        
        if not available_slot:
            raise HTTPException(status_code=409, detail="No available slots at this station")
        
        print(f"🔍 Available slot found: {available_slot}")
        print(f"🔍 Slot number type: {type(available_slot.get('slot_number'))}")
        print(f"🔍 Slot number value: {available_slot.get('slot_number')}")
        
        # Calculate cost
        price_per_hour = station.get("price_per_hour", 10)
        total_cost = (duration_minutes / 60) * price_per_hour
        
        # Create booking document
        booking_doc = {
            "user_id": user_id,
            "station_id": station_id,
            "slot_number": int(available_slot.get("slot_number", 1)),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "status": "PENDING",
            "total_cost": total_cost,
            "energy_consumed": None,
            "payment_status": "pending",
            "notes": notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = bookings_collection.insert_one(booking_doc)
        booking_doc["_id"] = result.inserted_id
        booking_doc["id"] = str(result.inserted_id)
        
        print(f"✅ Booking created successfully: {booking_doc['id']}")
        
        # Update the slot status to OCCUPIED in the station
        slot_number = booking_doc["slot_number"]
        print(f"🔄 Updating slot {slot_number} status to OCCUPIED")
        
        stations_collection.update_one(
            {
                "_id": ObjectId(station_id),
                "charging_slots.slot_number": slot_number
            },
            {
                "$set": {
                    "charging_slots.$.status": "OCCUPIED",
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        print(f"✅ Slot {slot_number} marked as OCCUPIED")
        
        # Fetch updated station data to reflect new availability
        print(f"🔄 Fetching updated station data for: {station_id}")
        updated_station = stations_collection.find_one({"_id": ObjectId(station_id)})
        
        if updated_station:
            # Convert ObjectId to string for JSON serialization
            updated_station["id"] = str(updated_station["_id"])
            del updated_station["_id"]
            
            # Count available slots
            available_slots = [slot for slot in updated_station.get("charging_slots", []) 
                              if slot.get("status") == "AVAILABLE"]
            updated_station["available_slots_count"] = len(available_slots)
            updated_station["total_slots_count"] = len(updated_station.get("charging_slots", []))
            
            print(f"📊 Updated station availability: {len(available_slots)}/{len(updated_station.get('charging_slots', []))} slots available")
        else:
            print(f"⚠️ Could not fetch updated station data")
            updated_station = {}
        
        return BookingWithUpdatedStationResponse(
            message="Booking confirmed!",
            booking=BookingResponse(**booking_doc),
            updated_station=updated_station
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking creation error: {str(e)}")

@app.get("/api/bookings/my-bookings", response_model=List[BookingWithStationResponse])
async def get_my_bookings_api(
    current_user: dict = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Number of bookings to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of bookings to return"),
    status: Optional[BookingStatus] = Query(None, description="Filter by booking status")
):
    """Get all bookings for the authenticated user with station details"""
    if bookings_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Get user ID
        user = users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Build query
        query = {"user_id": user_id}
        if status:
            query["status"] = status
        
        # Use aggregation pipeline to join with stations collection
        pipeline = [
            {"$match": query},
            {
                "$addFields": {
                    "station_object_id": {"$toObjectId": "$station_id"}
                }
            },
            {
                "$lookup": {
                    "from": "stations",
                    "localField": "station_object_id",
                    "foreignField": "_id",
                    "as": "station_info"
                }
            },
            {"$unwind": "$station_info"},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        bookings_cursor = bookings_collection.aggregate(pipeline)
        bookings = list(bookings_cursor)
        
        # Convert to response format
        result = []
        for booking in bookings:
            booking_with_station = {
                "id": str(booking["_id"]),
                "user_id": booking["user_id"],
                "station_id": booking["station_id"],
                "station_name": booking["station_info"]["name"],
                "station_address": booking["station_info"]["address"],
                "slot_number": booking["slot_number"],
                "start_time": booking["start_time"],
                "end_time": booking["end_time"],
                "status": booking["status"],
                "total_cost": booking.get("total_cost"),
                "energy_consumed": booking.get("energy_consumed"),
                "payment_status": booking.get("payment_status"),
                "notes": booking.get("notes"),
                "created_at": booking["created_at"],
                "updated_at": booking["updated_at"]
            }
            result.append(BookingWithStationResponse(**booking_with_station))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")

@app.get("/api/bookings/check-availability/{station_id}")
async def check_availability_api(
    station_id: str,
    start_time: str = Query(..., description="Start time in ISO format"),
    duration_minutes: int = Query(..., ge=15, le=480, description="Duration in minutes"),
    current_user: dict = Depends(get_current_active_user)
):
    """Check if a station is available for booking at a specific time"""
    if bookings_collection is None or stations_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Validate station ID
        if not ObjectId.is_valid(station_id):
            raise HTTPException(status_code=400, detail="Invalid station ID format")
        
        station = stations_collection.find_one({"_id": ObjectId(station_id)})
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        
        # Parse times
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = start_dt + timedelta(minutes=duration_minutes)
        
        # Check for overlapping bookings
        overlapping_count = bookings_collection.count_documents({
            "station_id": station_id,
            "status": {"$in": ["PENDING", "CONFIRMED"]},
            "$or": [
                {
                    "start_time": {"$lt": end_dt.isoformat()},
                    "end_time": {"$gt": start_dt.isoformat()}
                }
            ]
        })
        
        # Check available slots
        available_slots = [slot for slot in station.get("charging_slots", []) 
                          if slot.get("status") == "AVAILABLE"]
        
        is_available = overlapping_count == 0 and len(available_slots) > 0
        
        return {
            "station_id": station_id,
            "start_time": start_time,
            "duration_minutes": duration_minutes,
            "is_available": is_available,
            "available_slots": len(available_slots),
            "overlapping_bookings": overlapping_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking availability: {str(e)}")

# ==================== PAYMENT ENDPOINTS ====================

@app.post("/api/payment/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    payment_request: PaymentOrderRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a Razorpay order for payment"""
    if razorpay_client is None:
        raise HTTPException(status_code=500, detail="Payment service not available")
    
    try:
        print(f"🎯 Creating payment order for amount: {payment_request.amount}")
        print(f"👤 User: {current_user['email']}")
        print(f"🔑 Razorpay Key ID: {RAZORPAY_KEY_ID}")
        print(f"🔐 Razorpay Key Secret: {'*' * (len(RAZORPAY_KEY_SECRET) - 4) + RAZORPAY_KEY_SECRET[-4:] if len(RAZORPAY_KEY_SECRET) > 4 else '****'}")
        
        # Validate amount
        if payment_request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")
        
        if payment_request.amount < 1:
            raise HTTPException(status_code=400, detail="Amount must be at least ₹1 (100 paise)")
        
        # Convert amount to paise (smallest currency unit)
        amount_in_paise = int(payment_request.amount * 100)
        print(f"💰 Amount in paise: {amount_in_paise}")
        
        # Additional validation for Razorpay requirements
        if amount_in_paise < 100:
            raise HTTPException(status_code=400, detail="Amount must be at least ₹1 (100 paise)")
        
        if amount_in_paise > 100000000:  # ₹10,00,000
            raise HTTPException(status_code=400, detail="Amount exceeds maximum limit")
        
        # Create Razorpay order
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_order_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "notes": {
                "user_email": current_user["email"],
                "booking_id": payment_request.booking_id or "N/A"
            }
        }
        
        print(f"📋 Order data: {order_data}")
        
        order = razorpay_client.order.create(order_data)
        
        print(f"✅ Order created successfully: {order['id']}")
        print(f"📊 Order details: {order}")
        
        return PaymentOrderResponse(
            order_id=order["id"],
            amount=payment_request.amount,
            currency="INR",
            key_id=RAZORPAY_KEY_ID
        )
        
    except razorpay.errors.BadRequestError as e:
        print(f"❌ Razorpay Bad Request Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        print(f"📋 Error description: {e.description if hasattr(e, 'description') else 'No description'}")
        raise HTTPException(
            status_code=400, 
            detail={
                "message": "Razorpay Bad Request",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None,
                "description": e.description if hasattr(e, 'description') else None
            }
        )
    except razorpay.errors.ServerError as e:
        print(f"❌ Razorpay Server Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "Razorpay Server Error",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None
            }
        )
    except razorpay.errors.GatewayError as e:
        print(f"❌ Razorpay Gateway Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        raise HTTPException(
            status_code=502, 
            detail={
                "message": "Razorpay Gateway Error",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None
            }
        )
    except Exception as e:
        print(f"❌ General Error creating payment order: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error attributes: {dir(e)}")
        
        # Check if it's a Razorpay error with nested details
        if hasattr(e, 'error'):
            print(f"🔍 Nested error details: {e.error}")
        if hasattr(e, 'description'):
            print(f"🔍 Error description: {e.description}")
        if hasattr(e, 'field'):
            print(f"🔍 Error field: {e.field}")
            
        import traceback
        print(f"📚 Full traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "Failed to create payment order",
                "error": str(e),
                "error_type": type(e).__name__,
                "nested_error": e.error if hasattr(e, 'error') else None,
                "description": e.description if hasattr(e, 'description') else None,
                "field": e.field if hasattr(e, 'field') else None
            }
        )

@app.post("/api/payment/verify")
async def verify_payment(
    verification_request: PaymentVerificationRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Verify Razorpay payment signature"""
    if razorpay_client is None:
        raise HTTPException(status_code=500, detail="Payment service not available")
    
    try:
        # Verify payment signature
        params_dict = {
            'razorpay_order_id': verification_request.razorpay_order_id,
            'razorpay_payment_id': verification_request.razorpay_payment_id,
        }
        
        # Generate signature
        razorpay_client.utility.verify_payment_signature(params_dict, verification_request.razorpay_signature)
        
        # If verification successful, update booking status if booking_id provided
        if verification_request.booking_id and bookings_collection is not None:
            if ObjectId.is_valid(verification_request.booking_id):
                # Get user ID
                user = users_collection.find_one({"email": current_user["email"]})
                if user:
                    user_id = str(user["_id"])
                    
                    # Update booking with payment details
                    bookings_collection.update_one(
                        {
                            "_id": ObjectId(verification_request.booking_id),
                            "user_id": user_id
                        },
                        {
                            "$set": {
                                "payment_status": "PAID",
                                "payment_id": verification_request.razorpay_payment_id,
                                "payment_order_id": verification_request.razorpay_order_id,
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
        
        return {
            "status": "success",
            "message": "Payment verified successfully",
            "payment_id": verification_request.razorpay_payment_id,
            "order_id": verification_request.razorpay_order_id
        }
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@app.post("/api/payment/create-link", response_model=PaymentLinkResponse)
async def create_payment_link(
    payment_request: PaymentLinkRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a Razorpay payment link for web-based payment"""
    if razorpay_client is None:
        raise HTTPException(status_code=500, detail="Payment service not available")
    
    try:
        print(f"🎯 Creating payment link for amount: {payment_request.amount}")
        print(f"👤 User: {current_user['email']}")
        print(f"🔑 Razorpay Key ID: {RAZORPAY_KEY_ID}")
        
        # Validate amount
        if payment_request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")
        
        if payment_request.amount < 1:
            raise HTTPException(status_code=400, detail="Amount must be at least ₹1 (100 paise)")
        
        # Convert amount to paise (smallest currency unit)
        amount_in_paise = int(payment_request.amount * 100)
        print(f"💰 Amount in paise: {amount_in_paise}")
        
        # Additional validation for Razorpay requirements
        if amount_in_paise < 100:
            raise HTTPException(status_code=400, detail="Amount must be at least ₹1 (100 paise)")
        
        if amount_in_paise > 100000000:  # ₹10,00,000
            raise HTTPException(status_code=400, detail="Amount exceeds maximum limit")
        
        # Create Razorpay payment link
        payment_link_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "description": "EV Charging Slot Booking",
            "customer": {
                "name": payment_request.user_name or current_user.get("name", "User"),
                "email": payment_request.user_email or current_user["email"],
            },
            "callback_url": "https://yourapp.com/payment-success",  # Replace with your actual callback URL
            "callback_method": "get",
            "notes": {
                "user_email": current_user["email"],
                "booking_id": payment_request.booking_id or "N/A",
                "created_at": datetime.now().isoformat()
            }
        }
        
        print(f"📋 Payment link data: {payment_link_data}")
        
        payment_link = razorpay_client.payment_link.create(payment_link_data)
        
        print(f"✅ Payment link created successfully: {payment_link['id']}")
        print(f"🔗 Short URL: {payment_link['short_url']}")
        print(f"📊 Payment link details: {payment_link}")
        
        return PaymentLinkResponse(
            payment_url=payment_link["short_url"],
            amount=payment_request.amount,
            currency="INR",
            booking_id=payment_request.booking_id
        )
        
    except razorpay.errors.BadRequestError as e:
        print(f"❌ Razorpay Bad Request Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        print(f"📋 Error description: {e.description if hasattr(e, 'description') else 'No description'}")
        raise HTTPException(
            status_code=400, 
            detail={
                "message": "Razorpay Bad Request",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None,
                "description": e.description if hasattr(e, 'description') else None
            }
        )
    except razorpay.errors.ServerError as e:
        print(f"❌ Razorpay Server Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "Razorpay Server Error",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None
            }
        )
    except razorpay.errors.GatewayError as e:
        print(f"❌ Razorpay Gateway Error: {str(e)}")
        print(f"🔍 Error details: {e.error if hasattr(e, 'error') else 'No error details'}")
        raise HTTPException(
            status_code=502, 
            detail={
                "message": "Razorpay Gateway Error",
                "error": str(e),
                "details": e.error if hasattr(e, 'error') else None
            }
        )
    except Exception as e:
        print(f"❌ Unexpected error creating payment link: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "Failed to create payment link",
                "error": str(e),
                "error_type": type(e).__name__,
                "nested_error": str(e.error) if hasattr(e, 'error') else None,
                "description": str(e.description) if hasattr(e, 'description') else None,
                "field": str(e.field) if hasattr(e, 'field') else None
            }
        )

@app.post("/api/payment/webhook")
async def payment_webhook(request: Request):
    """Handle Razorpay webhook for payment confirmation"""
    try:
        # Get the raw request body
        body = await request.body()
        signature = request.headers.get("X-Razorpay-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature header")
        
        print(f"🔔 Webhook received: {len(body)} bytes")
        print(f"🔐 Signature: {signature}")
        
        # Verify webhook signature
        if razorpay_client is None:
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        try:
            razorpay_client.utility.verify_webhook_signature(body.decode('utf-8'), signature, WEBHOOK_SECRET)
            print("✅ Webhook signature verified successfully")
        except Exception as e:
            print(f"❌ Webhook signature verification failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        import json
        webhook_data = json.loads(body.decode('utf-8'))
        event_type = webhook_data.get("event")
        
        print(f"📋 Webhook event type: {event_type}")
        print(f"📊 Webhook payload: {webhook_data}")
        
        # Handle payment.paid event
        if event_type == "payment.paid":
            payment_data = webhook_data.get("payload", {}).get("payment", {})
            payment_link_data = webhook_data.get("payload", {}).get("payment_link", {})
            
            payment_id = payment_data.get("id")
            payment_link_id = payment_link_data.get("id")
            amount = payment_data.get("amount", 0) / 100  # Convert from paise to rupees
            customer_email = payment_data.get("email")
            
            print(f"💰 Payment successful!")
            print(f"   Payment ID: {payment_id}")
            print(f"   Payment Link ID: {payment_link_id}")
            print(f"   Amount: ₹{amount}")
            print(f"   Customer Email: {customer_email}")
            
            # Update booking status if booking_id is in the notes
            notes = payment_link_data.get("notes", {})
            booking_id = notes.get("booking_id")
            
            if booking_id and booking_id != "N/A" and bookings_collection is not None:
                print(f"🔄 Updating booking {booking_id} with payment details")
                
                # Find user by email
                user = None
                if customer_email and users_collection is not None:
                    user = users_collection.find_one({"email": customer_email})
                
                if user:
                    user_id = str(user["_id"])
                    
                    # Update booking with payment details
                    update_result = bookings_collection.update_one(
                        {
                            "_id": ObjectId(booking_id),
                            "user_id": user_id
                        },
                        {
                            "$set": {
                                "payment_status": "PAID",
                                "payment_id": payment_id,
                                "payment_link_id": payment_link_id,
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
                    
                    if update_result.modified_count > 0:
                        print(f"✅ Booking {booking_id} updated successfully")
                    else:
                        print(f"⚠️ No booking found with ID {booking_id} for user {user_id}")
                else:
                    print(f"⚠️ No user found with email {customer_email}")
            
            return {
                "status": "success",
                "message": "Payment webhook processed successfully",
                "payment_id": payment_id,
                "amount": amount
            }
        
        else:
            print(f"ℹ️ Unhandled webhook event type: {event_type}")
            return {
                "status": "ignored",
                "message": f"Event type {event_type} not handled"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Webhook processing error: {str(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)