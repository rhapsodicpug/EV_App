/**
 * Station List Screen
 * Displays list of charging stations with dynamic header
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ReanimatedAnimated, { 
  FadeInUp
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  MapPin,
  Zap,
  Star,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  ArrowLeft,
  Bell,
  User,
  DollarSign,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import StationCard from '../../components/custom/StationCard';
import { EVStation } from '../../types/api';
import apiService from '../../services/api';
import webSocketService from '../../services/WebSocketService';

const { width, height } = Dimensions.get('window');

// Color scheme matching the HomeScreen design
const STATION_COLORS = {
  primary: '#8cd279',
  secondary: '#8B5CF6',
  success: '#8cd279',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#3A3A3A',
  border: '#4A4A4A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#666666',
  },
  accent: '#8cd279',
  warning: '#F59E0B',
  error: '#EF4444',
};

const StationListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const [stations, setStations] = useState<EVStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<EVStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm] = useState(25); // Fixed radius - backend supports dynamic but UI removed
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Animated values
  const scrollY = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadStations();
    // Animate on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
  }, []);

  // Handle initial query from navigation
  useEffect(() => {
    const params = route.params as { initialQuery?: string };
    if (params?.initialQuery) {
      setSearchQuery(params.initialQuery);
    }
  }, [route.params]);

  // Helper function to calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter stations based on search query and active filters
  useEffect(() => {
    let filtered = [...stations];

    // Calculate distances if we have user location
    if (userLocation) {
      filtered = filtered.map(station => ({
        ...station,
        distance: station.location?.coordinates
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              station.location.coordinates[1], // latitude (second element in GeoJSON)
              station.location.coordinates[0]  // longitude (first element in GeoJSON)
            )
          : station.distance || 999 // Large number for stations without coordinates
      }));
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (activeFilters.size > 0) {
      filtered = filtered.filter(station => {
        // Available Now filter
        if (activeFilters.has('available')) {
          const hasAvailable = station.charging_slots?.some(slot => 
            slot.status === 'AVAILABLE'
          );
          if (!hasAvailable) return false;
        }

        // Fast Charging filter
        if (activeFilters.has('fast')) {
          const hasFastCharging = station.charging_slots?.some(slot => 
            slot.charger_type === 'DC_ULTRA_FAST' || 
            (slot.power_kw && slot.power_kw >= 50)
          );
          if (!hasFastCharging) return false;
        }

        // Within 5km filter
        if (activeFilters.has('nearby')) {
          const distance = station.distance || 999;
          if (distance > 5) return false;
        }

        // Budget Friendly filter (price <= 10)
        if (activeFilters.has('cheap')) {
          const hasCheapSlot = station.charging_slots?.some(slot => 
            slot.price_per_kwh && slot.price_per_kwh <= 10
          );
          if (!hasCheapSlot) return false;
        }

        return true;
      });
    }

    // Sort by distance if we have location data (nearest first)
    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = a.distance || 999;
        const distB = b.distance || 999;
        return distA - distB;
      });
      console.log('📍 Stations sorted by distance, nearest:', filtered[0]?.name, filtered[0]?.distance?.toFixed(2), 'km');
    }

    setFilteredStations(filtered);
  }, [searchQuery, stations, activeFilters, userLocation]);

  // Subscribe to WebSocket updates for real-time availability changes
  useEffect(() => {
    console.log('📡 Subscribing to WebSocket updates');
    
    const unsubscribe = webSocketService.subscribe((update) => {
      console.log('📡 Received WebSocket update:', update.type, update.station_id);
      
      if (update.type === 'booking_created' || update.type === 'booking_cancelled') {
        // Update the station in the stations array with new availability
        setStations(prevStations => {
          const updatedStations = prevStations.map(station => {
            if (station.id === update.station_id) {
              // Create updated station with new availability data
              const updatedStation: EVStation = {
                ...station,
                charging_slots: update.station.charging_slots.map((slot: any, index: number) => ({
                  ...slot,
                  status: slot.status || station.charging_slots?.[index]?.status || 'AVAILABLE',
                  slot_number: slot.slot_number || station.charging_slots?.[index]?.slot_number || index + 1,
                })),
              };
              
              // Update availability counts
              const availableCount = update.station.charging_slots.filter(
                (slot: any) => slot.status === 'AVAILABLE'
              ).length;
              const totalCount = update.station.charging_slots.length;
              
              console.log(`🔄 Updated station ${station.name}: ${availableCount}/${totalCount} available`);
              
              return updatedStation;
            }
            return station;
          });
          
          return updatedStations;
        });
      }
    });

    // Cleanup: unsubscribe on unmount
    return () => {
      console.log('📡 Unsubscribing from WebSocket updates');
      unsubscribe();
    };
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get user location for location-based search
      let stationData: any[] = [];

      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          // Get current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const { latitude, longitude } = location.coords;
          console.log('📍 Using location for station search:', { latitude, longitude, radiusKm });

          // Save user location for distance calculations
          setUserLocation({ latitude, longitude });

          // Fetch stations with location and radius
          const response = await apiService.getStationsByLocation(latitude, longitude, 50, radiusKm);
          stationData = response.stations || [];
        } else {
          console.log('📍 Location permission denied, fetching general stations');
          // Fallback to general station fetch
          const response = await apiService.getStations(0, 50);
          stationData = response.stations || (Array.isArray(response) ? response : []);
        }
      } catch (locationError) {
        console.log('📍 Location access failed, fetching general stations:', locationError);
        // Fallback to general station fetch
        const response = await apiService.getStations(0, 50);
        stationData = response.stations || (Array.isArray(response) ? response : []);
      }

      console.log(`📊 Loaded ${stationData.length} stations`);
      setStations(stationData);
    } catch (err: any) {
      console.error('Error loading stations:', err);
      setError(err.message || 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleStationPress = (station: EVStation) => {
    console.log('Station pressed:', station.name, station.id);
    try {
      (navigation as any).navigate('BookSlot', { station });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Search pressed');
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log('Filter pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    // Navigate to notifications screen or show notification modal
    console.log('Notification pressed');
  };

  const renderHeader = () => (
    <View style={styles.headerSafeArea}>
      <BlurView
        style={styles.headerContainer}
        intensity={50}
        tint="dark"
      >
        {/* Enhanced visual overlay for depth */}
        <View style={styles.headerOverlay} />
        
        {/* StatusBar spacing */}
        <View style={{ height: StatusBar.currentHeight || 44 }} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color={STATION_COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Charging Stations</Text>
            <Text style={styles.headerSubtitle}>
              {filteredStations.length} of {stations.length} stations found
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        
        {/* Search Input with Border Glow */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={styles.searchInputContent}>
              <View style={styles.searchIconContainer}>
                <Search size={20} color={STATION_COLORS.accent} />
              </View>
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search stations..."
                placeholderTextColor={STATION_COLORS.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {[
              { id: 'available', label: 'Available Now', icon: 'flash', lucideIcon: 'CheckCircle' },
              { id: 'fast', label: 'Fast Charging', icon: 'flash', lucideIcon: 'Zap' },
              { id: 'nearby', label: 'Within 5km', icon: 'location', lucideIcon: 'MapPin' },
              { id: 'cheap', label: 'Budget Friendly', icon: 'wallet', lucideIcon: 'DollarSign' },
            ].map((filter) => {
              const isActive = activeFilters.has(filter.id);
              const IconComponent = 
                filter.lucideIcon === 'Zap' ? Zap : 
                filter.lucideIcon === 'MapPin' ? MapPin : 
                filter.lucideIcon === 'DollarSign' ? DollarSign :
                CheckCircle;
              
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive
                  ]}
                  onPress={() => {
                    const newFilters = new Set(activeFilters);
                    if (newFilters.has(filter.id)) {
                      newFilters.delete(filter.id);
                    } else {
                      newFilters.add(filter.id);
                    }
                    setActiveFilters(newFilters);
                  }}
                >
                  <IconComponent size={14} color={isActive ? '#000000' : STATION_COLORS.text.primary} />
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </BlurView>
    </View>
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
      default:
        return 'primary';
    }
  };

  // Shimmer Animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (loading) {
      startShimmer();
    }
  }, [loading, shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  // Utility function for handling missing data
  const formatData = (value: any, fallback: string = '--', suffix: string = '') => {
    if (value === null || value === undefined || value === '') {
      return `${fallback}${suffix}`;
    }
    return `${value}${suffix}`;
  };

  // Clean, Minimal Station Card (Inspired by Tesla & Airbnb)
  const StationCard = ({ station, index }: { station: EVStation; index: number }) => {
    const availableSlots = station.charging_slots?.filter(slot => slot.status === 'AVAILABLE').length || 0;
    const totalSlots = station.charging_slots?.length || 0;
    const hasAvailability = availableSlots > 0;
    
    return (
      <ReanimatedAnimated.View
        entering={FadeInUp.duration(400).delay(index * 50)}
        style={styles.stationCardContainer}
      >
        <TouchableOpacity
          style={styles.stationCard}
          onPress={() => handleStationPress(station)}
          activeOpacity={0.7}
        >
          {/* Simple Content - No Blur, No Excessive Gradients */}
          <View style={styles.cardContent}>
            {/* Top Row: Name + Availability */}
            <View style={styles.topRow}>
              <View style={styles.nameSection}>
                <Text style={styles.stationName} numberOfLines={1}>
                  {formatData(station.name)}
                </Text>
                <Text style={styles.stationAddress} numberOfLines={1}>
                  {formatData(station.address)}
                </Text>
              </View>
              
              {/* Simple Availability Badge */}
              <View style={[styles.availabilityBadge, !hasAvailability && styles.availabilityBadgeUnavailable]}>
                <Text style={styles.availabilityText}>
                  {availableSlots}/{totalSlots}
                </Text>
              </View>
            </View>

            {/* Info Row: Distance, Rating, Type, Price */}
            <View style={styles.infoRow}>
              {/* Distance */}
              <View style={styles.infoItem}>
                <MapPin size={14} color="#8cd279" strokeWidth={2} />
                <Text style={styles.infoText}>
                  {station.distance 
                    ? station.distance < 1 
                      ? `${(station.distance * 1000).toFixed(0)}m`
                      : `${station.distance.toFixed(1)}km`
                    : '--'
                  }
                </Text>
              </View>

              {/* Rating */}
              <View style={styles.infoItem}>
                <Star size={14} color="#FFD700" fill="#FFD700" strokeWidth={2} />
                <Text style={styles.infoText}>
                  {formatData(station.rating, '--', '')}
                </Text>
              </View>

              {/* Charger Type */}
              <View style={styles.infoItem}>
                <Zap size={14} color="#8cd279" strokeWidth={2} />
                <Text style={styles.infoText}>
                  {formatData(station.charging_slots?.[0]?.charger_type, 'AC', '').replace('DC_', '').replace('_', ' ')}
                </Text>
              </View>

              {/* Price */}
              {station.charging_slots?.[0]?.price_per_kwh && (
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>
                    ₹{station.charging_slots[0].price_per_kwh}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </ReanimatedAnimated.View>
    );
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonCircle} />
      </View>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonDetails}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonLineVeryShort} />
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonLineVeryShort} />
        </View>
      </View>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={STATION_COLORS.background} />
        {renderHeader()}
        
        {/* Skeleton Cards */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3, 4].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </ScrollView>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {renderHeader()}
      
      {/* Stations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[STATION_COLORS.accent]}
            tintColor={STATION_COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={STATION_COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>{error}</Text>
          </View>
        ) : filteredStations.length > 0 ? (
          <>
            {filteredStations.map((station, index) => (
              <StationCard key={station.id || index} station={station} index={index} />
            ))}
          </>
        ) : searchQuery.trim() !== '' ? (
          <View style={styles.emptyState}>
            <Search size={48} color={STATION_COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>
              No stations found for "{searchQuery}"
            </Text>
            <Text style={[styles.emptyStateText, { fontSize: 14, marginTop: 8 }]}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color={STATION_COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>
              No stations found nearby
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STATION_COLORS.background,
  },

  // Header Styles
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },

  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  headerContent: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: STATION_COLORS.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: STATION_COLORS.text.secondary,
    marginTop: 2,
  },

  headerRight: {
    width: 40,
    height: 40,
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInputWrapper: {
    flex: 1,
    borderRadius: 20,
    position: 'relative',
  },

  searchInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(140, 210, 121, 0.6)',
    position: 'relative',
    zIndex: 1,
  },

  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  searchTextInput: {
    flex: 1,
    color: STATION_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    paddingRight: 10,
  },

  // Filter Styles
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  filterScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: STATION_COLORS.text.primary,
  },

  filterChipActive: {
    backgroundColor: STATION_COLORS.accent,
    borderColor: STATION_COLORS.accent,
  },

  filterChipTextActive: {
    color: '#000000',
  },

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 300,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  // Clean, Minimal Card Styles (Inspired by Tesla, Airbnb, Stripe)
  stationCardContainer: {
    marginBottom: 16,
  },

  stationCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  cardContent: {
    padding: 18,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },

  nameSection: {
    flex: 1,
  },

  stationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  stationAddress: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999999',
    lineHeight: 18,
  },

  // Simple Availability Badge
  availabilityBadge: {
    backgroundColor: '#8cd279',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  availabilityBadgeUnavailable: {
    backgroundColor: '#FF3B30',
  },

  availabilityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },

  // Info Row (Distance, Rating, Type, Price)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#CCCCCC',
    letterSpacing: -0.2,
  },

  priceTag: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(140, 210, 121, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8cd279',
    letterSpacing: 0.2,
  },

  // Skeleton Styles
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: STATION_COLORS.surface,
    padding: 20,
    overflow: 'hidden',
  },

  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  skeletonLine: {
    height: 20,
    backgroundColor: '#282828',
    borderRadius: 4,
    flex: 1,
    marginRight: 16,
  },

  skeletonLineShort: {
    height: 16,
    backgroundColor: '#282828',
    borderRadius: 4,
    width: '70%',
    marginBottom: 12,
  },

  skeletonLineVeryShort: {
    height: 12,
    backgroundColor: '#282828',
    borderRadius: 4,
    width: 40,
  },

  skeletonCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#282828',
    borderRadius: 20,
  },

  skeletonIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#282828',
    borderRadius: 8,
    marginRight: 6,
  },

  skeletonContent: {
    flex: 1,
  },

  skeletonDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },

  emptyStateText: {
    fontSize: 16,
    color: STATION_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

  export default StationListScreen;
