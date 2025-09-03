import { Platform, Share, Alert } from 'react-native';
import { storageService } from './StorageService';

// ==================== TYPES ====================

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'booking' | 'reminder' | 'status' | 'promotion' | 'system';
  priority?: 'default' | 'high' | 'low';
  scheduled?: boolean;
  scheduledTime?: Date;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  localEnabled: boolean;
  bookingReminders: boolean;
  statusUpdates: boolean;
  promotions: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

// ==================== NOTIFICATION SERVICE ====================

class NotificationService {
  private isWeb = Platform.OS === 'web';
  private defaultPreferences: NotificationPreferences = {
    pushEnabled: true,
    localEnabled: true,
    bookingReminders: true,
    statusUpdates: true,
    promotions: false,
    systemNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  };

  // ==================== INITIALIZATION ====================

  async initialize(): Promise<void> {
    if (this.isWeb) {
      console.log('🌐 Web platform: Using browser notifications');
      return;
    }

    try {
      // Dynamically import expo-notifications
      const Notifications = await this.getNotificationsModule();
      if (!Notifications) {
        console.log('📱 Notifications module not available');
        return;
      }

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      await this.requestPermissions();
      
      // Get push token
      await this.getPushToken();
      
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  // ==================== PERMISSIONS ====================

  async requestPermissions(): Promise<boolean> {
    if (this.isWeb) {
      // Request browser notification permission
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        } catch (error) {
          console.log('🌐 Browser notification permission failed:', error);
          return false;
        }
      }
      return false;
    }

    try {
      const Notifications = await this.getNotificationsModule();
      if (!Notifications) {
        console.log('📱 Notifications module not available');
        return false;
      }

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

      console.log('✅ Notification permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  // ==================== PUSH TOKENS ====================

  async getPushToken(): Promise<string | null> {
    if (this.isWeb) {
      return null; // Web doesn't have push tokens
    }

    try {
      const Notifications = await this.getNotificationsModule();
      const Device = await this.getDeviceModule();
      
      if (!Notifications || !Device) {
        console.log('📱 Required modules not available');
        return null;
      }

      if (!Device.isDevice) {
        console.log('📱 Not a physical device, skipping push token');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your project ID
      });

      // Store token for backend sync
      await storageService.setItem('push_token', token.data);
      console.log('📱 Push token obtained:', token.data);
      
      return token.data;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // ==================== SEND NOTIFICATIONS ====================

  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      // Check if notifications are enabled
      const preferences = await this.getPreferences();
      if (!preferences.localEnabled) {
        console.log('🔕 Local notifications disabled');
        return;
      }

      // Check quiet hours
      if (preferences.quietHours.enabled && await this.isInQuietHours()) {
        console.log('🌙 In quiet hours, notification delayed');
        return;
      }

      if (this.isWeb) {
        // Use browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.png', // Add your app icon
            badge: '/icon-192x192.png',
            tag: notification.id,
            data: notification.data,
          });
        }
      } else {
        // Use Expo notifications
        const Notifications = await this.getNotificationsModule();
        if (!Notifications) {
          console.log('📱 Notifications module not available');
          return;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
            sound: true,
            priority: notification.priority || 'default',
          },
          trigger: notification.scheduled && notification.scheduledTime
            ? { date: notification.scheduledTime }
            : null,
        });
      }

      console.log('✅ Local notification sent:', notification.title);
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  async sendPushNotification(notification: NotificationData, pushToken: string): Promise<void> {
    if (this.isWeb) {
      console.log('🌐 Web platform: Push notifications not supported');
      return;
    }

    try {
      // In a real app, you would send this to your backend
      // which would then send it to Expo's push service
      console.log('📱 Push notification would be sent to:', pushToken);
      console.log('📱 Notification content:', notification);
      
      // For demo purposes, we'll just send a local notification
      await this.sendLocalNotification(notification);
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  // ==================== SCHEDULED NOTIFICATIONS ====================

  async scheduleNotification(notification: NotificationData, scheduledTime: Date): Promise<void> {
    if (this.isWeb) {
      console.log('🌐 Web platform: Scheduled notifications not supported');
      return;
    }

    try {
      const Notifications = await this.getNotificationsModule();
      if (!Notifications) {
        console.log('📱 Notifications module not available');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: true,
          priority: notification.priority || 'default',
        },
        trigger: { date: scheduledTime },
      });

      console.log('⏰ Notification scheduled for:', scheduledTime);
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
    }
  }

  async cancelScheduledNotification(notificationId: string): Promise<void> {
    if (this.isWeb) {
      return;
    }

    try {
      const Notifications = await this.getNotificationsModule();
      if (!Notifications) {
        console.log('📱 Notifications module not available');
        return;
      }

      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Error cancelling scheduled notification:', error);
    }
  }

  // ==================== BOOKING NOTIFICATIONS ====================

  async sendBookingReminder(bookingId: string, stationName: string, reminderTime: Date): Promise<void> {
    const notification: NotificationData = {
      id: `booking_reminder_${bookingId}`,
      title: '🔋 Charging Reminder',
      body: `Your charging session at ${stationName} starts in 30 minutes`,
      type: 'reminder',
      priority: 'high',
      data: { bookingId, stationName },
    };

    await this.scheduleNotification(notification, reminderTime);
  }

  async sendBookingStatusUpdate(bookingId: string, status: string, stationName: string): Promise<void> {
    const notification: NotificationData = {
      id: `booking_status_${bookingId}`,
      title: '📱 Booking Update',
      body: `Your booking at ${stationName} is now ${status}`,
      type: 'status',
      data: { bookingId, status, stationName },
    };

    await this.sendLocalNotification(notification);
  }

  async sendChargingComplete(bookingId: string, stationName: string): Promise<void> {
    const notification: NotificationData = {
      id: `charging_complete_${bookingId}`,
      title: '✅ Charging Complete',
      body: `Your charging session at ${stationName} has finished`,
      type: 'status',
      priority: 'high',
      data: { bookingId, stationName },
    };

    await this.sendLocalNotification(notification);
  }

  // ==================== PREFERENCES MANAGEMENT ====================

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await storageService.getItem('notification_preferences');
      return stored ? JSON.parse(stored) : this.defaultPreferences;
    } catch (error) {
      console.error('❌ Error getting notification preferences:', error);
      return this.defaultPreferences;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await storageService.setItem('notification_preferences', JSON.stringify(updated));
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
    }
  }

  async resetPreferences(): Promise<void> {
    try {
      await storageService.setItem('notification_preferences', JSON.stringify(this.defaultPreferences));
      console.log('✅ Notification preferences reset to default');
    } catch (error) {
      console.error('❌ Error resetting notification preferences:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  private async isInQuietHours(): Promise<boolean> {
    const preferences = await this.getPreferences();
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Same day (e.g., 08:00 to 22:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // ==================== MODULE HELPERS ====================

  private async getNotificationsModule(): Promise<any | null> {
    if (this.isWeb) return null;
    
    try {
      const module = await import('expo-notifications');
      return module.default || module;
    } catch (error) {
      console.log('📱 Failed to import expo-notifications:', error);
      return null;
    }
  }

  private async getDeviceModule(): Promise<any | null> {
    if (this.isWeb) return null;
    
    try {
      const module = await import('expo-device');
      return module.default || module;
    } catch (error) {
      console.log('📱 Failed to import expo-device:', error);
      return null;
    }
  }

  // ==================== CLEANUP ====================

  async cleanup(): Promise<void> {
    if (this.isWeb) return;

    try {
      const Notifications = await this.getNotificationsModule();
      if (!Notifications) return;

      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🧹 All notifications cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
