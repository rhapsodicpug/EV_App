import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storageService } from '../services/StorageService';

// ==================== TYPES ====================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  name: string;
  details: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
}

type PaymentMethodAction =
  | { type: 'PAYMENT_METHODS_LOADING' }
  | { type: 'PAYMENT_METHODS_LOADED'; payload: PaymentMethod[] }
  | { type: 'PAYMENT_METHOD_ADDED'; payload: PaymentMethod }
  | { type: 'PAYMENT_METHOD_UPDATED'; payload: PaymentMethod }
  | { type: 'PAYMENT_METHOD_DELETED'; payload: string }
  | { type: 'PAYMENT_METHODS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface PaymentMethodContextType extends PaymentMethodState {
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePaymentMethod: (id: string, paymentMethod: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  clearError: () => void;
}

// ==================== REDUCER ====================

const paymentMethodReducer = (state: PaymentMethodState, action: PaymentMethodAction): PaymentMethodState => {
  switch (action.type) {
    case 'PAYMENT_METHODS_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'PAYMENT_METHODS_LOADED':
      return {
        ...state,
        paymentMethods: action.payload,
        isLoading: false,
        error: null,
      };
    case 'PAYMENT_METHOD_ADDED':
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.payload],
        isLoading: false,
        error: null,
      };
    case 'PAYMENT_METHOD_UPDATED':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(paymentMethod =>
          paymentMethod.id === action.payload.id ? action.payload : paymentMethod
        ),
        isLoading: false,
        error: null,
      };
    case 'PAYMENT_METHOD_DELETED':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(paymentMethod => paymentMethod.id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'PAYMENT_METHODS_ERROR':
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

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const PaymentMethodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentMethodReducer, {
    paymentMethods: [],
    isLoading: false,
    error: null,
  });

  // Load payment methods from storage on mount
  useEffect(() => {
    getPaymentMethods();
  }, []);

  const getPaymentMethods = async () => {
    try {
      dispatch({ type: 'PAYMENT_METHODS_LOADING' });
      const paymentMethods = await storageService.getPaymentMethods();
      dispatch({ type: 'PAYMENT_METHODS_LOADED', payload: paymentMethods });
    } catch (error) {
      dispatch({ type: 'PAYMENT_METHODS_ERROR', payload: 'Failed to load payment methods' });
    }
  };

  const addPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'PAYMENT_METHODS_LOADING' });
      
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethodData,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to storage
      const updatedPaymentMethods = [...state.paymentMethods, newPaymentMethod];
      await storageService.savePaymentMethods(updatedPaymentMethods);
      
      dispatch({ type: 'PAYMENT_METHOD_ADDED', payload: newPaymentMethod });
    } catch (error) {
      dispatch({ type: 'PAYMENT_METHODS_ERROR', payload: 'Failed to add payment method' });
      throw error;
    }
  };

  const updatePaymentMethod = async (id: string, paymentMethodData: Partial<PaymentMethod>) => {
    try {
      dispatch({ type: 'PAYMENT_METHODS_LOADING' });
      
      const updatedPaymentMethod = {
        ...state.paymentMethods.find(pm => pm.id === id),
        ...paymentMethodData,
        id,
        updatedAt: new Date().toISOString(),
      } as PaymentMethod;

      // Save to storage
      const updatedPaymentMethods = state.paymentMethods.map(paymentMethod =>
        paymentMethod.id === id ? updatedPaymentMethod : paymentMethod
      );
      await storageService.savePaymentMethods(updatedPaymentMethods);
      
      dispatch({ type: 'PAYMENT_METHOD_UPDATED', payload: updatedPaymentMethod });
    } catch (error) {
      dispatch({ type: 'PAYMENT_METHODS_ERROR', payload: 'Failed to update payment method' });
      throw error;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      dispatch({ type: 'PAYMENT_METHODS_LOADING' });
      
      // Save to storage
      const updatedPaymentMethods = state.paymentMethods.filter(paymentMethod => paymentMethod.id !== id);
      await storageService.savePaymentMethods(updatedPaymentMethods);
      
      dispatch({ type: 'PAYMENT_METHOD_DELETED', payload: id });
    } catch (error) {
      dispatch({ type: 'PAYMENT_METHODS_ERROR', payload: 'Failed to delete payment method' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: PaymentMethodContextType = {
    ...state,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethods,
    clearError,
  };

  return (
    <PaymentMethodContext.Provider value={value}>
      {children}
    </PaymentMethodContext.Provider>
  );
};

// ==================== HOOK ====================

export const usePaymentMethods = (): PaymentMethodContextType => {
  const context = useContext(PaymentMethodContext);
  if (context === undefined) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodProvider');
  }
  return context;
};
