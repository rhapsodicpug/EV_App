"""
EV Slot Booking API - Main Application
Refactored with APIRouter for better organization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.database import connect_to_mongo, close_connection
from app.routers import stations, bookings
from app.routers.auth import routers as auth_routers

# Application metadata
app_metadata = {
    "title": "EV Slot Booking API",
    "description": """
    ## EV Charging Slot Booking System for Mumbai
    
    A comprehensive API for managing EV charging station bookings with the following features:
    
    ### 🔐 **Authentication**
    - User registration and login
    - JWT token-based authentication
    - Secure password hashing
    
    ### 🏢 **Station Management**
    - CRUD operations for EV charging stations
    - Geospatial queries for nearby stations
    - Search and filter capabilities
    
    ### 📅 **Booking System**
    - Create and manage charging slot bookings
    - Conflict detection for overlapping bookings
    - Time validation and cost calculation
    
    ### 🗺️ **Location Features**
    - Find stations within radius
    - Filter by city, pincode, charger type
    - 24/7 availability filtering
    
    Built with FastAPI, MongoDB, and modern Python practices.
    """,
    "version": "2.0.0",
    "contact": {
        "name": "EV Booking API Support",
        "email": "support@evbooking.com",
    },
    "license_info": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    connect_to_mongo()
    yield
    # Shutdown
    close_connection()

# Create FastAPI application
app = FastAPI(
    lifespan=lifespan,
    **app_metadata
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to the EV Slot Booking API!",
        "version": "2.0.0",
        "docs": "/docs",
        "features": [
            "User Authentication",
            "Station Management", 
            "Booking System",
            "Geospatial Queries"
        ]
    }

# Health check endpoint
@app.get("/ping-db", tags=["health"])
async def ping_database():
    """Database health check"""
    from app.db.database import get_database
    
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        # Simple ping to check database
        db.command("ping")
        return {
            "status": "success",
            "message": "Database connection is healthy.",
            "database": db.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Include routers
app.include_router(stations.router)
app.include_router(bookings.router)

# Legacy booking endpoints for backward compatibility
@app.post("/bookings/")
async def bookings_legacy():
    """Redirect to new booking endpoint"""
    raise HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /api/bookings/"
    )

@app.get("/bookings/")
async def bookings_get_legacy():
    """Redirect to new booking endpoint"""
    raise HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /api/bookings/my-bookings"
    )

# Include auth routers
for auth_router in auth_routers:
    app.include_router(auth_router)

# Legacy endpoints for backward compatibility
@app.post("/register")
async def register_legacy():
    """Redirect to new auth endpoint"""
    raise HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /auth/register"
    )

@app.post("/token")
async def token_legacy():
    """Redirect to new auth endpoint"""
    raise HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /auth/token"
    )

@app.get("/users/me")
async def users_me_legacy():
    """Redirect to new auth endpoint"""
    raise HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /users/me"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
