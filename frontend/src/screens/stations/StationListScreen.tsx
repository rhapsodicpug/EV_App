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
  User
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import StationCard from '../../components/custom/StationCard';
import { EVStation } from '../../types/api';
import apiService from '../../services/api';

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

  // Filter stations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStations(stations);
    } else {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, stations]);

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
        console.log('📍 Location access failed, fetching general stations');
        // Fallback to general station fetch
        const response = await apiService.getStations(0, 50);
        stationData = response.stations || (Array.isArray(response) ? response : []);
      }

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
    <SafeAreaView style={styles.headerSafeArea}>
      <BlurView
        style={styles.headerContainer}
        intensity={50}
        tint="dark"
      >
        {/* Enhanced visual overlay for depth */}
        <View style={styles.headerOverlay} />
        
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
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
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
            <View style={styles.searchChevron}>
              <ChevronRight size={16} color={STATION_COLORS.text.secondary} />
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
              { id: 'available', label: 'Available Now', icon: 'flash' },
              { id: 'fast', label: 'Fast Charging', icon: 'zap' },
              { id: 'nearby', label: 'Within 5km', icon: 'location' },
              { id: 'cheap', label: 'Budget Friendly', icon: 'wallet' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={styles.filterChip}
                onPress={() => {
                  console.log('Filter pressed:', filter.label);
                }}
              >
                <Ionicons name={filter.icon as any} size={14} color={STATION_COLORS.text.primary} />
                <Text style={styles.filterChipText}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </SafeAreaView>
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

  // Glassmorphism Station Card Component
  const StationCard = ({ station, index }: { station: EVStation; index: number }) => (
    <ReanimatedAnimated.View
      entering={FadeInUp.duration(500).delay(index * 50)}
    >
      <TouchableOpacity
        style={styles.stationCard}
        onPress={() => handleStationPress(station)}
        activeOpacity={0.8}
      >
        <View style={styles.stationCardGradient}>
          <View style={styles.stationCardOverlay} />
          
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>
                {formatData(station.name)}
              </Text>
              <Text style={styles.stationAddress}>
                {formatData(station.address)}
              </Text>
            </View>
            <View style={styles.availabilityBadge}>
              <Text style={styles.availabilityText}>
                {formatData(station.charging_slots?.filter(slot => slot.status === 'AVAILABLE').length, '--', '')}/{formatData(station.charging_slots?.length, '--', '')} Available
              </Text>
            </View>
          </View>

          <View style={styles.stationDetails}>
            <View style={styles.stationDetail}>
              <MapPin size={14} color={STATION_COLORS.accent} />
              <Text style={styles.stationDetailText}>
                {formatData(station.distance, '--', 'km')}
              </Text>
            </View>

            <View style={styles.stationDetail}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.stationDetailText}>
                {formatData(station.rating, '--', '')}
              </Text>
            </View>

            <View style={styles.stationDetail}>
              <Zap size={14} color={STATION_COLORS.success} />
              <Text style={styles.stationDetailText}>
                {formatData(station.charging_slots?.[0]?.charger_type, '--', '')}
              </Text>
            </View>
          </View>

          {station.charging_slots?.[0]?.price_per_kwh && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                ₹{station.charging_slots[0].price_per_kwh}/kWh
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </ReanimatedAnimated.View>
  );

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
      <StatusBar barStyle="light-content" backgroundColor={STATION_COLORS.background} />
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

  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  },

  searchChevron: {
    marginLeft: 8,
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

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 300,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  // Station Card Styles
  stationCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  stationCardGradient: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: STATION_COLORS.surface,
  },

  stationCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
  },

  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  stationInfo: {
    flex: 1,
  },

  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: STATION_COLORS.text.primary,
    marginBottom: 4,
  },

  stationAddress: {
    fontSize: 14,
    color: STATION_COLORS.text.secondary,
    lineHeight: 20,
  },

  availabilityBadge: {
    backgroundColor: STATION_COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },

  stationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },

  stationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stationDetailText: {
    fontSize: 13,
    color: STATION_COLORS.text.secondary,
    marginLeft: 6,
    fontWeight: '500',
  },

  priceContainer: {
    alignItems: 'flex-end',
  },

  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: STATION_COLORS.accent,
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
