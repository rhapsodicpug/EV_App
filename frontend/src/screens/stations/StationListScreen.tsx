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
} from 'react-native';
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
  AlertCircle
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation, Badge } from '../../design';
import StationCard from '../../components/custom/StationCard';
import { EVStation } from '../../types/api';
import apiService from '../../services/api';

const StationListScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const [stations, setStations] = useState<EVStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<EVStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
          console.log('📍 Using location for station search:', { latitude, longitude });

          // Fetch stations with location
          const response = await apiService.getStationsByLocation(latitude, longitude, 50);
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
      (navigation as any).navigate('StationDetailsBooking', { station });
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

  // Skeleton Card Component
  const SkeletonCard = () => (
    <View style={dynamicStyles.stationCard}>
      <View style={dynamicStyles.skeletonHeader}>
        <View style={dynamicStyles.skeletonLine} />
        <View style={dynamicStyles.skeletonCircle} />
      </View>
      <View style={dynamicStyles.skeletonContent}>
        <View style={dynamicStyles.skeletonLineShort} />
        <View style={dynamicStyles.skeletonDetails}>
          <View style={dynamicStyles.skeletonIcon} />
          <View style={dynamicStyles.skeletonLineVeryShort} />
          <View style={dynamicStyles.skeletonIcon} />
          <View style={dynamicStyles.skeletonLineVeryShort} />
        </View>
      </View>
      <Animated.View
        style={[
          dynamicStyles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      />
    </View>
  );

  const dynamicStyles = {
    container: {
      backgroundColor: '#0A0A0A',
      flex: 1,
    },
    content: {
      padding: Spacing.lg,
      paddingTop: 120, // Space for dynamic header
    },
    stationCard: {
      marginBottom: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#1A1A1A',
      padding: Spacing.lg,
      ...Elevation.level2,
      overflow: 'hidden' as const,
    },
    stationHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: Spacing.sm,
    },
    stationName: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      flex: 1,
      marginBottom: Spacing.xs,
    },
    stationAddress: {
      fontSize: 14,
      color: '#A9A9A9',
      lineHeight: 20,
    },
    stationDetails: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.sm,
      gap: Spacing.md,
    },
    stationDetail: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    stationDetailText: {
      fontSize: 13,
      color: '#A9A9A9',
      marginLeft: Spacing.xs,
      fontWeight: '500' as const,
    },
    availabilityBadge: {
      backgroundColor: '#10B981',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: Spacing.xs,
    },
    availabilityText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
    priceText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#00A8FF',
    },

    // Skeleton styles
    skeletonHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.md,
    },
    skeletonLine: {
      height: 20,
      backgroundColor: '#282828',
      borderRadius: 4,
      flex: 1,
      marginRight: Spacing.md,
    },
    skeletonLineShort: {
      height: 16,
      backgroundColor: '#282828',
      borderRadius: 4,
      width: '70%' as const,
      marginBottom: Spacing.sm,
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
      marginRight: Spacing.xs,
    },
    skeletonContent: {
      flex: 1,
    },
    skeletonDetails: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.sm,
      gap: Spacing.md,
    },
    shimmerOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      opacity: 0.5,
    },

    emptyState: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: Spacing.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#A9A9A9',
      textAlign: 'center' as const,
      marginTop: Spacing.md,
    },
  };

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        {/* Header */}
        <View style={{
          backgroundColor: '#121212',
          paddingTop: 50,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#333333',
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: 4,
          }}>
            Charging Stations
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#666666',
          }}>
            Finding nearby stations...
          </Text>
        </View>

        {/* Skeleton Cards */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16, paddingTop: 20 }}>
            {[1, 2, 3, 4].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }



  return (
    <View style={dynamicStyles.container}>
      {/* Header matching login screen theme */}
      <View style={{
        backgroundColor: '#121212',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 4,
        }}>
          Charging Stations
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#666666',
        }}>
          {filteredStations.length} of {stations.length} stations found
        </Text>

        {/* Search Input */}
        <View style={{
          marginTop: 16,
          marginBottom: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 168, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Search size={20} color="#00A8FF" />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '500',
                  paddingVertical: 0,
                }}
                placeholder="Search stations..."
                placeholderTextColor="#A9A9A9"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={{
                fontSize: 12,
                color: '#A9A9A9',
                opacity: 0.7,
                marginTop: 2,
              }}>
                {searchQuery ? `Searching for "${searchQuery}"` : 'Find nearby charging spots'}
              </Text>
            </View>
            <View style={{ marginLeft: 8 }}>
              <Ionicons name="chevron-forward" size={16} color="#A9A9A9" />
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={{
          marginTop: 16,
          marginBottom: 8,
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 4,
              gap: 8,
            }}
          >
            {[
              { id: 'available', label: 'Available Now', icon: 'flash' },
              { id: 'fast', label: 'Fast Charging', icon: 'zap' },
              { id: 'nearby', label: 'Within 5km', icon: 'location' },
              { id: 'cheap', label: 'Budget Friendly', icon: 'wallet' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 168, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 168, 255, 0.3)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  gap: 6,
                }}
                onPress={() => {
                  // TODO: Implement filter logic
                  console.log('Filter pressed:', filter.label);
                }}
              >
                <Ionicons name={filter.icon as any} size={14} color="#00A8FF" />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#00A8FF',
                }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>



      {/* Stations List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >


        <View style={{ padding: 16 }}>

          {error ? (
            <View style={dynamicStyles.emptyState}>
              <AlertCircle size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.emptyStateText}>{error}</Text>
            </View>
          ) : filteredStations.length > 0 ? (
            <>
              {filteredStations.map((station, index) => (
                <ReanimatedAnimated.View
                  key={station.id || index}
                  entering={FadeInUp.duration(500).delay(index * 50)}
                >
                  <TouchableOpacity
                    style={dynamicStyles.stationCard}
                    onPress={() => handleStationPress(station)}
                    activeOpacity={0.8}
                  >
                    <View style={dynamicStyles.stationHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={dynamicStyles.stationName}>
                          {formatData(station.name)}
                        </Text>
                        <Text style={dynamicStyles.stationAddress}>
                          {formatData(station.address)}
                        </Text>
                      </View>
                      <View style={dynamicStyles.availabilityBadge}>
                        <Text style={dynamicStyles.availabilityText}>
                          {formatData(station.charging_slots?.filter(slot => slot.status === 'AVAILABLE').length, '--', '')}/{formatData(station.charging_slots?.length, '--', '')} Available
                        </Text>
                      </View>
                    </View>

                  <View style={dynamicStyles.stationDetails}>
                    <View style={dynamicStyles.stationDetail}>
                      <MapPin size={14} color="#00A8FF" />
                      <Text style={dynamicStyles.stationDetailText}>
                        {formatData(station.distance, '--', 'km')}
                      </Text>
                    </View>

                    <View style={dynamicStyles.stationDetail}>
                      <Star size={14} color="#FFD700" />
                      <Text style={dynamicStyles.stationDetailText}>
                        {formatData(station.rating, '--', '')}
                      </Text>
                    </View>

                    <View style={dynamicStyles.stationDetail}>
                      <Zap size={14} color="#10B981" />
                      <Text style={dynamicStyles.stationDetailText}>
                        {formatData(station.charging_slots?.[0]?.charger_type, '--', '')}
                      </Text>
                    </View>
                  </View>

                  {station.charging_slots?.[0]?.price_per_kwh && (
                    <Text style={dynamicStyles.priceText}>
                      ₹{station.charging_slots[0].price_per_kwh}/kWh
                    </Text>
                  )}
                  </TouchableOpacity>
                </ReanimatedAnimated.View>
              ))}
            </>
          ) : searchQuery.trim() !== '' ? (
            <View style={dynamicStyles.emptyState}>
              <Search size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.emptyStateText}>
                No stations found for "{searchQuery}"
              </Text>
              <Text style={[dynamicStyles.emptyStateText, { fontSize: 14, marginTop: 8 }]}>
                Try a different search term
              </Text>
            </View>
          ) : (
            <View style={dynamicStyles.emptyState}>
              <MapPin size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.emptyStateText}>
                No stations found nearby
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  export default StationListScreen;
