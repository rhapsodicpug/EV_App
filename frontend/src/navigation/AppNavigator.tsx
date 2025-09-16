/**
 * Main App Navigator
 * Handles the overall navigation structure
 */

import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import PaymentTestScreen from '../screens/PaymentTestScreen';
import { RootStackParamList } from '../types/api';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      setIsFirstTime(hasSeenWelcome === null);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(true); // Default to showing welcome screen
    }
  };

  const markWelcomeAsSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
    }
  };

  // Show splash screen while checking auth status or first time status
  if (isLoading || isFirstTime === null) {
    return (
      <SafeAreaProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isFirstTime ? (
          // Show welcome screen for first-time users
          <Stack.Screen 
            name="Welcome" 
            options={{
              gestureEnabled: false,
            }}
          >
            {() => <WelcomeScreen onComplete={markWelcomeAsSeen} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          // User is authenticated, show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not authenticated, show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        
        {/* Payment Test Screen - Available from anywhere */}
        <Stack.Screen 
          name="PaymentTest" 
          component={PaymentTestScreen}
          options={{
            title: 'Payment Test',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0F0F0F',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
