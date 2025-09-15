#!/usr/bin/env python3
"""
Connection Test Script for EV Booking App
Tests database connectivity and server functionality
"""

import os
import sys
import time
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

def test_imports():
    """Test all required imports"""
    print("🔍 Testing imports...")
    try:
        import pymongo
        import dotenv
        import fastapi
        import uvicorn
        from db.database import connect_to_mongo, get_database
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_environment():
    """Test environment variables"""
    print("\n🔍 Testing environment...")
    from dotenv import load_dotenv
    
    load_dotenv('config.env')
    
    mongo_uri = os.getenv('MONGO_URI')
    if mongo_uri:
        print("✅ MONGO_URI loaded")
        # Show safe version of URI
        if '@' in mongo_uri:
            parts = mongo_uri.split('@')
            safe_uri = parts[0].split('//')[0] + '//***:***@' + parts[1]
        else:
            safe_uri = mongo_uri[:30] + '...'
        print(f"🔗 URI: {safe_uri}")
        return True
    else:
        print("❌ MONGO_URI not found")
        return False

def test_database():
    """Test database connectivity"""
    print("\n🔍 Testing database connection...")
    try:
        from db.database import connect_to_mongo, get_database
        
        connect_to_mongo()
        db = get_database()
        
        if db is not None:
            # Test a simple operation
            collections = list(db.list_collection_names())
            print(f"✅ Database connected successfully")
            print(f"📊 Available collections: {collections}")
            return True
        else:
            print("❌ Database connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_server_startup():
    """Test if server can start"""
    print("\n🔍 Testing server startup...")
    try:
        from main import app
        print("✅ FastAPI app loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Server startup error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 EV Booking App Connection Tests")
    print("=" * 50)
    
    tests = [
        ("Imports", test_imports),
        ("Environment", test_environment),
        ("Database", test_database),
        ("Server", test_server_startup),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📋 Test Summary:")
    print("-" * 30)
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:12} : {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Server should work correctly.")
        print("\n💡 Next steps:")
        print("   1. Run: python start_server.py")
        print("   2. Test frontend connection to http://192.168.0.234:8000")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\n💡 Common fixes:")
        print("   - Install dependencies: pip install -r requirements.txt")
        print("   - Check config.env file exists and has MONGO_URI")
        print("   - Verify internet connection")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
