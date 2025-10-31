/**
 * Booking Notifications Screen
 * Display all booking-related notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { 
  ArrowLeft, 
  Bell, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Navigation,
  Route,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useBookings } from '../contexts/BookingContext';
import { LinearGradient } from 'expo-linear-gradient';
import { tripStorageService, SavedTrip } from '../services/TripStorageService';

const BookingNotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state: { bookings } } = useBookings();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  // Load saved trips when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    try {
      const trips = await tripStorageService.getAllTrips();
      setSavedTrips(trips);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Generate notification-style items from bookings and trips
  const getNotificationItems = () => {
    const items: Array<{
      id: string;
      type: 'booking_created' | 'booking_upcoming' | 'booking_completed' | 'booking_cancelled' | 'trip_planned';
      title: string;
      message: string;
      time: string;
      icon: 'check' | 'calendar' | 'clock' | 'x' | 'navigation' | 'route';
      color: string;
    }> = [];

    bookings.forEach(booking => {
      // Add booking created notification
      items.push({
        id: `${booking.id}_created`,
        type: 'booking_created',
        title: '✅ Booking Confirmed!',
        message: `Your charging session at ${booking.stationName} on ${formatDate(booking.date)} at ${booking.time} has been confirmed.`,
        time: formatTime(booking.createdAt),
        icon: 'check',
        color: '#10B981',
      });

      // Add upcoming reminder if booking is within 24 hours
      if (booking.status === 'upcoming') {
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        const now = new Date();
        const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntil > 0 && hoursUntil < 24) {
          items.push({
            id: `${booking.id}_reminder`,
            type: 'booking_upcoming',
            title: '⏰ Upcoming Charging Session',
            message: `Your charging session at ${booking.stationName} starts in ${Math.ceil(hoursUntil)} hour(s)!`,
            time: 'Reminder',
            icon: 'clock',
            color: '#F59E0B',
          });
        }
      }

      // Add completed notification
      if (booking.status === 'completed' && booking.completedAt) {
        items.push({
          id: `${booking.id}_completed`,
          type: 'booking_completed',
          title: '✅ Charging Complete',
          message: `Your charging session at ${booking.stationName} has finished successfully.`,
          time: formatTime(booking.completedAt),
          icon: 'check',
          color: '#8cd279',
        });
      }

      // Add cancelled notification
      if (booking.status === 'cancelled' && booking.cancelledAt) {
        items.push({
          id: `${booking.id}_cancelled`,
          type: 'booking_cancelled',
          title: '❌ Booking Cancelled',
          message: `Your booking at ${booking.stationName} on ${formatDate(booking.date)} has been cancelled.`,
          time: formatTime(booking.cancelledAt),
          icon: 'x',
          color: '#EF4444',
        });
      }
    });

    // Add trip planning notifications
    savedTrips.forEach(trip => {
      items.push({
        id: `${trip.id}_planned`,
        type: 'trip_planned',
        title: '🗺️ Trip Planned',
        message: `Your trip from ${trip.tripPlan.startLocation.name} to ${trip.tripPlan.endLocation.name} (${trip.tripPlan.distance.toFixed(1)} km) has been planned successfully!`,
        time: formatTime(trip.createdAt),
        icon: 'navigation',
        color: '#8cd279',
      });
    });

    // Sort by most recent first
    return items.sort((a, b) => {
      // Get timestamps for comparison
      const getTimestamp = (item: typeof items[0]) => {
        if (item.type === 'trip_planned') {
          const trip = savedTrips.find(t => item.id.startsWith(t.id));
          return trip ? new Date(trip.createdAt).getTime() : 0;
        } else {
          const booking = bookings.find(b => item.id.startsWith(b.id));
          return booking ? new Date(booking.createdAt).getTime() : 0;
        }
      };
      
      return getTimestamp(b) - getTimestamp(a);
    });
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'check': return <CheckCircle size={20} color="#10B981" />;
      case 'calendar': return <Calendar size={20} color="#F59E0B" />;
      case 'clock': return <Clock size={20} color="#F59E0B" />;
      case 'x': return <XCircle size={20} color="#EF4444" />;
      case 'navigation': return <Navigation size={20} color="#8cd279" />;
      case 'route': return <Route size={20} color="#8cd279" />;
      default: return <Bell size={20} color="#B0B0B0" />;
    }
  };

  const notificationItems = getNotificationItems();
  const upcomingCount = notificationItems.filter(n => n.type === 'booking_upcoming').length;
  const tripCount = notificationItems.filter(n => n.type === 'trip_planned').length;
  const totalCount = notificationItems.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {upcomingCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{upcomingCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={['rgba(140, 210, 121, 0.15)', 'rgba(139, 92, 246, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <Bell size={24} color="#8cd279" />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>Activity & Notifications</Text>
          <Text style={styles.summarySubtitle}>
            {totalCount === 0 
              ? 'No notifications yet' 
              : (() => {
                  const parts = [];
                  if (upcomingCount > 0) {
                    parts.push(`${upcomingCount} upcoming reminder${upcomingCount > 1 ? 's' : ''}`);
                  }
                  if (tripCount > 0) {
                    parts.push(`${tripCount} planned trip${tripCount > 1 ? 's' : ''}`);
                  }
                  return parts.length > 0 ? parts.join(' • ') : 'All caught up! 🎉';
                })()
            }
          </Text>
        </View>
      </LinearGradient>

      {/* Notifications List */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8cd279"
          />
        }
      >
        {notificationItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#666666" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              Your booking and trip notifications will appear here{'\n'}
              Stay updated on all your EV charging activities!
            </Text>
          </View>
        ) : (
          notificationItems.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View style={styles.notificationIcon}>
                {getIcon(item.icon)}
              </View>
              
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <View style={styles.notificationFooter}>
                  <Clock size={12} color="#666666" />
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Info Text */}
        {notificationItems.length > 0 && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Track your bookings, planned trips, and charging activities all in one place
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },

  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.3)',
  },

  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  summarySubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 100, // Space for floating navigation bar
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },

  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  notificationMessage: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 8,
  },

  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTime: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },

  infoContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(140, 210, 121, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.2)',
  },

  infoText: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default BookingNotificationsScreen;

