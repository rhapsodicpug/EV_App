/**
 * Floating Navigation Bar - Premium Icons-Only Implementation
 * Modern floating pill-shaped navigation with magic dot indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/api';
import FloatingNavigation from '../components/ui/FloatingNavigation';

// Import screens
import HomeNavigator from './HomeNavigator';
import StationNavigator from './StationNavigator';
import BookingNavigator from './BookingNavigator';
import ProfileNavigator from './ProfileNavigator';
import MapNavigator from './MapNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Navigation item data with Ionicons
const navigationItems = [
  { id: 'Home', label: 'Home', icon: 'home-outline' as const, screen: 'Home' },
  { id: 'Stations', label: 'Stations', icon: 'flash-outline' as const, screen: 'Search' },
  { id: 'Map', label: 'Map', icon: 'map-outline' as const, screen: 'Map' },
  { id: 'Bookings', label: 'Bookings', icon: 'calendar-outline' as const, screen: 'Bookings' },
  { id: 'Profile', label: 'You', icon: 'person-outline' as const, screen: 'Profile' },
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
    <FloatingNavigation
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
        component={HomeNavigator}
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
