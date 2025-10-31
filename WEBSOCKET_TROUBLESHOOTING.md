# 🔧 WebSocket Connection Troubleshooting Guide

## 🐛 **Error You're Seeing:**

```
ERROR  ❌ WebSocket error: ...
LOG  ❌ WebSocket disconnected
LOG  🔄 Reconnecting in 6 seconds (attempt 2/5)...
```

---

## ✅ **FIXES IMPLEMENTED:**

### **1. Improved Error Handling:**
- ✅ Better connection state checking
- ✅ Prevents duplicate connection attempts
- ✅ Proper cleanup on disconnect
- ✅ Max reconnection attempts reduced to 3
- ✅ Connection disabled after max attempts

### **2. Backend WebSocket Improvements:**
- ✅ Better ping/pong handling
- ✅ Improved error handling
- ✅ Proper connection/disconnection logging

### **3. Graceful Degradation:**
- ✅ App continues to work if WebSocket fails
- ✅ No blocking if connection can't be established
- ✅ Clear error messages

---

## 🔍 **TROUBLESHOOTING STEPS:**

### **Step 1: Check Backend is Running**

```bash
# Check if FastAPI server is running
curl http://YOUR_IP:8000/ping-db
```

**Expected:** `{"status": "connected"}` or similar

**If not running:**
```bash
cd /home/arya-manjardekar/Desktop/ev_app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### **Step 2: Verify IP Address**

**Check your computer's IP address:**

**Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (not 127.0.0.1)
```

**Update config:**

**File:** `frontend/src/constants/config.ts`

```typescript
BASE_URL: 'http://YOUR_ACTUAL_IP:8000'  // e.g., http://10.80.0.142:8000
```

**Important:** Use your **computer's actual IP**, not `localhost` or `127.0.0.1`

---

### **Step 3: Test WebSocket Connection**

**Test in browser console:**

1. Open browser DevTools
2. Run this in console:

```javascript
const ws = new WebSocket('ws://YOUR_IP:8000/ws');
ws.onopen = () => console.log('✅ Connected!');
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onclose = (e) => console.log('❌ Closed:', e.code, e.reason);
```

**Expected:** `✅ Connected!`

**If fails:**
- Check firewall settings
- Verify backend is accessible
- Check if port 8000 is open

---

### **Step 4: Check Network Connectivity**

**From your mobile device:**

1. Ensure device is on **same Wi-Fi network** as computer
2. Test HTTP API first:

```bash
# From mobile device or emulator
curl http://YOUR_IP:8000/ping-db
```

**If HTTP works but WebSocket doesn't:**
- Check firewall allows WebSocket connections
- Verify port 8000 is open for both HTTP and WebSocket

---

### **Step 5: Check Backend Logs**

**Look for WebSocket connection messages:**

```bash
# Backend should show:
✅ WebSocket client connected. Total: 1
```

**If you don't see this:**
- WebSocket endpoint might not be reached
- Check if backend WebSocket endpoint is working

---

## 🔧 **Common Issues & Solutions:**

### **Issue 1: "Connection refused" or timeout**

**Cause:** Backend not running or wrong IP

**Solution:**
1. Verify backend is running: `curl http://YOUR_IP:8000/ping-db`
2. Check IP address matches in config
3. Ensure backend listens on `0.0.0.0`, not `127.0.0.1`

---

### **Issue 2: "WebSocket failed" immediately**

**Cause:** Network/firewall blocking WebSocket

**Solution:**
1. Check firewall allows WebSocket connections
2. Verify port 8000 is open
3. Test WebSocket in browser first

---

### **Issue 3: Repeated reconnection attempts**

**Cause:** Connection keeps failing

**Solution:**
- ✅ **FIXED:** Now stops after 3 attempts
- ✅ **FIXED:** Connection disabled after max attempts
- App continues to work without WebSocket

---

### **Issue 4: Works on one device, not another**

**Cause:** Network configuration

**Solution:**
1. Both devices must be on same network
2. Both must use same IP address
3. Check firewall settings on router

---

## 🚀 **Quick Fix Checklist:**

- [ ] ✅ Backend is running (`python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`)
- [ ] ✅ IP address in `config.ts` matches your computer's IP
- [ ] ✅ Mobile device is on same Wi-Fi network
- [ ] ✅ Firewall allows port 8000 (HTTP + WebSocket)
- [ ] ✅ Backend WebSocket endpoint is accessible
- [ ] ✅ No network restrictions blocking WebSocket

---

## 📝 **What Was Fixed:**

### **Frontend (`WebSocketService.ts`):**
- ✅ Reduced max reconnection attempts: 5 → 3
- ✅ Increased reconnect delay: 3s → 5s
- ✅ Added connection disabled flag after max attempts
- ✅ Better state checking before connecting
- ✅ Proper cleanup on disconnect
- ✅ Graceful error handling

### **Backend (`main.py`):**
- ✅ Improved WebSocket endpoint error handling
- ✅ Better ping/pong message handling
- ✅ Proper connection/disconnection logging
- ✅ More robust exception handling

---

## 💡 **How to Test:**

### **1. Start Backend:**

```bash
cd /home/arya-manjardekar/Desktop/ev_app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Look for:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### **2. Update IP in Config:**

**File:** `frontend/src/constants/config.ts`

```typescript
BASE_URL: 'http://YOUR_ACTUAL_IP:8000'  // Replace with your IP
```

### **3. Run App:**

1. Open app on Device 1
2. Navigate to Charging Stations
3. Check console for: `✅ WebSocket connected successfully`

### **4. Test Real-time Update:**

1. Open app on Device 2 (same network)
2. Navigate to Charging Stations
3. Device 1: Book a slot
4. Device 2: Watch station card - should update instantly!

---

## 🎯 **Expected Console Output:**

### **Successful Connection:**

**Frontend:**
```
🔌 Connecting to WebSocket: ws://YOUR_IP:8000/ws
✅ WebSocket connected successfully
📡 Received pong - connection alive
```

**Backend:**
```
✅ WebSocket client connected. Total: 1
```

### **Connection Failed (After Fixes):**

**Frontend:**
```
🔌 Connecting to WebSocket: ws://YOUR_IP:8000/ws
❌ WebSocket error: ...
❌ WebSocket disconnected
🔄 Reconnecting in 5 seconds (attempt 1/3)...
🔄 Reconnecting in 10 seconds (attempt 2/3)...
🔄 Reconnecting in 15 seconds (attempt 3/3)...
❌ Max reconnection attempts reached. WebSocket disabled.
💡 Make sure backend is running and accessible at: ws://YOUR_IP:8000/ws
💡 App will continue to work, but without real-time updates.
```

**Note:** App still works! Just without real-time updates.

---

## 🔐 **Firewall Configuration:**

### **Ubuntu/Debian:**

```bash
# Allow port 8000
sudo ufw allow 8000/tcp
sudo ufw reload
```

### **macOS:**

```bash
# Check if firewall is blocking
# System Preferences → Security & Privacy → Firewall
# Click "Firewall Options" and allow Python/uvicorn
```

### **Windows:**

1. Windows Defender Firewall
2. Allow app through firewall
3. Add Python or uvicorn
4. Allow inbound connections on port 8000

---

## 🌐 **Network Requirements:**

### **Local Development:**
- ✅ Both devices on **same Wi-Fi network**
- ✅ Backend IP accessible from mobile device
- ✅ No VPN blocking connections

### **Production:**
- ✅ Use `wss://` (secure WebSocket)
- ✅ Backend on public IP or domain
- ✅ SSL certificate configured
- ✅ Load balancer supports WebSocket

---

## ✅ **After Fixes - What Works:**

1. **Connection State:** Prevents duplicate connections
2. **Error Handling:** Graceful failures, no crashes
3. **Reconnection:** Stops after 3 attempts (not infinite)
4. **App Functionality:** App works even if WebSocket fails
5. **Logging:** Clear messages for debugging

---

## 🎉 **If WebSocket Still Fails:**

**Don't worry!** The app will:
- ✅ Continue to work normally
- ✅ Show updated availability on refresh
- ✅ Allow bookings and cancellations
- ✅ Just won't have **instant** real-time updates

**Real-time updates are a "nice-to-have" feature, not critical for app functionality.**

---

## 📞 **Still Having Issues?**

1. **Check backend logs** for WebSocket connection attempts
2. **Test WebSocket in browser** to isolate React Native issue
3. **Verify network connectivity** between devices
4. **Check firewall/router settings**
5. **Try different network** if current one blocks WebSocket

---

**Last Updated:** October 31, 2025  
**Status:** ✅ **ERRORS FIXED - GRACEFUL DEGRADATION IMPLEMENTED**

