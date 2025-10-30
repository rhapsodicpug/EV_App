# IP Address Configuration Guide for EV Charging App

## 🔴 Why This Error Happens

### The Problem:
When you develop React Native apps locally, the frontend (mobile app) needs to connect to your backend server. Your backend runs on your computer's IP address, but this IP address can change when:

1. **You connect to a different WiFi network**
2. **Your router reassigns IP addresses (DHCP lease renewal)**
3. **You switch between WiFi and Ethernet**
4. **Your ISP changes your network configuration**

### Why it breaks:
- The frontend is hardcoded with an IP address (e.g., `http://192.168.1.13:8000`)
- When your IP changes to something else (e.g., `10.80.0.142`), the app still tries to connect to the OLD IP
- This causes: `Network Error` / `AxiosError: Network Error`

---

## 🛠️ How to Fix This Manually (Step-by-Step)

### Method 1: Quick Fix (Automated Script)

1. **Open Terminal** in the project root:
   ```bash
   cd /home/arya-manjardekar/Desktop/ev_app
   ```

2. **Run the IP update script**:
   ```bash
   cd frontend
   node scripts/update-ip.js
   ```

3. **Clear cache and restart Expo**:
   ```bash
   npx expo start --clear
   ```

4. **Reload your app**:
   - Press `r` in the Expo terminal
   - Or shake your phone and select "Reload"

---

### Method 2: Manual Fix (If script doesn't work)

#### Step 1: Find Your Current IP Address

**On Linux/Mac:**
```bash
hostname -I | awk '{print $1}'
```
OR
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1
```

**On Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

#### Step 2: Update the Config File

1. Open: `frontend/src/constants/config.ts`

2. Find this section (around line 13-15):
   ```typescript
   BASE_URL: isDev
     ? 'http://192.168.1.13:8000'  // <- CHANGE THIS
     : 'https://your-production-api.com',
   ```

3. Replace `192.168.1.13` with your NEW IP address:
   ```typescript
   BASE_URL: isDev
     ? 'http://10.80.0.142:8000'  // <- YOUR NEW IP
     : 'https://your-production-api.com',
   ```

#### Step 3: Clear All Caches

```bash
cd frontend

# Clear Metro bundler cache
rm -rf .expo
rm -rf node_modules/.cache

# Clear watchman cache (if installed)
watchman watch-del-all

# Restart with clear cache
npx expo start --clear
```

#### Step 4: Verify Backend is Running

```bash
# Check if backend is accessible
curl http://YOUR_IP:8000/docs

# Example:
curl http://10.80.0.142:8000/docs
```

If you see HTML output, the backend is working! ✅

#### Step 5: Reload the App

**In Expo Terminal:**
- Press `r` to reload

**On Your Phone:**
- Shake the device
- Select "Reload"
- Or close and reopen the app

---

## 🚀 Permanent Solution (Recommended)

To avoid this issue in the future, you have two options:

### Option A: Use a Static IP Address

Set your computer to use a static IP address instead of DHCP:

1. **On Linux:**
   ```bash
   # Edit network configuration
   sudo nano /etc/netplan/01-netcfg.yaml
   ```
   
   Add:
   ```yaml
   network:
     version: 2
     ethernets:
       eth0:
         dhcp4: no
         addresses: [192.168.1.100/24]
         gateway4: 192.168.1.1
         nameservers:
           addresses: [8.8.8.8, 8.8.4.4]
   ```
   
   Apply:
   ```bash
   sudo netplan apply
   ```

2. **On Windows/Mac:**
   - Go to Network Settings
   - Change from DHCP to Static IP
   - Set a fixed IP (e.g., 192.168.1.100)

### Option B: Use Environment Variables (Best Practice)

1. Create `frontend/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://10.80.0.142:8000
   ```

2. Update `frontend/src/constants/config.ts`:
   ```typescript
   import Constants from 'expo-constants';
   
   const API_BASE_URL = 
     Constants.expoConfig?.extra?.apiUrl || 
     process.env.EXPO_PUBLIC_API_URL ||
     'http://10.80.0.142:8000';  // fallback
   
   export const API_CONFIG = {
     BASE_URL: API_BASE_URL,
     // ... rest of config
   };
   ```

3. Update `frontend/app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://10.80.0.142:8000"
       }
     }
   }
   ```

4. Now you only need to update `.env` or `app.json` when IP changes!

---

## 🔍 Troubleshooting Checklist

If you still see "Network Error" after updating:

- [ ] **Backend is running?**
  ```bash
  ps aux | grep uvicorn
  ```

- [ ] **IP address is correct?**
  ```bash
  hostname -I | awk '{print $1}'
  ```

- [ ] **Backend is accessible?**
  ```bash
  curl http://YOUR_IP:8000/docs
  ```

- [ ] **Config file updated?**
  ```bash
  cat frontend/src/constants/config.ts | grep BASE_URL
  ```

- [ ] **Cache cleared?**
  ```bash
  cd frontend && npx expo start --clear
  ```

- [ ] **App reloaded?**
  - Press `r` in Expo terminal
  - Or shake phone → "Reload"

- [ ] **Firewall blocking?**
  ```bash
  sudo ufw status
  # If active, allow port 8000:
  sudo ufw allow 8000
  ```

- [ ] **Phone on same WiFi network as computer?**
  - Check your phone's WiFi settings
  - Must be on same network (e.g., both on "Home WiFi")

---

## 📝 Quick Reference Commands

```bash
# 1. Get current IP
hostname -I | awk '{print $1}'

# 2. Update IP automatically
cd frontend && node scripts/update-ip.js

# 3. Clear cache and restart
cd frontend && npx expo start --clear

# 4. Test backend
curl http://$(hostname -I | awk '{print $1}'):8000/docs

# 5. Check backend process
ps aux | grep uvicorn

# 6. Restart backend (if needed)
cd /home/arya-manjardekar/Desktop/ev_app
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 💡 Pro Tip

Add this alias to your `~/.bashrc` or `~/.zshrc` for quick IP updates:

```bash
alias fix-ev-ip='cd /home/arya-manjardekar/Desktop/ev_app/frontend && node scripts/update-ip.js && npx expo start --clear'
```

Then just run:
```bash
fix-ev-ip
```

---

## 📞 Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Network Error` | Wrong IP in config | Update IP and restart |
| `ECONNREFUSED` | Backend not running | Start backend server |
| `ETIMEDOUT` | Firewall/Different network | Check firewall, verify same WiFi |
| `undefined /token undefined` | Config not loaded | Clear cache: `expo start --clear` |
| `Cannot connect to 192.168.1.13` | Old IP cached | Force reload app (shake → reload) |

---

**Last Updated:** Based on current IP `10.80.0.142`  
**Backend Port:** 8000  
**Frontend Config:** `frontend/src/constants/config.ts`

