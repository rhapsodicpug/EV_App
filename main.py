import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from fastapi import FastAPI, HTTPException, Depends, Query, status
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

# Import our models
from models import (
    EVStation, StationCreate, StationUpdate, 
    ChargingSlot, SlotCreate, 
    User, UserCreate, UserLogin, UserResponse, Token, TokenData,
    Booking, BookingCreate, BookingUpdate, BookingResponse,
    ChargerType, ChargerStatus, BookingStatus
)

# Import authentication utilities
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user
)

# Load environment variables from .env file
load_dotenv()

# Payment Models
class PaymentOrderRequest(BaseModel):
    amount: float = Field(..., description="Amount in INR")
    booking_id: Optional[str] = Field(None, description="Optional booking ID for reference")

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str = "INR"
    key_id: str

class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    booking_id: Optional[str] = None

# Initialize Razorpay
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    print("🎉 Razorpay client initialized successfully!")
else:
    razorpay_client = None
    print("⚠️  Razorpay credentials not found in environment variables")

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
async def get_stations(skip: int = 0, limit: int = 100):
    """Get all EV charging stations with pagination"""
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

@app.get("/stations/{station_id}", response_model=EVStation)
async def get_station(station_id: str):
    """Get a specific EV charging station by ID"""
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    station_doc = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station_doc:
        raise HTTPException(status_code=404, detail="Station not found")
    
    station_doc["id"] = str(station_doc["_id"])
    del station_doc["_id"]
    return EVStation(**station_doc)

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
        
        # Validate amount
        if payment_request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")
        
        # Convert amount to paise (smallest currency unit)
        amount_in_paise = int(payment_request.amount * 100)
        print(f"💰 Amount in paise: {amount_in_paise}")
        
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
        
    except Exception as e:
        print(f"❌ Error creating payment order: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        import traceback
        print(f"📚 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)