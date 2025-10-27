/**
 * Proactive Notifications Service
 * Sends smart alerts and recommendations to users
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationConfig {
  lowBatteryAlerts: boolean;
  chargingReminders: boolean;
  priceAlerts: boolean;
  bookingReminders: boolean;
  maintenanceAlerts: boolean;
  promotionalOffers: boolean;
}

export interface ProactiveAlert {
  id: string;
  type: 'low_battery' | 'charging_reminder' | 'price_alert' | 'booking_reminder' | 'maintenance';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  scheduledTime?: Date;
}

class ProactiveNotificationsService {
  private static instance: ProactiveNotificationsService;
  private config: NotificationConfig;
  private readonly STORAGE_KEY = 'EV_APP_NOTIFICATION_CONFIG';

  static getInstance(): ProactiveNotificationsService {
    if (!ProactiveNotificationsService.instance) {
      ProactiveNotificationsService.instance = new ProactiveNotificationsService();
    }
    return ProactiveNotificationsService.instance;
  }

  constructor() {
    this.config = {
      lowBatteryAlerts: true,
      chargingReminders: true,
      priceAlerts: true,
      bookingReminders: true,
      maintenanceAlerts: true,
      promotionalOffers: true,
    };
  }

  /**
   * Initialize notifications
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permission denied');
        }
      }

      // Load config
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }

      // Setup notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Send low battery alert
   */
  async sendLowBatteryAlert(batteryLevel: number, nearestStation?: string): Promise<void> {
    if (!this.config.lowBatteryAlerts) return;

    const priority = batteryLevel < 15 ? 'critical' : 
                    batteryLevel < 25 ? 'high' : 'medium';

    await this.sendNotification({
      id: `low_battery_${Date.now()}`,
      type: 'low_battery',
      title: batteryLevel < 15 ? '🚨 Critical Battery Alert' : '⚠️ Low Battery',
      message: batteryLevel < 15 
        ? `Your battery is at ${batteryLevel}%! Find charging immediately.`
        : `Your battery is getting low (${batteryLevel}%). Consider charging soon.${nearestStation ? ` Nearest: ${nearestStation}` : ''}`,
      priority,
    });
  }

  /**
   * Send charging reminder
   */
  async sendChargingReminder(batteryLevel: number, preferredTime: string): Promise<void> {
    if (!this.config.chargingReminders) return;

    await this.sendNotification({
      id: `charging_reminder_${Date.now()}`,
      type: 'charging_reminder',
      title: '💡 Charging Reminder',
      message: `Your usual charging time (${preferredTime}) is coming up. Battery: ${batteryLevel}%`,
      priority: 'medium',
    });
  }

  /**
   * Send price alert
   */
  async sendPriceAlert(stationName: string, oldPrice: number, newPrice: number, discount: number): Promise<void> {
    if (!this.config.priceAlerts) return;

    await this.sendNotification({
      id: `price_alert_${Date.now()}`,
      type: 'price_alert',
      title: '💰 Great Deal Alert!',
      message: `${stationName}: Now ₹${newPrice}/kWh (was ₹${oldPrice}). Save ₹${discount}!`,
      priority: 'high',
    });
  }

  /**
   * Send booking reminder
   */
  async sendBookingReminder(booking: { station: string; time: string }): Promise<void> {
    if (!this.config.bookingReminders) return;

    await this.sendNotification({
      id: `booking_reminder_${Date.now()}`,
      type: 'booking_reminder',
      title: '📅 Upcoming Booking',
      message: `Your booking at ${booking.station} is at ${booking.time}. Arrive on time!`,
      priority: 'high',
      actionUrl: 'bookings://details',
    });
  }

  /**
   * Send maintenance alert
   */
  async sendMaintenanceAlert(maintenance: { type: string; description: string; dueDate: string }): Promise<void> {
    if (!this.config.maintenanceAlerts) return;

    await this.sendNotification({
      id: `maintenance_${Date.now()}`,
      type: 'maintenance',
      title: '🔧 Maintenance Due',
      message: `${maintenance.type}: ${maintenance.description}. Due: ${maintenance.dueDate}`,
      priority: 'medium',
    });
  }

  /**
   * Send promotional offer
   */
  async sendPromotionalOffer(offer: { title: string; description: string; discount: number; expiry: string }): Promise<void> {
    if (!this.config.promotionalOffers) return;

    await this.sendNotification({
      id: `promo_${Date.now()}`,
      type: 'low_battery', // Reuse type for general notifications
      title: `🎉 ${offer.title}`,
      message: `${offer.description} Save ₹${offer.discount}! Valid until ${offer.expiry}`,
      priority: 'medium',
    });
  }

  /**
   * Send notification
   */
  private async sendNotification(alert: ProactiveAlert): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.message,
          sound: alert.priority === 'critical',
          priority: alert.priority === 'critical' ? 'max' : 
                   alert.priority === 'high' ? 'high' : 'default',
        },
        trigger: alert.scheduledTime || null,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Update notification config
   */
  async updateConfig(config: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.save();
  }

  /**
   * Get current config
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable specific notification type
   */
  async toggleNotification(type: keyof NotificationConfig, enabled: boolean): Promise<void> {
    this.config[type] = enabled;
    await this.save();
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving notification config:', error);
    }
  }
}

export default ProactiveNotificationsService;

