# 📱 Complete App Explanation - Viva Guide

## 🎯 **Overview**

This is a comprehensive guide explaining **how the entire EV Charging Station Booking App works** - perfect for your viva tomorrow! It covers all technologies, features, and implementation details.

---

## 🏗️ **Architecture Overview**

### **Type: Full-Stack Mobile Application**

```
Frontend (React Native) ←→ Backend (FastAPI) ←→ Database (MongoDB)
         ↓                           ↓                    ↓
    Mobile App              REST API + WebSocket      Data Storage
```

**Architecture Pattern:** RESTful API + WebSocket for real-time updates

---

## 🎨 **Frontend (React Native)**

### **Technology Stack:**

1. **React Native** - Mobile app framework
   - Cross-platform (iOS + Android)
   - JavaScript/TypeScript

2. **Expo** - Development platform
   - Simplifies development
   - Built-in features (camera, location, notifications)

3. **TypeScript** - Type-safe JavaScript
   - Prevents errors
   - Better code quality

4. **React Navigation** - Navigation library
   - Stack navigation (screens)
   - Tab navigation (bottom tabs)
   - Drawer navigation (side menu)

5. **Context API** - State management
   - No Redux needed
   - Global state for: Auth, Booking, Vehicle, Theme

6. **AsyncStorage** - Local data storage
   - Stores user tokens
   - Saves user preferences
   - Offline data caching

### **Key Libraries:**

- **React Native Maps** - Map visualization
- **Expo Location** - GPS location services
- **Expo Notifications** - Push notifications
- **Axios** - HTTP requests to backend
- **BlurView & LinearGradient** - UI effects

---

## ⚙️ **Backend (FastAPI)**

### **Technology Stack:**

1. **FastAPI** - Python web framework
   - Fast performance
   - Auto API documentation
   - Type validation

2. **MongoDB** - NoSQL database
   - Flexible schema
   - Geospatial queries (for finding nearby stations)
   - Stores: Users, Stations, Bookings

3. **Pydantic** - Data validation
   - Validates request/response data
   - Type safety

4. **JWT (python-jose)** - Authentication
   - Secure token-based auth
   - Token expiration handling

5. **Passlib (bcrypt)** - Password hashing
   - Secure password storage
   - Bcrypt encryption

6. **WebSocket** - Real-time updates
   - Live station availability
   - Broadcasts booking changes

---

## 🔐 **1. Authentication System**

### **How It Works:**

1. **Registration:**
   ```
   User → Frontend → POST /auth/register → Backend
   ↓
   Backend: Hashes password (bcrypt) → Saves to MongoDB
   ↓
   Returns: User data (no password)
   ```

2. **Login:**
   ```
   User → Frontend → POST /auth/token → Backend
   ↓
   Backend: Verifies password → Generates JWT token
   ↓
   Returns: JWT token + user data
   ↓
   Frontend: Stores token in AsyncStorage
   ```

3. **JWT Token:**
   - **What:** JSON Web Token (encrypted user info)
   - **Contains:** User ID, email, expiration time
   - **Stored:** AsyncStorage (local storage)
   - **Sent:** With every API request (Authorization header)

4. **Token Validation:**
   - Every API request includes token
   - Backend verifies token
   - If valid → Process request
   - If invalid → Reject (401 Unauthorized)

### **2FA (Two-Factor Authentication):**

1. **Setup:**
   ```
   User → Profile → Enable 2FA
   ↓
   Backend: Generates TOTP secret → Creates QR code
   ↓
   User: Scans QR with Google Authenticator
   ↓
   User: Enters 6-digit code → Backend verifies
   ↓
   2FA enabled ✅
   ```

2. **Login with 2FA:**
   ```
   User → Login → Backend checks if 2FA enabled
   ↓
   If YES → Returns special response ("2FA_REQUIRED")
   ↓
   Frontend: Shows modal → User enters 6-digit code
   ↓
   Backend: Verifies code → Returns JWT token
   ↓
   User logged in ✅
   ```

**Technology:** `pyotp` (Time-based One-Time Password)

---

## 🗺️ **2. Station Discovery**

### **How It Works:**

1. **Getting User Location:**
   ```
   Frontend: Expo Location → Request permission
   ↓
   Gets: latitude, longitude
   ↓
   Sends to Backend
   ```

2. **Finding Nearby Stations:**
   ```
   Frontend → GET /stations/nearby?lat=X&lng=Y&radius=25
   ↓
   Backend: MongoDB geospatial query
   ↓
   Finds stations within radius
   ↓
   Calculates distance from user
   ↓
   Returns: Sorted by distance (nearest first)
   ```

3. **MongoDB Geospatial Query:**
   - Uses `$geoNear` or `$near` operators
   - Calculates distance using coordinates
   - Filters by radius

4. **Data Sources:**
   - **Custom Database:** Tata Power stations (hardcoded)
   - **OpenChargeMap API:** Global station data (optional)

**Technology:** MongoDB Geospatial Indexes

---

## 📅 **3. Booking System**

### **How It Works:**

1. **User Books Slot:**
   ```
   User → Select Station → Select Date/Time/Duration
   ↓
   Frontend → POST /api/bookings/
   ↓
   Backend:
   - Validates time slot
   - Checks for conflicts
   - Finds available slot
   - Creates booking in MongoDB
   - Updates slot status (AVAILABLE → OCCUPIED)
   - Broadcasts update via WebSocket
   ↓
   Returns: Booking confirmation
   ```

2. **Conflict Detection:**
   - Checks overlapping bookings
   - Same station + same time = conflict
   - Prevents double-booking

3. **Slot Management:**
   - Each station has multiple slots
   - Each slot has status: AVAILABLE / OCCUPIED
   - Booking changes status to OCCUPIED
   - Cancellation changes back to AVAILABLE

4. **Booking States:**
   - **PENDING** - Just created, payment pending
   - **CONFIRMED** - Payment successful
   - **CANCELLED** - User cancelled
   - **COMPLETED** - Charging finished

---

## 🔴 **4. Real-Time Updates (WebSocket)**

### **How It Works:**

1. **Connection:**
   ```
   Frontend: Connects to ws://YOUR_IP:8000/ws
   ↓
   Backend: Accepts connection
   ↓
   Connection established ✅
   ```

2. **When Booking Created:**
   ```
   User A: Books slot → Backend updates database
   ↓
   Backend: Broadcasts update via WebSocket
   ↓
   ALL connected clients receive update
   ↓
   Device B: Updates station availability instantly (2/2 → 1/2)
   ```

3. **Broadcast Message:**
   ```json
   {
     "type": "booking_created",
     "station_id": "507f1f77bcf86cd799439011",
     "station": {
       "available_slots_count": 1,
       "total_slots_count": 2,
       "charging_slots": [...]
     }
   }
   ```

4. **Frontend Updates:**
   - Listens for WebSocket messages
   - Updates station list in real-time
   - No refresh needed!

**Technology:** WebSocket (FastAPI WebSocket endpoint)

---

## 💳 **5. Payment Integration (Razorpay)**

### **How It Works:**

1. **Payment Flow:**
   ```
   User → Books slot → Navigate to Payment
   ↓
   Frontend → POST /payment/create-order
   ↓
   Backend:
   - Creates Razorpay order
   - Returns: order_id + key_id
   ↓
   Frontend: Opens Razorpay checkout
   ↓
   User: Enters payment details (UPI/Card/Wallet)
   ↓
   Razorpay: Processes payment
   ↓
   Frontend: Receives payment_id
   ↓
   Frontend → POST /payment/verify
   ↓
   Backend: Verifies payment signature
   ↓
   Backend: Updates booking status (PENDING → PAID)
   ↓
   Payment successful ✅
   ```

2. **Payment Verification:**
   - Razorpay sends signature
   - Backend verifies signature (HMAC)
   - Ensures payment is legitimate

3. **Webhook (Background):**
   ```
   Razorpay → POST /payment/webhook
   ↓
   Backend: Verifies webhook signature
   ↓
   Backend: Updates booking status
   ↓
   Works even if user closes app!
   ```

**Technology:** Razorpay SDK (react-native-razorpay)

---

## 🗺️ **6. Trip Planning**

### **How It Works:**

1. **User Plans Trip:**
   ```
   User → Plan a Trip → Select Start & End Location
   ↓
   Frontend: Calculates straight-line distance (Haversine formula)
   ↓
   Frontend: Estimates battery consumption
   ↓
   Frontend: Finds stations along route
   ↓
   Frontend: Displays results
   ```

2. **Distance Calculation:**
   - Uses Haversine formula
   - Calculates distance between two GPS coordinates
   - Accounts for Earth's curvature

3. **Battery Estimation:**
   ```
   Distance ÷ Vehicle Efficiency × Traffic Factor = Battery Used
   ```
   - Low traffic: Normal efficiency
   - Medium traffic: 1.2x
   - High traffic: 1.5x

4. **Route Stations:**
   - Finds stations between start and end
   - Sorted by distance
   - Shows available slots

**Technology:** Haversine formula (JavaScript calculation)

---

## 🚗 **7. Vehicle Management**

### **How It Works:**

1. **Add Vehicle:**
   ```
   User → Add Vehicle → Enter details
   ↓
   Frontend → POST /vehicles/
   ↓
   Backend: Saves to MongoDB
   ↓
   Vehicle added ✅
   ```

2. **Vehicle Data:**
   - Make, Model, Year
   - Battery capacity (kWh)
   - Estimated range
   - Charging preferences

3. **Storage:**
   - MongoDB: Vehicle details
   - AsyncStorage: Local cache

---

## 📱 **8. Notifications**

### **How It Works:**

1. **Local Notifications:**
   ```
   Backend: Booking created → Frontend schedules notification
   ↓
   Expo Notifications: Shows notification at scheduled time
   ↓
   User: Gets reminder about upcoming booking
   ```

2. **Notification Types:**
   - Booking reminders (before booking time)
   - Booking confirmations
   - Booking cancellations
   - Charging complete alerts

3. **Scheduling:**
   - Calculates time before booking
   - Schedules notification
   - Triggers on device (even if app closed)

**Technology:** Expo Notifications

---

## 🗺️ **9. Maps Integration**

### **How It Works:**

1. **Display Stations on Map:**
   ```
   Frontend: React Native Maps
   ↓
   Loads station coordinates
   ↓
   Displays markers on map
   ↓
   User: Taps marker → See station details
   ```

2. **Features:**
   - Marker clustering (groups nearby stations)
   - Custom markers (different colors for status)
   - Zoom to user location
   - Navigation to Google Maps

3. **Map Provider:**
   - iOS: Apple Maps
   - Android: Google Maps

**Technology:** react-native-maps

---

## 🧠 **10. State Management**

### **How It Works:**

**Uses React Context API** (not Redux)

1. **Contexts:**
   - `AuthContext` - User authentication
   - `BookingContext` - Booking state
   - `VehicleContext` - Vehicle data
   - `ThemeContext` - App theme
   - `AIChatbotContext` - Chatbot state

2. **Data Flow:**
   ```
   Context Provider → Supplies state
   ↓
   Components → useContext() → Access state
   ↓
   Update state → Components re-render
   ```

3. **Persistence:**
   - AsyncStorage for offline data
   - Syncs with backend on app start

---

## 🧭 **11. Navigation**

### **How It Works:**

1. **Navigation Types:**
   - **Stack Navigation:** Screen transitions (push/pop)
   - **Tab Navigation:** Bottom tabs (Home, Search, Profile, Bookings)
   - **Drawer Navigation:** Side menu

2. **Navigation Flow:**
   ```
   App Start → AuthNavigator
   ↓
   Login → MainNavigator (Bottom Tabs)
   ↓
   Home Tab → Station List → Station Details → Booking → Payment
   ```

3. **Deep Linking:**
   - Can navigate directly to screens
   - Passes parameters between screens

**Technology:** React Navigation

---

## 📊 **12. Data Flow Architecture**

### **Complete Flow Example (Booking):**

```
1. User Action:
   User taps "Book Slot" button

2. Frontend:
   - Shows booking form
   - User selects date/time/duration
   - Clicks "Confirm"

3. Frontend → Backend:
   POST /api/bookings/
   {
     station_id: "123",
     start_time: "2025-11-01T10:00:00Z",
     duration_minutes: 60
   }

4. Backend Processing:
   - Validates token (JWT)
   - Validates request data (Pydantic)
   - Checks for conflicts (MongoDB query)
   - Creates booking (MongoDB insert)
   - Updates slot status (MongoDB update)
   - Broadcasts update (WebSocket)

5. Backend → Frontend:
   Returns: Booking confirmation

6. Frontend:
   - Updates local state (BookingContext)
   - Saves to AsyncStorage
   - Shows success message
   - Navigates to payment screen

7. Real-Time Update:
   - WebSocket broadcasts to all clients
   - Other devices update station availability
```

---

## 🔧 **13. Key Technologies Explained**

### **Frontend:**

1. **React Native:**
   - Framework for mobile apps
   - One codebase for iOS + Android
   - Native performance

2. **Expo:**
   - Development platform
   - Built-in APIs (location, camera, etc.)
   - Easier deployment

3. **TypeScript:**
   - Typed JavaScript
   - Catches errors before runtime

4. **Context API:**
   - Global state management
   - No external libraries needed

### **Backend:**

1. **FastAPI:**
   - Modern Python web framework
   - Auto API documentation (Swagger UI)
   - Fast performance

2. **MongoDB:**
   - NoSQL database
   - Flexible schema
   - Geospatial queries

3. **JWT:**
   - Secure authentication
   - Stateless (no server-side sessions)

4. **WebSocket:**
   - Real-time bidirectional communication
   - Instant updates

---

## 🎤 **Viva Presentation Points**

### **1. Overall Architecture:**

> "This is a full-stack mobile application. The frontend is built with React Native using Expo, which allows us to build for both iOS and Android with one codebase. The backend uses FastAPI, a modern Python web framework known for its speed and automatic API documentation. We use MongoDB as our database because it supports geospatial queries, which is essential for finding nearby charging stations. The app uses RESTful APIs for standard operations and WebSocket for real-time updates."

### **2. Authentication:**

> "We implemented JWT-based authentication. When a user logs in, the backend verifies their credentials and generates a JWT token. This token is stored locally in AsyncStorage and sent with every API request. The backend validates the token on each request. We also implemented 2FA using TOTP - when enabled, users must enter a 6-digit code from their authenticator app after entering their password. This adds an extra layer of security."

### **3. Station Discovery:**

> "We use Expo Location to get the user's GPS coordinates. This data is sent to the backend, which uses MongoDB's geospatial queries to find stations within a specified radius. The results are sorted by distance, with the nearest stations shown first. We combine our custom database with OpenChargeMap API for comprehensive coverage."

### **4. Booking System:**

> "The booking system includes conflict detection to prevent double-booking. When a user books a slot, the backend checks for overlapping bookings at the same station and time. If available, it creates the booking and updates the slot status from AVAILABLE to OCCUPIED. The system also calculates the estimated cost based on duration and pricing."

### **5. Real-Time Updates:**

> "We implemented real-time synchronization using WebSocket. When a booking is created or cancelled on one device, the backend broadcasts the update to all connected clients via WebSocket. This means all users see updated availability instantly without needing to refresh. It works by maintaining active WebSocket connections and broadcasting station updates when bookings change."

### **6. Payment Integration:**

> "We integrated Razorpay for payment processing. When a user confirms a booking, the frontend creates a Razorpay order on the backend. The backend returns the order details, and the frontend opens Razorpay's secure payment gateway. After payment, we verify the payment signature to ensure security. We also implemented webhooks so payments are processed even if the user closes the app during payment."

### **7. Trip Planning:**

> "The trip planning feature calculates distance between two locations using the Haversine formula, which accounts for Earth's curvature. It then estimates battery consumption based on distance, vehicle efficiency, and traffic conditions. The system finds charging stations along the route and suggests where to stop for charging."

### **8. State Management:**

> "We use React's Context API for state management instead of Redux. This keeps the code simpler while providing global state for authentication, bookings, vehicles, and theme. The state persists using AsyncStorage, so user data survives app restarts."

### **9. UI/UX:**

> "We focused on modern UI/UX with glassmorphism effects using BlurView and LinearGradient. The app features smooth animations, haptic feedback for interactions, and a dark theme optimized for low-light conditions. Navigation is intuitive with bottom tabs and stack navigation."

---

## ❓ **Common Viva Questions**

### **Q: Why React Native instead of native development?**

**A:** "React Native allows us to write one codebase for both iOS and Android, reducing development time and maintenance costs. It provides native performance while sharing business logic between platforms."

### **Q: Why MongoDB instead of SQL database?**

**A:** "MongoDB's geospatial query capabilities are essential for finding nearby stations efficiently. Additionally, its flexible schema works well for EV charging data that may have varying station configurations."

### **Q: How do you handle offline functionality?**

**A:** "We use AsyncStorage to cache data locally. Critical data like user tokens and preferences are stored offline. However, core features like booking require internet connectivity for real-time conflict detection."

### **Q: How do you ensure payment security?**

**A:** "We use Razorpay's secure payment gateway, which handles PCI DSS compliance. We verify payment signatures using HMAC to ensure payments are legitimate. Webhooks provide redundancy for payment processing."

### **Q: How does real-time sync work?**

**A:** "When a booking is created, the backend broadcasts the update via WebSocket to all connected clients. Each device maintains a WebSocket connection and updates its local state when receiving broadcasts. This ensures all users see changes instantly."

### **Q: What happens if the backend is down?**

**A:** "The app gracefully handles backend failures. Users can view cached data from AsyncStorage, but booking and payments require backend connectivity. We show appropriate error messages and retry mechanisms."

### **Q: How do you handle location permissions?**

**A:** "We use Expo Location to request foreground location permissions. If denied, the app falls back to general station listings without location-based sorting. We clearly communicate why location is needed."

### **Q: What's the performance of the app?**

**A:** "FastAPI provides excellent backend performance with async support. React Native offers native performance. We optimize by caching data locally, using efficient database queries, and minimizing API calls."

---

## 📁 **Project Structure (Quick Reference)**

```
ev_app/
├── frontend/
│   ├── src/
│   │   ├── screens/          # All app screens
│   │   ├── components/        # Reusable components
│   │   ├── contexts/         # State management
│   │   ├── services/         # API services
│   │   ├── navigation/        # Navigation config
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── main.py                    # FastAPI backend
├── models.py                  # Data models
├── requirements.txt           # Python dependencies
└── README.md
```

---

## ✅ **Key Takeaways for Viva**

1. ✅ **Full-Stack:** React Native frontend + FastAPI backend
2. ✅ **Database:** MongoDB for geospatial queries
3. ✅ **Auth:** JWT tokens + 2FA (TOTP)
4. ✅ **Real-Time:** WebSocket for live updates
5. ✅ **Payment:** Razorpay integration
6. ✅ **State:** React Context API (not Redux)
7. ✅ **Location:** Expo Location + MongoDB geospatial
8. ✅ **Offline:** AsyncStorage for local data
9. ✅ **Maps:** React Native Maps
10. ✅ **Notifications:** Expo Notifications

---

## 🚀 **Final Presentation Summary**

> "I've built a complete full-stack EV charging station booking application. The frontend uses React Native with Expo for cross-platform mobile development. The backend uses FastAPI for high-performance API services, and MongoDB for flexible data storage with geospatial capabilities. Key features include JWT authentication with 2FA, real-time station availability updates via WebSocket, Razorpay payment integration, trip planning with battery estimation, and an intelligent booking system with conflict detection. The app provides a seamless user experience with modern UI, real-time synchronization, and comprehensive station discovery. Everything is production-ready with proper error handling, security measures, and offline support."

---

**Good luck with your viva!** 🎉

---

**Last Updated:** October 31, 2025  
**Version:** 1.0

