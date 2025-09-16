/**
 * Floating Navigation Bar - Premium Icons-Only Implementation
 * Modern floating pill-shaped navigation with magic dot indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/api';
import EnhancedFloatingNavigation from '../components/ui/EnhancedFloatingNavigation';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import StationNavigator from './StationNavigator';
import BookingNavigator from './BookingNavigator';
import ProfileNavigator from './ProfileNavigator';
import MapNavigator from './MapNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

import {
  Home,
  Zap,
  Map,
  Calendar,
  User,
} from 'lucide-react-native';

// Navigation item data with Lucide icons
const navigationItems = [
  { id: 'Home', label: 'Home', icon: Home, screen: 'Home' },
  { id: 'Stations', label: 'Stations', icon: Zap, screen: 'Search' },
  { id: 'Map', label: 'Map', icon: Map, screen: 'Map' },
  { id: 'Bookings', label: 'Bookings', icon: Calendar, screen: 'Bookings' },
  { id: 'Profile', label: 'You', icon: User, screen: 'Profile' },
];

// Custom Tab Bar Component - Floating Navigation
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const handleItemPress = (index: number, item: typeof navigationItems[0]) => {
    // Check if we're already on the target screen to prevent unnecessary navigation
    if (state.index === index) {
      return;
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(state.routes[index].name);
    }
  };

  return (
    <EnhancedFloatingNavigation
      items={navigationItems}
      activeIndex={state.index}
      onItemPress={handleItemPress}
    />
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Search"
        component={StationNavigator}
        options={{
          title: 'Stations',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          title: 'Map',
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingNavigator}
        options={{
          title: 'Bookings',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'You',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
