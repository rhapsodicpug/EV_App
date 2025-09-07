import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useThemeColors } from '../design';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Premium colors for Bookings screen
const BOOKING_COLORS = {
  primary: '#00A8FF',
  secondary: '#6366F1',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

interface Booking {
  id: string;
  stationName: string;
  stationAddress: string;
  date: string;
  timeSlot: string;
  amount: string;
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
  slotNumber: number;
  chargerType: string;
  bookingDate: string;
}

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // State for premium Bookings screen
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values for segmented control
  const tabIndicatorPosition = useSharedValue(0);

  // Mock data for premium design
  const mockBookings: Booking[] = [
    {
      id: '1',
      stationName: 'Mumbai Central EV Station',
      stationAddress: 'Mumbai Central Railway Station, Mumbai',
      date: 'Today',
      timeSlot: '3:00 PM - 4:00 PM',
      amount: '₹120',
      status: 'confirmed',
      slotNumber: 3,
      chargerType: 'DC Fast',
      bookingDate: '2024-01-15',
    },
    {
      id: '2',
      stationName: 'Bandra Kurla Complex Station',
      stationAddress: 'BKC, Bandra East, Mumbai',
      date: 'Tomorrow',
      timeSlot: '10:00 AM - 12:00 PM',
      amount: '₹160',
      status: 'upcoming',
      slotNumber: 1,
      chargerType: 'DC Ultra Fast',
      bookingDate: '2024-01-16',
    },
    {
      id: '3',
      stationName: 'Andheri West Charging Hub',
      stationAddress: 'Andheri West, Mumbai',
      date: 'Jan 18',
      timeSlot: '2:00 PM - 4:00 PM',
      amount: '₹140',
      status: 'completed',
      slotNumber: 2,
      chargerType: 'AC Fast',
      bookingDate: '2024-01-18',
    },
    {
      id: '4',
      stationName: 'Juhu Beach Station',
      stationAddress: 'Juhu Beach, Mumbai',
      date: 'Jan 12',
      timeSlot: '6:00 PM - 8:00 PM',
      amount: '₹180',
      status: 'cancelled',
      slotNumber: 4,
      chargerType: 'DC Fast',
      bookingDate: '2024-01-12',
    },
  ];

  // Filter bookings based on active tab
  const upcomingBookings = mockBookings.filter(booking =>
    ['upcoming', 'confirmed'].includes(booking.status)
  );
  const pastBookings = mockBookings.filter(booking =>
    ['completed', 'cancelled'].includes(booking.status)
  );

  // Handler functions
  const handleTabChange = (tab: 'Upcoming' | 'Past') => {
    setActiveTab(tab);
    // Animate tab indicator
    const targetPosition = tab === 'Upcoming' ? 0 : 1;
    tabIndicatorPosition.value = withTiming(targetPosition, { duration: 300 });
  };

  const handleGetDirections = (booking: Booking) => {
    Alert.alert('Directions', `Get directions to ${booking.stationName}?`);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => Alert.alert('Booking Cancelled', 'Your booking has been cancelled.')
        }
      ]
    );
  };

  const handleRebook = (booking: Booking) => {
    Alert.alert('Re-book', `Re-book at ${booking.stationName}?`);
  };

  const handleLeaveReview = (booking: Booking) => {
    Alert.alert('Review', 'Leave a review for your charging session?');
  };

  const handleFindCharger = () => {
    navigation.navigate('Home' as never);
  };

  // Status styling helpers
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          text: 'CONFIRMED',
          color: BOOKING_COLORS.success,
          icon: 'checkmark-circle',
          bgColor: BOOKING_COLORS.success + '20',
        };
      case 'upcoming':
        return {
          text: 'UPCOMING',
          color: BOOKING_COLORS.primary,
          icon: 'time',
          bgColor: BOOKING_COLORS.primary + '20',
        };
      case 'completed':
        return {
          text: 'COMPLETED',
          color: BOOKING_COLORS.success,
          icon: 'checkmark-circle',
          bgColor: BOOKING_COLORS.success + '20',
        };
      case 'cancelled':
        return {
          text: 'CANCELLED',
          color: BOOKING_COLORS.error,
          icon: 'close-circle',
          bgColor: BOOKING_COLORS.error + '20',
        };
      default:
        return {
          text: status.toUpperCase(),
          color: BOOKING_COLORS.text.secondary,
          icon: 'help-circle',
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
          [0, width / 2 - 20],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // Get current bookings based on active tab
  const currentBookings = activeTab === 'Upcoming' ? upcomingBookings : pastBookings;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

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
              Upcoming
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
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookingsContainer}
      >
        {currentBookings.length > 0 ? (
          currentBookings.map((booking) => (
            <View
              key={booking.id}
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
                  <Ionicons
                    name={getStatusInfo(booking.status).icon as any}
                    size={16}
                    color={getStatusInfo(booking.status).color}
                  />
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
                <Text style={styles.stationName}>{booking.stationName}</Text>
                <Text style={styles.stationAddress}>{booking.stationAddress}</Text>

                <View style={styles.bookingMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>
                      {booking.date} • {booking.timeSlot}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="battery-charging-outline"
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>
                      Slot {booking.slotNumber} • {booking.chargerType}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="cash-outline"
                      size={14}
                      color={BOOKING_COLORS.text.muted}
                    />
                    <Text style={styles.metaText}>{booking.amount}</Text>
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
                      <Ionicons
                        name="navigate-outline"
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Get Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelBooking(booking)}
                    >
                      <Ionicons
                        name="close-outline"
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
                      <Ionicons
                        name="refresh-outline"
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Re-book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLeaveReview(booking)}
                    >
                      <Ionicons
                        name="star-outline"
                        size={16}
                        color={BOOKING_COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Leave Review</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          /* Premium Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={80}
                color={BOOKING_COLORS.text.muted}
              />
            </View>

            <Text style={styles.emptyTitle}>No Bookings Yet</Text>

            <Text style={styles.emptySubtitle}>
              When you book a charging session, it will appear here.
            </Text>

            <TouchableOpacity
              style={styles.findChargerButton}
              onPress={handleFindCharger}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={BOOKING_COLORS.text.primary}
              />
              <Text style={styles.findChargerText}>Find a Charger</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Premium Styles for Bookings Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.background,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BOOKING_COLORS.text.primary,
    letterSpacing: 0.5,
  },

  // Segmented Control
  segmentedContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  segmentedControl: {
    backgroundColor: BOOKING_COLORS.surface,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    position: 'relative',
  },
  segmentedIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: width / 2 - 20,
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
    backgroundColor: BOOKING_COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    // Frosted glass effect
    shadowColor: BOOKING_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.surface,
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
    color: BOOKING_COLORS.text.primary,
  },
});

export default BookingScreen;
