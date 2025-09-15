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

// ==================== CONFIGURATION ====================

const API_BASE_URL = __DEV__ 
  ? 'http://127.0.0.1:8000'  // Development
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
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
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
        
        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401) {
          await this.handleAuthError();
          throw new AuthenticationError('Session expired', true);
        }

        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          throw new Error('Network error. Please check your internet connection.');
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
