// Platform-specific LocationService
import { Platform } from 'react-native';

// ==================== TYPES ====================
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coords: LocationCoordinates;
  timestamp: number;
  accuracy?: number;
}

export interface Geofence {
  id: string;
  stationId: string;
  stationName: string;
  coordinates: LocationCoordinates;
  radius: number;
  isActive: boolean;
}

// ==================== LOCATION SERVICE ====================
class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private geofences: Map<string, Geofence> = new Map();
  private isTracking = false;
  private locationWatcher: number | null = null;
  private isWeb = Platform.OS === 'web';

  constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // ==================== PERMISSIONS ====================
  async checkPermissionStatus(): Promise<{ granted: boolean; status: string }> {
    try {
      if (this.isWeb) {
        if (!navigator.geolocation) {
          return { granted: false, status: 'not_supported' };
        }
        // For web, we'll assume permission is granted if we can get location
        return { granted: true, status: 'granted' };
      }

      // Mobile implementation
      const Location = await import('expo-location');
      const status = await Location.getForegroundPermissionsAsync();
      return {
        granted: status.status === 'granted',
        status: status.status,
      };
    } catch (error) {
      console.error('Error checking permission status:', error);
      return { granted: false, status: 'unknown' };
    }
  }

  async requestPermissions(): Promise<{ granted: boolean; status: string }> {
    try {
      if (this.isWeb) {
        if (!navigator.geolocation) {
          return { granted: false, status: 'not_supported' };
        }
        // Request permission by trying to get current position
        const position = await this.getCurrentPosition();
        return { granted: !!position, status: position ? 'granted' : 'denied' };
      }

      // Mobile implementation
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      return {
        granted: status === 'granted',
        status,
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { granted: false, status: 'denied' };
    }
  }

  // ==================== LOCATION TRACKING ====================
  async startLocationUpdates(): Promise<void> {
    try {
      if (this.isTracking) {
        console.log('Location tracking already active');
        return;
      }

      if (this.isWeb) {
        // Web implementation using navigator.geolocation
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        this.locationWatcher = navigator.geolocation.watchPosition(
          (position) => {
            this.currentLocation = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              timestamp: position.timestamp,
              accuracy: position.coords.accuracy,
            };
          },
          (error) => {
            console.error('Location error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );

        this.isTracking = true;
        console.log('✅ Location tracking started (web)');
        return;
      }

      // Mobile implementation - simplified for Expo Go compatibility
      const Location = await import('expo-location');
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission if not granted
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (newStatus !== 'granted') {
          throw new Error('Location permission denied by user');
        }
      }

      // For Expo Go, we'll use a simpler approach
      console.log('✅ Location tracking started (mobile) - using periodic updates');
      this.isTracking = true;
      
      // Set up periodic location updates
      const updateLocation = async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          this.currentLocation = {
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy || undefined,
          };
        } catch (error) {
          console.error('Error updating location:', error);
        }
      };

      // Update location every 10 seconds
      updateLocation();
      const intervalId = setInterval(updateLocation, 10000);
      
      // Store interval ID for cleanup
      (this as any).locationIntervalId = intervalId;
      
    } catch (error) {
      console.error('❌ Error starting location updates:', error);
      throw error;
    }
  }

  async stopLocationUpdates(): Promise<void> {
    try {
      if (this.isWeb) {
        if (this.locationWatcher && navigator.geolocation) {
          navigator.geolocation.clearWatch(this.locationWatcher);
          this.locationWatcher = null;
        }
        this.isTracking = false;
        console.log('✅ Location tracking stopped (web)');
        return;
      }

      // Mobile implementation
      if ((this as any).locationIntervalId) {
        clearInterval((this as any).locationIntervalId);
        (this as any).locationIntervalId = null;
      }
      
      this.isTracking = false;
      console.log('✅ Location tracking stopped (mobile)');
    } catch (error) {
      console.error('❌ Error stopping location updates:', error);
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (this.isWeb) {
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        if (this.currentLocation) {
          return this.currentLocation;
        }

        const position = await this.getCurrentPosition();
        if (position) {
          this.currentLocation = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          };
          return this.currentLocation;
        }

        return null;
      }

      // Mobile implementation
      const Location = await import('expo-location');
      
      // First check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission if not granted
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (newStatus !== 'granted') {
          console.log('❌ Location permission denied by user');
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentLocation = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy || undefined,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      return null;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // ==================== GEOFENCING ====================
  async addGeofence(geofence: Geofence): Promise<void> {
    try {
      this.geofences.set(geofence.id, geofence);
      console.log('✅ Geofence added:', geofence.id);
    } catch (error) {
      console.error('❌ Error adding geofence:', error);
    }
  }

  async removeGeofence(geofenceId: string): Promise<void> {
    try {
      this.geofences.delete(geofenceId);
      console.log('✅ Geofence removed:', geofenceId);
    } catch (error) {
      console.error('❌ Error removing geofence:', error);
    }
  }

  // ==================== UTILITY METHODS ====================
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async sendArrivalNotification(stationName: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Use browser notifications for web
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔋 Arrived at Charging Station', {
            body: `Welcome to ${stationName}! Your charging session can begin.`,
            icon: '/icon-192x192.png',
          });
          console.log('✅ Arrival notification sent (web)');
        } else {
          console.log('🌐 Browser notifications not available');
        }
        return;
      }

      // Mobile implementation - simplified for Expo Go
      console.log('✅ Arrival notification would be sent (mobile)');
    } catch (error) {
      console.error('❌ Error sending arrival notification:', error);
    }
  }

  // ==================== INITIALIZATION ====================
  async initializeLocationTask(): Promise<void> {
    try {
      if (this.isWeb) {
        console.log('🌐 Location task initialization not needed on web');
        return;
      }

      // Mobile implementation - simplified for Expo Go
      console.log('✅ Location service initialized for Expo Go');
    } catch (error) {
      console.error('❌ Error initializing location tasks:', error);
    }
  }
}

export { LocationService };
export const locationService = LocationService.getInstance();
export default locationService;
