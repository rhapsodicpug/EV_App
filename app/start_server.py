#!/usr/bin/env python3
"""
EV Booking App Server Startup Script
Enhanced with connectivity testing and proper error handling
"""

import os
import sys
import time
import asyncio
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

def test_dependencies():
    """Test if all required dependencies are available"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'pymongo',
        'dotenv',
        'jose',
        'passlib'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} - OK")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - MISSING")
    
    return missing_packages

def test_environment():
    """Test environment configuration"""
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv('config.env')
    
    mongo_uri = os.getenv('MONGO_URI')
    if mongo_uri:
        print("✅ MONGO_URI - OK")
        # Hide password in logs
        safe_uri = mongo_uri.replace(mongo_uri.split('@')[0].split('//')[-1], '***:***')
        print(f"🔗 MongoDB URI: {safe_uri}")
    else:
        print("❌ MONGO_URI - MISSING")
        return False
    
    return True

def test_database_connection():
    """Test MongoDB connectivity"""
    try:
        from db.database import connect_to_mongo, get_database
        
        print("\n🔍 Testing database connection...")
        connect_to_mongo()
        
        db = get_database()
        if db is not None:
            print("✅ Database connection - OK")
            return True
        else:
            print("❌ Database connection - FAILED")
            return False
            
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def get_local_ip():
    """Get the local IP address"""
    import socket
    try:
        # Connect to Google DNS to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def main():
    """Main startup function"""
    print("🚀 EV Booking App Server Startup")
    print("=" * 50)
    
    # Test dependencies
    print("\n📦 Checking dependencies...")
    missing = test_dependencies()
    if missing:
        print(f"\n❌ Missing packages: {missing}")
        print("💡 Install with: pip install -r requirements.txt")
        return False
    
    # Test environment
    print("\n🔧 Checking environment...")
    if not test_environment():
        print("❌ Environment configuration failed")
        return False
    
    # Test database
    db_ok = test_database_connection()
    if not db_ok:
        print("⚠️  Database connection failed - server will run in limited mode")
    
    # Get network info
    local_ip = get_local_ip()
    print(f"\n🌐 Network Configuration:")
    print(f"   Local IP: {local_ip}")
    print(f"   Server will bind to: 0.0.0.0:8000")
    print(f"   Access URLs:")
    print(f"     - Local: http://localhost:8000")
    print(f"     - Local IP: http://{local_ip}:8000")
    print(f"     - Network: http://0.0.0.0:8000")
    
    # Start server
    print("\n🎯 Starting FastAPI server...")
    print("📝 Logs will appear below:")
    print("-" * 50)
    
    try:
        import uvicorn
        from main import app
        
        # Run with enhanced configuration
        uvicorn.run(
            app,
            host="0.0.0.0",  # Bind to all interfaces
            port=8000,
            reload=True,     # Auto-reload on changes
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Server stopped by user")
    except Exception as e:
        print(f"\n\n❌ Server error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
