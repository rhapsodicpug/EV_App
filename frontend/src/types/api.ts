/**
 * TypeScript types for API responses
 * These match our FastAPI backend models
 */

// ==================== COMMON TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// ==================== AUTH TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  connector_type?: ConnectorType;
}

export interface Vehicle {
  id: string;
  model: string;
  year: string;
  licensePlate: string;
  batteryCapacity: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  phone: string; // Make phone required
  vehicle_info?: VehicleInfo;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ==================== STATION TYPES ====================

export type ChargerType = 'AC_SLOW' | 'AC_FAST' | 'DC_FAST' | 'DC_ULTRA_FAST';
export type ConnectorType = 'TYPE_1' | 'TYPE_2' | 'CCS' | 'CHAdeMO' | 'TESLA';
export type ChargerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OFFLINE';

export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ChargingSlot {
  slot_number: number;
  charger_type: ChargerType;
  connector_type: ConnectorType;
  power_kw: number;
  status: ChargerStatus;
  price_per_kwh: number;
  current_session?: {
    user_id: string;
    start_time: string;
    estimated_end_time?: string;
  };
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
  operating_hours: string | OperatingHours;
  contact_number?: string;
  is_24_7: boolean;
  rating?: number;
  total_reviews?: number;
  distance?: number; // Added when searching nearby
  created_at: string;
  updated_at: string;
}

export interface StationCreate {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pincode: string;
  amenities: string[];
  operating_hours: string;
  contact_number?: string;
  is_24_7: boolean;
}

export interface StationSearchParams {
  latitude?: number;
  longitude?: number;
  max_distance_km?: number;
  city?: string;
  pincode?: string;
  charger_type?: ChargerType;
  is_24_7?: boolean;
  skip?: number;
  limit?: number;
}

export interface NearbyStationsResponse {
  stations: EVStation[];
  count: number;
  query: {
    latitude: number;
    longitude: number;
    max_distance_km: number;
    max_distance_meters: number;
  };
}

export interface SearchStationsResponse {
  stations: EVStation[];
  count: number;
  total_count: number;
  skip: number;
  limit: number;
  filters_applied: Record<string, any>;
}

// ==================== BOOKING TYPES ====================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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

export interface BookingWithStationResponse {
  id: string;
  user_id: string;
  station_id: string;
  station_name: string;
  station_address: string;
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

export interface BookingWithUpdatedStationResponse {
  message: string;
  booking: Booking;
  updated_station: EVStation & {
    available_slots_count: number;
    total_slots_count: number;
  };
}

// ==================== MAP TYPES ====================

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapMarker {
  id: string;
  coordinate: Coordinates;
  title: string;
  description: string;
  type: 'station' | 'user';
  color?: string;
  data?: EVStation;
}

// ==================== ERROR TYPES ====================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ==================== FORM TYPES ====================

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface LoginForm {
  email: FormField<string>;
  password: FormField<string>;
}

export interface RegisterForm {
  name: FormField<string>;
  email: FormField<string>;
  password: FormField<string>;
  confirmPassword: FormField<string>;
  phone: FormField<string>;
}

export interface BookingForm {
  station_id: FormField<string>;
  slot_number: FormField<number>;
  start_time: FormField<Date>;
  end_time: FormField<Date>;
  notes: FormField<string>;
}

// ==================== APP STATE TYPES ====================

export interface AppState {
  isLoading: boolean;
  error?: string;
  isOnline: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  token?: string;
  isLoading: boolean;
  error?: string;
}

export interface StationState {
  stations: EVStation[];
  nearbyStations: EVStation[];
  selectedStation?: EVStation;
  searchParams: StationSearchParams;
  isLoading: boolean;
  error?: string;
}

export interface BookingState {
  bookings: Booking[];
  currentBooking?: Booking;
  isLoading: boolean;
  error?: string;
}

export interface MapState {
  region: MapRegion;
  userLocation?: Coordinates;
  markers: MapMarker[];
  selectedMarker?: MapMarker;
  isLocationEnabled: boolean;
}

// ==================== NAVIGATION TYPES ====================

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  GetStarted: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  BackToGetStarted: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Map: undefined;
  Bookings: undefined;
  Profile: undefined;
  EditProfile: undefined;
  VehicleInfo: undefined;
};

export type StationStackParamList = {
  StationList: undefined;
  StationDetail: { stationId: string };
  StationBooking: { stationId: string };
  StationDetailsBooking: { station: EVStation };
  BookSlot: { station: EVStation };
  Payment: { booking: any; totalAmount: number };
  BookingConfirmed: { booking: any; totalAmount: number };
  SlotSelection: { station: any };
  BookingForm: { stationId: string; slotNumber?: number };
};

export type MapStackParamList = {
  InteractiveMap: undefined;
  StationDetails: { station: EVStation };
  StationBooking: { stationId: string };
};

export type BookingStackParamList = {
  BookingsMain: undefined;
  SlotSelection: { station: any };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyVehicle: undefined;
  AddVehicle: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  AppPreferences: undefined;
  HelpSupport: undefined;
  Feedback: undefined;
  About: undefined;
  GettingStartedTutorial: undefined;
  BookingTutorial: undefined;
  PaymentGuide: undefined;
};
