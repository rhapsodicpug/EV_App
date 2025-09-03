/**
 * Liquid Hero Home Screen
 * Premium EV charging app with dynamic liquid background and fluid animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import {
  MapPin,
  Star,
  Search,
  Zap,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../design';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Liquid colors for dynamic background
const LIQUID_COLORS = {
  primary: '#00A8FF', // Electric blue
  secondary: '#6366F1', // Indigo purple
  tertiary: '#06B6D4', // Cyan teal
  background: '#0F0F0F', // Very dark gray
  sheet: '#101010', // Dark gray for rising sheet
  surface: '#1A1A1A', // Surface color
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

// Mock data for Liquid Hero design
const MOCK_NEARBY_STATIONS = [
  {
    id: '1',
    name: 'Central Station Hub',
    address: 'Mumbai Central, Mumbai',
    available: 3,
    total: 5,
    distance: 1.2,
    connector: 'CCS',
    price: 15,
  },
  {
    id: '2',
    name: 'Mall Charging Point',
    address: 'Bandra West, Mumbai',
    available: 1,
    total: 4,
    distance: 2.8,
    connector: 'Type 2',
    price: 12,
  },
  {
    id: '3',
    name: 'Airport Terminal',
    address: 'Andheri East, Mumbai',
    available: 5,
    total: 6,
    distance: 4.5,
    connector: 'CCS',
    price: 20,
  },
];

const MOCK_FAVORITES = [
  {
    id: '4',
    name: 'Home Charging Hub',
    address: 'Your Home, Mumbai',
    available: 2,
    total: 2,
    distance: 0,
    connector: 'Tesla',
    price: 8,
  },
];

// Helper functions for Liquid Hero
const getUserName = (user: any) => {
  return user?.name || user?.email?.split('@')[0] || 'User';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

const getNearbyChargersCount = () => {
  // In a real app, this would fetch from API or use location data
  // For now, return the count from mock data
  const count = MOCK_NEARBY_STATIONS.length;
  return count;
};

const getNearbyChargersText = () => {
  const count = getNearbyChargersCount();
  if (count === 0) return 'No chargers available nearby';
  if (count === 1) return '1 charger available nearby';
  return `${count} chargers available nearby`;
};

const HomeScreen: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  const navigation = useNavigation();

  // State for Liquid Hero
  const [activeTab, setActiveTab] = useState<'Nearby' | 'Favorites'>('Nearby');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values for Liquid Hero
  const scrollY = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;

  // Hero content fade animation
  const heroFade = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Liquid background morphing animation
  useEffect(() => {
    const morphAnimation = () => {
      Animated.sequence([
        Animated.timing(liquidAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => morphAnimation());
    };
    morphAnimation();
  }, []);

  // Get current stations based on active tab
  const currentStations = activeTab === 'Nearby' ? MOCK_NEARBY_STATIONS : MOCK_FAVORITES;

  // Filter stations based on search
  const filteredStations = searchQuery.trim()
    ? currentStations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentStations;

  // Handler functions
  const handleNearbyPress = () => {
    navigation.navigate('Stations' as never);
  };

  const handleFavoritesPress = () => {
    setActiveTab('Favorites');
  };

  const handleStationPress = (station: any) => {
    // Navigate to station details
    console.log('Navigate to station:', station.name);
  };

  // Check if user needs to log in
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />
        <View style={styles.authRequiredContainer}>
          <View style={styles.authRequiredContent}>
            <Text style={styles.authRequiredTitle}>Welcome to EV Charging</Text>
            <Text style={styles.authRequiredSubtitle}>
              Please log in to access your personalized dashboard and find nearby charging stations.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />

      {/* Liquid Hero Section */}
      <Animated.View style={[styles.heroContainer, { opacity: heroFade }]}>
        <Animated.View
          style={[
            styles.liquidBackground,
            {
              transform: [
                {
                  scale: liquidAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              LIQUID_COLORS.primary,
              LIQUID_COLORS.secondary,
              LIQUID_COLORS.tertiary,
              LIQUID_COLORS.primary,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Animated liquid blobs */}
            <Animated.View
              style={[
                styles.liquidBlob,
                styles.blob1,
                {
                  transform: [
                    {
                      translateX: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 30],
                      }),
                    },
                    {
                      translateY: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.liquidBlob,
                styles.blob2,
                {
                  transform: [
                    {
                      translateX: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -25],
                      }),
                    },
                    {
                      translateY: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15],
                      }),
                    },
                  ],
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>

        {/* Floating Hero Content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroHeadline}>
            {getGreeting()}, {getUserName(user)}.
          </Text>

          <Text style={styles.heroSubheadline}>
            {getNearbyChargersText()}
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={LIQUID_COLORS.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for charging stations..."
                placeholderTextColor={LIQUID_COLORS.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleNearbyPress}
              activeOpacity={0.8}
            >
              <MapPin size={24} color={LIQUID_COLORS.text.primary} />
              <Text style={styles.quickActionText}>Nearby Chargers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleFavoritesPress}
              activeOpacity={0.8}
            >
              <Star size={24} color={LIQUID_COLORS.text.primary} />
              <Text style={styles.quickActionText}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Rising Sheet */}
      <Animated.ScrollView
        style={styles.risingSheet}
        contentContainerStyle={styles.sheetContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Inner Shadow for Depth */}
        <View style={styles.innerShadow} />

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Nearby' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('Nearby')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Nearby' && styles.activeTabText,
              ]}
            >
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Favorites' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('Favorites')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Favorites' && styles.activeTabText,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
        </View>

        {/* Borderless Station List */}
        <View style={styles.stationsList}>
          {filteredStations.map((station, index) => (
            <TouchableOpacity
              key={station.id}
              style={styles.stationRow}
              onPress={() => handleStationPress(station)}
              activeOpacity={0.7}
            >
              {/* Status Circle */}
              <View style={styles.statusCircle}>
                <Zap size={16} color={LIQUID_COLORS.primary} />
              </View>

              {/* Station Info */}
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationAddress}>{station.address}</Text>
                <View style={styles.stationMeta}>
                  <Text style={styles.stationMetaText}>
                    {station.available}/{station.total} Available
                  </Text>
                  <Text style={styles.stationMetaText}>
                    {station.distance} km • {station.connector}
                  </Text>
                </View>
              </View>

              {/* Chevron */}
              <ChevronRight size={20} color={LIQUID_COLORS.text.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

// Styles for the Liquid Hero HomeScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.background,
  },

  // Authentication Required Screen
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authRequiredContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  authRequiredTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  authRequiredSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: LIQUID_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
  },

  // Liquid Hero Section
  heroContainer: {
    height: height * 0.6, // 60% of screen height
    position: 'relative',
    overflow: 'hidden',
  },
  liquidBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  liquidBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blob1: {
    top: 50,
    right: 30,
  },
  blob2: {
    bottom: 80,
    left: 20,
  },

  // Floating Hero Content
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Account for status bar
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubheadline: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: LIQUID_COLORS.text.primary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 120,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginTop: 8,
  },

  // Rising Sheet
  risingSheet: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.sheet,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // Overlap with hero
  },
  sheetContent: {
    paddingTop: 40, // Account for rounded corners
    paddingBottom: 100, // Account for tab bar
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: LIQUID_COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
  },
  activeTabText: {
    color: LIQUID_COLORS.text.primary,
  },

  // Borderless Station List
  stationsList: {
    paddingHorizontal: 24,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  statusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIQUID_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 4,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationMetaText: {
    fontSize: 12,
    color: LIQUID_COLORS.text.muted,
    marginRight: 16,
  },
});

// Export the component
export default HomeScreen;
