/**
 * Range Anxiety Context
 * Provides route planning and range anxiety assistance across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import RangeAnxietyService, { RoutePlan, VehicleSpecs, RangeCalculation } from '../services/RangeAnxietyService';

interface RangeAnxietyContextType {
  vehicleSpecs: VehicleSpecs | null;
  currentRoute: RoutePlan | null;
  isLoading: boolean;
  error: string | null;
  planRoute: (startPoint: any, endPoint: any, currentBattery: number) => Promise<RoutePlan>;
  calculateCurrentRange: (batteryPercentage: number) => number;
  getRangeAnxietyLevel: (currentRange: number, requiredRange: number) => 'low' | 'medium' | 'high';
  getChargingTimeEstimate: (currentSoc: number, targetSoc: number, chargingSpeed: 'slow' | 'fast' | 'rapid') => number;
  getOptimalChargingStrategy: (currentSoc: number, targetSoc: number) => any;
  refreshVehicleSpecs: () => Promise<void>;
}

const RangeAnxietyContext = createContext<RangeAnxietyContextType | undefined>(undefined);

interface RangeAnxietyProviderProps {
  children: ReactNode;
  vehicleId?: string;
}

export const RangeAnxietyProvider: React.FC<RangeAnxietyProviderProps> = ({ 
  children, 
  vehicleId = 'default' 
}) => {
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecs | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RoutePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rangeService = RangeAnxietyService.getInstance();

  const refreshVehicleSpecs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const specs = await rangeService.initializeVehicleSpecs(vehicleId);
      setVehicleSpecs(specs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle specs');
    } finally {
      setIsLoading(false);
    }
  };

  const planRoute = async (startPoint: any, endPoint: any, currentBattery: number): Promise<RoutePlan> => {
    try {
      const route = await rangeService.planRoute(startPoint, endPoint, currentBattery);
      setCurrentRoute(route);
      return route;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to plan route');
      throw err;
    }
  };

  const calculateCurrentRange = (batteryPercentage: number): number => {
    return rangeService.calculateCurrentRange(batteryPercentage);
  };

  const getRangeAnxietyLevel = (currentRange: number, requiredRange: number): 'low' | 'medium' | 'high' => {
    return rangeService.getRangeAnxietyLevel(currentRange, requiredRange);
  };

  const getChargingTimeEstimate = (currentSoc: number, targetSoc: number, chargingSpeed: 'slow' | 'fast' | 'rapid'): number => {
    return rangeService.getChargingTimeEstimate(currentSoc, targetSoc, chargingSpeed);
  };

  const getOptimalChargingStrategy = (currentSoc: number, targetSoc: number) => {
    return rangeService.getOptimalChargingStrategy(currentSoc, targetSoc);
  };

  useEffect(() => {
    refreshVehicleSpecs();
  }, [vehicleId]);

  const value: RangeAnxietyContextType = {
    vehicleSpecs,
    currentRoute,
    isLoading,
    error,
    planRoute,
    calculateCurrentRange,
    getRangeAnxietyLevel,
    getChargingTimeEstimate,
    getOptimalChargingStrategy,
    refreshVehicleSpecs,
  };

  return (
    <RangeAnxietyContext.Provider value={value}>
      {children}
    </RangeAnxietyContext.Provider>
  );
};

export const useRangeAnxiety = (): RangeAnxietyContextType => {
  const context = useContext(RangeAnxietyContext);
  if (context === undefined) {
    throw new Error('useRangeAnxiety must be used within a RangeAnxietyProvider');
  }
  return context;
};
