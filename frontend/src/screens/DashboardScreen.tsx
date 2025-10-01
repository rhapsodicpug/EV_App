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
      // Try to get vehicle info from user profile first
      if (user?.vehicle_info) {
        return {
          id: 'user-vehicle',
          name: `${user.vehicle_info.make || 'EV'} ${user.vehicle_info.model || 'Vehicle'}`,
          batteryPercentage: 85, // Mock data - would come from vehicle API
          estimatedRange: user.vehicle_info.battery_capacity ? 
            Math.round(user.vehicle_info.battery_capacity * 0.85) : 300,
          make: user.vehicle_info.make,
          model: user.vehicle_info.model,
        };
      }

      // If no vehicle info, return null to show "Add Vehicle" prompt
      return null;
    } catch (error) {
      console.error('Error loading vehicle info:', error);
      return null;
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
      // This would be a real API call to check for active charging sessions
      // For now, return null as we don't have this endpoint yet
      return null;
    } catch (error) {
      console.error('Error loading charging session:', error);
      return null;
    }
  };

  // Load promotions
  const loadPromotions = async (): Promise<Promotion[]> => {
    try {
      // This would be a real API call to get promotions
      // For now, return mock data
      return [
        {
          id: '1',
          title: 'Weekend Special',
          description: 'Get 20% off on all charging sessions this weekend',
          validUntil: '2024-01-20',
          discount: 20,
        },
        {
          id: '2',
          title: 'New Station Launch',
          description: 'Visit our new ultra-fast charging station in downtown',
          validUntil: '2024-02-01',
        },
      ];
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
      
      <View style={styles.headerCenter}>
        <Text style={styles.greeting}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
        </Text>
        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
      </View>
      
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
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleImageContainer}>
            {vehicleInfo.image ? (
              <Image source={{ uri: vehicleInfo.image }} style={styles.vehicleImage} />
            ) : (
              <Car size={32} color={DASHBOARD_COLORS.primary} />
            )}
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicleInfo.name}</Text>
            <Text style={styles.vehicleSubtitle}>
              {vehicleInfo.batteryPercentage}% • {vehicleInfo.estimatedRange}km range
            </Text>
          </View>
        </View>
        
        <View style={styles.batteryContainer}>
          <View style={styles.batteryBar}>
            <View 
              style={[
                styles.batteryFill, 
                { width: `${vehicleInfo.batteryPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.batteryText}>{vehicleInfo.batteryPercentage}%</Text>
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Booking</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <ChevronRight size={20} color={DASHBOARD_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.bookingContent}>
          <View style={styles.bookingIcon}>
            <Calendar size={20} color={DASHBOARD_COLORS.primary} />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingStation}>{recentBooking.station_name}</Text>
            <Text style={styles.bookingDetails}>
              {new Date(recentBooking.start_time).toLocaleDateString()} • {recentBooking.duration_minutes}min
            </Text>
          </View>
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Charging in Progress</Text>
          <View style={styles.chargingBadge}>
            <Zap size={16} color={DASHBOARD_COLORS.success} />
            <Text style={styles.chargingBadgeText}>Active</Text>
          </View>
        </View>
        
        <View style={styles.chargingContent}>
          <View style={styles.chargingStation}>
            <Text style={styles.chargingStationName}>{chargingSession.stationName}</Text>
            <Text style={styles.chargingStationAddress}>{chargingSession.stationAddress}</Text>
          </View>
          
          <View style={styles.chargingProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${chargingSession.currentPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{chargingSession.currentPercentage}%</Text>
          </View>
          
          <View style={styles.chargingStats}>
            <View style={styles.statItem}>
              <Clock size={16} color={DASHBOARD_COLORS.text.secondary} />
              <Text style={styles.statText}>{chargingSession.timeRemaining}min left</Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={16} color={DASHBOARD_COLORS.text.secondary} />
              <Text style={styles.statText}>{chargingSession.powerKw}kW</Text>
            </View>
          </View>
        </View>
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Promotions & Updates</Text>
          <TouchableOpacity>
            <ChevronRight size={20} color={DASHBOARD_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.promotionContent}>
          <View style={styles.promotionImageContainer}>
            {promotion.image ? (
              <Image source={{ uri: promotion.image }} style={styles.promotionImage} />
            ) : (
              <TrendingUp size={32} color={DASHBOARD_COLORS.primary} />
            )}
          </View>
          <View style={styles.promotionInfo}>
            <Text style={styles.promotionTitle}>{promotion.title}</Text>
            <Text style={styles.promotionDescription}>{promotion.description}</Text>
            {promotion.discount && (
              <Text style={styles.promotionDiscount}>{promotion.discount}% OFF</Text>
            )}
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
  
  headerCenter: {
    alignItems: 'center',
  },
  
  greeting: {
    fontSize: 16,
    color: DASHBOARD_COLORS.text.secondary,
    fontWeight: '500',
  },
  
  userName: {
    fontSize: 24,
    color: DASHBOARD_COLORS.text.primary,
    fontWeight: '700',
    marginTop: 4,
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
  
  vehicleInfo: {
    flex: 1,
  },
  
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },
  
  vehicleSubtitle: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },
  
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  batteryBar: {
    flex: 1,
    height: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    borderRadius: 4,
    marginRight: 12,
  },
  
  batteryFill: {
    height: '100%',
    backgroundColor: DASHBOARD_COLORS.success,
    borderRadius: 4,
  },
  
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  
  bookingDetails: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },
  
  // Charging Status
  chargingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${DASHBOARD_COLORS.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  chargingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: DASHBOARD_COLORS.success,
    marginLeft: 4,
  },
  
  chargingContent: {
    gap: 16,
  },
  
  chargingStation: {
    marginBottom: 8,
  },
  
  chargingStationName: {
    fontSize: 16,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
    marginBottom: 4,
  },
  
  chargingStationAddress: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
  },
  
  chargingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: DASHBOARD_COLORS.surface,
    borderRadius: 4,
    marginRight: 12,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: DASHBOARD_COLORS.success,
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: DASHBOARD_COLORS.text.primary,
  },
  
  chargingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statText: {
    fontSize: 14,
    color: DASHBOARD_COLORS.text.secondary,
    marginLeft: 6,
  },
  
  // Promotions
  promotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  promotionImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${DASHBOARD_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  promotionImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  promotionInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  
  promotionDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: DASHBOARD_COLORS.success,
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
});

export default HomeScreen;
