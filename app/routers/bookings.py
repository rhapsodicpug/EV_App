"""
Booking-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models import (
    Booking, BookingCreate, BookingUpdate, BookingResponse, BookingStatus
)
from app.core.auth import get_current_active_user
from app.db.database import get_collections

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new booking for an EV charging slot"""
    collections = get_collections()
    bookings_collection = collections["bookings"]
    stations_collection = collections["stations"]
    users_collection = collections["users"]
    
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

@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(
    current_user: dict = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 50,
    status: Optional[BookingStatus] = None
):
    """Get all bookings for the current user"""
    collections = get_collections()
    bookings_collection = collections["bookings"]
    users_collection = collections["users"]
    
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

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific booking by ID"""
    collections = get_collections()
    bookings_collection = collections["bookings"]
    users_collection = collections["users"]
    
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

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    booking_update: BookingUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update a booking"""
    collections = get_collections()
    bookings_collection = collections["bookings"]
    users_collection = collections["users"]
    
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

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Cancel a booking"""
    collections = get_collections()
    bookings_collection = collections["bookings"]
    users_collection = collections["users"]
    
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
