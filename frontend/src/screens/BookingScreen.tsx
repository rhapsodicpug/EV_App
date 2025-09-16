import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar as CalendarIcon,
  Battery,
  DollarSign,
  Navigation,
  X,
  RotateCcw,
  Star,
  Search,
  ArrowLeft,
  Bell,
  User
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useThemeColors } from '../design';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { apiService } from '../services/api';
import { BookingWithStationResponse, BookingStatus } from '../types/api';

const { width } = Dimensions.get('window');

// Color scheme matching the HomeScreen and StationListScreen design
const BOOKING_COLORS = {
  primary: '#8cd279',
  secondary: '#8B5CF6',
  success: '#8cd279',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#3A3A3A',
  border: '#4A4A4A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
    muted: '#666666',
  },
  accent: '#8cd279',
};

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const isFocused = useIsFocused();

  // State for premium Bookings screen
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookings, setBookings] = useState<BookingWithStationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Animation values for segmented control
  const tabIndicatorPosition = useSharedValue(0);

  // Fetch bookings from API
  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching bookings from API...');
      const data = await apiService.getMyBookings(0, 100);
      console.log('✅ Bookings fetched:', data.length, 'bookings');
      
      setBookings(data);
    } catch (err: any) {
      console.error('❌ Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings(false);
  };

  // Effect to fetch bookings when screen loads or becomes focused
  useEffect(() => {
    if (isFocused) {
      fetchBookings();
    }
  }, [isFocused]);

  // Filter bookings based on active tab and status
  const upcomingBookings = bookings.filter(booking =>
    ['PENDING', 'CONFIRMED'].includes(booking.status)
  );
  const pastBookings = bookings.filter(booking =>
    ['COMPLETED', 'CANCELLED'].includes(booking.status)
  );

  // Handler functions
  const handleTabChange = (tab: 'Upcoming' | 'Past') => {
    setActiveTab(tab);
    // Animate tab indicator
    const targetPosition = tab === 'Upcoming' ? 0 : 1;
    tabIndicatorPosition.value = withTiming(targetPosition, { duration: 300 });
  };

  const handleGetDirections = (booking: BookingWithStationResponse) => {
    Alert.alert('Directions', `Get directions to ${booking.station_name}?`);
  };

  const handleCancelBooking = async (booking: BookingWithStationResponse) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelBooking(booking.id);
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
              // Refresh bookings after cancellation
              fetchBookings();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleRebook = (booking: BookingWithStationResponse) => {
    Alert.alert('Re-book', `Re-book at ${booking.station_name}?`);
  };

  const handleLeaveReview = (booking: BookingWithStationResponse) => {
    Alert.alert('Review', 'Leave a review for your charging session?');
  };

  const handleFindCharger = () => {
    navigation.navigate('Home' as never);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'Notification center would open here');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  // Format date and time helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (bookingDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (bookingDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startTimeStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const endTimeStr = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  const formatAmount = (cost?: number) => {
    if (!cost) return '₹0';
    return `₹${Math.round(cost)}`;
  };

  // Status styling helpers
  const getStatusInfo = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          text: 'CONFIRMED',
          color: BOOKING_COLORS.success,
          icon: CheckCircle,
          bgColor: BOOKING_COLORS.success + '20',
        };
      case 'PENDING':
        return {
          text: 'PENDING',
          color: BOOKING_COLORS.primary,
          icon: Clock,
          bgColor: BOOKING_COLORS.primary + '20',
        };
      case 'COMPLETED':
        return {
          text: 'COMPLETED',
          color: BOOKING_COLORS.success,
          icon: CheckCircle,
          bgColor: BOOKING_COLORS.success + '20',
        };
      case 'CANCELLED':
        return {
          text: 'CANCELLED',
          color: BOOKING_COLORS.error,
          icon: XCircle,
          bgColor: BOOKING_COLORS.error + '20',
        };
      default:
        return {
          text: status.toUpperCase(),
          color: BOOKING_COLORS.text.secondary,
          icon: AlertCircle,
          bgColor: BOOKING_COLORS.surface,
        };
    }
  };

  // Animated styles for tab indicator
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          tabIndicatorPosition.value,
          [0, 1],
          [0, (width - 48) / 2 - 4], // Match the width calculation
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // Get current bookings based on active tab
  const currentBookings = activeTab === 'Upcoming' ? upcomingBookings : pastBookings;

  // Render header with gradient blur effect
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
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color={BOOKING_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Bell size={24} color={BOOKING_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // Loading state
  if (isLoading && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.background} />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={BOOKING_COLORS.error} />
          <Text style={styles.errorTitle}>Failed to Load Bookings</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.background} />
      {renderHeader()}

      {/* Segmented Control */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedControl}>
          {/* Animated Background Indicator */}
          <Animated.View
            style={[
              styles.segmentedIndicator,
              tabIndicatorStyle,
            ]}
          />

          <TouchableOpacity
            style={styles.segmentedButton}
            onPress={() => handleTabChange('Upcoming')}
          >
            <Text
              style={[
                styles.segmentedText,
                activeTab === 'Upcoming' && styles.activeSegmentedText,
              ]}
            >
              Upcoming ({upcomingBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.segmentedButton}
            onPress={() => handleTabChange('Past')}
          >
            <Text
              style={[
                styles.segmentedText,
                activeTab === 'Past' && styles.activeSegmentedText,
              ]}
            >
              Past ({pastBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookingsContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={BOOKING_COLORS.primary}
            colors={[BOOKING_COLORS.primary]}
          />
        }
      >
        {currentBookings.length > 0 ? (
          currentBookings.map((booking) => (
            <LinearGradient
              key={booking.id}
              colors={[
                'rgba(58, 58, 58, 0.8)',
                'rgba(42, 42, 42, 0.6)',
                'rgba(26, 26, 26, 0.4)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.bookingCard,
                activeTab === 'Past' && styles.pastBookingCard,
              ]}
            >
              {/* Status Header */}
              <View style={styles.statusHeader}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusInfo(booking.status).bgColor },
                  ]}
                >
                  {React.createElement(getStatusInfo(booking.status).icon, {
                    size: 16,
                    color: getStatusInfo(booking.status).color,
                  })}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusInfo(booking.status).color },
                    ]}
                  >
                    {getStatusInfo(booking.status).text}
                  </Text>
                </View>
              </View>

              {/* Booking Content */}
              <View style={styles.bookingContent}>
                <Text style={styles.stationName}>{booking.station_name}</Text>
                <Text style={styles.stationAddress}>{booking.station_address}</Text>

                <View style={styles.bookingMeta}>
                  <View style={styles.metaItem}>
                    <CalendarIcon
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>
                      {formatDate(booking.start_time)} • {formatTimeSlot(booking.start_time, booking.end_time)}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Battery
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>
                      Slot {booking.slot_number}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <DollarSign
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>{formatAmount(booking.total_cost)}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {activeTab === 'Upcoming' ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleGetDirections(booking)}
                    >
                      <Navigation
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Get Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelBooking(booking)}
                    >
                      <X
                        size={16}
                        color={BOOKING_COLORS.error}
                      />
                      <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                        Cancel Booking
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRebook(booking)}
                    >
                      <RotateCcw
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Re-book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLeaveReview(booking)}
                    >
                      <Star
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Leave Review</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </LinearGradient>
          ))
        ) : (
          /* Premium Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={80} color={BOOKING_COLORS.text.muted} />
            </View>

            <Text style={styles.emptyTitle}>No Bookings Yet.</Text>

            <Text style={styles.emptySubtitle}>
              Your confirmed charging sessions will appear here.
            </Text>

            <TouchableOpacity
              style={styles.findChargerButton}
              onPress={handleFindCharger}
            >
              <Search
                size={20}
                color={BOOKING_COLORS.text.primary}
              />
              <Text style={styles.findChargerText}>Find a Charger</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Premium Styles for Bookings Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.background,
  },

  // Header with gradient blur effect
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.text.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: BOOKING_COLORS.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BOOKING_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: BOOKING_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: BOOKING_COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  // Segmented Control
  segmentedContainer: {
    paddingHorizontal: 24,
    paddingTop: 120, // Account for header
    paddingBottom: 20,
  },
  segmentedControl: {
    backgroundColor: BOOKING_COLORS.surface,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    position: 'relative',
    marginHorizontal: 0,
  },
  segmentedIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 48) / 2 - 4, // Account for container padding (24px each side) and internal padding
    height: 40,
    backgroundColor: BOOKING_COLORS.primary,
    borderRadius: 12,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentedText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.text.secondary,
  },
  activeSegmentedText: {
    color: BOOKING_COLORS.text.primary,
  },

  // Bookings List
  bookingsScrollView: {
    flex: 1,
  },
  bookingsContainer: {
    padding: 24,
    paddingBottom: 100, // Account for tab bar
  },

  // Booking Cards
  bookingCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    // Frosted glass effect
    shadowColor: BOOKING_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pastBookingCard: {
    opacity: 0.7, // De-emphasized for past bookings
  },

  // Status Header
  statusHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: BOOKING_COLORS.surface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Booking Content
  bookingContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.text.primary,
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: BOOKING_COLORS.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Booking Meta
  bookingMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: BOOKING_COLORS.text.muted,
    marginLeft: 8,
    flex: 1,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BOOKING_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.primary + '40',
  },
  cancelButton: {
    borderColor: BOOKING_COLORS.error + '40',
    backgroundColor: BOOKING_COLORS.error + '10',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.primary,
    marginLeft: 6,
  },
  cancelButtonText: {
    color: BOOKING_COLORS.error,
  },

  // Premium Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: BOOKING_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  findChargerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: BOOKING_COLORS.primary,
    borderRadius: 16,
    gap: 8,
  },
  findChargerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default BookingScreen;