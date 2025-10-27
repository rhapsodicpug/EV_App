/**
 * User Preference Tracker
 * Learns and tracks user preferences for better recommendations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  preferredStationTypes: string[];
  preferredChargingTimes: string[];
  preferredPriceRange: { min: number; max: number };
  preferredLocations: string[];
  favoriteStations: string[];
  averageChargingDuration: number;
  preferredChargerType: 'AC Slow' | 'AC Fast' | 'DC Fast' | 'DC Ultra-Fast';
  budgetConscious: boolean;
}

class UserPreferenceTracker {
  private static instance: UserPreferenceTracker;
  private preferences: UserPreferences;
  private readonly STORAGE_KEY = 'EV_APP_USER_PREFERENCES';

  static getInstance(): UserPreferenceTracker {
    if (!UserPreferenceTracker.instance) {
      UserPreferenceTracker.instance = new UserPreferenceTracker();
    }
    return UserPreferenceTracker.instance;
  }

  constructor() {
    this.preferences = {
      preferredStationTypes: [],
      preferredChargingTimes: [],
      preferredPriceRange: { min: 0, max: 20 },
      preferredLocations: [],
      favoriteStations: [],
      averageChargingDuration: 45,
      preferredChargerType: 'DC Fast',
      budgetConscious: false,
    };
  }

  /**
   * Initialize preferences from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.preferences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  /**
   * Track a booking to learn preferences
   */
  async trackBooking(booking: {
    stationId: string;
    stationName: string;
    stationType: string;
    chargerType: string;
    location: string;
    pricePerKwh: number;
    bookingTime: string;
    duration: number;
  }): Promise<void> {
    // Update preferred charger type
    this.updatePreference('preferredChargerType', booking.chargerType as any);

    // Update preferred charging times
    const hour = new Date(booking.bookingTime).getHours();
    const timeSlot = this.getTimeSlot(hour);
    this.addToArray('preferredChargingTimes', timeSlot);

    // Update price range
    if (this.preferences.preferredPriceRange.min === 0 || 
        booking.pricePerKwh < this.preferences.preferredPriceRange.min) {
      this.preferences.preferredPriceRange.min = booking.pricePerKwh;
    }
    if (booking.pricePerKwh > this.preferences.preferredPriceRange.max) {
      this.preferences.preferredPriceRange.max = booking.pricePerKwh;
    }

    // Update average duration
    const newAvg = (this.preferences.averageChargingDuration + booking.duration) / 2;
    this.preferences.averageChargingDuration = Math.round(newAvg);

    // Add to favorite stations
    this.addToArray('favoriteStations', booking.stationId);

    // Save to storage
    await this.save();
  }

  /**
   * Track station view to learn interest
   */
  async trackStationView(stationId: string, stationName: string, location: string): Promise<void> {
    // Track location preference
    this.addToArray('preferredLocations', location);
    
    // If viewed multiple times, might be interested
    // Implementation can check view count
  }

  /**
   * Track cancellation to avoid similar stations
   */
  async trackCancellation(booking: { stationId: string; reason?: string }): Promise<void> {
    // Could track reasons and avoid suggesting similar stations
    // For now, just log
    console.log('Cancellation tracked:', booking.reason);
  }

  /**
   * Get preferred charging time suggestions
   */
  getPreferredChargingTimes(): string[] {
    return this.preferences.preferredChargingTimes.slice(0, 3);
  }

  /**
   * Get suggested stations based on preferences
   */
  getSuggestedStations(): string[] {
    return this.preferences.favoriteStations.slice(0, 5);
  }

  /**
   * Check if user is budget conscious
   */
  isBudgetConscious(): boolean {
    return this.preferences.budgetConscious || 
           this.preferences.preferredPriceRange.max < 7;
  }

  /**
   * Get all preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences manually
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.save();
  }

  /**
   * Reset preferences
   */
  async resetPreferences(): Promise<void> {
    this.preferences = {
      preferredStationTypes: [],
      preferredChargingTimes: [],
      preferredPriceRange: { min: 0, max: 20 },
      preferredLocations: [],
      favoriteStations: [],
      averageChargingDuration: 45,
      preferredChargerType: 'DC Fast',
      budgetConscious: false,
    };
    await this.save();
  }

  /**
   * Get insights for user
   */
  getInsights(): {
    favoriteTimeToCharge: string;
    averageSessionDuration: number;
    preferredCharger: string;
    budgetConscious: boolean;
    totalBookings: number;
  } {
    const topTime = this.preferences.preferredChargingTimes[0] || 'Evening';
    
    return {
      favoriteTimeToCharge: topTime,
      averageSessionDuration: this.preferences.averageChargingDuration,
      preferredCharger: this.preferences.preferredChargerType,
      budgetConscious: this.isBudgetConscious(),
      totalBookings: this.preferences.favoriteStations.length,
    };
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 22) return 'Evening';
    return 'Night';
  }

  private addToArray(key: keyof UserPreferences, value: string): void {
    const arr = (this.preferences[key] as string[]) || [];
    if (!arr.includes(value)) {
      arr.push(value);
      (this.preferences[key] as any) = arr;
    }
  }

  private updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }
}

export default UserPreferenceTracker;

