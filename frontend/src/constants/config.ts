/**
 * Configuration constants for the EV Charging App
 */

import Constants from 'expo-constants';

// API Configuration with enhanced connectivity options
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Try multiple possible local IPs and localhost
    const possibleUrls = [
      'http://192.168.0.234:8000', // Current network IP
      'http://192.168.1.9:8000',   // Original IP
      'http://localhost:8000',      // Standard localhost
      'http://127.0.0.1:8000',     // Localhost IP
    ];
    
    // In a real app, you could test connectivity to each URL
    // For now, we'll use the first one as default but make it easy to change
    return possibleUrls[0];
  }
  return 'https://your-production-api.com';  // Production URL
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  
  TIMEOUT: 15000, // 15 seconds - increased for better reliability
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/token',
      PROFILE: '/users/me',
    },
    
    // Station endpoints
    STATIONS: {
      LIST: '/stations/',
      DETAIL: '/stations',
      NEARBY: '/stations/nearby/',
      SEARCH: '/stations/search/',
      SLOTS: '/stations/{id}/slots/',
    },
    
    // Booking endpoints
    BOOKINGS: {
      LIST: '/api/bookings/my-bookings',
      CREATE: '/api/bookings/',
      DETAIL: '/bookings',
      UPDATE: '/bookings',
      CANCEL: '/bookings',
    },
  },
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'EV Charging App',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.evcharging.app',
  
  // Features flags
  FEATURES: {
    MAPS_ENABLED: true,
    PUSH_NOTIFICATIONS: true,
    BIOMETRIC_AUTH: false, // Enable in future versions
    DARK_MODE: true,
  },
  
  // Default values
  DEFAULTS: {
    MAP_ZOOM: 15,
    SEARCH_RADIUS: 10, // km
    REFRESH_INTERVAL: 30000, // 30 seconds
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ev_charging_app:auth_token',
  USER_DATA: '@ev_charging_app:user_data',
  FAVORITES: '@ev_charging_app:favorites',
  SEARCH_HISTORY: '@ev_charging_app:search_history',
  APP_SETTINGS: '@ev_charging_app:settings',
};

// Mumbai coordinates (default location)
export const MUMBAI_COORDINATES = {
  latitude: 19.0760,
  longitude: 72.8777,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_REGION: MUMBAI_COORDINATES,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
  MARKER_COLORS: {
    AVAILABLE: '#4CAF50',    // Green for available slots
    OCCUPIED: '#FF9800',     // Orange for fully occupied
    MAINTENANCE: '#FF9800',  // Orange for limited availability
    OFFLINE: '#9E9E9E',      // Gray for offline
  },
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  MOCK_DATA: __DEV__,
  SHOW_PERFORMANCE: __DEV__,
  API_LOGGING: __DEV__,
};
