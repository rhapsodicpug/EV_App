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
import GetStartedScreen from '../screens/GetStartedScreen';
import { RootStackParamList } from '../types/api';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasSeenGetStarted, setHasSeenGetStarted] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      const hasSeenGetStartedFlag = await AsyncStorage.getItem('hasSeenGetStarted');
      setIsFirstTime(hasSeenWelcome === null);
      setHasSeenGetStarted(hasSeenGetStartedFlag === null);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(true);
      setHasSeenGetStarted(true);
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

  const markGetStartedAsSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenGetStarted', 'true');
      setHasSeenGetStarted(false);
    } catch (error) {
      console.error('Error marking get started as seen:', error);
    }
  };

  const handleNavigateToAuth = async () => {
    try {
      // Set a flag to indicate we want to start with SignUp
      await AsyncStorage.setItem('startWithSignUp', 'true');
      markGetStartedAsSeen();
    } catch (error) {
      console.error('Error setting SignUp flag:', error);
      markGetStartedAsSeen();
    }
  };

  const handleNavigateToLogin = () => {
    console.log('🔐 handleNavigateToLogin called');
    markGetStartedAsSeen();
    // Navigate to login flow - this will be handled by the navigation state change
  };

  // Show splash screen while checking auth status or first time status
  if (isLoading || isFirstTime === null || hasSeenGetStarted === null) {
    console.log('🔄 Loading state:', { isLoading, isFirstTime, hasSeenGetStarted });
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

  console.log('🎯 Navigation state:', { isFirstTime, hasSeenGetStarted, isAuthenticated });

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
        ) : hasSeenGetStarted ? (
          // Show get started screen after welcome
          <Stack.Screen 
            name="GetStarted" 
            options={{
              gestureEnabled: false,
            }}
          >
            {() => (
              <GetStartedScreen 
                onNavigateToAuth={handleNavigateToAuth}
                onNavigateToLogin={handleNavigateToLogin}
              />
            )}
          </Stack.Screen>
        ) : isAuthenticated ? (
          // User is authenticated, show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not authenticated, show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
