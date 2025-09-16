/**
 * Station Navigator
 * Handles station-related screens (list, detail, booking)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StationStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens
import StationListScreen from '../screens/stations/StationListScreen';
import StationDetailsScreen from '../screens/stations/StationDetailsScreen';
import StationBookingScreen from '../screens/stations/StationBookingScreen';
import StationDetailsBookingScreen from '../screens/stations/StationDetailsBookingScreen';
import BookSlotScreen from '../screens/bookings/BookSlotScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingConfirmedScreen from '../screens/bookings/BookingConfirmedScreen';

const Stack = createStackNavigator<StationStackParamList>();

const StationNavigator: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <Stack.Navigator
      initialRouteName="StationList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="StationList"
        component={StationListScreen}
        options={{
          title: 'Charging Stations',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="StationDetail"
        component={StationDetailsScreen}
        options={{
          title: 'Station Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="StationBooking"
        component={StationBookingScreen}
        options={{
          title: 'Book Charging Station',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="StationDetailsBooking"
        component={StationDetailsBookingScreen}
        options={{
          title: 'Station Details & Booking',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="BookSlot"
        component={BookSlotScreen}
        options={{
          title: 'Book a slot',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Payment',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookingConfirmed"
        component={BookingConfirmedScreen}
        options={{
          title: 'Booking Confirmed',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default StationNavigator;
