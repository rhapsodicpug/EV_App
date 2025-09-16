import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Vehicle } from '../types/api';
import { storageService } from '../services/StorageService';

// ==================== TYPES ====================

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
}

type VehicleAction =
  | { type: 'VEHICLES_LOADING' }
  | { type: 'VEHICLES_LOADED'; payload: Vehicle[] }
  | { type: 'VEHICLE_ADDED'; payload: Vehicle }
  | { type: 'VEHICLE_UPDATED'; payload: Vehicle }
  | { type: 'VEHICLE_DELETED'; payload: string }
  | { type: 'VEHICLES_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface VehicleContextType extends VehicleState {
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicles: () => Promise<void>;
  clearError: () => void;
}

// ==================== REDUCER ====================

const vehicleReducer = (state: VehicleState, action: VehicleAction): VehicleState => {
  switch (action.type) {
    case 'VEHICLES_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'VEHICLES_LOADED':
      return {
        ...state,
        vehicles: action.payload,
        isLoading: false,
        error: null,
      };
    case 'VEHICLE_ADDED':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload],
        isLoading: false,
        error: null,
      };
    case 'VEHICLE_UPDATED':
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        ),
        isLoading: false,
        error: null,
      };
    case 'VEHICLE_DELETED':
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'VEHICLES_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// ==================== CONTEXT ====================

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(vehicleReducer, {
    vehicles: [],
    isLoading: false,
    error: null,
  });

  // Load vehicles from storage on mount
  useEffect(() => {
    getVehicles();
  }, []);

  const getVehicles = async () => {
    try {
      dispatch({ type: 'VEHICLES_LOADING' });
      const vehicles = await storageService.getVehicles();
      dispatch({ type: 'VEHICLES_LOADED', payload: vehicles });
    } catch (error) {
      dispatch({ type: 'VEHICLES_ERROR', payload: 'Failed to load vehicles' });
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'VEHICLES_LOADING' });
      
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to storage
      const updatedVehicles = [...state.vehicles, newVehicle];
      await storageService.saveVehicles(updatedVehicles);
      
      dispatch({ type: 'VEHICLE_ADDED', payload: newVehicle });
    } catch (error) {
      dispatch({ type: 'VEHICLES_ERROR', payload: 'Failed to add vehicle' });
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    try {
      dispatch({ type: 'VEHICLES_LOADING' });
      
      const updatedVehicle = {
        ...state.vehicles.find(v => v.id === id),
        ...vehicleData,
        id,
        updatedAt: new Date().toISOString(),
      } as Vehicle;

      // Save to storage
      const updatedVehicles = state.vehicles.map(vehicle =>
        vehicle.id === id ? updatedVehicle : vehicle
      );
      await storageService.saveVehicles(updatedVehicles);
      
      dispatch({ type: 'VEHICLE_UPDATED', payload: updatedVehicle });
    } catch (error) {
      dispatch({ type: 'VEHICLES_ERROR', payload: 'Failed to update vehicle' });
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      dispatch({ type: 'VEHICLES_LOADING' });
      
      // Save to storage
      const updatedVehicles = state.vehicles.filter(vehicle => vehicle.id !== id);
      await storageService.saveVehicles(updatedVehicles);
      
      dispatch({ type: 'VEHICLE_DELETED', payload: id });
    } catch (error) {
      dispatch({ type: 'VEHICLES_ERROR', payload: 'Failed to delete vehicle' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: VehicleContextType = {
    ...state,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicles,
    clearError,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

// ==================== HOOK ====================

export const useVehicles = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
