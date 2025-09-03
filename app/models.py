from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, field=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema: JsonSchemaValue, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

class ChargerType(str, Enum):
    AC_SLOW = "AC_SLOW"  # 3-7 kW
    AC_FAST = "AC_FAST"  # 7-22 kW
    DC_FAST = "DC_FAST"  # 50+ kW
    DC_ULTRA_FAST = "DC_ULTRA_FAST"  # 150+ kW

class ChargerStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    OUT_OF_ORDER = "OUT_OF_ORDER"
    MAINTENANCE = "MAINTENANCE"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float] = Field(..., description="[longitude, latitude]")

class ChargingSlot(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    slot_number: int = Field(..., description="Slot number at the station")
    charger_type: ChargerType = Field(..., description="Type of charger")
    power_kw: float = Field(..., description="Power rating in kW")
    status: ChargerStatus = Field(default=ChargerStatus.AVAILABLE, description="Current status")
    price_per_kwh: float = Field(..., description="Price per kWh in INR")
    connector_type: str = Field(..., description="Connector type (CCS, CHAdeMO, Type 2, etc.)")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class EVStation(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="Station name")
    address: str = Field(..., description="Full address")
    location: Location = Field(..., description="GPS coordinates")
    city: str = Field(default="Mumbai", description="City name")
    state: str = Field(default="Maharashtra", description="State name")
    pincode: str = Field(..., description="PIN code")
    charging_slots: List[ChargingSlot] = Field(default_factory=list, description="Available charging slots")
    amenities: List[str] = Field(default_factory=list, description="Available amenities")
    operating_hours: Dict[str, str] = Field(..., description="Operating hours (e.g., {'monday': '06:00-22:00'})")
    contact_number: Optional[str] = Field(None, description="Contact number")
    is_24_7: bool = Field(default=False, description="24/7 availability")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    hashed_password: str = Field(..., description="Hashed password")
    vehicle_info: Optional[Dict[str, Any]] = Field(None, description="Vehicle details")
    is_active: bool = Field(default=True, description="Account status")
    is_verified: bool = Field(default=False, description="Email verification status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Authentication Models
class UserCreate(BaseModel):
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    password: str = Field(..., description="Plain text password")
    vehicle_info: Optional[Dict[str, Any]] = Field(None, description="Vehicle details")

class UserLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    id: str = Field(..., description="User ID")
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    vehicle_info: Optional[Dict[str, Any]] = Field(None, description="Vehicle details")
    is_active: bool = Field(..., description="Account status")
    is_verified: bool = Field(..., description="Email verification status")
    created_at: datetime = Field(..., description="Account creation date")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class TokenData(BaseModel):
    email: Optional[str] = Field(None, description="User email from token")

class Booking(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="User ID who made the booking")
    station_id: str = Field(..., description="EV station ID")
    slot_number: int = Field(..., description="Charging slot number")
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    status: BookingStatus = Field(default=BookingStatus.PENDING, description="Booking status")
    total_cost: Optional[float] = Field(None, description="Total cost of the booking")
    energy_consumed: Optional[float] = Field(None, description="Energy consumed in kWh")
    payment_status: Optional[str] = Field(default="pending", description="Payment status")
    notes: Optional[str] = Field(None, description="Additional notes")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Request/Response Models
class StationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    pincode: str
    amenities: List[str] = []
    operating_hours: Dict[str, str]
    contact_number: Optional[str] = None
    is_24_7: bool = False

class StationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pincode: Optional[str] = None
    amenities: Optional[List[str]] = None
    operating_hours: Optional[Dict[str, str]] = None
    contact_number: Optional[str] = None
    is_24_7: Optional[bool] = None

class SlotCreate(BaseModel):
    slot_number: int
    charger_type: ChargerType
    power_kw: float
    price_per_kwh: float
    connector_type: str

class BookingCreate(BaseModel):
    station_id: str = Field(..., description="EV station ID")
    slot_number: int = Field(..., description="Charging slot number")
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    notes: Optional[str] = Field(None, description="Additional notes")

class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = Field(None, description="New booking start time")
    end_time: Optional[datetime] = Field(None, description="New booking end time")
    status: Optional[BookingStatus] = Field(None, description="New booking status")
    notes: Optional[str] = Field(None, description="Additional notes")

class BookingResponse(BaseModel):
    id: str = Field(..., description="Booking ID")
    user_id: str = Field(..., description="User ID who made the booking")
    station_id: str = Field(..., description="EV station ID")
    slot_number: int = Field(..., description="Charging slot number")
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    status: BookingStatus = Field(..., description="Booking status")
    total_cost: Optional[float] = Field(None, description="Total cost of the booking")
    energy_consumed: Optional[float] = Field(None, description="Energy consumed in kWh")
    payment_status: Optional[str] = Field(None, description="Payment status")
    notes: Optional[str] = Field(None, description="Additional notes")
    created_at: datetime = Field(..., description="Booking creation date")
    updated_at: datetime = Field(..., description="Last update date")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
