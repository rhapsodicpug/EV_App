/**
 * Trip Storage Service
 * Handles saving, loading, and deleting trip plans
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripPlan } from './TripPlannerService';

const TRIPS_STORAGE_KEY = '@ev_app_saved_trips';

export interface SavedTrip {
  id: string;
  name: string;
  tripPlan: TripPlan;
  createdAt: string;
  isFavorite: boolean;
}

class TripStorageService {
  /**
   * Save a new trip
   */
  async saveTrip(tripPlan: TripPlan, customName?: string): Promise<SavedTrip> {
    try {
      const trips = await this.getAllTrips();
      
      const tripNumber = trips.length + 1;
      const defaultName = `${tripPlan.startLocation.name} → ${tripPlan.endLocation.name}`;
      
      const newTrip: SavedTrip = {
        id: `trip_${Date.now()}`,
        name: customName || defaultName,
        tripPlan,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      trips.push(newTrip);
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
      
      console.log('✅ Trip saved:', newTrip.name);
      return newTrip;
    } catch (error) {
      console.error('❌ Error saving trip:', error);
      throw error;
    }
  }

  /**
   * Get all saved trips
   */
  async getAllTrips(): Promise<SavedTrip[]> {
    try {
      const tripsJson = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
      if (!tripsJson) return [];
      
      const trips = JSON.parse(tripsJson);
      return trips;
    } catch (error) {
      console.error('❌ Error loading trips:', error);
      return [];
    }
  }

  /**
   * Get a specific trip by ID
   */
  async getTripById(tripId: string): Promise<SavedTrip | null> {
    try {
      const trips = await this.getAllTrips();
      return trips.find(trip => trip.id === tripId) || null;
    } catch (error) {
      console.error('❌ Error getting trip:', error);
      return null;
    }
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    try {
      const trips = await this.getAllTrips();
      const filteredTrips = trips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filteredTrips));
      console.log('✅ Trip deleted:', tripId);
    } catch (error) {
      console.error('❌ Error deleting trip:', error);
      throw error;
    }
  }

  /**
   * Update a trip
   */
  async updateTrip(tripId: string, updates: Partial<SavedTrip>): Promise<void> {
    try {
      const trips = await this.getAllTrips();
      const tripIndex = trips.findIndex(trip => trip.id === tripId);
      
      if (tripIndex === -1) {
        throw new Error('Trip not found');
      }

      trips[tripIndex] = { ...trips[tripIndex], ...updates };
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
      console.log('✅ Trip updated:', tripId);
    } catch (error) {
      console.error('❌ Error updating trip:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(tripId: string): Promise<void> {
    try {
      const trips = await this.getAllTrips();
      const trip = trips.find(t => t.id === tripId);
      
      if (!trip) {
        throw new Error('Trip not found');
      }

      await this.updateTrip(tripId, { isFavorite: !trip.isFavorite });
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Clear all trips
   */
  async clearAllTrips(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRIPS_STORAGE_KEY);
      console.log('✅ All trips cleared');
    } catch (error) {
      console.error('❌ Error clearing trips:', error);
      throw error;
    }
  }

  /**
   * Get recent trips (last 5)
   */
  async getRecentTrips(limit: number = 5): Promise<SavedTrip[]> {
    try {
      const trips = await this.getAllTrips();
      return trips
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recent trips:', error);
      return [];
    }
  }

  /**
   * Get favorite trips
   */
  async getFavoriteTrips(): Promise<SavedTrip[]> {
    try {
      const trips = await this.getAllTrips();
      return trips.filter(trip => trip.isFavorite);
    } catch (error) {
      console.error('❌ Error getting favorite trips:', error);
      return [];
    }
  }
}

export const tripStorageService = new TripStorageService();
export default tripStorageService;

