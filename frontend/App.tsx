/**
 * Main App Component
 * Entry point for the EV Charging App
 */

import React, { useEffect } from 'react';
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
import { NavigationBarProvider } from './src/contexts/NavigationBarContext';
import AlertProvider from './src/providers/AlertProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { bookingNotificationService } from './src/services/BookingNotificationService';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  // Initialize notification service on app start
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await bookingNotificationService.initialize();
        console.log('✅ Booking notifications initialized');
      } catch (error) {
        console.error('❌ Failed to initialize booking notifications:', error);
      }
    };

    initNotifications();
  }, []);

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
                        <NavigationBarProvider>
                          <AlertProvider>
                            <AppContent />
                          </AlertProvider>
                        </NavigationBarProvider>
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