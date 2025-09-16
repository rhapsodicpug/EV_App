/**
 * Liquid Hero Home Screen
 * Stunning fluid animation, depth, and organic shapes
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import {
  Clock,
  Zap,
  Star,
  ChevronRight,
  Filter,
  Bookmark,
  TrendingUp,
  AlertCircle,
  Calendar,
  Wifi,
  Coffee,
  Car,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Battery,
  Navigation,
  Settings,
  Bell,
  User,
  Activity,
  Plus,
  Heart,
  Home,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

// Liquid Hero Color Palette
const LIQUID_COLORS = {
  primary: '#00A8FF',
  secondary: '#8B5CF6',
  tertiary: '#06D6A0',
  success: '#10B981',
  accent: '#FF6B6B',
  background: '#0A0A0A',
  surface: '#101010',
  card: '#1A1A1A',
  border: '#282828',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
};

interface Station {
  id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: number;
  availableSlots?: number;
  totalSlots?: number;
  pricePerHour?: number;
  amenities?: string[];
  connectorTypes?: string[];
  isFavorite?: boolean;
  image?: string;
}

interface Booking {
  id: string;
  stationName: string;
  stationAddress: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'active' | 'completed';
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useAuth();
  
  // State
  const [stations, setStations] = useState<Station[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nearby' | 'recent' | 'favorites'>('nearby');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stationsError, setStationsError] = useState<string | null>(null);
  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animateLiquid = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(liquidAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(liquidAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateLiquid();
  }, []);

  // Get user's current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log('📍 Requesting location permission...');
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationError('Location permission denied. Please enable location services to see nearby stations.');
          console.log('❌ Location permission denied');
          return;
        }

        console.log('✅ Location permission granted, getting current position...');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        console.log('📍 Current location:', { latitude, longitude });

        setUserLocation({ latitude, longitude });
        setLocationError(null);

      } catch (error) {
        console.error('❌ Error getting location:', error);
        setLocationError('Unable to get your location. Please check your GPS settings.');
      }
    };

    getLocation();
  }, []);

  // Fetch stations when location changes
  useEffect(() => {
    if (userLocation) {
      console.log('🔄 Location changed, fetching stations...');
      loadData();
    }
  }, [userLocation]);

  // Scroll-based animations
  const heroFade = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Sticky header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [-30, 0],
    extrapolate: 'clamp',
  });


  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setStationsError(null);

      let stationsResponse;

      // Use location-based API if we have user location, otherwise fallback to regular API
      if (userLocation) {
        console.log('📡 Fetching stations using location:', userLocation);
        stationsResponse = await apiService.getStationsByLocation(
          userLocation.latitude,
          userLocation.longitude,
          20
        );
        console.log('✅ Got stations from API:', stationsResponse.count, 'stations');
      } else {
        console.log('📡 Fetching stations without location (fallback)');
        stationsResponse = await apiService.getStations(0, 20);
      }

      // Set stations data
      setStations(stationsResponse.stations || []);

      // Set recent stations (first 5)
      setRecentStations((stationsResponse.stations || []).slice(0, 5));

      // Mock upcoming booking (you can replace this with real booking data later)
      if ((stationsResponse.stations || []).length > 0) {
        const firstStation = stationsResponse.stations[0];
        setUpcomingBooking({
          id: '1',
          stationName: firstStation.name,
          stationAddress: firstStation.address,
          date: 'Today',
          time: '2:00 PM',
          duration: '2 hours',
          status: 'upcoming',
        });
      }

    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      setStationsError('Failed to load charging stations. Please check your connection.');

      // Show user-friendly error message
      if (error.message?.includes('Network')) {
        setStationsError('Network error. Please check your internet connection.');
      } else if (error.response?.status === 404) {
        setStationsError('Charging station service temporarily unavailable.');
      } else if (error.response?.status >= 500) {
        setStationsError('Server error. Please try again later.');
      }

      // Don't show alert, let the UI handle the error state
      console.error('❌ Stations API error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };



  const handleStationPress = (station: Station) => {
    (navigation as any).navigate('Search', {
      screen: 'StationDetailsBooking',
      params: { station }
    });
  };

  const handleBookingPress = () => {
    (navigation as any).navigate('Bookings', {
      screen: 'BookingConfirmation',
      params: {
        stationName: upcomingBooking?.stationName,
        stationAddress: upcomingBooking?.stationAddress,
        date: upcomingBooking?.date,
        time: upcomingBooking?.time,
        duration: upcomingBooking?.duration,
      },
    });
  };

  useEffect(() => {
    // Only load data if we have location or if location failed (for fallback)
    if (userLocation || locationError) {
      loadData();
    }

    // Log current greeting for verification
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
    const username = user?.email?.split('@')[0] || 'User';
    console.log('🧪 VERIFICATION: Current greeting should be:', `Good ${greeting}, ${username}!`);
    console.log('🧪 VERIFICATION: Quick action buttons should be REMOVED');
  }, [userLocation, locationError]);

  const renderLiquidBackground = () => (
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
            {
              rotate: liquidAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '5deg'],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[LIQUID_COLORS.primary, LIQUID_COLORS.secondary, LIQUID_COLORS.tertiary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Animated blobs */}
        <Animated.View
          style={[
            styles.blob,
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
                {
                  scale: liquidAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.8],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
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
                {
                  scale: liquidAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1.1, 0.7, 1.1],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Floating particles */}
        <View style={styles.particles}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  transform: [
                    {
                      translateY: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30 + i * 5],
                      }),
                    },
                    {
                      scale: liquidAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1, 0.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderFloatingHeroContent = () => (
    <Animated.View
      style={[
        styles.heroContent,
        {
          opacity: heroFade,
          transform: [{ translateY: heroTranslate }],
        },
      ]}
    >
      <View style={styles.heroContentInner}>
        <View style={styles.heroHeader}>
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={16} color={LIQUID_COLORS.primary} />
            <Text style={styles.locationText}>
              {userLocation
                ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`
                : locationError
                  ? 'Location unavailable'
                  : 'Detecting location...'
              }
            </Text>
          </View>
          <Text style={styles.heroHeadline}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'User'}!
          </Text>
          <Text style={styles.heroSubtitle}>
            Ready to power up your journey?
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderStickyHeader = () => (
    <Animated.View
      style={[
        styles.stickyHeader,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }],
        },
      ]}
    >
      <LinearGradient
        colors={[LIQUID_COLORS.surface, LIQUID_COLORS.card]}
        style={styles.stickyHeaderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.stickyHeaderContent}>
          <View style={styles.stickyHeaderTop}>
            <View style={styles.stickyHeaderLeft}>
              <View style={styles.stickyHeaderAvatar}>
                <Text style={styles.stickyHeaderAvatarText}>
                  {user?.name?.split(' ')[0]?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.stickyHeaderTextContainer}>
                <Text style={styles.stickyHeaderTitle}>
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'User'}!
                </Text>
                <View style={styles.stickyHeaderLocation}>
                  <Ionicons name="location" size={12} color={LIQUID_COLORS.primary} />
                  <Text style={styles.stickyHeaderLocationText}>
                    {userLocation
                      ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`
                      : locationError
                        ? 'Location unavailable'
                        : 'Detecting...'
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );


  const renderRisingSheet = () => {
    const getCurrentStations = () => {
      switch (activeTab) {
        case 'nearby':
          return stations;
        case 'recent':
          return recentStations;
        case 'favorites':
          return stations.filter(station => station.rating && station.rating > 4.5); // Mock favorites
        default:
          return stations;
      }
    };

    const getTabTitle = () => {
      switch (activeTab) {
        case 'nearby':
          return 'Nearby Stations';
        case 'recent':
          return 'Recently Visited';
        case 'favorites':
          return 'Favorite Stations';
        default:
          return 'Stations';
      }
    };

    const currentStations = getCurrentStations();

    // Quick Stats Component
    const QuickStats = () => (
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatsCard}>
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Zap size={20} color={LIQUID_COLORS.primary} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatNumber}>{stations.length}</Text>
              <Text style={styles.quickStatLabel}>Stations</Text>
            </View>
          </View>
          
          <View style={styles.quickStatDivider} />
          
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Navigation size={20} color={LIQUID_COLORS.success} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatNumber}>
                {stations.reduce((acc, station) => acc + (station.availableSlots || 0), 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Available</Text>
            </View>
          </View>
          
          <View style={styles.quickStatDivider} />
          
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Clock size={20} color={LIQUID_COLORS.accent} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatNumber}>
                {upcomingBooking ? '1' : '0'}
              </Text>
              <Text style={styles.quickStatLabel}>Bookings</Text>
            </View>
          </View>
        </View>
      </View>
    );

    // Weather Widget Component
    const WeatherWidget = () => (
      <View style={styles.weatherWidgetContainer}>
        <LinearGradient
          colors={[LIQUID_COLORS.card, LIQUID_COLORS.surface]}
          style={styles.weatherWidget}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.weatherContent}>
            <View style={styles.weatherIcon}>
              <Sun size={24} color="#FFD700" />
            </View>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>28°C</Text>
              <Text style={styles.weatherDesc}>Perfect for charging</Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Wind size={14} color={LIQUID_COLORS.text.secondary} />
                <Text style={styles.weatherDetailText}>12 km/h</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Thermometer size={14} color={LIQUID_COLORS.text.secondary} />
                <Text style={styles.weatherDetailText}>65%</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );

    return (
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
        {/* Inner Shadow */}
        <View style={styles.innerShadow} />

        {/* Quick Stats */}
        <QuickStats />

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Upcoming Booking */}
        {upcomingBooking && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Next Charge</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>Active</Text>
              </View>
            </View>
            <LinearGradient
              colors={[LIQUID_COLORS.primary, LIQUID_COLORS.secondary]}
              style={styles.bookingCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.bookingCard}
                onPress={handleBookingPress}
                activeOpacity={0.8}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingIcon}>
                    <Calendar size={20} color={LIQUID_COLORS.primary} />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingTitle}>{upcomingBooking.stationName}</Text>
                    <Text style={styles.bookingSubtitle}>{upcomingBooking.stationAddress}</Text>
                  </View>
                  <ChevronRight size={20} color={LIQUID_COLORS.text.tertiary} />
                </View>
                <View style={styles.bookingDetails}>
                  <View style={styles.bookingDetailRow}>
                    <Ionicons name="time-outline" size={14} color={LIQUID_COLORS.text.secondary} />
                    <Text style={styles.bookingDetail}>
                      {upcomingBooking.date} • {upcomingBooking.time}
                    </Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Ionicons name="battery-charging" size={14} color={LIQUID_COLORS.text.secondary} />
                    <Text style={styles.bookingDetail}>
                      Duration: {upcomingBooking.duration}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            {(['nearby', 'recent', 'favorites'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Station List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{getTabTitle()}</Text>
            <Ionicons name="location-outline" size={18} color={LIQUID_COLORS.primary} />
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingItem}>
                <View style={[styles.statusDot, { backgroundColor: LIQUID_COLORS.surface }]} />
                <View style={styles.stationIcon}>
                  <Activity size={20} color={LIQUID_COLORS.text.tertiary} />
                </View>
                <View style={styles.loadingTextContainer}>
                  <View style={styles.loadingText} />
                  <View style={styles.loadingSubtext} />
                </View>
              </View>
              <Text style={styles.loadingMessage}>Finding nearby charging stations...</Text>
            </View>
          )}

          {/* Error State */}
          {stationsError && !isLoading && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <AlertCircle size={24} color={LIQUID_COLORS.accent} />
              </View>
              <Text style={styles.errorTitle}>Unable to load stations</Text>
              <Text style={styles.errorMessage}>{stationsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadData}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No Data State */}
          {!isLoading && !stationsError && currentStations.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Zap size={32} color={LIQUID_COLORS.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No stations found</Text>
              <Text style={styles.emptyMessage}>
                {userLocation
                  ? 'No charging stations found in your area. Try expanding your search.'
                  : 'Enable location services to find nearby charging stations.'
                }
              </Text>
            </View>
          )}

          {/* Station List */}
          {!isLoading && !stationsError && currentStations.map((station, index) => {
            const getStatusColor = () => {
              if (station.rating && station.rating >= 4.5) return LIQUID_COLORS.success;
              if (station.rating && station.rating >= 3.5) return '#FFA500'; // Orange
              return '#FF6B6B'; // Red
            };

            return (
              <TouchableOpacity
                key={station.id}
                style={[
                  styles.stationRow,
                  index === currentStations.length - 1 && styles.lastRow,
                ]}
                onPress={() => handleStationPress(station)}
                activeOpacity={0.8}
              >
                <View style={styles.stationLeft}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                  <View style={styles.stationIcon}>
                    <Zap size={20} color={LIQUID_COLORS.primary} />
                  </View>
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <Text style={styles.stationAddress}>{station.address}</Text>
                </View>
                <View style={styles.stationMeta}>
                  <View style={styles.metaItem}>
                    <Navigation size={12} color={LIQUID_COLORS.text.secondary} />
                    <Text style={styles.metaText}>{station.distance || 'N/A'}km</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={12} color="#FFD700" />
                    <Text style={styles.metaText}>{station.rating || 'N/A'}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={LIQUID_COLORS.text.tertiary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />
      
      {/* Liquid Hero Background */}
      {renderLiquidBackground()}
      
      {/* Floating Hero Content */}
      {renderFloatingHeroContent()}
      
      {/* Sticky Header */}
      {renderStickyHeader()}
      
      {/* Rising Sheet */}
      {renderRisingSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.background,
  },

  // Liquid Background
  liquidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    overflow: 'hidden',
  },

  gradientBackground: {
    flex: 1,
    position: 'relative',
  },

  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },

  blob1: {
    top: 50,
    right: 30,
  },

  blob2: {
    bottom: 80,
    left: 20,
  },

  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },

  // Hero Content
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  heroContentInner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },

  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },

  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: LIQUID_COLORS.text.secondary,
    marginLeft: 6,
  },

  heroHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  heroHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },


  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: LIQUID_COLORS.text.tertiary,
    fontWeight: '400',
  },

  // Hero Stats
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
  },

  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },

  weatherText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginLeft: 6,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.primary,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LIQUID_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },


  // Hero Footer
  heroFooter: {
    alignItems: 'center',
  },

  footerBadges: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },

  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },

  footerBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: LIQUID_COLORS.text.secondary,
  },

  heroFooterText: {
    fontSize: 14,
    fontWeight: '500',
    color: LIQUID_COLORS.text.secondary,
    letterSpacing: 1,
    opacity: 0.8,
  },

  // Sticky Header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Reduced height since we removed bottom section
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  stickyHeaderGradient: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: LIQUID_COLORS.border,
  },

  stickyHeaderContent: {
    flex: 1,
    paddingHorizontal: 28, // Increased horizontal padding
    paddingTop: 44, // Increased top padding for better spacing
    paddingBottom: 20, // Increased bottom padding
    justifyContent: 'center', // Center content vertically
  },

  stickyHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stickyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stickyHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIQUID_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  stickyHeaderAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  stickyHeaderTextContainer: {
    flex: 1,
  },

  stickyHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 2,
  },

  stickyHeaderLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stickyHeaderLocationText: {
    fontSize: 12,
    color: LIQUID_COLORS.text.secondary,
    marginLeft: 4,
    fontWeight: '500',
  },




  // Rising Sheet
  risingSheet: {
    position: 'absolute',
    top: height * 0.4,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: LIQUID_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  sheetContent: {
    paddingTop: 40,
    paddingBottom: 100,
    paddingHorizontal: 24,
  },

  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Sections
  section: {
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    letterSpacing: 0.5,
  },

  sectionBadge: {
    backgroundColor: LIQUID_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Tab Navigation
  tabContainer: {
    marginBottom: 24,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 24,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: LIQUID_COLORS.primary,
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
    textTransform: 'capitalize',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  // Booking Card
  bookingCardGradient: {
    borderRadius: 16,
    padding: 2, // This creates the gradient border effect
    marginBottom: 8,
  },

  bookingCard: {
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 14, // Slightly smaller than gradient wrapper
    padding: 20,
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  bookingInfo: {
    flex: 1,
  },

  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },

  bookingSubtitle: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
  },

  bookingDetails: {
    gap: 8,
    marginTop: 12,
  },

  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  bookingDetail: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    fontWeight: '500',
  },

  // Station Rows
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIQUID_COLORS.border,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  stationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LIQUID_COLORS.success,
    marginRight: 8,
    shadowColor: LIQUID_COLORS.success,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },

  stationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stationInfo: {
    flex: 1,
  },

  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },

  stationAddress: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
  },

  stationMeta: {
    alignItems: 'flex-end',
    marginRight: 8,
    gap: 4,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    color: LIQUID_COLORS.text.tertiary,
    fontWeight: '500',
  },

  // Loading, Error, and Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },

  loadingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  loadingText: {
    height: 16,
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 8,
    marginBottom: 8,
  },

  loadingSubtext: {
    height: 12,
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 6,
    width: '60%',
  },

  loadingMessage: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: LIQUID_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LIQUID_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Quick Stats Styles
  quickStatsContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  quickStatsCard: {
    flexDirection: 'row',
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickStatContent: {
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: LIQUID_COLORS.text.secondary,
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: LIQUID_COLORS.border,
    marginHorizontal: 16,
  },

  // Weather Widget Styles
  weatherWidgetContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  weatherWidget: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    fontWeight: '500',
  },
  weatherDetails: {
    alignItems: 'flex-end',
    gap: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: 12,
    color: LIQUID_COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default HomeScreen;
