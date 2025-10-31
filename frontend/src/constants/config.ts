/**
 * Configuration constants for the EV Charging App
 */

import Constants from 'expo-constants';

// Determine if we're in development mode
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

// API Configuration
export const API_CONFIG = {
  // Use local IP for development - update for production
  BASE_URL: isDev
    ? 'http://192.168.1.15:8000'  // Local development (use your machine's IP)
    : 'https://your-production-api.com',  // Production URL
  
  TIMEOUT: 10000, // 10 seconds
  
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/token',
      PROFILE: '/users/me',
      TWO_FACTOR_SETUP: '/auth/2fa/setup',
      TWO_FACTOR_ENABLE: '/auth/2fa/enable',
      TWO_FACTOR_VERIFY: '/auth/2fa/verify',
      TWO_FACTOR_DISABLE: '/auth/2fa/disable',
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
  ENABLE_LOGGING: isDev,
  MOCK_DATA: isDev,
  SHOW_PERFORMANCE: isDev,
  API_LOGGING: isDev,
};
