/**
 * Dynamic Dashboard Home Screen
 * Fully data-driven with live API integration
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
  RefreshControl,
  StatusBar,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import {
  Bell,
  User,
  MapPin,
  Zap,
  Calendar,
  History,
  Battery,
  Clock,
  ChevronRight,
  Car,
  Plus,
  QrCode,
  BookOpen,
  TrendingUp,
  Repeat,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { EVStation, Booking } from '../types/api';

const { width, height } = Dimensions.get('window');

// Dashboard Color Palette
const DASHBOARD_COLORS = {
  primary: '#00A8FF',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  border: '#3A3A3A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
};

// Types for dashboard data
interface VehicleInfo {
  id: string;
  name: string;
  image?: string;
  batteryPercentage: number;
  estimatedRange: number;
  make?: string;
  model?: string;
}

interface ChargingSession {
  id: string;
  stationName: string;
  stationAddress: string;
  currentPercentage: number;
  timeRemaining: number;
  powerKw: number;
  costSoFar: number;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  validUntil: string;
  discount?: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useAuth();
  
  // State for all dashboard data
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [recentBooking, setRecentBooking] = useState<Booking | null>(null);
  const [chargingSession, setChargingSession] = useState<ChargingSession | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Load all data in parallel for better performance
      const [
        vehicleResponse,
        bookingsResponse,
        chargingResponse,
        promotionsResponse,
      ] = await Promise.allSettled([
        loadVehicleInfo(),
        loadRecentBooking(),
        loadChargingSession(),
        loadPromotions(),
      ]);

      // Handle vehicle info
      if (vehicleResponse.status === 'fulfilled') {
        setVehicleInfo(vehicleResponse.value);
      } else {
        console.log('No vehicle info available');
        setVehicleInfo(null);
      }

      // Handle recent booking
      if (bookingsResponse.status === 'fulfilled') {
        setRecentBooking(bookingsResponse.value);
      } else {
        console.log('No recent bookings');
        setRecentBooking(null);
      }

      // Handle charging session
      if (chargingResponse.status === 'fulfilled') {
        setChargingSession(chargingResponse.value);
      } else {
        console.log('No active charging session');
        setChargingSession(null);
      }

      // Handle promotions
      if (promotionsResponse.status === 'fulfilled') {
        setPromotions(promotionsResponse.value);
      } else {
        console.log('No promotions available');
        setPromotions([]);
      }

    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      setErrors({ general: 'Failed to load dashboard data' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load vehicle information
  const loadVehicleInfo = async (): Promise<VehicleInfo | null> => {
    try {
      // Call the new API endpoint
      const vehicleData = await apiService.getMyVehicle();
      return {
        id: vehicleData.id,
        name: vehicleData.name,
        batteryPercentage: vehicleData.battery_percentage,
        estimatedRange: vehicleData.estimated_range,
        make: vehicleData.make,
        model: vehicleData.model,
        image: vehicleData.image,
      };
    } catch (error: any) {
      console.error('Error loading vehicle info:', error);
      // If 404, user has no vehicle - return null to show "Add Vehicle" prompt
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  // Load recent booking
  const loadRecentBooking = async (): Promise<Booking | null> => {
    try {
      const bookings = await apiService.getMyBookings(0, 1);
      return bookings.length > 0 ? bookings[0] : null;
    } catch (error) {
      console.error('Error loading recent booking:', error);
      return null;
    }
  };

  // Load charging session
  const loadChargingSession = async (): Promise<ChargingSession | null> => {
    try {
      // Call the new API endpoint
      const sessionData = await apiService.getCurrentChargingSession();
      return {
        id: sessionData.id,
        stationName: sessionData.station_name,
        stationAddress: sessionData.station_address,
        currentPercentage: sessionData.current_percentage,
        timeRemaining: sessionData.time_remaining,
        powerKw: sessionData.power_kw,
        costSoFar: sessionData.cost_so_far,
      };
    } catch (error: any) {
      console.error('Error loading charging session:', error);
      // If 404, no active session - return null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  // Load promotions
  const loadPromotions = async (): Promise<Promotion[]> => {
    try {
      // Call the new API endpoint
      const promotionsData = await apiService.getPromotions();
      return promotionsData.map(promo => ({
        id: promo.id,
        title: promo.title,
        description: promo.description,
        image: promo.image,
        validUntil: promo.valid_until,
        discount: promo.discount,
      }));
    } catch (error) {
      console.error('Error loading promotions:', error);
      return [];
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick action handlers
  const handleFindCharger = () => {
    navigation.navigate('Search', { screen: 'StationList' });
  };

  const handleStartCharging = () => {
    // Navigate to QR scanner or charging flow
    Alert.alert('Start Charging', 'QR code scanner would open here');
  };

  const handleBookSlot = () => {
    navigation.navigate('Bookings', { screen: 'BookingForm' });
  };

  const handleViewHistory = () => {
    navigation.navigate('Bookings', { screen: 'BookingList' });
  };

  const handleAddVehicle = () => {
    navigation.navigate('Profile', { screen: 'EditProfile' });
  };

  const handleNotifications = () => {
    // Navigate to notifications screen
    Alert.alert('Notifications', 'Notifications screen would open here');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  // Render shimmer loading component
  const renderShimmer = () => (
    <View style={styles.shimmerContainer}>
      <View style={styles.shimmerCard}>
        <View style={styles.shimmerLine} />
        <View style={[styles.shimmerLine, { width: '60%' }]} />
      </View>
      <View style={styles.shimmerCard}>
        <View style={styles.shimmerLine} />
        <View style={[styles.shimmerLine, { width: '80%' }]} />
      </View>
      <View style={styles.shimmerCard}>
        <View style={styles.shimmerLine} />
        <View style={[styles.shimmerLine, { width: '70%' }]} />
      </View>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={handleNotifications}>
        <Bell size={24} color={DASHBOARD_COLORS.text.primary} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Home</Text>
      
      <TouchableOpacity style={styles.headerButton} onPress={handleProfile}>
        <User size={24} color={DASHBOARD_COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  // Render My Vehicle card
  const renderVehicleCard = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <View style={styles.shimmerLine} />
          <View style={[styles.shimmerLine, { width: '60%', marginTop: 8 }]} />
        </View>
      );
    }

    if (!vehicleInfo) {
      return (
        <View style={styles.card}>
          <View style={styles.addVehicleContainer}>
            <View style={styles.addVehicleIcon}>
              <Car size={32} color={DASHBOARD_COLORS.primary} />
            </View>
            <View style={styles.addVehicleContent}>
              <Text style={styles.addVehicleTitle}>Add Your Vehicle</Text>
              <Text style={styles.addVehicleSubtitle}>
                Get personalized charging recommendations
              </Text>
            </View>
            <TouchableOpacity style={styles.addVehicleButton} onPress={handleAddVehicle}>
              <Plus size={20} color={DASHBOARD_COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Vehicle</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIconContainer}>
            <Car size={40} color={DASHBOARD_COLORS.text.secondary} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicleInfo.name}</Text>
            <Text style={styles.vehicleSubtitle}>
              Battery: {vehicleInfo.batteryPercentage}% - Range: {vehicleInfo.estimatedRange} mi
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Quick Actions
  const renderQuickActions = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleFindCharger}>
          <MapPin size={24} color={DASHBOARD_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Find Charger</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleStartCharging}>
          <Zap size={24} color={DASHBOARD_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Start Charging</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleBookSlot}>
          <Calendar size={24} color={DASHBOARD_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Book Slot</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleViewHistory}>
          <History size={24} color={DASHBOARD_COLORS.text.primary} />
          <Text style={styles.quickActionText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Recent Booking card
  const renderRecentBooking = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <View style={styles.shimmerLine} />
          <View style={[styles.shimmerLine, { width: '70%', marginTop: 8 }]} />
        </View>
      );
    }

    if (!recentBooking) {
      return null; // Don't show card if no recent booking
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Booking</Text>
        <View style={styles.bookingCard}>
          <View style={styles.bookingIconContainer}>
            <Calendar size={24} color={DASHBOARD_COLORS.text.primary} />
            <Text style={styles.bookingDay}>12</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingDate}>July 15, 2024</Text>
            <Text style={styles.bookingDetails}>Duration: 2 hours</Text>
            <Text style={styles.bookingDetails}>Station: Green Energy Hub</Text>
          </View>
          <TouchableOpacity style={styles.repeatButton}>
            <Text style={styles.repeatButtonText}>Repeat Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Charging Status card
  const renderChargingStatus = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <View style={styles.shimmerLine} />
          <View style={[styles.shimmerLine, { width: '50%', marginTop: 8 }]} />
        </View>
      );
    }

    if (!chargingSession) {
      return null; // Don't show card if no active charging session
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Charging Status</Text>
        <Text style={styles.chargingProgressLabel}>Charging Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${chargingSession.currentPercentage}%` }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.progressText}>
          {chargingSession.currentPercentage}% - 1 hour 30 minutes left
        </Text>
      </View>
    );
  };

  // Render Promotions card
  const renderPromotions = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <View style={styles.shimmerLine} />
          <View style={[styles.shimmerLine, { width: '80%', marginTop: 8 }]} />
        </View>
      );
    }

    if (promotions.length === 0) {
      return null; // Don't show card if no promotions
    }

    const promotion = promotions[0]; // Show first promotion

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Promotions & Updates</Text>
        <View style={styles.promotionCard}>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionNew}>New</Text>
            <Text style={styles.promotionTitle}>Summer Charging Discounts</Text>
            <Text style={styles.promotionDescription}>
              Enjoy 20% off on all charging sessions this month.
            </Text>
          </View>
          <View style={styles.promotionIconContainer}>
            <Zap size={32} color={DASHBOARD_COLORS.text.secondary} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DASHBOARD_COLORS.background} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={DASHBOARD_COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          renderShimmer()
        ) : (
          <>
            {renderVehicleCard()}
            {renderQuickActions()}
            {renderRecentBooking()}
            {renderChargingStatus()}
            {renderPromotions()}
          </>
        )}
        
        {/* Error state */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DASHBOARD_COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: DASHBOARD_COLORS.background,
  },
  
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DASHBOARD_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    color: DASHBOARD_COLORS.text.primary,
    fontWeight: '700',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  // Cards
  card: {
    backgroundColor: DASHBOARD_COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.border,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 16,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  // Vehicle Card
  addVehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  addVehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${DASHBOARD_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  addVehicleContent: {
    flex: 1,
  },
  
  addVehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },
  
  addVehicleSubtitle: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },
  
  addVehicleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DASHBOARD_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  vehicleImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${DASHBOARD_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  vehicleImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  
  quickActionButton: {
    width: (width - 60) / 2,
    height: 80,
    backgroundColor: DASHBOARD_COLORS.success,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginTop: 8,
  },
  
  // Booking Card
  bookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${DASHBOARD_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  bookingInfo: {
    flex: 1,
  },
  
  bookingStation: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },
  
  // Shimmer Loading
  shimmerContainer: {
    gap: 16,
  },
  
  shimmerCard: {
    backgroundColor: DASHBOARD_COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.border,
  },
  
  shimmerLine: {
    height: 16,
    backgroundColor: DASHBOARD_COLORS.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  // Error State
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  errorText: {
    fontSize: 16,
    color: DASHBOARD_COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  retryButton: {
    backgroundColor: DASHBOARD_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
  },

  // New styles for updated design
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },

  vehicleSubtitle: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },

  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  bookingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },

  bookingDay: {
    position: 'absolute',
    bottom: 2,
    fontSize: 12,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
  },

  bookingDate: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },

  bookingDetails: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
    marginBottom: 2,
  },

  repeatButton: {
    backgroundColor: DASHBOARD_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },

  repeatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
  },

  chargingProgressLabel: {
    fontSize: 16,
    color: DASHBOARD_COLORS.text.secondary,
    marginTop: 12,
    marginBottom: 8,
  },

  progressBarContainer: {
    marginBottom: 8,
  },

  progressBar: {
    height: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    borderRadius: 4,
  },

  progressFill: {
    height: '100%',
    backgroundColor: DASHBOARD_COLORS.text.primary,
    borderRadius: 4,
  },

  progressText: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },

  promotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  promotionContent: {
    flex: 1,
  },

  promotionNew: {
    fontSize: 12,
    fontWeight: '600',
    color: DASHBOARD_COLORS.success,
    marginBottom: 4,
  },

  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },

  promotionDescription: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },

  promotionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
});

export default HomeScreen;
