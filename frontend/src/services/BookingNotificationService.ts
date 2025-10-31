/**
 * Booking Notification Service
 * Simple notification system for booking-related alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookingNotificationData {
  bookingId: string;
  stationName: string;
  date: string;
  time: string;
}

class BookingNotificationService {
  private isInitialized = false;
  private isWeb = Platform.OS === 'web';

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.isWeb) {
      console.log('🌐 Web platform: Using browser notifications');
      await this.initializeWebNotifications();
      return;
    }

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (hasPermission) {
        this.isInitialized = true;
        console.log('✅ Booking notification service initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize booking notification service:', error);
    }
  }

  /**
   * Initialize web notifications
   */
  private async initializeWebNotifications(): Promise<void> {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          this.isInitialized = true;
          console.log('✅ Browser notifications enabled');
        }
      } catch (error) {
        console.log('❌ Browser notification permission failed:', error);
      }
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (this.isWeb) {
      return this.isInitialized;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Send notification when a new booking is created
   */
  async sendBookingCreatedNotification(data: BookingNotificationData): Promise<void> {
    if (!this.isInitialized) {
      console.log('⚠️ Notification service not initialized');
      return;
    }

    try {
      const title = '✅ Booking Confirmed!';
      const body = `Your charging session at ${data.stationName} on ${this.formatDate(data.date)} at ${data.time} has been confirmed.`;

      if (this.isWeb) {
        this.sendWebNotification(title, body, data);
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { bookingId: data.bookingId, type: 'booking_created' },
            sound: true,
          },
          trigger: null, // Send immediately
        });
      }

      console.log('📲 Booking created notification sent');
    } catch (error) {
      console.error('❌ Failed to send booking created notification:', error);
    }
  }

  /**
   * Send reminder notification for upcoming booking
   */
  async scheduleUpcomingBookingReminder(data: BookingNotificationData): Promise<void> {
    if (!this.isInitialized || this.isWeb) {
      return; // Skip for web, or if not initialized
    }

    try {
      // Parse the booking date and time
      const bookingDateTime = this.parseDateTime(data.date, data.time);
      
      // Schedule notification 30 minutes before the booking
      const reminderTime = new Date(bookingDateTime.getTime() - 30 * 60 * 1000);
      
      // Only schedule if the reminder time is in the future
      if (reminderTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Upcoming Charging Session',
            body: `Your charging session at ${data.stationName} starts in 30 minutes!`,
            data: { bookingId: data.bookingId, type: 'booking_reminder' },
            sound: true,
          },
          trigger: { date: reminderTime },
        });

        console.log('⏰ Reminder scheduled for:', reminderTime.toLocaleString());
      }
    } catch (error) {
      console.error('❌ Failed to schedule booking reminder:', error);
    }
  }

  /**
   * Send notification for cancelled booking
   */
  async sendBookingCancelledNotification(data: BookingNotificationData): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      const title = '❌ Booking Cancelled';
      const body = `Your booking at ${data.stationName} on ${this.formatDate(data.date)} has been cancelled.`;

      if (this.isWeb) {
        this.sendWebNotification(title, body, data);
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { bookingId: data.bookingId, type: 'booking_cancelled' },
            sound: true,
          },
          trigger: null,
        });
      }

      console.log('📲 Booking cancelled notification sent');
    } catch (error) {
      console.error('❌ Failed to send booking cancelled notification:', error);
    }
  }

  /**
   * Send web notification (for browser)
   */
  private sendWebNotification(title: string, body: string, data: BookingNotificationData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: `booking_${data.bookingId}`,
      });
    }
  }

  /**
   * Parse date and time strings into a Date object
   */
  private parseDateTime(dateStr: string, timeStr: string): Date {
    // Handle ISO format dates (YYYY-MM-DD)
    const date = new Date(dateStr);
    
    // Parse time (HH:MM format)
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    
    return date;
  }

  /**
   * Format date for display
   */
  private formatDate(dateStr: string): string {
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
  }

  /**
   * Cancel all notifications for a specific booking
   */
  async cancelBookingNotifications(bookingId: string): Promise<void> {
    if (this.isWeb) {
      return;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.bookingId === bookingId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log('🗑️ Cancelled notifications for booking:', bookingId);
    } catch (error) {
      console.error('❌ Failed to cancel booking notifications:', error);
    }
  }

  /**
   * Check and notify about upcoming bookings (call this on app launch)
   */
  async checkUpcomingBookings(bookings: any[]): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingBookings = bookings.filter(booking => {
        if (booking.status !== 'upcoming') return false;
        
        const bookingDate = this.parseDateTime(booking.date, booking.time);
        return bookingDate > now && bookingDate <= next24Hours;
      });

      if (upcomingBookings.length > 0) {
        console.log(`📅 Found ${upcomingBookings.length} upcoming booking(s) in the next 24 hours`);
        
        // Send a summary notification
        const title = '📅 Upcoming Bookings';
        const body = upcomingBookings.length === 1
          ? `You have a charging session at ${upcomingBookings[0].stationName} today!`
          : `You have ${upcomingBookings.length} charging sessions scheduled for today.`;

        if (this.isWeb) {
          this.sendWebNotification(title, body, { 
            bookingId: upcomingBookings[0].id,
            stationName: upcomingBookings[0].stationName,
            date: upcomingBookings[0].date,
            time: upcomingBookings[0].time
          });
        } else {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: { type: 'upcoming_summary', count: upcomingBookings.length },
              sound: true,
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to check upcoming bookings:', error);
    }
  }
}

export const bookingNotificationService = new BookingNotificationService();
export default bookingNotificationService;

