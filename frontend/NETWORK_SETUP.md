# Network Setup Guide

## 🔧 API Configuration

The app connects to the backend API using your machine's IP address. If you're experiencing network errors, follow these steps:

### Quick Fix

1. **Update IP Address Automatically:**
   ```bash
   npm run update-ip
   ```

2. **Restart Expo with Clear Cache:**
   ```bash
   npm run start:clear
   ```

### Manual Configuration

If the automatic script doesn't work, manually update the IP address:

1. **Find your current IP address:**
   ```bash
   hostname -I
   ```

2. **Update the configuration file:**
   Edit `src/constants/config.ts` and update the `BASE_URL`:
   ```typescript
   BASE_URL: __DEV__
     ? 'http://YOUR_IP_ADDRESS:8000'  // Replace with your actual IP
     : 'https://your-production-api.com',
   ```

3. **Restart the development server:**
   ```bash
   npx expo start --clear
   ```

### Common Issues

#### ❌ Network Error
- **Cause:** IP address mismatch between frontend and backend
- **Solution:** Update the IP address in `config.ts` and restart

#### ❌ CORS Error
- **Cause:** Backend CORS configuration
- **Solution:** Backend is already configured to allow all origins for development

#### ❌ Backend Not Running
- **Cause:** Backend server is not started
- **Solution:** Start the backend server:
  ```bash
  # From the root directory
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```

### Verification

Test the backend connection:
```bash
curl http://YOUR_IP_ADDRESS:8000/
```

Expected response:
```json
{"message":"Welcome to the EV Slot Booking API!"}
```

### Development vs Production

- **Development:** Uses your local IP address (e.g., `http://192.168.1.10:8000`)
- **Production:** Uses the production API URL (configured in `config.ts`)

### Troubleshooting

1. **Check if backend is running:**
   ```bash
   ps aux | grep python
   ```

2. **Check if port 8000 is accessible:**
   ```bash
   netstat -tlnp | grep 8000
   ```

3. **Test API endpoints:**
   ```bash
   curl -X POST http://YOUR_IP:8000/token \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "test123"}'
   ```

### Network Requirements

- Backend must be running on port 8000
- Frontend and backend must be on the same network
- Firewall should allow connections on port 8000
- CORS is configured to allow all origins for development
