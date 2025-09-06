/**
 * Booking Navigator
 * Handles booking-related screens (list, detail)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BookingStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens
import BookingScreen from '../screens/BookingScreen';
import { SlotSelectionScreen } from '../screens/bookings/SlotSelectionScreen';
import { BookingConfirmationScreen } from '../screens/bookings/BookingConfirmationScreen';

const Stack = createStackNavigator<BookingStackParamList>();

const BookingNavigator: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <Stack.Navigator
      initialRouteName="BookingsMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
          ...Elevation.level2,
        },
        headerTintColor: Colors.neutral.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 22,
          letterSpacing: 0.5,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="BookingsMain" 
        component={BookingScreen}
        options={{
          title: 'My Bookings',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SlotSelection" 
        component={SlotSelectionScreen}
        options={{
          title: 'Select Time Slot',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{
          title: 'Confirm Booking',
          headerShown: false,
        }}
        getId={({ params }) => {
          // Create unique key based on booking parameters to force re-render
          if (params) {
            const { station, startTime, endTime, cost, selectedSlot, selectedDate, totalPrice } = params;
            return `${station?.id || 'unknown'}-${startTime || 'unknown'}-${endTime || 'unknown'}-${cost || totalPrice || 'unknown'}`;
          }
          return 'default';
        }}
      />
    </Stack.Navigator>
  );
};

export default BookingNavigator;
