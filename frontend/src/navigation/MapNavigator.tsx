import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MapStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens
import InteractiveMapScreen from '../screens/maps/InteractiveMapScreen';
import StationDetailsScreen from '../screens/stations/StationDetailsScreen';

const Stack = createStackNavigator<MapStackParamList>();

const MapNavigator: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <Stack.Navigator
      initialRouteName="InteractiveMap"
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
        name="InteractiveMap" 
        component={InteractiveMapScreen}
        options={{
          title: 'Map View',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="StationDetails" 
        component={StationDetailsScreen}
        options={{
          title: 'Station Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default MapNavigator;
