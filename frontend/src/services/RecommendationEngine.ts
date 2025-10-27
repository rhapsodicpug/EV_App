/**
 * Recommendation Engine
 * Provides smart, personalized station recommendations based on user context
 */

import { apiService } from './api';
import { EVStation } from '../types/api';
import { UserContext } from '../components/ui/ContextCollectionModal';

export interface PersonalizedRecommendation extends EVStation {
  whyRecommended: string;
  recommendationScore: number;
  estimatedTime: string;
  estimatedCost: number;
  urgencyMatch: boolean;
}

export interface RecommendationCriteria {
  batteryLevel: number;
  urgency: 'urgent' | 'soon' | 'later' | 'planning';
  preferences: {
    distance: boolean;
    speed: boolean;
    price: boolean;
    amenities: boolean;
  };
  userLocation?: { latitude: number; longitude: number };
}

class RecommendationEngine {
  private static instance: RecommendationEngine;

  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Get personalized station recommendations
   */
  async getPersonalizedRecommendations(
    criteria: RecommendationCriteria
  ): Promise<PersonalizedRecommendation[]> {
    try {
      // Fetch nearby stations
      const response = await apiService.getStationsByLocation(
        criteria.userLocation?.latitude || 0,
        criteria.userLocation?.longitude || 0,
        50,
        25 // 25km radius
      );

      const stations = response.stations || [];
      
      // Apply smart filtering and ranking
      const recommendations = this.rankAndFilterStations(stations, criteria);
      
      return recommendations.slice(0, 5); // Return top 5
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Rank and filter stations based on context
   */
  private rankAndFilterStations(
    stations: EVStation[],
    criteria: RecommendationCriteria
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    for (const station of stations) {
      const rec = this.createRecommendation(station, criteria);
      if (rec) {
        recommendations.push(rec);
      }
    }

    // Sort by recommendation score
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return recommendations;
  }

  /**
   * Create personalized recommendation for a station
   */
  private createRecommendation(
    station: EVStation,
    criteria: RecommendationCriteria
  ): PersonalizedRecommendation | null {
    let score = 0;
    let whyRecommended = '';
    const reasons: string[] = [];

    // Critical Battery Logic (<20%)
    if (criteria.batteryLevel < 20) {
      // Prioritize NEAREST first
      const distance = station.distance_km || 999;
      score += (1000 - distance) * 10; // Heavier weight on distance
      reasons.push(`Nearest option (${distance} km away)`);
      
      // If very critical, only show stations with availability
      if (criteria.batteryLevel < 15) {
        const availableConnectors = station.connectors?.filter(c => c.status === 'Available').length || 0;
        if (availableConnectors === 0) {
          return null; // Skip if no availability
        }
        reasons.push('Available right now');
      }
    }

    // Urgency-based filtering
    let urgencyMatch = false;
    if (criteria.urgency === 'urgent') {
      // Only show stations available NOW
      const availableConnectors = station.connectors?.filter(c => c.status === 'Available').length || 0;
      if (availableConnectors === 0 && criteria.batteryLevel > 30) {
        // Allow unavailable if not critical
      } else if (availableConnectors > 0) {
        score += 50;
        urgencyMatch = true;
        reasons.push('Available immediately');
      }
    } else if (criteria.urgency === 'soon') {
      const availableConnectors = station.connectors?.filter(c => c.status === 'Available').length || 0;
      if (availableConnectors > 0) {
        score += 30;
        urgencyMatch = true;
      }
    }

    // Preference matching
    if (criteria.preferences.distance) {
      const distance = station.distance_km || 999;
      score += (50 - distance) * 2; // Bonus for closer stations
      reasons.push('Close to your location');
    }

    if (criteria.preferences.speed) {
      const hasDC = station.connectors?.some(c => c.type?.includes('DC')) || false;
      if (hasDC) {
        score += 40;
        reasons.push('Fast charging available');
      }
    }

    if (criteria.preferences.price) {
      const avgPrice = this.getAveragePrice(station);
      score += (100 - avgPrice) * 2; // Cheaper = higher score
      reasons.push(`Affordable (₹${avgPrice}/kWh)`);
    }

    if (criteria.preferences.amenities) {
      const amenityCount = station.amenities?.length || 0;
      score += amenityCount * 10;
      if (amenityCount > 0) {
        reasons.push('Great amenities');
      }
    }

    // Battery level specific logic
    if (criteria.batteryLevel >= 20 && criteria.batteryLevel < 40) {
      // Low battery: prefer fast charging
      const hasDC = station.connectors?.some(c => c.type?.includes('DC')) || false;
      if (hasDC) {
        score += 30;
        reasons.push('Fast charging recommended for your battery level');
      }
    }

    // Calculate estimates
    const estimatedTime = this.calculateChargingTime(criteria.batteryLevel, station);
    const estimatedCost = this.calculateCost(criteria.batteryLevel, station);

    // Create personalized recommendation
    const primaryReason = this.getPrimaryReason(reasons, criteria);

    return {
      ...station,
      whyRecommended: primaryReason,
      recommendationScore: score,
      estimatedTime,
      estimatedCost,
      urgencyMatch,
    };
  }

  /**
   * Get primary reason for recommendation
   */
  private getPrimaryReason(reasons: string[], criteria: RecommendationCriteria): string {
    if (reasons.length === 0) return 'Good station for you';

    // For critical battery, always prioritize distance
    if (criteria.batteryLevel < 20) {
      const distanceReason = reasons.find(r => r.includes('Nearest'));
      if (distanceReason) return distanceReason;
    }

    // For urgent need, prioritize availability
    if (criteria.urgency === 'urgent') {
      const availabilityReason = reasons.find(r => r.includes('Available'));
      if (availabilityReason) return availabilityReason;
    }

    // Return first reason as primary
    return reasons[0];
  }

  /**
   * Calculate estimated charging time
   */
  private calculateChargingTime(currentBattery: number, station: EVStation): string {
    const targetBattery = currentBattery < 50 ? 80 : 95; // Charge to 80% if low, 95% if higher
    const batteryNeeded = targetBattery - currentBattery;

    // Estimate based on connector types
    const hasDC = station.connectors?.some(c => c.type?.includes('DC')) || false;
    
    if (hasDC) {
      // DC Fast: ~10-15% per 15 minutes
      const minutesNeeded = (batteryNeeded / 10) * 15;
      if (minutesNeeded < 30) return 'Less than 30 min';
      if (minutesNeeded < 60) return '30-60 min';
      return '1-2 hours';
    } else {
      // AC: ~20-30% per hour
      const hoursNeeded = batteryNeeded / 25;
      if (hoursNeeded < 1) return '30-60 min';
      return `${Math.ceil(hoursNeeded)}-${Math.ceil(hoursNeeded) + 1} hours`;
    }
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(currentBattery: number, station: EVStation): number {
    const avgPrice = this.getAveragePrice(station);
    const targetBattery = currentBattery < 50 ? 80 : 95;
    const batteryNeeded = targetBattery - currentBattery;
    
    // Estimate: 50 kWh battery, so 1% = 0.5 kWh
    const kwhNeeded = batteryNeeded * 0.5;
    return kwhNeeded * avgPrice;
  }

  /**
   * Get average price from station
   */
  private getAveragePrice(station: EVStation): number {
    const prices = station.connectors
      ?.map(c => c.price_per_kwh)
      .filter((p): p is number => typeof p === 'number') || [];
    
    if (prices.length === 0) return 8; // Default to ₹8/kWh
    
    const sum = prices.reduce((a, b) => a + b, 0);
    return Math.round((sum / prices.length) * 100) / 100;
  }

  /**
   * Get emergency recommendations
   */
  async getEmergencyRecommendations(userLocation: { latitude: number; longitude: number }) {
    const criteria: RecommendationCriteria = {
      batteryLevel: 10, // Very critical
      urgency: 'urgent',
      preferences: {
        distance: true,
        speed: false,
        price: false,
        amenities: false,
      },
      userLocation,
    };

    return this.getPersonalizedRecommendations(criteria);
  }

  /**
   * Get price-optimized recommendations
   */
  async getCheapestRecommendations(userLocation: { latitude: number; longitude: number }) {
    const criteria: RecommendationCriteria = {
      batteryLevel: 50,
      urgency: 'later',
      preferences: {
        distance: false,
        speed: false,
        price: true,
        amenities: false,
      },
      userLocation,
    };

    return this.getPersonalizedRecommendations(criteria);
  }
}

export default RecommendationEngine;

