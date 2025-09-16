/**
 * Main App Component
 * Entry point for the EV Charging App
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { VehicleProvider } from './src/contexts/VehicleContext';
import { PaymentMethodProvider } from './src/contexts/PaymentMethodContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer>
      <StatusBar
        style="light"
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VehicleProvider>
          <PaymentMethodProvider>
            <AppContent />
          </PaymentMethodProvider>
        </VehicleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}