/**
 * Profile Navigator
 * Handles profile-related screens (profile, edit profile, vehicle info, settings)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyVehicleScreen from '../screens/MyVehicleScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/AddPaymentMethodScreen';
import AppPreferencesScreen from '../screens/AppPreferencesScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AboutScreen from '../screens/AboutScreen';
import GettingStartedTutorial from '../screens/tutorials/GettingStartedTutorial';
import BookingTutorial from '../screens/tutorials/BookingTutorial';
import PaymentGuide from '../screens/tutorials/PaymentGuide';
import ChatbotScreen from '../screens/ChatbotScreen';
import TripResultsScreen from '../screens/trip/TripResultsScreen';
import TwoFactorSetupScreen from '../screens/settings/TwoFactorSetupScreen';

const Stack = createStackNavigator();

const ProfileNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.accent,
          shadowColor: theme.colors.shadow.light,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 22,
          letterSpacing: 0.5,
        },
        cardStyle: { backgroundColor: theme.colors.background },
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
          headerShown: false, // Use custom header
        }}
      />
      <Stack.Screen
        name="MyVehicle"
        component={MyVehicleScreen}
        options={{
          title: 'My Vehicle',
          headerBackTitle: 'Back',
          headerShown: false, // Use custom header
        }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: 'Add Vehicle',
          headerBackTitle: 'Back',
          headerShown: false, // Use custom header
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          title: 'Payment Methods',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddPaymentMethod"
        component={AddPaymentMethodScreen}
        options={{
          title: 'Add Payment Method',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          title: 'Help & Support',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: 'Send Feedback',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About App',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AppPreferences"
        component={AppPreferencesScreen}
        options={{
          title: 'Preferences',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GettingStartedTutorial"
        component={GettingStartedTutorial}
        options={{
          title: 'Getting Started',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookingTutorial"
        component={BookingTutorial}
        options={{
          title: 'Booking Tutorial',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentGuide"
        component={PaymentGuide}
        options={{
          title: 'Payment Guide',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: 'EV Assistant',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TripResults"
        component={TripResultsScreen}
        options={{
          title: 'Trip Plan',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetupScreen}
        options={{
          title: 'Setup 2FA',
          headerBackTitle: 'Back',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
