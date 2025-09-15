#!/usr/bin/env python3
"""
EV Booking App Backend Runner
Comprehensive solution that works around Python environment issues
"""

import sys
import os
import subprocess
from pathlib import Path

def find_working_python():
    """Find a working Python installation"""
    possible_pythons = [
        "python",
        "py",
        "python3",
        "python.exe",
        "py.exe",
        r"C:\Python311\python.exe",
        r"C:\Python310\python.exe",
        r"C:\Users\Siddharth\AppData\Local\Programs\Python\Python311\python.exe",
        r"C:\Users\Siddharth\AppData\Local\Programs\Python\Python310\python.exe",
    ]
    
    for python_cmd in possible_pythons:
        try:
            result = subprocess.run([python_cmd, "--version"], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print(f"✅ Found working Python: {python_cmd}")
                print(f"   Version: {result.stdout.strip()}")
                return python_cmd
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    return None

def install_dependencies(python_cmd):
    """Install dependencies using the working Python"""
    requirements = [
        "fastapi",
        "uvicorn[standard]", 
        "pymongo",
        "python-dotenv",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart"
    ]
    
    print("📦 Installing dependencies...")
    for package in requirements:
        try:
            print(f"   Installing {package}...")
            result = subprocess.run([python_cmd, "-m", "pip", "install", package], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"   ✅ {package} installed")
            else:
                print(f"   ⚠️  {package} failed: {result.stderr[:100]}")
        except Exception as e:
            print(f"   ❌ {package} error: {e}")

def check_imports(python_cmd):
    """Test if all required imports work"""
    test_script = '''
import sys
import os
sys.path.append(".")
sys.path.append("app")

try:
    import fastapi
    import uvicorn
    import pymongo
    from dotenv import load_dotenv
    print("SUCCESS: All imports working")
except ImportError as e:
    print(f"IMPORT_ERROR: {e}")
except Exception as e:
    print(f"ERROR: {e}")
'''
    
    try:
        result = subprocess.run([python_cmd, "-c", test_script], 
                              capture_output=True, text=True, cwd=Path.cwd())
        print("🧪 Import test result:")
        print(f"   {result.stdout.strip()}")
        return "SUCCESS" in result.stdout
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def run_server(python_cmd):
    """Run the FastAPI server"""
    print("\n🚀 Starting EV Booking App Backend...")
    print("🌐 Server will be available at:")
    print("   - http://localhost:8000")
    print("   - http://192.168.0.234:8000")
    print("   - API Docs: http://localhost:8000/docs")
    print("-" * 50)
    
    # Create a simple uvicorn command
    try:
        os.chdir("app")
        env = os.environ.copy()
        env["PYTHONPATH"] = ".."
        
        # Run uvicorn directly
        subprocess.run([
            python_cmd, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], env=env)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        
        # Fallback: try running the simple_start.py
        print("\n🔄 Trying fallback method...")
        try:
            subprocess.run([python_cmd, "simple_start.py"])
        except Exception as e2:
            print(f"❌ Fallback also failed: {e2}")

def main():
    """Main function"""
    print("🔧 EV Booking App Backend Setup & Runner")
    print("=" * 50)
    
    # Find working Python
    python_cmd = find_working_python()
    if not python_cmd:
        print("❌ No working Python installation found!")
        print("💡 Please install Python from https://python.org")
        return False
    
    # Install dependencies
    install_dependencies(python_cmd)
    
    # Test imports
    if not check_imports(python_cmd):
        print("⚠️  Some imports failed, but trying to run anyway...")
    
    # Run server
    run_server(python_cmd)
    
    return True

if __name__ == "__main__":
    main()
