/**
 * Home Navigator
 * Handles home screen and related screens like notifications
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import BookingNotificationsScreen from '../screens/BookingNotificationsScreen';

const Stack = createStackNavigator();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
      />
      <Stack.Screen 
        name="BookingNotifications" 
        component={BookingNotificationsScreen}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;

