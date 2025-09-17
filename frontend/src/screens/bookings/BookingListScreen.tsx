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
  CheckCircle,
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
    getUpcomingBookings, 
    getCompletedBookings, 
    getCancelledBookings,
    markCompleted,
    deleteBooking,
    cancelBooking 
  } = useBookings();
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getCurrentBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingBookings();
      case 'completed':
        return getCompletedBookings();
      case 'cancelled':
        return getCancelledBookings();
      default:
        return [];
    }
  };

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowActionModal(true);
  };

  const handleMarkCompleted = () => {
    if (selectedBooking) {
      setShowCompleteModal(true);
    }
  };

  const confirmMarkCompleted = async () => {
    if (selectedBooking) {
      try {
        await markCompleted(selectedBooking.id);
        setShowCompleteModal(false);
        setShowActionModal(false);
        setSelectedBooking(null);
        Alert.alert('Success', 'Booking marked as completed!');
      } catch (error) {
        Alert.alert('Error', 'Failed to mark booking as completed');
      }
    }
  };

  const handleDeleteBooking = () => {
    if (selectedBooking) {
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteBooking = async () => {
    if (selectedBooking) {
      try {
        await deleteBooking(selectedBooking.id);
        setShowDeleteModal(false);
        setShowActionModal(false);
        setSelectedBooking(null);
        Alert.alert('Success', 'Booking deleted successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to delete booking');
      }
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBooking) {
      try {
        await cancelBooking(selectedBooking.id);
        setShowActionModal(false);
        setSelectedBooking(null);
        Alert.alert('Success', 'Booking cancelled successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel booking');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
        return <CheckCircle size={16} color={BOOKING_COLORS.success} />;
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
      </View>
    </TouchableOpacity>
  );

  const currentBookings = getCurrentBookings();

  return (
    <View style={styles.container}>
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

      {/* Action Modal */}
      <CustomModal
        visible={showActionModal}
        title="Booking Actions"
        message={`What would you like to do with your booking at ${selectedBooking?.stationName}?`}
        options={[
          ...(selectedBooking?.status === 'upcoming' ? [
            {
              text: 'Mark as Done',
              onPress: handleMarkCompleted,
              style: 'primary' as const,
            },
            {
              text: 'Cancel Booking',
              onPress: handleCancelBooking,
              style: 'destructive' as const,
            },
          ] : []),
          {
            text: 'Delete',
            onPress: handleDeleteBooking,
            style: 'destructive' as const,
          },
          {
            text: 'Close',
            onPress: () => {
              setShowActionModal(false);
              setSelectedBooking(null);
            },
            style: 'cancel' as const,
          },
        ]}
        onClose={() => {
          setShowActionModal(false);
          setSelectedBooking(null);
        }}
      />

      {/* Complete Confirmation Modal */}
      <CustomModal
        visible={showCompleteModal}
        title="Mark as Completed"
        message="Are you sure you want to mark this booking as completed? This will move it to the completed section."
        options={[
          {
            text: 'Yes, Mark as Done',
            onPress: confirmMarkCompleted,
            style: 'primary' as const,
          },
          {
            text: 'Cancel',
            onPress: () => setShowCompleteModal(false),
            style: 'cancel' as const,
          },
        ]}
        onClose={() => setShowCompleteModal(false)}
      />

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
  },

  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.text.primary,
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
