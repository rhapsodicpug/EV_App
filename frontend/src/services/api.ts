/**
 * API Service Layer
 * Handles all HTTP requests to the backend
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
  BookingWithStationResponse,
  BookingWithUpdatedStationResponse,
  BookingCreate,
  BookingUpdate,
  ApiResponse,
} from '../types/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    // Debug logging
    if (__DEV__) {
      console.log('🔧 API Service Initializing...');
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
          // Don't treat login endpoint 401 errors as token expiration
          const isLoginEndpoint = error.config?.url?.includes('/token') || 
                                 error.config?.url?.includes('/login') ||
                                 error.config?.url?.includes('/register');
          
          if (isLoginEndpoint) {
            // This is a login/register error, not a token expiration
            if (__DEV__) {
              console.log('🔐 Login/Register failed - invalid credentials');
            }
            return Promise.reject(error);
          }

          // This is a token expiration error for authenticated endpoints
          await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);

          // Create a more informative error
          const authError = new Error('Your session has expired. Please log in again.');
          authError.name = 'AuthenticationError';
          (authError as any).status = 401;
          (authError as any).expired = true;

          if (__DEV__) {
            console.log('🔑 Token expired - user needs to log in again');
          }

          return Promise.reject(authError);
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH METHODS ====================

  async register(data: UserRegistration): Promise<User> {
    // Debug logging
    if (__DEV__) {
      console.log('🔧 Register attempt with endpoint:', API_CONFIG.ENDPOINTS.AUTH.REGISTER);
      console.log('🔧 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`);
    }

    const response = await this.client.post<User>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  }

  async login(credentials: UserLogin): Promise<AuthToken> {
    // Debug logging
    if (__DEV__) {
      console.log('🔧 Login attempt with endpoint:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('🔧 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
      console.log('🔧 Credentials:', { email: credentials.email, password: '***' });
    }

    try {
      // Backend expects JSON data for login
      const response = await this.client.post<AuthToken>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Handle different response structures
      const tokenData = response.data;
      const accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }
      
      // Store token
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      
      return {
        access_token: accessToken,
        token_type: tokenData.token_type || 'bearer',
        expires_in: tokenData.expires_in || 3600,
      };
    } catch (error: any) {
      console.error('❌ Login API error:', error);
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 422) {
        throw new Error('Invalid credentials format');
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    
    // Store user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
      console.log('✅ Logged out and cleared stored data');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }

  // ==================== STATION METHODS ====================

  async getStations(skip = 0, limit = 100): Promise<{ stations: EVStation[]; count: number }> {
    const response = await this.client.get(API_CONFIG.ENDPOINTS.STATIONS.LIST, {
      params: { skip, limit },
    });
    return response.data;
  }

  async getStationsByLocation(
    latitude: number,
    longitude: number,
    limit = 50,
    radiusKm = 25
  ): Promise<{ stations: EVStation[]; count: number; source?: string }> {
    const response = await this.client.get(API_CONFIG.ENDPOINTS.STATIONS.LIST, {
      params: {
        latitude,
        longitude,
        radius_km: radiusKm,
        limit,
      },
    });
    return response.data;
  }

  async getStation(stationId: string): Promise<EVStation> {
    const response = await this.client.get<EVStation>(`${API_CONFIG.ENDPOINTS.STATIONS.DETAIL}/${stationId}`);
    return response.data;
  }

  async getNearbyStations(params: StationSearchParams): Promise<NearbyStationsResponse> {
    const response = await this.client.get<NearbyStationsResponse>(
      API_CONFIG.ENDPOINTS.STATIONS.NEARBY,
      { params }
    );
    return response.data;
  }

  async searchStations(params: StationSearchParams): Promise<SearchStationsResponse> {
    const response = await this.client.get<SearchStationsResponse>(
      API_CONFIG.ENDPOINTS.STATIONS.SEARCH,
      { params }
    );
    return response.data;
  }

  async getStationSlots(stationId: string): Promise<any[]> {
    const response = await this.client.get(
      API_CONFIG.ENDPOINTS.STATIONS.SLOTS.replace('{id}', stationId)
    );
    return response.data;
  }

  // ==================== BOOKING METHODS ====================

  async createBooking(data: BookingCreate): Promise<BookingWithUpdatedStationResponse> {
    const response = await this.client.post<BookingWithUpdatedStationResponse>(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, data);
    return response.data;
  }

  async getBookings(skip = 0, limit = 50, status?: string): Promise<Booking[]> {
    const params: any = { skip, limit };
    if (status) params.status = status;

    const response = await this.client.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKINGS.LIST, {
      params,
    });
    return response.data;
  }

  async getMyBookings(skip = 0, limit = 50, status?: string): Promise<BookingWithStationResponse[]> {
    const params: any = { skip, limit };
    if (status) params.status = status;

    const response = await this.client.get<BookingWithStationResponse[]>('/api/bookings/my-bookings', {
      params,
    });
    return response.data;
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`${API_CONFIG.ENDPOINTS.BOOKINGS.DETAIL}/${bookingId}`);
    return response.data;
  }

  async updateBooking(bookingId: string, data: BookingUpdate): Promise<Booking> {
    const response = await this.client.put<Booking>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE}/${bookingId}`,
      data
    );
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`${API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL}/${bookingId}`);
    return response.data;
  }

  // ==================== UTILITY METHODS ====================

  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await this.client.get('/ping-db');
    return response.data;
  }

  // Generic method for custom requests
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    const response = await this.client.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
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

  // ==================== DASHBOARD METHODS ====================

  async getMyVehicle(): Promise<any> {
    const response = await this.client.get('/api/vehicle/my-vehicle');
    return response.data;
  }

  async getCurrentChargingSession(): Promise<any> {
    const response = await this.client.get('/api/charging-session/current');
    return response.data;
  }

  async getPromotions(): Promise<any[]> {
    const response = await this.client.get('/api/promotions');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
