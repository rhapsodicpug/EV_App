# 🎤 Viva Quick Reference Card

## 🗣️ **30-Second Introduction**

> "This is a full-stack EV charging station booking app built with React Native frontend and FastAPI backend. It features real-time station availability, JWT authentication with 2FA, Razorpay payment integration, and WebSocket-based live updates. Users can discover nearby stations, book charging slots, plan trips with battery estimates, and manage their bookings seamlessly."

---

## 🏗️ **Technology Stack (Quick)**

### **Frontend:**
- React Native + Expo
- TypeScript
- React Navigation
- Context API (State Management)

### **Backend:**
- FastAPI (Python)
- MongoDB (Database)
- JWT (Authentication)
- WebSocket (Real-time)

### **Integrations:**
- Razorpay (Payment)
- Expo Location (GPS)
- React Native Maps
- Expo Notifications

---

## 🔑 **Key Features & How They Work**

### **1. Authentication (JWT + 2FA)**
- User logs in → Backend verifies password → Generates JWT token
- Token stored in AsyncStorage → Sent with every API request
- 2FA: User enters 6-digit code from Google Authenticator
- **Tech:** python-jose (JWT), pyotp (2FA)

---

### **2. Station Discovery**
- Frontend: Gets user location (Expo Location)
- Backend: MongoDB geospatial query finds nearby stations
- Results sorted by distance (nearest first)
- **Tech:** MongoDB `$geoNear` operator

---

### **3. Booking System**
- User selects station → Date/Time/Duration
- Backend checks for conflicts (prevent double-booking)
- Creates booking → Updates slot status (AVAILABLE → OCCUPIED)
- Broadcasts update via WebSocket
- **Tech:** MongoDB queries, conflict detection logic

---

### **4. Real-Time Updates (WebSocket)**
- Device connects to `ws://YOUR_IP:8000/ws`
- When booking created → Backend broadcasts update
- All connected clients receive update instantly
- Station availability updates without refresh
- **Tech:** FastAPI WebSocket, ConnectionManager class

---

### **5. Payment Integration (Razorpay)**
- Frontend creates Razorpay order → Backend returns order_id
- Frontend opens Razorpay checkout (UPI/Card/Wallet)
- Payment successful → Backend verifies signature (HMAC)
- Updates booking status (PENDING → PAID)
- Webhook for background processing
- **Tech:** Razorpay SDK, Signature verification

---

### **6. Trip Planning**
- User selects start & end location
- Calculates distance (Haversine formula)
- Estimates battery consumption (distance × efficiency × traffic)
- Finds stations along route
- **Tech:** Haversine formula (JavaScript)

---

### **7. EV Assistant (Chatbot)**
- Rule-based pattern matching chatbot
- Keyword matching for intent recognition
- 14 intents (greeting, booking, trip_planning, etc.)
- Hardcoded response templates
- Context-aware based on conversation history
- **Tech:** Pattern matching, NOT AI/ML

---

### **8. Maps Integration**
- React Native Maps displays stations
- Markers for each station
- Custom colors for availability status
- Navigation to Google Maps
- **Tech:** react-native-maps

---

### **9. Notifications**
- Expo Notifications for reminders
- Scheduled before booking time
- Local notifications (no server needed)
- **Tech:** Expo Notifications

---

## 💾 **Data Storage**

- **MongoDB:** Users, Stations, Bookings
- **AsyncStorage:** JWT tokens, User preferences, Local cache
- **Context API:** In-memory state (Auth, Booking, Vehicle)

---

## 🔄 **Data Flow (Booking Example)**

```
User Action
    ↓
Frontend → API Request (with JWT token)
    ↓
Backend validates token & request
    ↓
Backend processes (MongoDB operations)
    ↓
Backend broadcasts update (WebSocket)
    ↓
Backend returns response
    ↓
Frontend updates local state (Context API)
    ↓
Frontend saves to AsyncStorage
    ↓
UI updates
```

---

## 🎯 **Common Questions & Answers**

### **Q: Why React Native?**
**A:** "Cross-platform development - one codebase for iOS and Android, native performance."

### **Q: Why MongoDB?**
**A:** "Geospatial queries for finding nearby stations efficiently, flexible schema for varying station data."

### **Q: How does real-time work?**
**A:** "WebSocket maintains persistent connections. When booking changes, backend broadcasts to all connected clients instantly."

### **Q: Payment security?**
**A:** "Razorpay handles PCI compliance. We verify payment signatures using HMAC. Webhooks provide redundancy."

### **Q: Offline support?**
**A:** "AsyncStorage caches data locally. Core features require internet for real-time conflict detection."

### **Q: Why Context API over Redux?**
**A:** "Simpler setup, no extra libraries, sufficient for our app's state management needs."

### **Q: How do you find nearby stations?**
**A:** "MongoDB geospatial queries using `$geoNear` operator with user's GPS coordinates."

---

## 📊 **Architecture (Visual)**

```
Frontend (React Native)
    ↓ HTTP/WebSocket
Backend (FastAPI)
    ↓ Queries
MongoDB
    ↓
External APIs (Razorpay, OpenChargeMap)
```

---

## ✅ **Checklist Before Viva**

- [ ] Know tech stack (React Native, FastAPI, MongoDB)
- [ ] Understand JWT authentication flow
- [ ] Understand WebSocket real-time updates
- [ ] Know payment integration (Razorpay)
- [ ] Understand MongoDB geospatial queries
- [ ] Know how booking conflict detection works
- [ ] Understand Context API state management
- [ ] Know how trip planning calculates distance/battery
- [ ] Understand EV Assistant (rule-based, not AI)
- [ ] Know project structure (frontend/backend)

---

## 🗣️ **Opening Statement**

> "Good morning/afternoon. I've developed a comprehensive EV charging station booking application. It's a full-stack solution with a React Native mobile frontend and FastAPI backend. The app allows EV owners to discover nearby charging stations, book slots with real-time availability, process payments securely via Razorpay, and plan trips with battery estimates. Key technical highlights include JWT authentication with 2FA, WebSocket-based real-time synchronization, MongoDB geospatial queries for location-based services, and a rule-based chatbot assistant. The application is production-ready with proper error handling, security measures, and offline support."

---

## 🎯 **If Asked About Specific Code:**

**Say:** "I can explain the architecture and flow. The codebase is modular with separate services for different features. Key files include:
- Frontend: Context files for state, API service for backend communication
- Backend: FastAPI routers for different endpoints
- Database: MongoDB with Pydantic models for validation"

---

## 💡 **Key Points to Emphasize**

1. ✅ **Real-Time:** WebSocket for instant updates
2. ✅ **Security:** JWT + 2FA authentication
3. ✅ **Payment:** Razorpay integration with webhooks
4. ✅ **Location:** MongoDB geospatial queries
5. ✅ **Cross-Platform:** One codebase (iOS + Android)
6. ✅ **Production-Ready:** Error handling, validation, security

---

## 🚨 **If You Don't Know Something:**

**Say:** "That's a great question. The specific implementation details are in the codebase. The overall approach uses [relevant technology/concept]. Would you like me to explain how that technology works in general?"

---

**Remember:** Be confident! You built the entire app! 🚀

**Good luck!** 🎉

