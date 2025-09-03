"""
EV Slot Booking API - Entry Point
Refactored application with improved structure
"""

from app.main import app

# This is the new entry point for the refactored application
# Run with: uvicorn main_new:app --reload

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
