/**
 * Smart Notification Context
 * Provides intelligent notifications across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SmartNotificationService, { 
  SmartNotification, 
  ChargingReminder, 
  TripReminder 
} from '../services/SmartNotificationService';

interface SmartNotificationContextType {
  notifications: SmartNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationStats: () => any;
  checkBatteryLevel: (battery: number) => void;
  checkWeatherConditions: (weatherData: any) => void;
  checkPricingAlerts: (currentPrice: number, averagePrice: number) => void;
  createChargingReminder: (reminder: Omit<ChargingReminder, 'id'>) => ChargingReminder;
  createTripReminder: (reminder: Omit<TripReminder, 'id'>) => TripReminder;
  getChargingReminders: () => ChargingReminder[];
  getTripReminders: () => TripReminder[];
  updateChargingReminder: (id: string, updates: Partial<ChargingReminder>) => void;
  deleteChargingReminder: (id: string) => void;
  updateTripReminder: (id: string, updates: Partial<TripReminder>) => void;
  deleteTripReminder: (id: string) => void;
  refreshNotifications: () => void;
}

const SmartNotificationContext = createContext<SmartNotificationContextType | undefined>(undefined);

interface SmartNotificationProviderProps {
  children: ReactNode;
}

export const SmartNotificationProvider: React.FC<SmartNotificationProviderProps> = ({ 
  children 
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificationService = SmartNotificationService.getInstance();

  const refreshNotifications = () => {
    try {
      const allNotifications = notificationService.getNotifications();
      const unread = notificationService.getUnreadCount();
      
      setNotifications(allNotifications);
      setUnreadCount(unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  };

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    refreshNotifications();
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    refreshNotifications();
  };

  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
    refreshNotifications();
  };

  const getNotificationStats = () => {
    return notificationService.getNotificationStats();
  };

  const checkBatteryLevel = (battery: number) => {
    notificationService.checkBatteryLevel(battery);
    refreshNotifications();
  };

  const checkWeatherConditions = (weatherData: any) => {
    notificationService.checkWeatherConditions(weatherData);
    refreshNotifications();
  };

  const checkPricingAlerts = (currentPrice: number, averagePrice: number) => {
    notificationService.checkPricingAlerts(currentPrice, averagePrice);
    refreshNotifications();
  };

  const createChargingReminder = (reminder: Omit<ChargingReminder, 'id'>): ChargingReminder => {
    const newReminder = notificationService.createChargingReminder(reminder);
    refreshNotifications();
    return newReminder;
  };

  const createTripReminder = (reminder: Omit<TripReminder, 'id'>): TripReminder => {
    const newReminder = notificationService.createTripReminder(reminder);
    refreshNotifications();
    return newReminder;
  };

  const getChargingReminders = (): ChargingReminder[] => {
    return notificationService.getChargingReminders();
  };

  const getTripReminders = (): TripReminder[] => {
    return notificationService.getTripReminders();
  };

  const updateChargingReminder = (id: string, updates: Partial<ChargingReminder>) => {
    notificationService.updateChargingReminder(id, updates);
    refreshNotifications();
  };

  const deleteChargingReminder = (id: string) => {
    notificationService.deleteChargingReminder(id);
    refreshNotifications();
  };

  const updateTripReminder = (id: string, updates: Partial<TripReminder>) => {
    notificationService.updateTripReminder(id, updates);
    refreshNotifications();
  };

  const deleteTripReminder = (id: string) => {
    notificationService.deleteTripReminder(id);
    refreshNotifications();
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await notificationService.initialize();
        refreshNotifications();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, []);

  const value: SmartNotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationStats,
    checkBatteryLevel,
    checkWeatherConditions,
    checkPricingAlerts,
    createChargingReminder,
    createTripReminder,
    getChargingReminders,
    getTripReminders,
    updateChargingReminder,
    deleteChargingReminder,
    updateTripReminder,
    deleteTripReminder,
    refreshNotifications,
  };

  return (
    <SmartNotificationContext.Provider value={value}>
      {children}
    </SmartNotificationContext.Provider>
  );
};

export const useSmartNotifications = (): SmartNotificationContextType => {
  const context = useContext(SmartNotificationContext);
  if (context === undefined) {
    throw new Error('useSmartNotifications must be used within a SmartNotificationProvider');
  }
  return context;
};
