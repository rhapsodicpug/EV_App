/**
 * Booking List Screen
 * Shows upcoming, completed, and cancelled bookings with management options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  BackHandler,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  XCircle,
  MoreVertical,
  Trash2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useBookings, Booking } from '../../contexts/BookingContext';
import CustomModal from '../../components/ui/CustomModal';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const BOOKING_COLORS = {
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
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  icon: '#FFFFFF',
};

type TabType = 'upcoming' | 'completed' | 'cancelled';

const BookingListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { 
    state,
    getUpcomingBookings, 
    getCompletedBookings, 
    getCancelledBookings,
    deleteBooking,
    cancelBooking,
    loadBookings
  } = useBookings();
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getCurrentBookings = () => {
    const upcoming = getUpcomingBookings();
    const completed = getCompletedBookings();
    const cancelled = getCancelledBookings();
    
    console.log('📊 Booking counts:', {
      upcoming: upcoming.length,
      completed: completed.length,
      cancelled: cancelled.length,
      activeTab
    });
    
    switch (activeTab) {
      case 'upcoming':
        return upcoming;
      case 'completed':
        return completed;
      case 'cancelled':
        return cancelled;
      default:
        return [];
    }
  };

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Monitor state changes and update current bookings
  useEffect(() => {
    console.log('🔄 State changed, total bookings:', state.bookings.length);
    console.log('🔄 Active tab:', activeTab);
    const current = getCurrentBookings();
    console.log('🔄 Current bookings for tab:', current.length);
    console.log('🔄 Current bookings IDs:', current.map(b => b.id));
    setCurrentBookings(current);
  }, [state.bookings, activeTab]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    // Show delete confirmation for completed bookings
    if (booking.status === 'completed') {
      setShowDeleteModal(true);
    }
    // Show cancel confirmation for upcoming bookings
    if (booking.status === 'upcoming') {
      setShowCancelModal(true);
    }
  };

  const handleCancelBooking = () => {
    if (selectedBooking && selectedBooking.status === 'upcoming') {
      setShowCancelModal(true);
    }
  };

  const confirmCancelBooking = async () => {
    if (selectedBooking) {
      const bookingId = selectedBooking.id;
      console.log('🎯 Starting cancel process for booking:', bookingId);
      console.log('📊 Current bookings before cancel:', currentBookings.length);
      
      // Close the cancel modal first
      setShowCancelModal(false);
      
      // Cancel the booking
      await cancelBooking(bookingId);
      console.log('🎯 Cancel process finished');
      
      // Manually reload bookings to ensure UI updates
      await loadBookings();
      console.log('📥 Bookings reloaded');
      
      // Update current bookings manually
      const updated = getCurrentBookings();
      console.log('📊 Updated bookings count:', updated.length);
      setCurrentBookings(updated);
      
      // Clear selection
      setSelectedBooking(null);
      
      // Force refresh the screen to update UI
      forceRefresh();
      
      console.log('✅ Cancel complete, UI should update now');
      
      // Show success message
      Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
    }
  };


  const handleDeleteBooking = () => {
    console.log('🔍 Delete button clicked, selectedBooking:', selectedBooking);
    if (selectedBooking) {
      console.log('✅ Showing delete modal for booking:', selectedBooking.id);
      setShowDeleteModal(true);
    } else {
      console.log('❌ No selected booking to delete');
    }
  };

  const confirmDeleteBooking = async () => {
    if (selectedBooking) {
      const bookingId = selectedBooking.id;
      console.log('🎯 Starting delete process for booking:', bookingId);
      console.log('📊 Current bookings before delete:', currentBookings.length);
      
      // Close the delete modal first
      setShowDeleteModal(false);
      
      // Delete the booking
      await deleteBooking(bookingId);
      console.log('🎯 Delete process finished');
      
      // Manually reload bookings to ensure UI updates
      await loadBookings();
      console.log('📥 Bookings reloaded');
      
      // Update current bookings manually
      const updated = getCurrentBookings();
      console.log('📊 Updated bookings count:', updated.length);
      setCurrentBookings(updated);
      
      // Clear selection
      setSelectedBooking(null);
      
      // Force refresh the screen to update UI
      forceRefresh();
      
      console.log('✅ Delete complete, UI should update now');
      
      // Show success message
      Alert.alert('Success', 'Booking deleted successfully!');
    }
  };


  const formatDate = (dateString: string) => {
    try {
      // Handle both date formats (YYYY-MM-DD and MM/DD/YYYY)
      let date: Date;
      
      if (dateString.includes('-')) {
        // ISO format (YYYY-MM-DD)
        date = new Date(dateString + 'T00:00:00');
      } else if (dateString.includes('/')) {
        // Locale format (MM/DD/YYYY or DD/MM/YYYY)
        date = new Date(dateString);
      } else {
        // Try to parse as ISO date string
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString; // Return original string if invalid
      }

      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return dateString; // Return original string on error
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return BOOKING_COLORS.warning;
      case 'completed':
        return BOOKING_COLORS.success;
      case 'cancelled':
        return BOOKING_COLORS.error;
      default:
        return BOOKING_COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock size={16} color={BOOKING_COLORS.warning} />;
      case 'completed':
        return <Clock size={16} color={BOOKING_COLORS.success} />;
      case 'cancelled':
        return <XCircle size={16} color={BOOKING_COLORS.error} />;
      default:
        return <Clock size={16} color={BOOKING_COLORS.text.secondary} />;
    }
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => handleBookingPress(booking)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitle}>
          <Text style={styles.stationName}>{booking.stationName}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(booking.status)}
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>
        <MoreVertical size={20} color={BOOKING_COLORS.text.secondary} />
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={BOOKING_COLORS.text.secondary} />
          <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={BOOKING_COLORS.text.secondary} />
          <Text style={styles.detailText}>{formatTime(booking.time)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={BOOKING_COLORS.text.secondary} />
          <Text style={styles.detailText} numberOfLines={1}>{booking.stationAddress}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <DollarSign size={16} color={BOOKING_COLORS.text.secondary} />
          <Text style={styles.detailText}>₹{booking.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.durationText}>{booking.duration} minutes</Text>
        {booking.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setSelectedBooking(booking);
              setShowCancelModal(true);
            }}
          >
            <XCircle size={18} color={BOOKING_COLORS.error} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View key={refreshKey} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={BOOKING_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({getUpcomingBookings().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({getCompletedBookings().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
            Cancelled ({getCancelledBookings().length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming' 
                ? 'You don\'t have any upcoming bookings'
                : `You don't have any ${activeTab} bookings`
              }
            </Text>
          </View>
        ) : (
          currentBookings.map(renderBookingCard)
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={showDeleteModal}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        options={[
          {
            text: 'Yes, Delete',
            onPress: confirmDeleteBooking,
            style: 'destructive' as const,
          },
          {
            text: 'Cancel',
            onPress: () => setShowDeleteModal(false),
            style: 'cancel' as const,
          },
        ]}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Cancel Confirmation Modal */}
      <CustomModal
        visible={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This will move it to the Cancelled section."
        options={[
          {
            text: 'Yes, Cancel',
            onPress: confirmCancelBooking,
            style: 'destructive' as const,
          },
          {
            text: 'Keep Booking',
            onPress: () => setShowCancelModal(false),
            style: 'cancel' as const,
          },
        ]}
        onClose={() => setShowCancelModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: BOOKING_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.text.primary,
  },

  headerRight: {
    width: 40,
  },

  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButtonText: {
    fontSize: 18,
  },

  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  testButtonText: {
    fontSize: 16,
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.surface,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: BOOKING_COLORS.accent,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.text.secondary,
  },

  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 120, // Extra padding to avoid bottom navigation overlap
  },

  // Booking Card Styles
  bookingCard: {
    backgroundColor: BOOKING_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.border,
  },

  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  bookingTitle: {
    flex: 1,
  },

  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.text.primary,
    marginBottom: 4,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  bookingDetails: {
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailText: {
    fontSize: 14,
    color: BOOKING_COLORS.text.secondary,
    marginLeft: 8,
    flex: 1,
  },

  bookingFooter: {
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.border,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.text.primary,
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: BOOKING_COLORS.error,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: BOOKING_COLORS.error,
    marginLeft: 4,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BOOKING_COLORS.text.primary,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: BOOKING_COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default BookingListScreen;
