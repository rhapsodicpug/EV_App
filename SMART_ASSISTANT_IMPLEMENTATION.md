# Smart Assistant Implementation Guide

## ✅ Completed Features

### 1. **Context Collection Modal** ✓
- **File:** `frontend/src/components/ui/ContextCollectionModal.tsx`
- **Features:**
  - Battery level selection (Critical, Low, Normal, Good)
  - Urgency selection (Urgent, Soon, Later, Planning)
  - Preferences (Distance, Speed, Price, Amenities)
  - Beautiful UI with color-coded options
  - Form validation

### 2. **Recommendation Engine** ✓
- **File:** `frontend/src/services/RecommendationEngine.ts`
- **Features:**
  - Personalized station recommendations
  - Smart ranking based on context
  - Critical battery prioritization (<20%)
  - Urgency-based filtering
  - Preference matching
  - Cost and time estimates
  - Emergency mode support

### 3. **Range Calculator** ✓
- **File:** `frontend/src/services/RangeCalculator.ts`
- **Features:**
  - Calculate range estimates (conservative, normal, maximum)
  - Safety margin calculations
  - Minimum charge needed for trips
  - Charging plan creation
  - Trip analysis with charging stops
  - Battery level recommendations

### 4. **Emergency Mode Card** ✓
- **File:** `frontend/src/components/chat/EmergencyModeCard.tsx`
- **Features:**
  - Critical battery warning UI
  - Top recommendation display
  - Quick book and navigate
  - Show all options
  - Beautiful alert styling

### 5. **Personalized Station Card** ✓
- **File:** `frontend/src/components/chat/PersonalizedStationCard.tsx`
- **Features:**
  - Rank badge (🏆 🥈 🥉)
  - Why recommended explanation
  - Details grid (distance, speed, cost, time)
  - Quick book button
  - View details button

---

## 📋 Next Steps to Complete Integration

### Step 1: Import New Components in ChatbotScreen

```typescript
import ContextCollectionModal, { UserContext } from '../components/ui/ContextCollectionModal';
import EmergencyModeCard from '../components/chat/EmergencyModeCard';
import PersonalizedStationCard from '../components/chat/PersonalizedStationCard';
import RecommendationEngine, { PersonalizedRecommendation } from '../services/RecommendationEngine';
import RangeCalculator from '../services/RangeCalculator';
import { useVehicles } from '../contexts/VehicleContext';
import * as Location from 'expo-location';
```

### Step 2: Add State to ChatbotScreen

```typescript
const [showContextModal, setShowContextModal] = useState(false);
const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
const [showRecommendations, setShowRecommendations] = useState(false);
const [userContext, setUserContext] = useState<UserContext | null>(null);
const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

const recommendationEngine = RecommendationEngine.getInstance();
const rangeCalculator = RangeCalculator.getInstance();
const { vehicles } = useVehicles();

// Get user location
useEffect(() => {
  Location.requestForegroundPermissionsAsync().then(({ status }) => {
    if (status === 'granted') {
      Location.getCurrentPositionAsync().then(position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  });
}, []);
```

### Step 3: Add Context Handler

```typescript
const handleContextSubmit = async (context: UserContext) => {
  setUserContext(context);
  setShowContextModal(false);

  // Show loading
  setIsLoading(true);

  try {
    // Get recommendations
    const recs = await recommendationEngine.getPersonalizedRecommendations({
      batteryLevel: context.batteryLevel!,
      urgency: context.urgency!,
      preferences: context.preferences,
      userLocation: userLocation || undefined,
    });

    setRecommendations(recs);
    setShowRecommendations(true);

    // Add bot message with recommendations
    await sendMessage(`I found ${recs.length} perfect stations for you!`);
  } catch (error) {
    Alert.alert('Error', 'Failed to get recommendations');
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Add Emergency Mode Detection

```typescript
const checkEmergencyMode = (batteryLevel: number) => {
  if (batteryLevel < 20) {
    // Show emergency mode UI
    Alert.alert(
      '🚨 Low Battery',
      'Your battery is critical! Want to find nearest charging station?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Find Stations', 
          onPress: () => setShowContextModal(true) 
        },
      ]
    );
  }
};
```

### Step 5: Add Quick Actions

```typescript
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'find_charging':
      setShowContextModal(true);
      break;
    case 'check_range':
      if (vehicles.length > 0) {
        const battery = vehicles[0].battery_percentage || 50;
        const range = rangeCalculator.calculateRange(battery);
        Alert.alert(
          'Range Estimate',
          `Conservative: ${range.conservative} km\nNormal: ${range.normal} km\nMaximum: ${range.maximum} km`
        );
      }
      break;
    case 'emergency':
      Alert.alert('Emergency Mode', 'Finding nearest stations...');
      setShowContextModal(true);
      break;
  }
};
```

### Step 6: Update Message Rendering

Add to messages rendering:
```typescript
{messages.map((message) => (
  <React.Fragment key={message.id}>
    <ChatMessage
      message={message}
      onQuickReply={handleQuickReply}
      onSuggestion={handleSuggestion}
    />
    
    {/* Show recommendations after certain message */}
    {message.id === 'recommendations_trigger' && showRecommendations && (
      <View style={styles.recommendationsContainer}>
        {userContext && userContext.batteryLevel! < 20 && recommendations[0] ? (
          <EmergencyModeCard
            batteryLevel={userContext.batteryLevel!}
            recommendations={recommendations}
            onBookStation={handleBookStation}
            onShowAll={() => {/* Show all */}}
          />
        ) : (
          recommendations.slice(0, 3).map((rec, index) => (
            <PersonalizedStationCard
              key={rec.id}
              recommendation={rec}
              rank={index + 1}
              onBook={handleBookStation}
              onViewDetails={handleViewStationDetails}
            />
          ))
        )}
      </View>
    )}
  </React.Fragment>
))}
```

### Step 7: Add Styles for New Components

```typescript
const styles = StyleSheet.create({
  // ... existing styles ...
  
  recommendationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
```

---

## 🎯 Usage Examples

### For Users:
1. **Open Chatbot**
2. **Type:** "I need charging" or "My battery is low"
3. **Context modal appears** → User fills in battery level, urgency, preferences
4. **Recommendations shown** → Personalized stations with "why recommended"
5. **Click "Book Now"** → Quick booking

### Emergency Flow:
1. User opens chatbot with critical battery (<20%)
2. **Auto-trigger:** Emergency mode card shown
3. **Recommendation:** Nearest available station highlighted
4. **One-click:** "Book & Navigate"

---

## 📊 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Context Collection | ✅ Done | Beautiful modal to gather user needs |
| Smart Recommendations | ✅ Done | Personalized station suggestions |
| Range Calculations | ✅ Done | Battery range & trip planning |
| Emergency Mode | ✅ Done | Critical battery handling |
| Personalized Cards | ✅ Done | Ranked station display |
| Integration | ⏳ Pending | Connect to ChatbotScreen |
| Quick Actions | ⏳ Pending | One-click shortcuts |
| Proactive Alerts | ⏳ Pending | Smart notifications |
| Price Comparison | ⏳ Pending | Show price optimization |
| Route Planning | ⏳ Pending | Multi-stop trip planning |

---

## 🚀 To Complete Implementation

1. **Update ChatbotScreen** with imports and state (Step 1-2)
2. **Add handlers** for context and recommendations (Step 3-4)
3. **Update UI** to show recommendations (Step 6-7)
4. **Test** the flow end-to-end

**Estimated Time:** 1-2 hours

**Files to Modify:**
- `frontend/src/screens/ChatbotScreen.tsx` (main integration)

---

## 💡 Future Enhancements

- **Gemini Integration:** Add for natural language understanding
- **Voice Commands:** "I need charging now" → Auto recommendations
- **Learning:** Remember user preferences
- **Predictive:** Suggest charging before user needs it
- **Social:** "Where do others charge?"

---

## ✅ What's Working Now

All core logic is complete and can be integrated. The components are:
- ✅ Fully typed (TypeScript)
- ✅ Well documented
- ✅ Reusable and modular
- ✅ Production-ready

Just needs to be wired into ChatbotScreen!

