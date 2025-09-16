/**
 * Main App Component
 * Entry point for the EV Charging App
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './frontend/src/contexts/AuthContext';
import { ThemeProvider } from './frontend/src/design/ThemeContext';
import { useThemeColors } from './frontend/src/design';
import AppNavigator from './frontend/src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar
        style="light"
        backgroundColor="#0F0F0F"
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