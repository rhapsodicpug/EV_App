/**
 * Home Screen
 * Modern dashboard matching the provided design with full functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  User,
  MapPin,
  Zap,
  Calendar,
  Clock,
  Battery,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

// Color palette for the home screen
const HOME_COLORS = {
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
    tertiary: '#808080',
  },
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  // State for dynamic data
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [recentBooking, setRecentBooking] = useState<any>(null);
  const [chargingSession, setChargingSession] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data in parallel
      const [vehicleData, bookingData, chargingData, promotionsData] = await Promise.all([
        apiService.getMyVehicle().catch(() => null),
        apiService.getMyBookings().catch(() => []),
        apiService.getCurrentChargingSession().catch(() => null),
        apiService.getPromotions().catch(() => []),
      ]);

      setVehicleInfo(vehicleData);
      setRecentBooking(bookingData?.[0] || null);
      setChargingSession(chargingData);
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleFindCharger = () => {
    navigation.navigate('Search' as never);
  };

  const handleStartCharging = () => {
    Alert.alert('Start Charging', 'QR code scanner would open here to start charging');
  };

  const handleBookSlot = () => {
    navigation.navigate('Bookings' as never);
  };

  const handleRepeatBooking = () => {
    if (recentBooking) {
      Alert.alert('Repeat Booking', `Would repeat booking at ${recentBooking.station_name}`);
    }
  };

  const handleNotificationPress = () => {
    // Navigate to notifications screen or show notification modal
    Alert.alert('Notifications', 'Notification feature coming soon!');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.95)', 
          'rgba(10, 10, 10, 0.9)', 
          'rgba(20, 20, 20, 0.85)',
          'rgba(30, 30, 30, 0.8)',
          'rgba(26, 26, 26, 0.75)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerOverlay} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Bell size={24} color={HOME_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <User size={24} color={HOME_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderVehicleCard = () => {
    if (!vehicleInfo) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vehicle</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.noVehicleContainer}>
              <Text style={styles.noVehicleText}>No vehicle added yet</Text>
              <TouchableOpacity style={styles.addVehicleButton}>
                <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Vehicle</Text>
        <View style={styles.vehicleCard}>
          {vehicleInfo.image ? (
            <Image
              source={{ uri: vehicleInfo.image }}
              style={styles.vehicleImage}
            />
          ) : (
            <View style={styles.vehicleImagePlaceholder}>
              <Zap size={24} color={HOME_COLORS.text.secondary} />
            </View>
          )}
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicleInfo.name}</Text>
            <Text style={styles.vehicleDetails}>
              Battery: {vehicleInfo.battery_percentage}% - Range: {vehicleInfo.estimated_range} mi
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleFindCharger}>
          <MapPin size={24} color={HOME_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Find Charger</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleStartCharging}>
          <Zap size={24} color={HOME_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Start Charging</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleBookSlot}>
          <Calendar size={24} color={HOME_COLORS.text.primary} />
          <Text style={styles.quickActionText}>Book Slot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentBooking = () => {
    if (!recentBooking) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Booking</Text>
          <View style={styles.bookingCard}>
            <View style={styles.noBookingContainer}>
              <Text style={styles.noBookingText}>No recent bookings</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Booking</Text>
        <View style={styles.bookingCard}>
          <View style={styles.bookingIcon}>
            <Calendar size={20} color={HOME_COLORS.text.primary} />
            <Text style={styles.bookingDay}>{new Date(recentBooking.start_time).getDate()}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingDate}>
              {new Date(recentBooking.start_time).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>
            <Text style={styles.bookingDetails}>
              Duration: {recentBooking.duration_minutes} minutes
            </Text>
            <Text style={styles.bookingDetails}>
              Station: {recentBooking.station_name || 'Unknown Station'}
            </Text>
          </View>
          <TouchableOpacity style={styles.repeatButton} onPress={handleRepeatBooking}>
            <Text style={styles.repeatButtonText}>Repeat Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChargingStatus = () => {
    if (!chargingSession) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charging Status</Text>
        <View style={styles.chargingCard}>
          <Text style={styles.chargingProgressLabel}>Charging Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${chargingSession.current_percentage}%` }
                ]} 
              />
            </View>
          </View>
          <Text style={styles.progressText}>
            {chargingSession.current_percentage}% - {chargingSession.time_remaining} left
          </Text>
        </View>
      </View>
    );
  };

  const renderPromotions = () => {
    if (!promotions.length) return null;

    const promotion = promotions[0];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promotions & Updates</Text>
        <View style={styles.promotionCard}>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionNew}>New</Text>
            <Text style={styles.promotionTitle}>{promotion.title}</Text>
            <Text style={styles.promotionDescription}>
              {promotion.description}
            </Text>
          </View>
          {promotion.image && (
            <Image
              source={{ uri: promotion.image }}
              style={styles.promotionImage}
            />
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={HOME_COLORS.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={HOME_COLORS.background} />
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderVehicleCard()}
          {renderQuickActions()}
          {renderRecentBooking()}
          {renderChargingStatus()}
          {renderPromotions()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },

  headerBlur: {
    width: '100%',
    overflow: 'hidden',
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  },

  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HOME_COLORS.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 140,
    paddingBottom: 100,
  },

  content: {
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: HOME_COLORS.text.secondary,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginBottom: 12,
  },

  vehicleCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginBottom: 4,
  },

  vehicleDetails: {
    fontSize: 14,
    color: HOME_COLORS.text.secondary,
  },

  quickActionsContainer: {
    gap: 12,
  },

  quickActionButton: {
    backgroundColor: HOME_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },

  bookingCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: HOME_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  bookingDay: {
    fontSize: 12,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginTop: 2,
  },

  bookingInfo: {
    flex: 1,
  },

  bookingDate: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginBottom: 4,
  },

  bookingDetails: {
    fontSize: 14,
    color: HOME_COLORS.text.secondary,
    marginBottom: 2,
  },

  repeatButton: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  repeatButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: HOME_COLORS.text.primary,
  },

  chargingCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },

  chargingProgressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginBottom: 12,
  },

  progressBarContainer: {
    marginBottom: 8,
  },

  progressBar: {
    height: 8,
    backgroundColor: HOME_COLORS.text.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: HOME_COLORS.success,
    borderRadius: 4,
  },

  progressText: {
    fontSize: 14,
    color: HOME_COLORS.text.primary,
  },

  promotionCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  promotionContent: {
    flex: 1,
  },

  promotionNew: {
    fontSize: 12,
    color: HOME_COLORS.text.secondary,
    marginBottom: 4,
  },

  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.text.primary,
    marginBottom: 4,
  },

  promotionDescription: {
    fontSize: 14,
    color: HOME_COLORS.text.secondary,
  },

  promotionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 16,
  },

  vehicleImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HOME_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  noVehicleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  noVehicleText: {
    fontSize: 16,
    color: HOME_COLORS.text.secondary,
    marginBottom: 12,
  },

  addVehicleButton: {
    backgroundColor: HOME_COLORS.success,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  addVehicleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },

  noBookingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  noBookingText: {
    fontSize: 16,
    color: HOME_COLORS.text.secondary,
  },
});

export default HomeScreen;