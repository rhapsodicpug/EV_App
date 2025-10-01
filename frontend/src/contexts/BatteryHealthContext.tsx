/**
 * Battery Health Context
 * Provides battery health monitoring and insights across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import BatteryHealthService, { BatteryHealthData, BatteryInsight } from '../services/BatteryHealthService';

interface BatteryHealthContextType {
  healthData: BatteryHealthData | null;
  insights: BatteryInsight[];
  isLoading: boolean;
  error: string | null;
  refreshHealthData: () => Promise<void>;
  getChargingRecommendations: () => string[];
  predictHealth: (monthsAhead: number) => number;
  getHealthTrends: () => { date: string; health: number }[];
}

const BatteryHealthContext = createContext<BatteryHealthContextType | undefined>(undefined);

interface BatteryHealthProviderProps {
  children: ReactNode;
  vehicleId?: string;
}

export const BatteryHealthProvider: React.FC<BatteryHealthProviderProps> = ({ 
  children, 
  vehicleId = 'default' 
}) => {
  const [healthData, setHealthData] = useState<BatteryHealthData | null>(null);
  const [insights, setInsights] = useState<BatteryInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const batteryService = BatteryHealthService.getInstance();

  const refreshHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await batteryService.initializeBatteryHealth(vehicleId);
      const healthInsights = batteryService.getBatteryInsights();
      
      setHealthData(data);
      setInsights(healthInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load battery health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getChargingRecommendations = (): string[] => {
    return batteryService.getChargingRecommendations();
  };

  const predictHealth = (monthsAhead: number): number => {
    return batteryService.predictBatteryHealth(monthsAhead);
  };

  const getHealthTrends = () => {
    return batteryService.getHealthTrends();
  };

  useEffect(() => {
    refreshHealthData();
  }, [vehicleId]);

  const value: BatteryHealthContextType = {
    healthData,
    insights,
    isLoading,
    error,
    refreshHealthData,
    getChargingRecommendations,
    predictHealth,
    getHealthTrends,
  };

  return (
    <BatteryHealthContext.Provider value={value}>
      {children}
    </BatteryHealthContext.Provider>
  );
};

export const useBatteryHealth = (): BatteryHealthContextType => {
  const context = useContext(BatteryHealthContext);
  if (context === undefined) {
    throw new Error('useBatteryHealth must be used within a BatteryHealthProvider');
  }
  return context;
};
