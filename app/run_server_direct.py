#!/usr/bin/env python3
"""
Direct server runner for EV Booking App
Fixes import path issues and runs the server directly
"""

import sys
import os
from pathlib import Path

# Add parent directory to Python path for imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))
sys.path.insert(0, str(current_dir))

# Set environment variables
os.environ.setdefault('PYTHONPATH', str(parent_dir))

def test_imports():
    """Test if all required modules can be imported"""
    try:
        print("🧪 Testing imports...")
        
        # Test basic FastAPI
        import fastapi
        print("✅ FastAPI imported")
        
        # Test uvicorn
        import uvicorn
        print("✅ Uvicorn imported")
        
        # Test database modules
        try:
            from db.database import connect_to_mongo, get_database
            print("✅ Database module imported")
        except ImportError as e:
            print(f"⚠️  Database import issue: {e}")
        
        # Test app models with fallback
        try:
            from app.models import EVStation
            print("✅ App models imported (absolute)")
        except ImportError:
            try:
                from models import EVStation
                print("✅ Models imported (relative)")
            except ImportError as e:
                print(f"⚠️  Models import issue: {e}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def create_simple_app():
    """Create a simple FastAPI app if full app fails"""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(
        title="EV Booking API (Simple Mode)",
        description="EV Charging Slot Booking System - Running in simple mode",
        version="1.0.0"
    )
    
    # Add CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    def read_root():
        return {
            "message": "EV Booking API is running in simple mode",
            "status": "ok",
            "docs": "/docs"
        }
    
    @app.get("/health")
    def health_check():
        return {"status": "healthy", "mode": "simple"}
    
    return app

def run_server():
    """Run the server with proper configuration"""
    print("\n🚀 Starting EV Booking App Backend...")
    
    # Test imports first
    imports_ok = test_imports()
    
    if imports_ok:
        try:
            # Try to import the full application
            from main import app
            print("✅ Full application loaded successfully")
        except Exception as e:
            print(f"⚠️  Full app failed: {e}")
            print("🔄 Creating simple app...")
            app = create_simple_app()
    else:
        print("🔄 Creating simple app due to import issues...")
        app = create_simple_app()
    
    # Network information
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "127.0.0.1"
    
    print(f"\n🌐 Server Configuration:")
    print(f"   Local IP: {local_ip}")
    print(f"   Binding to: 0.0.0.0:8000")
    print(f"\n📱 Access URLs:")
    print(f"   - Localhost: http://localhost:8000")
    print(f"   - Network: http://{local_ip}:8000")
    print(f"   - API Docs: http://{local_ip}:8000/docs")
    print(f"\n🔧 Frontend Configuration:")
    print(f"   Update frontend BASE_URL to: http://{local_ip}:8000")
    print("-" * 60)
    
    # Start server
    try:
        import uvicorn
        uvicorn.run(
            app,
            host="0.0.0.0",  # Bind to all interfaces
            port=8000,
            reload=False,    # Disable reload to avoid path issues
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    run_server()
