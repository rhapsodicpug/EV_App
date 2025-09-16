import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/api';
import { PaymentMethod } from '../contexts/PaymentMethodContext';

// ==================== TYPES ====================
export interface StorageServiceInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  setUserData(key: string, value: any): Promise<void>;
  getUserData(key: string): Promise<any | null>;
  removeUserData(key: string): Promise<void>;
  saveVehicles(vehicles: Vehicle[]): Promise<void>;
  getVehicles(): Promise<Vehicle[]>;
  savePaymentMethods(paymentMethods: PaymentMethod[]): Promise<void>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  saveThemeMode(themeMode: string): Promise<void>; // Disabled - always dark mode
  getThemeMode(): Promise<string | null>; // Disabled - always dark mode
  isSecureStorageAvailable(): boolean;
  getStorageMethod(): string;
}

// ==================== STORAGE SERVICE ====================
class StorageService implements StorageServiceInterface {
  private secureStoreAvailable = false;
  private isWeb = Platform.OS === 'web';

  constructor() {
    // Check if secure store is available on initialization (only for mobile)
    if (!this.isWeb) {
      this.checkSecureStoreAvailability();
    }
  }

  private async checkSecureStoreAvailability(): Promise<void> {
    try {
      // Try to import expo-secure-store to check availability
      const SecureStoreModule = await import('expo-secure-store');
      this.secureStoreAvailable = !!SecureStoreModule.default;
    } catch (error) {
      console.log('🔒 Secure store not available, falling back to AsyncStorage');
      this.secureStoreAvailable = false;
    }
  }

  // Store a value securely
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb || !this.secureStoreAvailable) {
        // Use AsyncStorage for web or when secure store is unavailable
        await AsyncStorage.setItem(key, value);
        return;
      }

      // Use expo-secure-store for mobile when available
      try {
        const SecureStore = await this.getSecureStore();
        if (SecureStore) {
          await SecureStore.setItemAsync(key, value);
          return;
        }
      } catch (secureError) {
        console.log('🔒 Secure store failed, falling back to AsyncStorage:', secureError);
      }
      // Fallback to AsyncStorage
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('❌ Error storing value:', error);
      throw error;
    }
  }

  // Retrieve a value securely
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb || !this.secureStoreAvailable) {
        // Use AsyncStorage for web or when secure store is unavailable
        return await AsyncStorage.getItem(key);
      }

      // Use expo-secure-store for mobile when available
      try {
        const SecureStore = await this.getSecureStore();
        if (SecureStore) {
          const value = await SecureStore.getItemAsync(key);
          return value;
        }
      } catch (secureError) {
        console.log('🔒 Secure store failed, falling back to AsyncStorage:', secureError);
      }
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('❌ Error retrieving value:', error);
      return null;
    }
  }

  // Remove a value securely
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb || !this.secureStoreAvailable) {
        // Use AsyncStorage for web or when secure store is unavailable
        await AsyncStorage.removeItem(key);
        return;
      }

      // Use expo-secure-store for mobile when available
      try {
        const SecureStore = await this.getSecureStore();
        if (SecureStore) {
          await SecureStore.deleteItemAsync(key);
          return;
        }
      } catch (secureError) {
        console.log('🔒 Secure store failed, falling back to AsyncStorage:', secureError);
      }
      // Fallback to AsyncStorage
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Error removing value:', error);
      throw error;
    }
  }

  // Get secure store instance with error handling
  private async getSecureStore(): Promise<any | null> {
    if (this.isWeb || !this.secureStoreAvailable) {
      return null;
    }

    try {
      const SecureStoreModule = await import('expo-secure-store');
      return SecureStoreModule.default;
    } catch (error) {
      console.log('🔒 Failed to import secure store:', error);
      this.secureStoreAvailable = false;
      return null;
    }
  }

  // Store user data (always use AsyncStorage for complex data)
  async setUserData(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Error storing user data:', error);
      throw error;
    }
  }

  // Retrieve user data (always use AsyncStorage for complex data)
  async getUserData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error retrieving user data:', error);
      return null;
    }
  }

  // Remove user data
  async removeUserData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Error removing user data:', error);
      throw error;
    }
  }

  // Check if secure storage is available
  isSecureStorageAvailable(): boolean {
    return !this.isWeb && this.secureStoreAvailable;
  }

  // Get current storage method being used
  getStorageMethod(): string {
    if (this.isWeb) return 'AsyncStorage (Web)';
    if (this.secureStoreAvailable) return 'SecureStore (Mobile)';
    return 'AsyncStorage (Fallback)';
  }

  // Vehicle storage methods
  async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    try {
      const vehiclesJson = JSON.stringify(vehicles);
      await this.setItem('vehicles', vehiclesJson);
    } catch (error) {
      console.error('Failed to save vehicles:', error);
      throw error;
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const vehiclesJson = await this.getItem('vehicles');
      if (!vehiclesJson) {
        return [];
      }
      return JSON.parse(vehiclesJson);
    } catch (error) {
      console.error('Failed to get vehicles:', error);
      return [];
    }
  }

  // Payment method storage methods
  async savePaymentMethods(paymentMethods: PaymentMethod[]): Promise<void> {
    try {
      const paymentMethodsJson = JSON.stringify(paymentMethods);
      await this.setItem('paymentMethods', paymentMethodsJson);
    } catch (error) {
      console.error('Failed to save payment methods:', error);
      throw error;
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const paymentMethodsJson = await this.getItem('paymentMethods');
      if (!paymentMethodsJson) {
        return [];
      }
      return JSON.parse(paymentMethodsJson);
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return [];
    }
  }

  // Theme storage methods (disabled - always using dark mode)
  async saveThemeMode(themeMode: string): Promise<void> {
    // No-op since we're always using dark mode
    console.log('Theme switching disabled - always using dark mode');
  }

  async getThemeMode(): Promise<string | null> {
    // Always return dark mode
    return 'dark';
  }
}

export { StorageService };
export const storageService = new StorageService();
export default storageService;
