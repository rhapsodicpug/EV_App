/**
 * Enhanced API Service Layer
 * Handles all HTTP requests to the backend with error handling, caching, and retry mechanisms
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import {
  AuthToken,
  User,
  UserLogin,
  UserRegistration,
  EVStation,
  StationSearchParams,
  NearbyStationsResponse,
  SearchStationsResponse,
  Booking,
  BookingCreate,
  BookingUpdate,
  ApiResponse,
} from '../types/api';
import NetworkErrorHandler, { RetryMechanism, OfflineQueueManager } from './NetworkErrorHandler';
import CacheService, { cacheService } from './CacheService';

class EnhancedApiService {
  private client: AxiosInstance;
  private errorHandler: NetworkErrorHandler;
  private retryMechanism: RetryMechanism;
  private offlineQueue: OfflineQueueManager;
  private cacheService: CacheService;

  constructor() {
    // Debug logging
    if (__DEV__) {
      console.log('🔧 Enhanced API Service Initializing...');
      console.log('🔧 Base URL:', API_CONFIG.BASE_URL);
      console.log('🔧 Auth Endpoints:', API_CONFIG.ENDPOINTS.AUTH);
      console.log('🔧 Station Endpoints:', API_CONFIG.ENDPOINTS.STATIONS);
    }

    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.errorHandler = NetworkErrorHandler.getInstance();
    this.retryMechanism = new RetryMechanism(3, 1000);
    this.offlineQueue = OfflineQueueManager.getInstance();
    this.cacheService = cacheService;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        if (__DEV__) {
          console.error(`❌ API Error: ${error.response?.status} ${error.config?.url || 'unknown URL'}`, error.response?.data);
        }

        // Handle 401 - Unauthorized (token expired)
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
          // Navigate to login screen - this would be handled by navigation service
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH METHODS ====================

  async register(data: UserRegistration): Promise<User> {
    return this.retryMechanism.execute(async () => {
      // Debug logging
      if (__DEV__) {
        console.log('🔧 Register attempt with endpoint:', API_CONFIG.ENDPOINTS.AUTH.REGISTER);
        console.log('🔧 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`);
      }

      const response = await this.client.post<User>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    });
  }

  async login(credentials: UserLogin): Promise<AuthToken> {
    return this.retryMechanism.execute(async () => {
      // Debug logging
      if (__DEV__) {
        console.log('🔧 Login attempt with endpoint:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
        console.log('🔧 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
      }

      // Backend expects JSON data for login
      const response = await this.client.post<AuthToken>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );
      
      // Store token
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token);
      
      return response.data;
    });
  }

  async getProfile(): Promise<User> {
    // Check cache first
    const cachedProfile = await this.cacheService.get<User>(CacheService.getKeys().USER_PROFILE);
    if (cachedProfile) {
      return cachedProfile;
    }

    return this.retryMechanism.execute(async () => {
      const response = await this.client.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      // Cache the profile
      await this.cacheService.set(CacheService.getKeys().USER_PROFILE, response.data, 5 * 60 * 1000); // 5 minutes
      
      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      
      return response.data;
    });
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    await this.cacheService.clear(); // Clear cache on logout
  }

  // ==================== STATION METHODS ====================

  async getStations(skip = 0, limit = 100): Promise<{ stations: EVStation[]; count: number }> {
    // Check cache first
    const cacheKey = `stations_${skip}_${limit}`;
    const cachedStations = await this.cacheService.get<{ stations: EVStation[]; count: number }>(cacheKey);
    if (cachedStations) {
      return cachedStations;
    }

    return this.retryMechanism.execute(async () => {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.STATIONS.LIST, {
        params: { skip, limit },
      });
      
      // Cache the stations
      await this.cacheService.set(cacheKey, response.data, 10 * 60 * 1000); // 10 minutes
      
      return response.data;
    });
  }

  async getStation(stationId: string): Promise<EVStation> {
    // Check cache first
    const cacheKey = CacheService.getKeys().STATION_DETAIL(stationId);
    const cachedStation = await this.cacheService.get<EVStation>(cacheKey);
    if (cachedStation) {
      return cachedStation;
    }

    return this.retryMechanism.execute(async () => {
      const response = await this.client.get<EVStation>(`${API_CONFIG.ENDPOINTS.STATIONS.DETAIL}/${stationId}`);
      
      // Cache the station
      await this.cacheService.set(cacheKey, response.data, 15 * 60 * 1000); // 15 minutes
      
      return response.data;
    });
  }

  async getNearbyStations(params: StationSearchParams): Promise<NearbyStationsResponse> {
    // Check cache first
    const cacheKey = CacheService.getKeys().NEARBY_STATIONS(params.latitude || 0, params.longitude || 0);
    const cachedStations = await this.cacheService.get<NearbyStationsResponse>(cacheKey);
    if (cachedStations) {
      return cachedStations;
    }

    return this.retryMechanism.execute(async () => {
      const response = await this.client.get<NearbyStationsResponse>(
        API_CONFIG.ENDPOINTS.STATIONS.NEARBY,
        { params }
      );
      
      // Cache the nearby stations
      await this.cacheService.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes
      
      return response.data;
    });
  }

  async searchStations(params: StationSearchParams): Promise<SearchStationsResponse> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.get<SearchStationsResponse>(
        API_CONFIG.ENDPOINTS.STATIONS.SEARCH,
        { params }
      );
      return response.data;
    });
  }

  async getStationSlots(stationId: string): Promise<any[]> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.get(
        API_CONFIG.ENDPOINTS.STATIONS.SLOTS.replace('{id}', stationId)
      );
      return response.data;
    });
  }

  // ==================== BOOKING METHODS ====================

  async createBooking(data: BookingCreate): Promise<Booking> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.post<Booking>(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, data);
      
      // Clear booking cache after creating a new booking
      await this.cacheService.remove(CacheService.getKeys().BOOKINGS);
      
      return response.data;
    });
  }

  async getBookings(skip = 0, limit = 50, status?: string): Promise<Booking[]> {
    // Check cache first
    const cacheKey = `bookings_${skip}_${limit}_${status || 'all'}`;
    const cachedBookings = await this.cacheService.get<Booking[]>(cacheKey);
    if (cachedBookings) {
      return cachedBookings;
    }

    return this.retryMechanism.execute(async () => {
      const params: any = { skip, limit };
      if (status) params.status = status;

      const response = await this.client.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKINGS.LIST, {
        params,
      });
      
      // Cache the bookings
      await this.cacheService.set(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes
      
      return response.data;
    });
  }

  async getBooking(bookingId: string): Promise<Booking> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.get<Booking>(`${API_CONFIG.ENDPOINTS.BOOKINGS.DETAIL}/${bookingId}`);
      return response.data;
    });
  }

  async updateBooking(bookingId: string, data: BookingUpdate): Promise<Booking> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.put<Booking>(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE}/${bookingId}`,
        data
      );
      
      // Clear booking cache after updating
      await this.cacheService.remove(CacheService.getKeys().BOOKINGS);
      
      return response.data;
    });
  }

  async cancelBooking(bookingId: string): Promise<{ message: string }> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.delete(`${API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL}/${bookingId}`);
      
      // Clear booking cache after cancelling
      await this.cacheService.remove(CacheService.getKeys().BOOKINGS);
      
      return response.data;
    });
  }

  // ==================== UTILITY METHODS ====================

  async checkHealth(): Promise<{ status: string; message: string }> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.get('/ping-db');
      return response.data;
    });
  }

  // Generic method for custom requests
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    return this.retryMechanism.execute(async () => {
      const response = await this.client.request<T>({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    });
  }

  // Method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch {
      return false;
    }
  }

  // Method to get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  }

  // Method to get stored user data
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Method to set auth token (for AuthContext)
  setAuthToken(token: string): void {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  // Method to clear auth token (for AuthContext)
  clearAuthToken(): void {
    delete this.client.defaults.headers.common.Authorization;
  }

  // Method to get network status
  isNetworkOnline(): boolean {
    return this.errorHandler.isNetworkOnline();
  }

  // Method to check network status
  async checkNetworkStatus(): Promise<boolean> {
    return this.errorHandler.checkNetworkStatus();
  }

  // Method to handle errors
  handleError(error: any) {
    return this.errorHandler.handleError(error);
  }

  // Method to show error alert
  showErrorAlert(error: any, onRetry?: () => void) {
    return this.errorHandler.showErrorAlert(error, onRetry);
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;
