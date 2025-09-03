# EV Charging Station Booking App 🚗⚡

A comprehensive mobile application for booking electric vehicle charging slots at charging stations. Built with React Native (Expo) for the frontend and FastAPI for the backend, this app provides a seamless experience for EV owners to find, book, and manage their charging needs.

## 🌟 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing
- User profile management

### 🗺️ Station Discovery
- Interactive map with charging station locations
- Geospatial search for nearby stations
- Station details with amenities and operating hours
- Real-time availability status

### 📅 Booking System
- Real-time slot availability checking
- Flexible booking with start/end times
- Multiple charger types support (AC Slow, AC Fast, DC Fast, DC Ultra-Fast)
- Booking history and management
- Automatic conflict detection

### 💳 Payment Integration
- Secure payment processing
- Cost calculation based on usage
- Payment status tracking

### 🎨 Modern UI/UX
- Dark/Light theme support
- Intuitive navigation
- Responsive design
- Accessibility features
- Multilingual support

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance web framework
- **MongoDB** - NoSQL database with geospatial queries
- **Pydantic** - Data validation and serialization
- **JWT** - Authentication tokens
- **Uvicorn** - ASGI server

### Frontend
- **React Native** - Mobile application framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching
- **React Native Maps** - Interactive maps

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Python 3.8+** - For backend development
- **Node.js 16+** - For frontend development
- **MongoDB** - Database (local or Atlas)
- **Expo CLI** - For React Native development
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/rhapsodicpug/EV_App.git
cd EV_App
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your MongoDB connection:
```env
MONGO_URI=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

#### Database Setup
1. Ensure MongoDB is running locally or you have access to MongoDB Atlas
2. The database will be automatically created when you run the backend

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure API Endpoint
Update the API base URL in `frontend/src/constants/config.ts` if needed:
```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

## 🎯 Running the Project

### Backend (Terminal 1)
```bash
# From the root directory
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### Frontend (Terminal 2)
```bash
cd frontend
npm start
# OR
expo start
```

This will open the Expo DevTools. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open web browser
- Scan QR code with Expo Go app on your phone

## 📊 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /token` - User login (returns JWT token)
- `GET /users/me` - Get current user info

### Stations
- `POST /stations/` - Create new charging station
- `GET /stations/` - Get all stations (paginated)
- `GET /stations/{id}` - Get specific station
- `PUT /stations/{id}` - Update station
- `DELETE /stations/{id}` - Delete station
- `GET /stations/nearby/` - Find nearby stations (geospatial)

### Bookings
- `POST /bookings/` - Create new booking
- `GET /bookings/` - Get user's bookings
- `GET /bookings/{id}` - Get specific booking
- `PUT /bookings/{id}` - Update booking
- `DELETE /bookings/{id}` - Cancel booking

### Charging Slots
- `POST /stations/{id}/slots/` - Add charging slot to station
- `GET /stations/{id}/slots/` - Get station's charging slots

## 📁 Project Structure

```
ev_app/
├── app/                    # FastAPI backend application
│   ├── __init__.py
│   ├── core/              # Core functionality
│   ├── db/                # Database connections
│   ├── main.py           # Main API application
│   ├── models.py         # Pydantic models
│   └── routers/          # API route handlers
├── frontend/              # React Native mobile app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── design/       # Design system and themes
│   │   ├── navigation/   # Navigation configuration
│   │   ├── screens/      # App screens
│   │   ├── services/     # API services and utilities
│   │   └── types/        # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── package.json     # Frontend dependencies
├── auth.py               # Authentication utilities
├── models.py            # Shared models
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🔧 Development

### Adding New Features
1. Backend: Add new endpoints in the appropriate router file
2. Frontend: Create new screens in `src/screens/`
3. Update types in `src/types/` for new API responses
4. Add navigation routes in `src/navigation/`

### Database Migrations
The app uses MongoDB, so schema changes are handled automatically through the Pydantic models. For data migrations, you can add scripts in the root directory.

### Testing
```bash
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

### Code Style
- **Backend**: Follow PEP 8 standards
- **Frontend**: Use ESLint and Prettier configurations
- **Commits**: Use conventional commit format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [API Documentation](http://localhost:8000/docs) for backend issues
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Check MongoDB connection status

## 🔄 Version History

- **v1.0.0** - Initial release with core booking functionality
  - User authentication
  - Station management
  - Booking system
  - Mobile app interface
  - Geospatial search
    
---

Made with ❤️ for the EV community
