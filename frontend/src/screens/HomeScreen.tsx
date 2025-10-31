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
  Modal,
  Pressable,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DynamicWallpaper } from '../components';
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
  Edit3,
  X,
  CheckCircle,
  Info,
  Shield,
  Gauge,
  Car,
  Bot,
  Navigation,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useVehicles } from '../contexts/VehicleContext';
import { useBookings } from '../contexts/BookingContext';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';
import CustomModal from '../components/ui/CustomModal';
import { useTheme } from '../contexts/ThemeContext';
import TripPlannerModal from '../components/trip/TripPlannerModal';
import { MumbaiLocation } from '../constants/mumbaiLocations';
import { tripPlannerService } from '../services/TripPlannerService';

const { width, height } = Dimensions.get('window');

// Enhanced color palette with glassmorphism support
const HOME_COLORS = {
  primary: '#8cd279',
  secondary: '#8B5CF6',
  success: '#8cd279',
  background: '#1A1A1A',
  surface: 'rgba(42, 42, 42, 0.3)', // More transparent for glassmorphism
  card: 'rgba(58, 58, 58, 0.4)', // Semi-transparent
  border: 'rgba(255, 255, 255, 0.1)', // Subtle border
  glass: 'rgba(255, 255, 255, 0.05)', // Glass overlay
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
  // Neumorphism colors
  neumorphism: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.3)',
    highlight: 'rgba(255, 255, 255, 0.05)',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
  // Enhanced hierarchy colors
  divider: 'rgba(255, 255, 255, 0.08)',
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: 'rgba(255, 255, 255, 0.06)',
  },
};

// Typography scale for better hierarchy
const TYPOGRAPHY = {
  // Display styles
  display: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  // Heading styles
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Body styles
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  // Label styles
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  // Caption styles
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
};

// Spacing system for consistent layout
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { vehicles } = useVehicles();
  const { getUpcomingBookings, getCompletedBookings } = useBookings();
  const { theme } = useTheme();
  
  // State for dynamic data
  const [recentBooking, setRecentBooking] = useState<any>(null);
  const [chargingSession, setChargingSession] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modals
  const [showVehicleInfoModal, setShowVehicleInfoModal] = useState(false);
  const [showTripPlannerModal, setShowTripPlannerModal] = useState(false);
  
  // Animation values for modal
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const [showRepeatBookingModal, setShowRepeatBookingModal] = useState(false);

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
      const [bookingData, chargingData, promotionsData] = await Promise.all([
        apiService.getMyBookings().catch(() => []),
        apiService.getCurrentChargingSession().catch(() => null),
        apiService.getPromotions().catch(() => []),
      ]);

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
    // Navigate to the Profile tab (which shows ProfileMain screen)
    // Use getParent to access the tab navigator
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('Profile');
    } else {
      navigation.navigate('Profile' as never);
    }
  };

  const handleFindCharger = () => {
    navigation.navigate('Search' as never);
  };


  const handlePlanTrip = () => {
    setShowTripPlannerModal(true);
  };

  const handleTripPlanned = (startLocation: MumbaiLocation, endLocation: MumbaiLocation) => {
    setShowTripPlannerModal(false);
    
    // Calculate trip plan
    const tripPlan = tripPlannerService.calculateTripPlan(
      startLocation,
      endLocation,
      vehicles && vehicles.length > 0 && vehicles[0].batteryCapacity 
        ? parseFloat(vehicles[0].batteryCapacity) 
        : undefined
    );
    
    // Navigate to TripResultsScreen
    (navigation as any).navigate('Profile', {
      screen: 'TripResults',
      params: { tripPlan }
    });
  };

  // Modal animation functions
  const openVehicleModal = () => {
    setShowVehicleInfoModal(true);
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeVehicleModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowVehicleInfoModal(false);
    });
  };

  const handleRepeatBooking = () => {
    if (recentBooking) {
      setShowRepeatBookingModal(true);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('BookingNotifications' as never);
  };

  const handleEVAssistantPress = () => {
    // Navigate directly to Profile with Chatbot as the target screen
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      (parentNavigation as any).navigate('Profile', {
        screen: 'Chatbot',
      });
    }
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
        
        <SafeAreaView style={styles.headerSafeAreaInner}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
              <Bell size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Home</Text>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <User size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );

  const renderVehicleSection = () => {
    const primaryVehicle = vehicles[0]; // Get the first vehicle as primary

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Vehicle</Text>
          <View style={styles.sectionDivider} />
        </View>
        
        <View style={styles.sectionContent}>
          {!primaryVehicle ? (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyStateIcon}>
                <Car size={32} color={HOME_COLORS.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Vehicle Added</Text>
              <Text style={styles.emptyStateDescription}>
                Add your electric vehicle to get personalized charging recommendations
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  const parentNavigation = navigation.getParent();
                  if (parentNavigation) {
                    parentNavigation.navigate('Profile');
                    setTimeout(() => {
                      parentNavigation.navigate('Profile', { 
                        screen: 'AddVehicle',
                        params: {}
                      });
                    }, 50);
                  } else {
                    // @ts-ignore
                    navigation.navigate('Profile', { screen: 'AddVehicle' });
                  }
                }}
              >
                <Car size={16} color="#000000" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.vehicleCard}
              onPress={openVehicleModal}
              activeOpacity={0.8}
            >
              <View style={styles.vehicleCardContent}>
                <View style={styles.vehicleImageContainer}>
                  {primaryVehicle.image ? (
                    <Image
                      source={{ uri: primaryVehicle.image }}
                      style={styles.vehicleImage}
                    />
                  ) : (
                    <View style={styles.vehicleImagePlaceholder}>
                      <Car size={24} color={HOME_COLORS.success} />
                    </View>
                  )}
                </View>
                
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{primaryVehicle.model}</Text>
                  <Text style={styles.vehicleDetails}>
                    {primaryVehicle.licensePlate} • {primaryVehicle.year} • {primaryVehicle.batteryCapacity} kWh
                  </Text>
                </View>
                
                <View style={styles.vehicleAction}>
                  <ChevronRight size={20} color={HOME_COLORS.text.secondary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderQuickActionsSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.sectionDivider} />
      </View>
      
      <View style={styles.sectionContent}>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={handleFindCharger}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Zap size={24} color="#000000" />
            </View>
            <Text style={styles.quickActionTitle}>Find Charger</Text>
            <Text style={styles.quickActionDescription}>Locate nearby stations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handlePlanTrip}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Navigation size={24} color="#000000" />
            </View>
            <Text style={styles.quickActionTitle}>Plan a Trip</Text>
            <Text style={styles.quickActionDescription}>Route & battery calc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleEVAssistantPress}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Bot size={24} color="#000000" />
            </View>
            <Text style={styles.quickActionTitle}>EV Assistant</Text>
            <Text style={styles.quickActionDescription}>AI-powered support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderRecentBookingSection = () => {
    const upcomingBookings = getUpcomingBookings();
    const completedBookings = getCompletedBookings();
    const allActivities = [...upcomingBookings.slice(0, 2), ...completedBookings.slice(0, 1)];
    
    const formatBookingDate = (dateStr: string): Date => {
      try {
        // Handle ISO format (YYYY-MM-DD)
        if (dateStr.includes('-')) {
          return new Date(dateStr);
        }
        // Handle other formats
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
          return new Date(); // Fallback to today
        }
        return parsedDate;
      } catch {
        return new Date(); // Fallback to today
      }
    };
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.sectionDivider} />
        </View>
        
        <View style={styles.sectionContent}>
          {allActivities.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyStateIcon}>
                <Calendar size={32} color={HOME_COLORS.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
              <Text style={styles.emptyStateDescription}>
                Your bookings and charging sessions will appear here
              </Text>
            </View>
          ) : (
            <>
              {allActivities.map((booking, index) => {
                const bookingDate = formatBookingDate(booking.date);
                const isUpcoming = booking.status === 'upcoming';
                const isCompleted = booking.status === 'completed';
                
                return (
                  <TouchableOpacity 
                    key={booking.id}
                    style={[styles.activityCard, index > 0 && styles.activityCardSpacing]}
                    onPress={() => navigation.navigate('Bookings' as never)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.activityCardContent}>
                      <View style={[
                        styles.activityDateContainer,
                        isUpcoming && styles.activityDateUpcoming,
                        isCompleted && styles.activityDateCompleted
                      ]}>
                        <Text style={styles.activityDay}>
                          {bookingDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                        <Text style={styles.activityDateNumber}>
                          {bookingDate.getDate()}
                        </Text>
                      </View>
                      
                      <View style={styles.activityInfo}>
                        <View style={styles.activityTitleRow}>
                          <Text style={styles.activityTitle}>
                            {isUpcoming ? '🔜 Upcoming Booking' : '✅ Completed'}
                          </Text>
                          {isUpcoming && (
                            <View style={styles.upcomingBadge}>
                              <Text style={styles.upcomingBadgeText}>Soon</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.activityStation}>{booking.stationName}</Text>
                        <Text style={styles.activityTime}>
                          {bookingDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })} • {booking.time} • {booking.duration} min
                        </Text>
                      </View>
                      
                      <View style={styles.activityAction}>
                        <ChevronRight size={20} color={HOME_COLORS.text.secondary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderChargingStatus = () => {
    if (!chargingSession) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Charging Status</Text>
          <View style={styles.sectionDivider} />
        </View>
        
        <View style={styles.sectionContent}>
        <BlurView
          style={styles.chargingCard}
          intensity={25}
          tint="dark"
        >
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
        </BlurView>
        </View>
      </View>
    );
  };

  const renderPromotions = () => {
    if (!promotions.length) return null;

    const promotion = promotions[0];
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Promotions & Updates</Text>
          <View style={styles.sectionDivider} />
        </View>
        
        <View style={styles.sectionContent}>
        <BlurView
          style={styles.promotionCard}
          intensity={25}
          tint="dark"
        >
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
        </BlurView>
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
    <DynamicWallpaper theme="dark" variant="gradient">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent={true}
        />
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
            {renderVehicleSection()}
            {renderQuickActionsSection()}
            {renderRecentBookingSection()}
            {renderChargingStatus()}
            {renderPromotions()}
          </Animated.View>
        </ScrollView>
      </View>

      {/* Custom Modals */}

      <CustomModal
        visible={showRepeatBookingModal}
        title="Repeat Booking"
        message={recentBooking ? `Would repeat booking at ${recentBooking.station_name}` : ''}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowRepeatBookingModal(false)}
      />

      {/* Enhanced Vehicle Info Modal */}
      <Modal
        visible={showVehicleInfoModal}
        animationType="none"
        transparent={true}
        onRequestClose={closeVehicleModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <BlurView
            style={styles.modalBlurContainer}
            intensity={50}
            tint="dark"
          >
            <Animated.View 
              style={[
                styles.vehicleModalContainer,
                {
                  transform: [{ scale: modalScale }],
                  opacity: modalOpacity,
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(42, 42, 42, 0.9)', 'rgba(32, 32, 32, 0.95)']}
                style={styles.vehicleModalContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.vehicleModalHeader}>
                  <View style={styles.vehicleModalTitleContainer}>
                    <Car size={24} color={HOME_COLORS.success} style={styles.vehicleModalTitleIcon} />
                    <Text style={styles.vehicleModalTitle}>Vehicle Details</Text>
                  </View>
                  <Pressable 
                    style={styles.vehicleModalCloseButton}
                    onPress={closeVehicleModal}
                    android_ripple={{ color: 'rgba(255,255,255,0.1)', radius: 20 }}
                  >
                    <X size={20} color={HOME_COLORS.text.secondary} />
                  </Pressable>
                </View>
                
                {vehicles[0] && (
                  <ScrollView 
                    style={styles.vehicleModalBody}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.vehicleModalScrollContent}
                  >
                    <View style={styles.vehicleModalImageContainer}>
                      {vehicles[0].image ? (
                        <View style={styles.vehicleModalImageWrapper}>
                          <Image
                            source={{ uri: vehicles[0].image }}
                            style={styles.vehicleModalImage}
                          />
                          <View style={styles.vehicleModalImageOverlay}>
                            <CheckCircle size={20} color={HOME_COLORS.success} />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.vehicleModalImagePlaceholder}>
                          <Car size={48} color={HOME_COLORS.success} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.vehicleModalInfo}>
                      <Text style={styles.vehicleModalName}>{vehicles[0].model}</Text>
                      <View style={styles.vehicleModalSubtitleContainer}>
                        <Battery size={16} color={HOME_COLORS.success} />
                        <Text style={styles.vehicleModalSubtitle}>Electric Vehicle</Text>
                      </View>
                      
                      <View style={styles.vehicleModalDetails}>
                        <View style={styles.vehicleModalDetailRow}>
                          <View style={styles.vehicleModalDetailIconContainer}>
                            <Shield size={16} color={HOME_COLORS.text.secondary} />
                            <Text style={styles.vehicleModalDetailLabel}>License Plate</Text>
                          </View>
                          <Text style={styles.vehicleModalDetailValue}>{vehicles[0].licensePlate}</Text>
                        </View>
                        
                        <View style={styles.vehicleModalDetailRow}>
                          <View style={styles.vehicleModalDetailIconContainer}>
                            <Calendar size={16} color={HOME_COLORS.text.secondary} />
                            <Text style={styles.vehicleModalDetailLabel}>Year</Text>
                          </View>
                          <Text style={styles.vehicleModalDetailValue}>{vehicles[0].year}</Text>
                        </View>
                        
                        <View style={styles.vehicleModalDetailRow}>
                          <View style={styles.vehicleModalDetailIconContainer}>
                            <Battery size={16} color={HOME_COLORS.text.secondary} />
                            <Text style={styles.vehicleModalDetailLabel}>Battery Capacity</Text>
                          </View>
                          <Text style={styles.vehicleModalDetailValue}>{vehicles[0].batteryCapacity} kWh</Text>
                        </View>
                        
                        <View style={styles.vehicleModalDetailRow}>
                          <View style={styles.vehicleModalDetailIconContainer}>
                            <Clock size={16} color={HOME_COLORS.text.secondary} />
                            <Text style={styles.vehicleModalDetailLabel}>Added</Text>
                          </View>
                          <Text style={styles.vehicleModalDetailValue}>
                            {new Date(vehicles[0].createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
                
                <View style={styles.vehicleModalActions}>
                  <TouchableOpacity 
                    style={styles.vehicleModalActionButton}
                    onPress={() => {
                      closeVehicleModal();
                      // Navigate to edit vehicle
                      const parentNavigation = navigation.getParent();
                      if (parentNavigation) {
                        parentNavigation.navigate('Profile');
                        setTimeout(() => {
                          parentNavigation.navigate('Profile', { 
                            screen: 'MyVehicle',
                            params: {}
                          });
                        }, 50);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Edit3 size={18} color="#000000" style={styles.vehicleModalActionIcon} />
                    <Text style={styles.vehicleModalActionText}>Edit Vehicle</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.vehicleModalActionButtonSecondary}
                    onPress={closeVehicleModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.vehicleModalActionTextSecondary}>Close</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Modal>

      {/* Trip Planner Modal */}
      <TripPlannerModal
        visible={showTripPlannerModal}
        onClose={() => setShowTripPlannerModal(false)}
        onPlanTrip={handleTripPlanned}
      />
    </DynamicWallpaper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },

  headerSafeAreaInner: {
    backgroundColor: 'transparent',
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
  },

  notificationButton: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 140,
    paddingBottom: 100,
  },

  content: {
    paddingHorizontal: SPACING.md,
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

  // Enhanced section system
  sectionContainer: {
    marginBottom: SPACING.xl,
  },

  sectionHeader: {
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: HOME_COLORS.text.primary,
    marginBottom: SPACING.sm,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: HOME_COLORS.divider,
    width: '100%',
  },

  sectionContent: {
    // Content spacing handled by individual cards
  },

  // Card system
  card: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Empty state system
  emptyStateCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: HOME_COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  emptyStateTitle: {
    ...TYPOGRAPHY.h4,
    color: HOME_COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptyStateDescription: {
    ...TYPOGRAPHY.body,
    color: HOME_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  // Button system
  primaryButton: {
    backgroundColor: HOME_COLORS.success,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HOME_COLORS.neumorphism.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    color: '#000000',
    fontWeight: '600',
  },

  buttonIcon: {
    marginRight: SPACING.sm,
  },

  secondaryButton: {
    backgroundColor: HOME_COLORS.glass,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
  },

  secondaryButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: HOME_COLORS.text.primary,
    fontWeight: '500',
  },

  // Vehicle card system
  vehicleCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  vehicleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },

  vehicleImageContainer: {
    marginRight: SPACING.md,
  },

  vehicleAction: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  } as ImageStyle,

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    ...TYPOGRAPHY.bodyLarge,
    color: HOME_COLORS.text.primary,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },

  vehicleDetails: {
    ...TYPOGRAPHY.body,
    color: HOME_COLORS.text.secondary,
  },

  // Quick actions system
  quickActionsGrid: {
    gap: SPACING.md,
  },

  quickActionCard: {
    width: '100%',
    backgroundColor: HOME_COLORS.primary,
    borderRadius: 50, // Full rounded pill shape
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  quickActionIcon: {
    marginRight: 12,
  },

  quickActionTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '700' as const,
  },

  quickActionDescription: {
    display: 'none', // Hide descriptions for full-width button style
  },

  // Booking card system
  bookingCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  bookingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },

  bookingDateContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HOME_COLORS.glass,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  bookingDay: {
    ...TYPOGRAPHY.label,
    color: HOME_COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },

  bookingDateNumber: {
    ...TYPOGRAPHY.h3,
    color: HOME_COLORS.text.primary,
    fontWeight: '700' as const,
  },

  bookingInfo: {
    flex: 1,
  },

  bookingTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: HOME_COLORS.text.primary,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },

  bookingStation: {
    ...TYPOGRAPHY.body,
    color: HOME_COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },

  bookingTime: {
    ...TYPOGRAPHY.bodySmall,
    color: HOME_COLORS.text.tertiary,
  },

  // Activity card system (for Recent Activity section)
  activityCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  activityCardSpacing: {
    marginTop: SPACING.md,
  },

  activityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },

  activityDateContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HOME_COLORS.glass,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  activityDateUpcoming: {
    backgroundColor: 'rgba(140, 210, 121, 0.1)',
    borderColor: 'rgba(140, 210, 121, 0.3)',
  },

  activityDateCompleted: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  activityDay: {
    ...TYPOGRAPHY.label,
    fontSize: 10,
    color: HOME_COLORS.text.secondary,
    marginBottom: 2,
  },

  activityDateNumber: {
    ...TYPOGRAPHY.h3,
    fontSize: 20,
    color: HOME_COLORS.text.primary,
    fontWeight: '700' as const,
  },

  activityInfo: {
    flex: 1,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  activityTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: HOME_COLORS.text.primary,
    fontWeight: '600' as const,
    flex: 1,
  },

  upcomingBadge: {
    backgroundColor: 'rgba(140, 210, 121, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.4)',
  },

  upcomingBadgeText: {
    ...TYPOGRAPHY.label,
    fontSize: 10,
    color: HOME_COLORS.success,
    fontWeight: '600' as const,
  },

  activityStation: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: HOME_COLORS.text.secondary,
    marginBottom: 4,
  },

  activityTime: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: HOME_COLORS.text.tertiary,
  },

  activityAction: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Legacy styles - keeping for compatibility
  repeatButton: {
    backgroundColor: HOME_COLORS.glass,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    // Subtle neumorphism effect
    shadowColor: HOME_COLORS.neumorphism.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  repeatButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: HOME_COLORS.text.primary,
  },

  chargingCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    // Glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    // Glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
    backgroundColor: HOME_COLORS.glass,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    // Subtle glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    // Neumorphism effect
    shadowColor: HOME_COLORS.neumorphism.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    // Inner highlight
    borderWidth: 1,
    borderColor: HOME_COLORS.neumorphism.light,
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

  // Vehicle Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalBlurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  vehicleModalContainer: {
    width: '90%',
    maxWidth: 400,
  },

  vehicleModalContent: {
    backgroundColor: 'rgba(42, 42, 42, 0.85)', // More opaque for readability
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // More visible border
    // Enhanced glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },

  vehicleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  vehicleModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleModalTitleIcon: {
    marginRight: 8,
  },

  vehicleModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF', // Pure white for maximum contrast
  },

  vehicleModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  vehicleModalCloseText: {
    fontSize: 18,
    color: '#D0D0D0', // Brighter for better visibility
    fontWeight: '300',
  },

  vehicleModalBody: {
    flex: 1,
    marginBottom: 24,
  },

  vehicleModalScrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },

  vehicleModalImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  vehicleModalImageWrapper: {
    position: 'relative',
  },

  vehicleModalImageOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(42, 42, 42, 0.9)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: HOME_COLORS.success,
  },

  vehicleModalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  vehicleModalImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(140, 210, 121, 0.1)',
    borderWidth: 2,
    borderColor: HOME_COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced glassmorphism effect
    shadowColor: HOME_COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  vehicleModalInfo: {
    alignItems: 'center',
    width: '100%',
  },

  vehicleModalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // Pure white for maximum contrast
    marginBottom: 4,
    textAlign: 'center',
  },

  vehicleModalSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  vehicleModalSubtitle: {
    fontSize: 14,
    color: '#D0D0D0', // Brighter for better readability
    marginLeft: 6,
    textAlign: 'center',
  },

  vehicleModalDetails: {
    width: '100%',
    gap: 12,
  },

  vehicleModalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // More opaque for readability
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Enhanced glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  vehicleModalDetailIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  vehicleModalDetailLabel: {
    fontSize: 14,
    color: '#E0E0E0', // Brighter for better readability
    fontWeight: '500',
    marginLeft: 8,
  },

  vehicleModalDetailValue: {
    fontSize: 14,
    color: '#FFFFFF', // Pure white for maximum contrast
    fontWeight: '600',
  },

  vehicleModalActions: {
    gap: 12,
  },

  vehicleModalActionButton: {
    backgroundColor: HOME_COLORS.success,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced neumorphism effect
    shadowColor: HOME_COLORS.neumorphism.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    // Inner highlight
    borderWidth: 1,
    borderColor: HOME_COLORS.neumorphism.light,
  },

  vehicleModalActionIcon: {
    marginRight: 8,
  },

  vehicleModalActionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // More opaque for readability
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  vehicleModalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  vehicleModalActionTextSecondary: {
    color: '#FFFFFF', // Pure white for maximum contrast
  },
});

export default HomeScreen;