/**
 * Profile Navigator
 * Handles profile-related screens (profile, edit profile, vehicle info, settings)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

// Import screens
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import VehicleInfoScreen from '../screens/VehicleInfoScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const ProfileNavigator: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
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
        name="ProfileMain" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="VehicleInfo" 
        component={VehicleInfoScreen}
        options={{
          title: 'Vehicle Information',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
