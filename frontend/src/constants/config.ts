/**
 * Configuration Constants
 * Central configuration for the EV Charging App
 */

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: '@ev_charging_app:auth_token',
  USER_DATA: '@ev_charging_app:user_data',
  
  // User Preferences
  THEME_MODE: '@ev_charging_app:theme_mode',
  LANGUAGE: '@ev_charging_app:language',
  NOTIFICATIONS_ENABLED: '@ev_charging_app:notifications_enabled',
  
  // App State
  ONBOARDING_COMPLETED: '@ev_charging_app:onboarding_completed',
  LAST_LOCATION: '@ev_charging_app:last_location',
  SEARCH_HISTORY: '@ev_charging_app:search_history',
  FAVORITE_STATIONS: '@ev_charging_app:favorite_stations',
  
  // Cache
  STATIONS_CACHE: '@ev_charging_app:stations_cache',
  BOOKINGS_CACHE: '@ev_charging_app:bookings_cache',
} as const;

// ==================== API CONFIGURATION ====================

export const API_CONFIG = {
  // Base URLs
  BASE_URL: __DEV__ 
    ? 'http://127.0.0.1:8000'  // Development
    : 'https://your-production-api.com',  // Production
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/token',
      REGISTER: '/auth/register',
      PROFILE: '/users/me',
    },
    STATIONS: {
      LIST: '/stations/',
      DETAIL: '/stations',
      NEARBY: '/stations/nearby/',
      SEARCH: '/stations/search/',
      SLOTS: '/stations/{id}/slots/',
    },
    BOOKINGS: {
      CREATE: '/api/bookings/',
      LIST: '/api/bookings/',
      MY_BOOKINGS: '/api/bookings/my-bookings',
      DETAIL: '/api/bookings',
      UPDATE: '/api/bookings',
      CANCEL: '/api/bookings',
      AVAILABILITY: '/api/bookings/check-availability',
    },
    HEALTH: {
      PING: '/ping-db',
      STATUS: '/',
    },
  },
} as const;

// ==================== APP CONFIGURATION ====================

export const APP_CONFIG = {
  // App Info
  NAME: 'EV Charging App',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Features
  FEATURES: {
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: true,
    LOCATION_SERVICES: true,
  },
  
  // Limits
  MAX_SEARCH_RADIUS: 50, // km
  DEFAULT_SEARCH_RADIUS: 10, // km
  MAX_BOOKING_DURATION: 480, // minutes (8 hours)
  MIN_BOOKING_DURATION: 15, // minutes
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== MAP CONFIGURATION ====================

export const MAP_CONFIG = {
  // Default region (Mumbai)
  DEFAULT_REGION: {
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Map settings
  ZOOM_LEVELS: {
    CITY: 0.1,
    AREA: 0.05,
    STREET: 0.01,
  },
  
  // Marker settings
  MARKER_COLORS: {
    AVAILABLE: '#4CAF50',
    OCCUPIED: '#FF9800',
    MAINTENANCE: '#F44336',
    OUT_OF_ORDER: '#9E9E9E',
  },
} as const;

// ==================== THEME CONFIGURATION ====================

export const THEME_CONFIG = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 50,
  },
} as const;

// ==================== VALIDATION RULES ====================

export const VALIDATION_RULES = {
  // User registration
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
  },
  
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[+]?[\d\s\-\(\)]+$/,
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  
  // Booking validation
  BOOKING: {
    MIN_ADVANCE_HOURS: 0.25, // 15 minutes
    MAX_ADVANCE_DAYS: 30,
  },
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  
  // Booking errors
  SLOT_UNAVAILABLE: 'This slot is no longer available.',
  INVALID_TIME_RANGE: 'Please select a valid time range.',
  BOOKING_CONFLICT: 'You already have a booking during this time.',
  
  // Location errors
  LOCATION_PERMISSION_DENIED: 'Location permission is required to find nearby stations.',
  LOCATION_UNAVAILABLE: 'Unable to get your current location.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  
  // Booking
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully.',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully!',
  
  // Generic
  OPERATION_SUCCESS: 'Operation completed successfully!',
} as const;

// ==================== NOTIFICATION TYPES ====================

export const NOTIFICATION_TYPES = {
  BOOKING_REMINDER: 'booking_reminder',
  BOOKING_STARTED: 'booking_started',
  BOOKING_ENDING: 'booking_ending',
  BOOKING_COMPLETED: 'booking_completed',
  STATION_AVAILABLE: 'station_available',
  MAINTENANCE_ALERT: 'maintenance_alert',
} as const;

// ==================== CHARGER TYPES ====================

export const CHARGER_TYPES = {
  AC_SLOW: {
    label: 'AC Slow',
    power: '3-7 kW',
    icon: '🔌',
    color: '#4CAF50',
  },
  AC_FAST: {
    label: 'AC Fast',
    power: '7-22 kW',
    icon: '⚡',
    color: '#FF9800',
  },
  DC_FAST: {
    label: 'DC Fast',
    power: '50+ kW',
    icon: '🚀',
    color: '#2196F3',
  },
  DC_ULTRA_FAST: {
    label: 'DC Ultra Fast',
    power: '150+ kW',
    icon: '💨',
    color: '#9C27B0',
  },
} as const;

// ==================== EXPORT TYPES ====================

export type StorageKey = keyof typeof STORAGE_KEYS;
export type ApiEndpoint = typeof API_CONFIG.ENDPOINTS;
export type ChargerTypeConfig = typeof CHARGER_TYPES;
export type ValidationRule = typeof VALIDATION_RULES;
