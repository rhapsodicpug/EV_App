/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  User, 
  UserLogin, 
  UserRegistration, 
  AuthToken,
  EVStation,
  StationCreate,
  StationUpdate,
  StationsResponse,
  NearbyStationsResponse,
  Booking,
  BookingCreate,
  BookingUpdate,
  BookingResponse,
  BookingWithStationResponse,
  AvailabilityCheck,
  StationSearchParams,
  NearbySearchParams,
  ApiError,
  AuthenticationError
} from '../types/api';
import { storageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/config';
import { isTokenExpired } from '../utils/tokenUtils';

// ==================== CONFIGURATION ====================

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.234:8000'  // Development - Use network IP for device access
  : 'https://your-production-api.com';  // Production

const API_TIMEOUT = 30000; // 30 seconds

// ==================== AXIOS INSTANCE ====================

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ==================== INTERCEPTORS ====================

  private setupInterceptors() {
    // Request interceptor - Add auth token and validate expiry
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            // Check if token is expired before using it
            if (isTokenExpired(token)) {
              console.log('🔑 Token expired, removing from storage');
              await this.handleAuthError();
              // Don't add expired token to headers
            } else if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (error) {
          console.error('Error processing auth token:', error);
        }
        
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.detail || 'Authentication failed';
          console.log('🔐 401 Unauthorized:', errorMessage);
          
          // For login endpoint, don't clear storage - let the calling code handle it
          const isLoginEndpoint = error.config?.url?.includes('/auth/token');
          
          if (!isLoginEndpoint) {
            // Only clear auth data for non-login endpoints (like profile fetch)
            const isAuthEndpoint = error.config?.url?.includes('/users/me');
            if (isAuthEndpoint) {
              await this.handleAuthError();
            }
            throw new AuthenticationError(errorMessage, true);
          } else {
            // For login endpoint, just throw a simple error
            const simpleError = new Error(errorMessage);
            simpleError.name = 'LoginError';
            throw simpleError;
          }
        }

        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          throw new Error('Network error. Please check your internet connection.');
        }

        // Handle connection refused (server not running)
        if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
          throw new Error('Backend server is not running. Please start the server.');
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        }

        // Handle other HTTP errors
        const apiError: ApiError = {
          message: error.response?.data?.detail || error.message || 'An error occurred',
          status: error.response?.status,
          code: error.code,
          details: error.response?.data,
        };

        throw apiError;
      }
    );
  }

  private async handleAuthError() {
    try {
      await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storageService.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }


  // ==================== HELPER METHODS ====================

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  async login(credentials: UserLogin): Promise<AuthToken> {
    return this.request<AuthToken>({
      method: 'POST',
      url: '/auth/token',
      data: credentials,
    });
  }

  async register(userData: UserRegistration): Promise<User> {
    return this.request<User>({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>({
      method: 'GET',
      url: '/users/me',
    });
  }

  // Special method for login flow - pass token directly
  async getProfileWithToken(token: string): Promise<User> {
    return this.request<User>({
      method: 'GET',
      url: '/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>({
      method: 'PUT',
      url: '/users/me',
      data: userData,
    });
  }

  // ==================== STATION ENDPOINTS ====================

  async getStations(skip: number = 0, limit: number = 100): Promise<StationsResponse> {
    return this.request<StationsResponse>({
      method: 'GET',
      url: '/stations/',
      params: { skip, limit },
    });
  }

  async getStation(stationId: string): Promise<EVStation> {
    return this.request<EVStation>({
      method: 'GET',
      url: `/stations/${stationId}`,
    });
  }

  async createStation(stationData: StationCreate): Promise<EVStation> {
    return this.request<EVStation>({
      method: 'POST',
      url: '/stations/',
      data: stationData,
    });
  }

  async updateStation(stationId: string, stationData: StationUpdate): Promise<EVStation> {
    return this.request<EVStation>({
      method: 'PUT',
      url: `/stations/${stationId}`,
      data: stationData,
    });
  }

  async deleteStation(stationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      method: 'DELETE',
      url: `/stations/${stationId}`,
    });
  }

  async getNearbyStations(params: NearbySearchParams): Promise<NearbyStationsResponse> {
    return this.request<NearbyStationsResponse>({
      method: 'GET',
      url: '/stations/nearby/',
      params,
    });
  }

  async searchStations(params: StationSearchParams): Promise<StationsResponse> {
    return this.request<StationsResponse>({
      method: 'GET',
      url: '/stations/search/',
      params,
    });
  }

  // ==================== BOOKING ENDPOINTS ====================

  async createBooking(bookingData: BookingCreate): Promise<BookingResponse> {
    return this.request<BookingResponse>({
      method: 'POST',
      url: '/api/bookings/',
      data: bookingData,
    });
  }

  async getMyBookings(
    skip: number = 0, 
    limit: number = 50, 
    status?: string
  ): Promise<BookingWithStationResponse[]> {
    const params: any = { skip, limit };
    if (status) params.status = status;

    return this.request<BookingWithStationResponse[]>({
      method: 'GET',
      url: '/api/bookings/my-bookings',
      params,
    });
  }

  async getBooking(bookingId: string): Promise<BookingResponse> {
    return this.request<BookingResponse>({
      method: 'GET',
      url: `/api/bookings/${bookingId}`,
    });
  }

  async updateBooking(bookingId: string, bookingData: BookingUpdate): Promise<BookingResponse> {
    return this.request<BookingResponse>({
      method: 'PUT',
      url: `/api/bookings/${bookingId}`,
      data: bookingData,
    });
  }

  async cancelBooking(bookingId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      method: 'DELETE',
      url: `/api/bookings/${bookingId}`,
    });
  }

  async checkAvailability(
    stationId: string,
    startTime: string,
    durationMinutes: number = 60
  ): Promise<AvailabilityCheck> {
    return this.request<AvailabilityCheck>({
      method: 'GET',
      url: `/api/bookings/check-availability/${stationId}`,
      params: {
        start_time: startTime,
        duration_minutes: durationMinutes,
      },
    });
  }

  // ==================== HEALTH CHECK ====================

  async pingDatabase(): Promise<{ status: string; message: string; database: string }> {
    return this.request<{ status: string; message: string; database: string }>({
      method: 'GET',
      url: '/ping-db',
    });
  }

  async getApiStatus(): Promise<{ message: string; version: string; features: string[] }> {
    return this.request<{ message: string; version: string; features: string[] }>({
      method: 'GET',
      url: '/',
    });
  }

  // ==================== UTILITY METHODS ====================

  getBaseUrl(): string {
    return API_BASE_URL;
  }

  setTimeout(timeout: number): void {
    this.api.defaults.timeout = timeout;
  }

  // ==================== FILE UPLOAD ====================

  async uploadFile(file: FormData, endpoint: string): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: endpoint,
      data: file,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// ==================== EXPORT ====================

export const apiService = new ApiService();
export default apiService;
