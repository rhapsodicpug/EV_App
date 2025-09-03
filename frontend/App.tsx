/**
 * Main App Component
 * Entry point for the EV Charging App
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/design/ThemeContext';
import { useThemeColors } from './src/design';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { colors, isDark } = useThemeColors();
  
  return (
    <NavigationContainer>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={colors.primary} 
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}