# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Architecture

This is a full-stack EV Charging Station Booking Application built with:
- **Backend**: FastAPI (Python 3.8+) with MongoDB Atlas/local
- **Frontend**: React Native (Expo) with TypeScript
- **Architecture**: Microservice-style with modular routers and clean separation

### Core Backend Structure
The FastAPI backend follows a modular router architecture:
- `app/main.py` - Main application with lifespan management and middleware
- `app/routers/` - API endpoints organized by domain (stations, bookings, auth)
- `app/db/database.py` - MongoDB connection with comprehensive error handling
- `app/models.py` - Pydantic models with MongoDB ObjectId integration
- `app/core/auth.py` - JWT authentication and user management

### Frontend Architecture
React Native app using modern patterns:
- Context-based state management (AuthContext, ThemeContext)
- Navigation with React Navigation v6
- TypeScript with strict configuration
- Component-based architecture in `src/` directory

## Development Commands

### Backend Development

#### Start Backend Server
```bash
# Recommended: Using the comprehensive runner
python run_backend.py

# Alternative: Direct server runner
cd app
python run_server_direct.py

# Manual with virtual environment
venv\Scripts\activate
cd app
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Backend Testing
```bash
# Install dependencies
pip install -r requirements.txt

# Database health check
curl http://localhost:8000/ping-db

# API documentation
# Visit: http://localhost:8000/docs
```

### Frontend Development

#### Start Frontend Development
```bash
cd frontend
npm install
npm start
# OR
expo start
```

#### Platform-specific runs
```bash
cd frontend
npm run ios      # iOS simulator
npm run android  # Android emulator  
npm run web      # Web browser
```

#### Frontend Testing & Linting
```bash
cd frontend
npm test         # Run tests
npx eslint .     # Lint code
npx prettier --write .  # Format code
```

### Database Operations

#### Sample Data Creation
```bash
python create_sample_data.py
```

#### MongoDB Connection Testing
```bash
python test_db.py
```

## Key Implementation Details

### Authentication Flow
- JWT-based authentication with token expiration
- Password hashing using Passlib with bcrypt
- User context maintained in React Native with AsyncStorage
- Protected routes using dependency injection in FastAPI

### Booking System Architecture
- Real-time conflict detection for overlapping bookings
- Automatic slot assignment algorithm
- Cost calculation based on slot pricing and duration
- Status tracking (PENDING → CONFIRMED → ACTIVE → COMPLETED)

### Geospatial Features
- MongoDB 2dsphere indexes for location-based queries
- Nearby station discovery using `$nearSphere` aggregation
- Distance-based filtering in kilometers
- Station clustering support in React Native Maps

### Database Schema
- **Users**: Authentication, profile, vehicle info
- **Stations**: Location (GeoJSON), slots, amenities, operating hours
- **Bookings**: Time slots, status, cost calculation, conflict detection
- **ChargingSlots**: Nested in stations, charger types (AC/DC), power ratings

### Error Handling Patterns
- Comprehensive MongoDB connection handling with retries
- HTTPException-based error responses with proper status codes
- Graceful degradation to "limited mode" when database unavailable
- Frontend error boundaries and async error handling

## Environment Configuration

### Backend Environment (.env)
```env
MONGO_URI=mongodb://localhost:27017
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=ev_booking_db
```

### Network Configuration for Development
- Backend binds to `0.0.0.0:8000` for remote access
- Frontend API base URL configurable in `frontend/src/constants/config.ts`
- CORS enabled for all origins (configure for production)

## Development Workflow

### Adding New API Endpoints
1. Define Pydantic models in `app/models.py`
2. Create router in `app/routers/[domain].py`
3. Include router in `app/main.py`
4. Update frontend services in `frontend/src/services/`

### Adding New Frontend Features
1. Create components in `frontend/src/components/`
2. Add screens to `frontend/src/screens/`
3. Update navigation in `frontend/src/navigation/`
4. Define TypeScript types in `frontend/src/types/`

### Database Schema Changes
- MongoDB schema changes handled through Pydantic models
- No migrations required - dynamic schema evolution
- Add indexes manually through MongoDB Compass or scripts

## Testing Strategy

### Backend Testing
```bash
pytest  # (when test files are created)
```

### API Testing
- Use FastAPI's interactive docs at `/docs`
- Swagger UI available for all endpoints
- Built-in request/response validation

## Performance Considerations

### Backend Optimizations
- MongoDB connection pooling with retry logic
- Geospatial indexes for location queries
- Efficient aggregation pipelines for booking-station joins
- Async endpoint handlers for I/O operations

### Frontend Optimizations
- React Navigation v6 for performance
- Efficient re-renders with proper React hooks
- Image optimization with Expo
- Network request caching potential

## Common Development Issues

### Import Path Issues
- Use `app/run_server_direct.py` for direct server runs
- Python path properly configured in runners
- Relative imports handled within app module

### Database Connection Problems
- Server runs in "limited mode" if MongoDB unavailable
- Check `app/config.env` exists and is properly formatted
- Verify network connectivity for MongoDB Atlas

### Virtual Environment Management
- Use `python run_backend.py` for automatic venv handling
- Manual activation: `venv\Scripts\activate` (Windows)
- Dependencies in both root and `app/requirements.txt`

## Security Considerations

- JWT tokens with configurable expiration
- Password hashing with bcrypt
- CORS configuration needs production hardening
- MongoDB connection strings in environment variables only
- User input validation through Pydantic models