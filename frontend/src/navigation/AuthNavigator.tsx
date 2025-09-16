/**
 * Authentication Navigator
 * Handles login, register, and forgot password screens
 */

import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/api';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import BackToGetStartedScreen from '../screens/auth/BackToGetStartedScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'SignUp'>('Login');

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const startWithSignUp = await AsyncStorage.getItem('startWithSignUp');
      if (startWithSignUp === 'true') {
        setInitialRoute('SignUp');
        // Clear the flag after using it
        await AsyncStorage.removeItem('startWithSignUp');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
    }
  };

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#1A1A1A' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
      <Stack.Screen 
        name="BackToGetStarted" 
        component={BackToGetStartedScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
