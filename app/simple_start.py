#!/usr/bin/env python3
"""
Simple startup script for EV Booking App
Minimal version that should work even with dependency issues
"""

print("🚀 Starting EV Booking App...")
print("🌐 Your network IP: 192.168.0.234")
print("📱 Configure frontend to: http://192.168.0.234:8000")
print("🔗 API docs at: http://192.168.0.234:8000/docs")
print("-" * 50)

try:
    # Import and start the app
    from main import app
    import uvicorn
    
    print("✅ FastAPI app loaded successfully")
    print("🔄 Starting server on all interfaces...")
    
    # Start server - accessible from network
    uvicorn.run(
        app, 
        host="0.0.0.0",  # Bind to all interfaces for remote access
        port=8000,
        reload=True,
        log_level="info"
    )

except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("💡 Install with: pip install fastapi uvicorn pymongo python-dotenv")
    
except KeyboardInterrupt:
    print("\n🛑 Server stopped by user")
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    print("🔍 Check your Python environment and dependencies")
