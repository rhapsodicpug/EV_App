/**
 * Predictive Maintenance Context
 * Provides maintenance monitoring and predictions across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PredictiveMaintenanceService, { 
  MaintenanceAlert, 
  VehicleHealth, 
  MaintenanceItem,
  UsagePattern,
  MaintenancePrediction
} from '../services/PredictiveMaintenanceService';

interface PredictiveMaintenanceContextType {
  alerts: MaintenanceAlert[];
  vehicleHealth: VehicleHealth | null;
  maintenanceItems: MaintenanceItem[];
  usagePattern: UsagePattern | null;
  predictions: MaintenancePrediction[];
  isLoading: boolean;
  error: string | null;
  markAlertAsRead: (alertId: string) => void;
  getMaintenanceStats: () => any;
  updateMaintenanceItem: (itemId: string, updates: Partial<MaintenanceItem>) => void;
  addMaintenanceItem: (item: Omit<MaintenanceItem, 'id'>) => MaintenanceItem;
  deleteMaintenanceItem: (itemId: string) => void;
  refreshData: () => Promise<void>;
}

const PredictiveMaintenanceContext = createContext<PredictiveMaintenanceContextType | undefined>(undefined);

interface PredictiveMaintenanceProviderProps {
  children: ReactNode;
  vehicleId?: string;
}

export const PredictiveMaintenanceProvider: React.FC<PredictiveMaintenanceProviderProps> = ({ 
  children, 
  vehicleId = 'default' 
}) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [vehicleHealth, setVehicleHealth] = useState<VehicleHealth | null>(null);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [usagePattern, setUsagePattern] = useState<UsagePattern | null>(null);
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maintenanceService = PredictiveMaintenanceService.getInstance();

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await maintenanceService.initialize(vehicleId);
      
      const alertsData = maintenanceService.getMaintenanceAlerts();
      const healthData = maintenanceService.getVehicleHealth();
      const itemsData = maintenanceService.getMaintenanceItems();
      const patternData = maintenanceService.getUsagePattern();
      const predictionsData = maintenanceService.getMaintenancePredictions();
      
      setAlerts(alertsData);
      setVehicleHealth(healthData);
      setMaintenanceItems(itemsData);
      setUsagePattern(patternData);
      setPredictions(predictionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance data');
    } finally {
      setIsLoading(false);
    }
  };

  const markAlertAsRead = (alertId: string) => {
    maintenanceService.markAlertAsRead(alertId);
    refreshData();
  };

  const getMaintenanceStats = () => {
    return maintenanceService.getMaintenanceStats();
  };

  const updateMaintenanceItem = (itemId: string, updates: Partial<MaintenanceItem>) => {
    maintenanceService.updateMaintenanceItem(itemId, updates);
    refreshData();
  };

  const addMaintenanceItem = (item: Omit<MaintenanceItem, 'id'>): MaintenanceItem => {
    const newItem = maintenanceService.addMaintenanceItem(item);
    refreshData();
    return newItem;
  };

  const deleteMaintenanceItem = (itemId: string) => {
    maintenanceService.deleteMaintenanceItem(itemId);
    refreshData();
  };

  useEffect(() => {
    refreshData();
  }, [vehicleId]);

  const value: PredictiveMaintenanceContextType = {
    alerts,
    vehicleHealth,
    maintenanceItems,
    usagePattern,
    predictions,
    isLoading,
    error,
    markAlertAsRead,
    getMaintenanceStats,
    updateMaintenanceItem,
    addMaintenanceItem,
    deleteMaintenanceItem,
    refreshData,
  };

  return (
    <PredictiveMaintenanceContext.Provider value={value}>
      {children}
    </PredictiveMaintenanceContext.Provider>
  );
};

export const usePredictiveMaintenance = (): PredictiveMaintenanceContextType => {
  const context = useContext(PredictiveMaintenanceContext);
  if (context === undefined) {
    throw new Error('usePredictiveMaintenance must be used within a PredictiveMaintenanceProvider');
  }
  return context;
};
