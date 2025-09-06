/**
 * Premium Station Details Screen
 * Parallax hero with dynamic shrinking header, frosted glass cards, and sticky CTA
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Zap,
  Star,
  Clock,
  Wifi,
  Coffee,
  Car,
  Battery,
  ChevronRight,
  Calendar,
  Navigation,
} from 'lucide-react-native';
import { EVStation, OperatingHours } from '../../types/api';
import apiService from '../../services/api';

const { width, height } = Dimensions.get('window');

interface StationDetailsScreenProps {
  route: {
    params: {
      stationId: string;
    };
  };
  navigation: any;
}

const StationDetailsScreen: React.FC<StationDetailsScreenProps> = ({ route, navigation }) => {
  const { stationId } = route.params;
  const [station, setStation] = useState<EVStation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parallax and animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [300, 120],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [100, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const contentTranslateY = scrollY.interpolate({
    inputRange: [100, 200],
    outputRange: [50, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadStationDetails();
  }, []);

  const loadStationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stationData = await apiService.getStation(stationId);
      setStation(stationData);
    } catch (error) {
      console.error('Error loading station details:', error);
      setError('Failed to load station details');
      // Use mock data as fallback
      setStation({
        id: stationId,
        name: 'Central Mumbai EV Station',
        address: 'Mumbai Central Railway Station, Mumbai, Maharashtra 400008',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        charging_slots: [
          {
            slot_number: 1,
            charger_type: 'DC_FAST',
            connector_type: 'CCS',
            power_kw: 150,
            status: 'AVAILABLE',
            price_per_kwh: 12,
          },
          {
            slot_number: 2,
            charger_type: 'DC_FAST',
            connector_type: 'CCS',
            power_kw: 150,
            status: 'AVAILABLE',
            price_per_kwh: 12,
          },
          {
            slot_number: 3,
            charger_type: 'AC_FAST',
            connector_type: 'TYPE_2',
            power_kw: 22,
            status: 'AVAILABLE',
            price_per_kwh: 8,
          },
          {
            slot_number: 4,
            charger_type: 'AC_FAST',
            connector_type: 'TYPE_2',
            power_kw: 22,
            status: 'OCCUPIED',
            price_per_kwh: 8,
          },
        ],
        amenities: ['wifi', 'restrooms', 'coffee', 'parking'],
        operating_hours: {
          monday: '06:00-22:00',
          tuesday: '06:00-22:00',
          wednesday: '06:00-22:00',
          thursday: '06:00-22:00',
          friday: '06:00-22:00',
          saturday: '06:00-22:00',
          sunday: '06:00-22:00'
        },
        rating: 4.5,
      } as EVStation);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectorIcon = (connectorType: string) => {
    switch (connectorType) {
      case 'CCS':
        return '⚡';
      case 'TYPE_2':
        return '🔌';
      case 'CHADEMO':
        return '⚡';
      default:
        return '🔌';
    }
  };

  const getAvailabilityText = (station: EVStation) => {
    const total = station.charging_slots?.length || 0;
    const available = station.charging_slots?.filter(slot => slot.status === 'AVAILABLE').length || 0;
    return `${available} of ${total} Available`;
  };

  const formatOperatingHours = (hours: string | OperatingHours) => {
    // Handle string format (e.g., "24/7")
    if (typeof hours === 'string') {
      return hours;
    }

    // Handle object format (day-by-day hours)
    if (typeof hours === 'object' && hours !== null) {
      // Check if all days have the same hours (common case)
      const firstDayHours = hours.monday;

      // If all days have the same hours, show as "Daily: X"
      const allSame = hours.monday === hours.tuesday &&
                     hours.tuesday === hours.wednesday &&
                     hours.wednesday === hours.thursday &&
                     hours.thursday === hours.friday &&
                     hours.friday === hours.saturday &&
                     hours.saturday === hours.sunday;

      if (allSame && firstDayHours) {
        return `Daily: ${firstDayHours}`;
      }

      // Otherwise, show weekday vs weekend hours
      const weekdayHours = hours.monday;
      const weekendHours = hours.saturday;

      if (weekdayHours === weekendHours) {
        return `Daily: ${weekdayHours}`;
      } else {
        return `Mon-Fri: ${weekdayHours}\nSat-Sun: ${weekendHours}`;
      }
    }

    // Default fallback
    return '24/7';
  };

  const handleBookSlot = () => {
    Alert.alert(
      'Book Charging Slot',
      'Navigate to booking screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => navigation.navigate('SlotSelection', { station })
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading station details...</Text>
      </View>
    );
  }

  if (error || !station) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Station not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStationDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Sticky Header that appears on scroll */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: headerTitleOpacity,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
          {station.name}
        </Text>
        <View style={styles.headerAvailability}>
          <Text style={styles.headerAvailabilityText}>
            {getAvailabilityText(station)}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Parallax Hero Section */}
        <Animated.View style={[styles.heroContainer, { height: heroHeight }]}>
          <Animated.Image
            source={{ uri: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop' }}
            style={[styles.heroImage, { opacity: heroOpacity }]}
            resizeMode="cover"
          />

          {/* Hero Overlay */}
          <Animated.View style={[styles.heroOverlay, { opacity: heroOpacity }]}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{station.name}</Text>
              <Text style={styles.heroAddress}>{station.address}</Text>

              {/* Availability Tag */}
              <View style={styles.availabilityTag}>
                <Text style={styles.availabilityTagText}>
                  {getAvailabilityText(station)}
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Content Cards */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          {/* Available Chargers Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Zap size={20} color="#00A8FF" />
              <Text style={styles.cardTitle}>Available Chargers</Text>
            </View>

            <View style={styles.chargersList}>
              {station.charging_slots?.map((slot, index) => (
                <View key={slot.slot_number} style={styles.chargerRow}>
                  <View style={styles.chargerLeft}>
                    <Text style={styles.connectorIcon}>{getConnectorIcon(slot.connector_type)}</Text>
                    <View style={styles.chargerInfo}>
                      <Text style={styles.chargerType}>{slot.connector_type}</Text>
                      <Text style={styles.chargerPower}>{slot.power_kw} kW</Text>
                    </View>
                  </View>

                  <View style={styles.chargerRight}>
                    <Text style={styles.chargerPrice}>₹{slot.price_per_kwh}/kWh</Text>
                    <Text style={[
                      styles.chargerStatus,
                      { color: slot.status === 'AVAILABLE' ? '#4CAF50' : '#FF9800' }
                    ]}>
                      {slot.status === 'AVAILABLE' ? 'Available' : 'Occupied'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Information & Amenities Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock size={20} color="#00A8FF" />
              <Text style={styles.cardTitle}>Information & Amenities</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Clock size={16} color="#888888" />
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>{formatOperatingHours(station.operating_hours)}</Text>
              </View>

              <View style={styles.infoItem}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.infoLabel}>Rating</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>{station.rating || '4.5'}</Text>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                </View>
              </View>
            </View>

            <View style={styles.amenitiesSection}>
              <Text style={styles.amenitiesTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {station.amenities?.includes('wifi') && (
                  <View style={styles.amenityItem}>
                    <Wifi size={16} color="#00A8FF" />
                    <Text style={styles.amenityText}>Wi-Fi</Text>
                  </View>
                )}
                {station.amenities?.includes('restrooms') && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityIcon}>🚻</Text>
                    <Text style={styles.amenityText}>Restrooms</Text>
                  </View>
                )}
                {station.amenities?.includes('coffee') && (
                  <View style={styles.amenityItem}>
                    <Coffee size={16} color="#8B4513" />
                    <Text style={styles.amenityText}>Coffee</Text>
                  </View>
                )}
                {station.amenities?.includes('parking') && (
                  <View style={styles.amenityItem}>
                    <Car size={16} color="#666666" />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing for sticky CTA */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Call-to-Action Button */}
      <View style={styles.stickyCTAContainer}>
        <TouchableOpacity style={styles.stickyCTAButton} onPress={handleBookSlot}>
          <Calendar size={20} color="#ffffff" />
          <Text style={styles.stickyCTAText}>Book a Charging Slot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Remove all old code and replace with new styles
  return null;
};

// Styles for the StationDetailsScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flex: 1,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    fontSize: 16,
    color: '#b3b3b3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00A8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Sticky Header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  stickyHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerAvailability: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerAvailabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Parallax Hero Section
  heroContainer: {
    position: 'relative',
    width: width,
  },
  heroImage: {
    width: width,
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroAddress: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  availabilityTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  availabilityTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Content Container
  contentContainer: {
    padding: 16,
  },

  // Frosted Glass Cards
  card: {
    backgroundColor: 'rgba(44, 44, 46, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },

  // Chargers List
  chargersList: {
    gap: 12,
  },
  chargerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  chargerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  chargerInfo: {
    gap: 2,
  },
  chargerType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chargerPower: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  chargerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chargerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00A8FF',
  },
  chargerStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Information Grid
  infoGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },

  // Amenities Section
  amenitiesSection: {
    marginTop: 16,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  amenityIcon: {
    fontSize: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },

  // Sticky CTA Button
  stickyCTAContainer: {
    position: 'absolute',
    bottom: 80, // Above navigation bar
    left: 16,
    right: 16,
  },
  stickyCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A8FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stickyCTAText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 100, // Space for sticky CTA
  },
});

export default StationDetailsScreen;
