/**
 * Booking Navigator
 * Handles booking-related screens (list, detail)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BookingStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens
import BookingListScreen from '../screens/bookings/BookingListScreen';
import { SlotSelectionScreen } from '../screens/bookings/SlotSelectionScreen';

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
        component={BookingListScreen}
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
    </Stack.Navigator>
  );
};

export default BookingNavigator;
