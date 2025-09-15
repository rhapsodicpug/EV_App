/**
 * API Types and Interfaces
 * Defines all data structures used in the EV Charging App
 */

// ==================== NAVIGATION TYPES ====================

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  PaymentTest: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Bookings: undefined;
  Profile: undefined;
};

// ==================== USER TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_info?: VehicleInfo;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface VehicleInfo {
  make?: string;
  model?: string;
  year?: number;
  battery_capacity?: number;
  connector_type?: string;
  license_plate?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicle_info?: VehicleInfo;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_info?: VehicleInfo;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// ==================== AUTH TYPES ====================

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenData {
  email?: string;
}

// ==================== STATION TYPES ====================

export interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ChargingSlot {
  id?: string;
  slot_number: number;
  charger_type: ChargerType;
  power_kw: number;
  status: ChargerStatus;
  price_per_kwh: number;
  connector_type: string;
}

export interface EVStation {
  id: string;
  name: string;
  address: string;
  location: Location;
  city: string;
  state: string;
  pincode: string;
  charging_slots: ChargingSlot[];
  amenities: string[];
  operating_hours: Record<string, string>;
  contact_number?: string;
  is_24_7: boolean;
  created_at: string;
  updated_at: string;
}

export interface StationCreate {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pincode: string;
  amenities?: string[];
  operating_hours: Record<string, string>;
  contact_number?: string;
  is_24_7?: boolean;
}

export interface StationUpdate {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  amenities?: string[];
  operating_hours?: Record<string, string>;
  contact_number?: string;
  is_24_7?: boolean;
}

export interface SlotCreate {
  slot_number: number;
  charger_type: ChargerType;
  power_kw: number;
  price_per_kwh: number;
  connector_type: string;
}

// ==================== BOOKING TYPES ====================

export interface Booking {
  id: string;
  user_id: string;
  station_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cost?: number;
  energy_consumed?: number;
  payment_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  station_id: string;
  start_time: string;
  duration_minutes: number;
  notes?: string;
}

export interface BookingUpdate {
  start_time?: string;
  end_time?: string;
  status?: BookingStatus;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  user_id: string;
  station_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cost?: number;
  energy_consumed?: number;
  payment_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithStationResponse extends BookingResponse {
  station_name: string;
  station_address: string;
}

export interface AvailabilityCheck {
  station_id: string;
  station_name?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  available_slots: AvailableSlot[];
  total_available: number;
}

export interface AvailableSlot {
  slot_number: number;
  charger_type: ChargerType;
  power_kw: number;
  price_per_kwh: number;
  connector_type: string;
}

// ==================== ENUMS ====================

export enum ChargerType {
  AC_SLOW = "AC_SLOW",
  AC_FAST = "AC_FAST", 
  DC_FAST = "DC_FAST",
  DC_ULTRA_FAST = "DC_ULTRA_FAST"
}

export enum ChargerStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  OUT_OF_ORDER = "OUT_OF_ORDER",
  MAINTENANCE = "MAINTENANCE"
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  total_count?: number;
  skip: number;
  limit: number;
}

export interface StationsResponse {
  stations: EVStation[];
  count: number;
  total_count?: number;
  skip?: number;
  limit?: number;
}

export interface NearbyStationsResponse extends StationsResponse {
  query: {
    latitude: number;
    longitude: number;
    max_distance_km: number;
    max_distance_meters: number;
  };
}

// ==================== ERROR TYPES ====================

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AuthenticationError extends Error {
  expired: boolean;
  
  constructor(message: string, expired: boolean = false) {
    super(message);
    this.name = 'AuthenticationError';
    this.expired = expired;
  }
}

// ==================== SEARCH AND FILTER TYPES ====================

export interface StationSearchParams {
  city?: string;
  pincode?: string;
  charger_type?: ChargerType;
  is_24_7?: boolean;
  skip?: number;
  limit?: number;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  max_distance_km?: number;
  limit?: number;
}

// ==================== UTILITY TYPES ====================

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

export type OperatingHours = Record<string, string>;

// ==================== PAYMENT TYPES ====================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  is_default: boolean;
}

export interface PaymentRequest {
  booking_id: string;
  amount: number;
  payment_method_id: string;
}

export interface PaymentResponse {
  transaction_id: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  timestamp: string;
}
