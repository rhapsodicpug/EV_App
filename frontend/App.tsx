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
import { BookingProvider } from './src/contexts/BookingContext';
import { BatteryHealthProvider } from './src/contexts/BatteryHealthContext';
import { RangeAnxietyProvider } from './src/contexts/RangeAnxietyContext';
import { SmartNotificationProvider } from './src/contexts/SmartNotificationContext';
import { PredictiveMaintenanceProvider } from './src/contexts/PredictiveMaintenanceContext';
import { AIChatbotProvider } from './src/contexts/AIChatbotContext';
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
            <BookingProvider>
              <BatteryHealthProvider>
                <RangeAnxietyProvider>
                  <SmartNotificationProvider>
                    <PredictiveMaintenanceProvider>
                      <AIChatbotProvider userId="default_user">
                        <AppContent />
                      </AIChatbotProvider>
                    </PredictiveMaintenanceProvider>
                  </SmartNotificationProvider>
                </RangeAnxietyProvider>
              </BatteryHealthProvider>
            </BookingProvider>
          </PaymentMethodProvider>
        </VehicleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}