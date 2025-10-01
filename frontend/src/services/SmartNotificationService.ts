/**
 * Smart Notification Service
 * Provides intelligent notifications for charging reminders and trip planning
 */

export interface NotificationRule {
  id: string;
  type: 'charging' | 'trip' | 'maintenance' | 'weather' | 'pricing';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conditions: NotificationCondition[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'between';
  value: any;
  unit?: string;
}

export interface SmartNotification {
  id: string;
  type: 'charging' | 'trip' | 'maintenance' | 'weather' | 'pricing';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  scheduledFor: string;
  isRead: boolean;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
}

export interface ChargingReminder {
  id: string;
  batteryThreshold: number;
  timeWindow: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  isActive: boolean;
}

export interface TripReminder {
  id: string;
  destination: string;
  departureTime: string;
  requiredBattery: number;
  reminderTime: number; // minutes before departure
  isActive: boolean;
}

export interface WeatherAlert {
  id: string;
  condition: 'rain' | 'snow' | 'extreme_heat' | 'extreme_cold';
  severity: 'low' | 'medium' | 'high';
  message: string;
  impact: string;
}

class SmartNotificationService {
  private static instance: SmartNotificationService;
  private notifications: SmartNotification[] = [];
  private chargingReminders: ChargingReminder[] = [];
  private tripReminders: TripReminder[] = [];
  private weatherAlerts: WeatherAlert[] = [];

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  /**
   * Initialize smart notification system
   */
  async initialize(): Promise<void> {
    try {
      // Load existing notifications and rules
      await this.loadNotificationRules();
      await this.loadChargingReminders();
      await this.loadTripReminders();
      
      // Start monitoring for conditions
      this.startMonitoring();
    } catch (error) {
      console.error('Failed to initialize smart notifications:', error);
      throw error;
    }
  }

  /**
   * Get all notifications
   */
  getNotifications(): SmartNotification[] {
    return this.notifications.sort((a, b) => 
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  /**
   * Create charging reminder
   */
  createChargingReminder(reminder: Omit<ChargingReminder, 'id'>): ChargingReminder {
    const newReminder: ChargingReminder = {
      id: `charging_reminder_${Date.now()}`,
      ...reminder,
    };

    this.chargingReminders.push(newReminder);
    return newReminder;
  }

  /**
   * Create trip reminder
   */
  createTripReminder(reminder: Omit<TripReminder, 'id'>): TripReminder {
    const newReminder: TripReminder = {
      id: `trip_reminder_${Date.now()}`,
      ...reminder,
    };

    this.tripReminders.push(newReminder);
    return newReminder;
  }

  /**
   * Check battery level and trigger charging reminders
   */
  checkBatteryLevel(currentBattery: number): void {
    const activeReminders = this.chargingReminders.filter(r => r.isActive);
    
    activeReminders.forEach(reminder => {
      if (currentBattery <= reminder.batteryThreshold) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.getDay();

        // Check if current time is within the reminder window
        if (currentTime >= reminder.timeWindow.start && 
            currentTime <= reminder.timeWindow.end &&
            reminder.daysOfWeek.includes(currentDay)) {
          
          this.createNotification({
            type: 'charging',
            title: 'Low Battery Alert',
            message: `Your battery is at ${currentBattery}%. Consider charging soon.`,
            priority: 'high',
            scheduledFor: new Date().toISOString(),
            actionRequired: true,
            actionText: 'Find Charging Station',
            actionUrl: '/stations',
          });
        }
      }
    });
  }

  /**
   * Check trip reminders
   */
  checkTripReminders(): void {
    const now = new Date();
    
    this.tripReminders.forEach(reminder => {
      if (reminder.isActive) {
        const departureTime = new Date(reminder.departureTime);
        const reminderTime = new Date(departureTime.getTime() - (reminder.reminderTime * 60000));
        
        if (now >= reminderTime && now <= departureTime) {
          this.createNotification({
            type: 'trip',
            title: 'Trip Reminder',
            message: `Your trip to ${reminder.destination} is coming up. Make sure you have enough charge.`,
            priority: 'medium',
            scheduledFor: new Date().toISOString(),
            actionRequired: true,
            actionText: 'Check Route',
            actionUrl: '/range-assistant',
          });
        }
      }
    });
  }

  /**
   * Check weather conditions and create alerts
   */
  checkWeatherConditions(weatherData: any): void {
    // Extreme temperature alerts
    if (weatherData.temperature > 35) {
      this.createNotification({
        type: 'weather',
        title: 'Extreme Heat Alert',
        message: 'High temperatures detected. Charging may be slower than usual.',
        priority: 'medium',
        scheduledFor: new Date().toISOString(),
        actionRequired: false,
      });
    }

    if (weatherData.temperature < -10) {
      this.createNotification({
        type: 'weather',
        title: 'Extreme Cold Alert',
        message: 'Low temperatures detected. Battery range may be reduced.',
        priority: 'medium',
        scheduledFor: new Date().toISOString(),
        actionRequired: false,
      });
    }

    // Rain/snow alerts
    if (weatherData.condition === 'rain' || weatherData.condition === 'snow') {
      this.createNotification({
        type: 'weather',
        title: 'Weather Alert',
        message: `${weatherData.condition} detected. Drive safely and consider charging stops.`,
        priority: 'low',
        scheduledFor: new Date().toISOString(),
        actionRequired: false,
      });
    }
  }

  /**
   * Check pricing alerts
   */
  checkPricingAlerts(currentPrice: number, averagePrice: number): void {
    const priceDifference = ((currentPrice - averagePrice) / averagePrice) * 100;
    
    if (priceDifference > 20) {
      this.createNotification({
        type: 'pricing',
        title: 'High Pricing Alert',
        message: `Charging rates are ${priceDifference.toFixed(0)}% higher than average. Consider waiting.`,
        priority: 'medium',
        scheduledFor: new Date().toISOString(),
        actionRequired: false,
      });
    } else if (priceDifference < -20) {
      this.createNotification({
        type: 'pricing',
        title: 'Low Pricing Alert',
        message: `Charging rates are ${Math.abs(priceDifference).toFixed(0)}% lower than average. Great time to charge!`,
        priority: 'low',
        scheduledFor: new Date().toISOString(),
        actionRequired: true,
        actionText: 'Find Station',
        actionUrl: '/stations',
      });
    }
  }

  /**
   * Create a new notification
   */
  private createNotification(notification: Omit<SmartNotification, 'id' | 'isRead'>): void {
    const newNotification: SmartNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
  }

  /**
   * Start monitoring for notification conditions
   */
  private startMonitoring(): void {
    // Check every minute
    setInterval(() => {
      this.checkTripReminders();
    }, 60000);
  }

  /**
   * Load notification rules (mock implementation)
   */
  private async loadNotificationRules(): Promise<void> {
    // In a real app, this would load from storage or API
    const defaultRules: NotificationRule[] = [
      {
        id: 'battery_low',
        type: 'charging',
        title: 'Low Battery',
        message: 'Battery level is below threshold',
        priority: 'high',
        conditions: [
          { field: 'battery', operator: 'less_than', value: 20, unit: '%' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'trip_reminder',
        type: 'trip',
        title: 'Trip Reminder',
        message: 'Upcoming trip requires charging',
        priority: 'medium',
        conditions: [
          { field: 'departure_time', operator: 'less_than', value: 60, unit: 'minutes' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Load charging reminders (mock implementation)
   */
  private async loadChargingReminders(): Promise<void> {
    // In a real app, this would load from storage or API
    this.chargingReminders = [
      {
        id: 'default_charging_reminder',
        batteryThreshold: 20,
        timeWindow: { start: '08:00', end: '22:00' },
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
        isActive: true,
      },
    ];
  }

  /**
   * Load trip reminders (mock implementation)
   */
  private async loadTripReminders(): Promise<void> {
    // In a real app, this would load from storage or API
    this.tripReminders = [];
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const stats = {
      total: this.notifications.length,
      unread: this.getUnreadCount(),
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    this.notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = [];
  }

  /**
   * Get charging reminders
   */
  getChargingReminders(): ChargingReminder[] {
    return this.chargingReminders;
  }

  /**
   * Get trip reminders
   */
  getTripReminders(): TripReminder[] {
    return this.tripReminders;
  }

  /**
   * Update charging reminder
   */
  updateChargingReminder(id: string, updates: Partial<ChargingReminder>): void {
    const index = this.chargingReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.chargingReminders[index] = { ...this.chargingReminders[index], ...updates };
    }
  }

  /**
   * Delete charging reminder
   */
  deleteChargingReminder(id: string): void {
    this.chargingReminders = this.chargingReminders.filter(r => r.id !== id);
  }

  /**
   * Update trip reminder
   */
  updateTripReminder(id: string, updates: Partial<TripReminder>): void {
    const index = this.tripReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.tripReminders[index] = { ...this.tripReminders[index], ...updates };
    }
  }

  /**
   * Delete trip reminder
   */
  deleteTripReminder(id: string): void {
    this.tripReminders = this.tripReminders.filter(r => r.id !== id);
  }
}

export default SmartNotificationService;
