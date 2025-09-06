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
    </Stack.Navigator>
  );
};

export default StationNavigator;
