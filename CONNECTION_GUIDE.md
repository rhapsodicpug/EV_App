# EV Charging App - Frontend & Backend Connection Guide

## Quick Start

### Option 1: Use the Startup Scripts (Recommended)
```bash
# Start both frontend and backend together
start_dev.bat

# Or start them individually:
start_backend.bat    # Backend only
start_frontend.bat   # Frontend only
```

### Option 2: Manual Setup

#### Backend (FastAPI)
```bash
# Navigate to project root
cd EV_App

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the backend server
python main_new.py
```
Backend will be available at: http://localhost:8000

#### Frontend (React Native/Expo)
```bash
# Navigate to frontend directory
cd EV_App/frontend

# Install dependencies (if not already done)
npm install

# Start the Expo development server
npx expo start
```

## Connection Configuration

### Current Setup
- **Backend**: FastAPI server running on `http://localhost:8000`
- **Frontend**: React Native/Expo app connecting to the backend
- **Database**: MongoDB Atlas (configured in backend)

### API Endpoints
The backend provides these main endpoints:

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/token` - User login
- `GET /users/me` - Get current user profile

#### Stations
- `GET /stations/` - List all charging stations
- `GET /stations/{id}` - Get specific station
- `GET /stations/nearby/` - Find nearby stations
- `GET /stations/search/` - Search stations with filters

#### Bookings
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/{id}` - Get specific booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Testing the Connection

1. **Start Backend**: Run `start_backend.bat` or `python main_new.py`
2. **Verify Backend**: Open http://localhost:8000/docs in your browser
3. **Start Frontend**: Run `start_frontend.bat` or `npx expo start` in the frontend directory
4. **Test API**: The frontend will automatically connect to the backend

### Mobile Device Testing

If you want to test on a physical device:

1. **Find your computer's IP address**:
   ```bash
   ipconfig  # Windows
   ```

2. **Update API URLs** in these files:
   - `frontend/src/services/api.ts` (line 34)
   - `frontend/src/constants/config.ts` (line 34)
   
   Change `http://localhost:8000` to `http://YOUR_IP:8000`

3. **Ensure firewall allows connections** on port 8000

### Environment Variables

#### Backend (.env)
```env
MONGODB_URL=your_mongodb_atlas_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Troubleshooting

### Common Issues

1. **Backend not starting**:
   - Check if MongoDB connection string is correct
   - Ensure all dependencies are installed: `pip install -r requirements.txt`

2. **Frontend can't connect to backend**:
   - Verify backend is running on http://localhost:8000
   - Check API URLs in frontend configuration files

3. **CORS errors**:
   - Backend is configured to allow all origins in development
   - For production, update CORS settings in `app/main.py`

4. **Database connection issues**:
   - Verify MongoDB Atlas connection string
   - Check network connectivity
   - Ensure database user has proper permissions

### Development Tips

1. **API Documentation**: Visit http://localhost:8000/docs for interactive API documentation
2. **Database Health**: Check http://localhost:8000/ping-db to verify database connection
3. **Hot Reload**: Both frontend and backend support hot reload during development
4. **Logging**: Check console outputs in both frontend and backend for debugging

## Production Deployment

### Backend
- Update CORS origins to your frontend domain
- Set proper environment variables
- Use a production WSGI server like Gunicorn
- Configure HTTPS

### Frontend
- Update API_BASE_URL to your production backend URL
- Build the app for your target platform (iOS/Android)
- Configure proper environment variables

## API Authentication Flow

1. **Register/Login**: User creates account or logs in via `/auth/register` or `/auth/token`
2. **Token Storage**: Frontend stores JWT token securely
3. **Authenticated Requests**: Token is automatically added to all API requests
4. **Token Refresh**: Implement token refresh logic as needed

## Next Steps

1. Run `start_dev.bat` to start both servers
2. Open the Expo development server and scan QR code with Expo Go app
3. Test user registration and login
4. Create sample charging stations using the API
5. Test booking functionality

For detailed API usage, visit: http://localhost:8000/docs
