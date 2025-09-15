"""
Station-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models import (
    EVStation, StationCreate, StationUpdate,
    ChargingSlot, SlotCreate,
    ChargerType
)
from db.database import get_collections

router = APIRouter(
    prefix="/stations",
    tags=["stations"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=dict)
async def get_stations(skip: int = 0, limit: int = 100):
    """Get all EV charging stations with pagination"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
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

@router.get("/{station_id}", response_model=EVStation)
async def get_station(station_id: str):
    """Get a specific EV charging station by ID"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
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

@router.post("/", response_model=EVStation)
async def create_station(station: StationCreate):
    """Create a new EV charging station"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Create station data
    station_data = EVStation(
        name=station.name,
        address=station.address,
        location={
            "type": "Point",
            "coordinates": [station.longitude, station.latitude]
        },
        city="Mumbai",  # You can make this dynamic
        state="Maharashtra",
        pincode=station.pincode,
        charging_slots=[],
        amenities=station.amenities,
        operating_hours=station.operating_hours,
        contact_number=station.contact_number,
        is_24_7=station.is_24_7
    )
    
    result = stations_collection.insert_one(station_data.dict(by_alias=True, exclude={"id"}))
    station_data.id = result.inserted_id
    
    return station_data

@router.put("/{station_id}", response_model=EVStation)
async def update_station(station_id: str, station_update: StationUpdate):
    """Update an EV charging station"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
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

@router.delete("/{station_id}")
async def delete_station(station_id: str):
    """Delete an EV charging station"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    result = stations_collection.delete_one({"_id": ObjectId(station_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return {"message": "Station deleted successfully"}

@router.get("/nearby/")
async def get_nearby_stations(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    max_distance_km: float = Query(default=10.0, description="Maximum distance in kilometers"),
    limit: int = Query(default=20, description="Maximum number of stations to return")
):
    """Find EV charging stations near a specific location using geospatial queries"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
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

@router.get("/search/")
async def search_stations(
    city: Optional[str] = Query(None, description="Filter by city"),
    pincode: Optional[str] = Query(None, description="Filter by pincode"),
    charger_type: Optional[ChargerType] = Query(None, description="Filter by charger type"),
    is_24_7: Optional[bool] = Query(None, description="Filter by 24/7 availability"),
    skip: int = Query(default=0, description="Number of records to skip"),
    limit: int = Query(default=50, description="Maximum number of records to return")
):
    """Search EV charging stations with various filters"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
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

@router.post("/{station_id}/slots/", response_model=ChargingSlot)
async def create_charging_slot(station_id: str, slot: SlotCreate):
    """Add a new charging slot to a station"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    station_doc = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station_doc:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Create new slot
    new_slot = ChargingSlot(
        slot_number=slot.slot_number,
        charger_type=slot.charger_type,
        power_kw=slot.power_kw,
        status="AVAILABLE",
        price_per_kwh=slot.price_per_kwh,
        connector_type=slot.connector_type
    )
    
    # Add slot to station
    result = stations_collection.update_one(
        {"_id": ObjectId(station_id)},
        {"$push": {"charging_slots": new_slot.dict()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return new_slot

@router.get("/{station_id}/slots/", response_model=List[ChargingSlot])
async def get_charging_slots(station_id: str):
    """Get all charging slots for a station"""
    collections = get_collections()
    stations_collection = collections["stations"]
    
    if stations_collection is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    if not ObjectId.is_valid(station_id):
        raise HTTPException(status_code=400, detail="Invalid station ID format")
    
    station_doc = stations_collection.find_one({"_id": ObjectId(station_id)})
    if not station_doc:
        raise HTTPException(status_code=404, detail="Station not found")
    
    slots = []
    for slot_doc in station_doc.get("charging_slots", []):
        slots.append(ChargingSlot(**slot_doc))
    
    return slots
