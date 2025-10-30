#!/bin/bash

# Quick IP Fix Script for EV Charging App
# This script automatically updates your IP address in the config and restarts the app

echo "🔧 EV App IP Fix Script"
echo "======================="
echo ""

# Get current IP
CURRENT_IP=$(hostname -I | awk '{print $1}')
echo "📍 Detected IP Address: $CURRENT_IP"
echo ""

# Check if backend is running
if ps aux | grep -E "uvicorn.*main:app" | grep -v grep > /dev/null; then
    echo "✅ Backend server is running on port 8000"
else
    echo "❌ Backend server is NOT running!"
    echo "   Starting backend..."
    cd /home/arya-manjardekar/Desktop/ev_app
    source venv/bin/activate
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    sleep 3
    echo "✅ Backend started"
fi
echo ""

# Test if backend is accessible
echo "🧪 Testing backend connection..."
if curl -s http://$CURRENT_IP:8000/docs > /dev/null; then
    echo "✅ Backend is accessible at http://$CURRENT_IP:8000"
else
    echo "❌ Cannot reach backend at http://$CURRENT_IP:8000"
    echo "   Please check if:"
    echo "   1. Backend is running: ps aux | grep uvicorn"
    echo "   2. Port 8000 is open: sudo ufw allow 8000"
    exit 1
fi
echo ""

# Update IP in config
echo "📝 Updating frontend configuration..."
cd /home/arya-manjardekar/Desktop/ev_app/frontend

# Run the update script
if [ -f "scripts/update-ip.js" ]; then
    node scripts/update-ip.js
else
    echo "⚠️  Update script not found, manually updating config..."
    sed -i "s|http://[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}:8000|http://$CURRENT_IP:8000|g" src/constants/config.ts
    echo "✅ Updated config.ts"
fi
echo ""

# Kill existing Expo processes
echo "🔄 Stopping existing Expo processes..."
pkill -f "expo start" 2>/dev/null
sleep 2
echo ""

# Clear caches
echo "🗑️  Clearing caches..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "✅ Caches cleared"
echo ""

# Restart Expo with clear cache
echo "🚀 Starting Expo with fresh cache..."
echo "   (This will open in a new window)"
echo ""
echo "📱 Next steps:"
echo "   1. Wait for QR code to appear"
echo "   2. Scan QR code with Expo Go app"
echo "   3. Or press 'r' in the Expo terminal to reload"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

npx expo start --clear

echo ""
echo "✨ Done! Your app should now connect to http://$CURRENT_IP:8000"

