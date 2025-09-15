#!/usr/bin/env python3
"""
EV Booking App Environment Setup Script
Comprehensive setup for all dependencies and configuration
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()[:200]}")
            return True
        else:
            print(f"❌ {description} - Failed")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()[:200]}")
            return False
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def install_python_dependencies():
    """Install all required Python dependencies"""
    packages = [
        "fastapi==0.116.1",
        "uvicorn[standard]==0.35.0", 
        "pymongo==4.15.0",
        "python-dotenv==1.1.1",
        "python-jose[cryptography]==3.5.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.20",
        "pydantic==2.11.9",
        "dnspython==2.8.0"
    ]
    
    print("📦 Installing Python dependencies...")
    success_count = 0
    
    for package in packages:
        if run_command(f'python -m pip install "{package}"', f"Installing {package.split('==')[0]}"):
            success_count += 1
    
    print(f"\n📊 Installation Summary: {success_count}/{len(packages)} packages installed")
    return success_count == len(packages)

def create_config_file():
    """Create config.env if it doesn't exist"""
    config_path = Path("app/config.env")
    
    if config_path.exists():
        print("✅ config.env already exists")
        return True
    
    config_content = """# EV Booking App Configuration
MONGO_URI=mongodb+srv://ev_admin:test123@ev0.c3vgduu.mongodb.net/?retryWrites=true&w=majority&appName=EV0
SECRET_KEY=ev-booking-app-super-secret-key-2024-mumbai
RAZORPAY_KEY_ID=rzp_test_RELMDjsWd8Rgxq
RAZORPAY_KEY_SECRET=uAh776qtksqgTOUZcsa4YY1c
OCM_API_KEY=58cdb5ec-a372-4b95-a46f-80fdbcc40d62
"""
    
    try:
        config_path.write_text(config_content)
        print("✅ Created config.env file")
        return True
    except Exception as e:
        print(f"❌ Failed to create config.env: {e}")
        return False

def test_imports():
    """Test if all imports work"""
    print("\n🧪 Testing imports...")
    
    test_script = '''
import sys
sys.path.append("app")

try:
    import pymongo
    import fastapi
    import uvicorn
    from dotenv import load_dotenv
    from jose import jwt
    from passlib.context import CryptContext
    print("SUCCESS: All imports working")
except ImportError as e:
    print(f"IMPORT_ERROR: {e}")
except Exception as e:
    print(f"ERROR: {e}")
'''
    
    return run_command(f'python -c "{test_script}"', "Testing imports")

def get_network_info():
    """Get network information"""
    network_script = '''
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    local_ip = s.getsockname()[0]
    s.close()
    print(f"LOCAL_IP: {local_ip}")
except Exception as e:
    print(f"NETWORK_ERROR: {e}")
'''
    
    result = subprocess.run(f'python -c "{network_script}"', shell=True, capture_output=True, text=True)
    if result.returncode == 0 and "LOCAL_IP:" in result.stdout:
        return result.stdout.split("LOCAL_IP: ")[1].strip()
    return "127.0.0.1"

def create_run_script():
    """Create a simple run script"""
    local_ip = get_network_info()
    
    script_content = f'''#!/usr/bin/env python3
"""
EV Booking App - Simple Startup Script
"""

import os
import sys
from pathlib import Path

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# Change to app directory
os.chdir(app_dir)

print("🚀 Starting EV Booking App Server...")
print(f"🌐 Local IP: {local_ip}")
print(f"📱 Frontend should connect to: http://{local_ip}:8000")
print(f"🔗 API Documentation: http://{local_ip}:8000/docs")
print("-" * 50)

try:
    import uvicorn
    from main import app
    
    # Start server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
except KeyboardInterrupt:
    print("\\n🛑 Server stopped")
except ImportError as e:
    print(f"❌ Import error: {{e}}")
    print("💡 Run: python setup_environment.py")
except Exception as e:
    print(f"❌ Server error: {{e}}")
'''
    
    try:
        Path("run_server.py").write_text(script_content)
        print(f"✅ Created run_server.py (Local IP: {local_ip})")
        return True
    except Exception as e:
        print(f"❌ Failed to create run_server.py: {e}")
        return False

def main():
    """Main setup function"""
    print("🔧 EV Booking App Environment Setup")
    print("=" * 50)
    
    steps = [
        ("Installing Python dependencies", install_python_dependencies),
        ("Creating config file", create_config_file),
        ("Testing imports", test_imports),
        ("Creating run script", create_run_script),
    ]
    
    success_count = 0
    for step_name, step_func in steps:
        if step_func():
            success_count += 1
        else:
            print(f"⚠️  {step_name} failed - continuing anyway...")
    
    print(f"\n📋 Setup Summary: {success_count}/{len(steps)} steps completed")
    
    if success_count >= 3:  # Most steps successful
        print("\n🎉 Setup completed successfully!")
        print("\n💡 Next steps:")
        print("   1. Run: python run_server.py")
        print("   2. Update frontend config with your local IP")
        print("   3. Test the connection")
    else:
        print("\n⚠️  Setup had issues. Try manual installation:")
        print("   pip install fastapi uvicorn pymongo python-dotenv")

if __name__ == "__main__":
    main()
