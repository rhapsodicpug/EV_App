/**
 * Station Navigator
 * Handles station-related screens (list, detail, booking)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StationStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens (we'll create these next)
import StationListScreen from '../screens/stations/StationListScreen';
import StationDetailScreen from '../screens/stations/StationDetailScreen';
import BookingFormScreen from '../screens/bookings/BookingFormScreen';

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
        component={StationDetailScreen}
        options={{
          title: 'Station Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="BookingForm" 
        component={BookingFormScreen}
        options={{
          title: 'Book Charging Slot',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default StationNavigator;
