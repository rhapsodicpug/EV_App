"""
Simple EV Slot Booking API - Minimal version for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="EV Slot Booking API",
    description="A simple EV charging slot booking system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "🚗⚡ Welcome to the EV Slot Booking API!",
        "version": "1.0.0",
        "status": "running",
        "docs": "http://127.0.0.1:8001/docs",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "api_info": "/"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check"""
    return {
        "status": "healthy",
        "message": "API is running successfully"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting EV Slot Booking API...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
