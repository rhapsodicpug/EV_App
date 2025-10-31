/**
 * Trip Planner Service
 * Handles trip calculations, battery estimates, and route planning
 */

import { MumbaiLocation } from '../constants/mumbaiLocations';

export interface BatteryConsumption {
  kWh: number;
  percentage: number;
  description: string;
}

export interface TripPlan {
  startLocation: MumbaiLocation;
  endLocation: MumbaiLocation;
  distance: number; // km
  estimatedTime: number; // minutes
  batteryConsumption: {
    lowTraffic: BatteryConsumption;
    mediumTraffic: BatteryConsumption;
    highTraffic: BatteryConsumption;
  };
}

export interface StationWithDistance {
  station: any; // EVStation type
  distanceFromRoute: number; // km
  distanceFromStart: number; // km
}

class TripPlannerService {
  // Average EV consumption: 15 kWh per 100km
  private readonly BASE_CONSUMPTION_PER_100KM = 15;
  
  // Average vehicle battery capacity (can be customized per user vehicle)
  private readonly DEFAULT_BATTERY_CAPACITY = 50; // kWh
  
  // Traffic multipliers
  private readonly TRAFFIC_MULTIPLIERS = {
    low: 0.85,      // Highway/smooth traffic (efficient)
    medium: 1.0,    // Normal city traffic
    high: 1.35,     // Heavy traffic/stop-and-go
  };
  
  // Average speed by traffic condition (for time estimation)
  private readonly AVERAGE_SPEEDS = {
    low: 60,        // km/h
    medium: 35,     // km/h
    high: 20,       // km/h
  };

  /**
   * Calculate straight-line distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Add 25% for actual road distance (straight line vs actual roads)
    return distance * 1.25;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate battery consumption for a given distance and traffic condition
   */
  calculateBatteryConsumption(
    distance: number, 
    trafficLevel: 'low' | 'medium' | 'high',
    batteryCapacity: number = this.DEFAULT_BATTERY_CAPACITY
  ): BatteryConsumption {
    const multiplier = this.TRAFFIC_MULTIPLIERS[trafficLevel];
    const kWh = (distance / 100) * this.BASE_CONSUMPTION_PER_100KM * multiplier;
    const percentage = (kWh / batteryCapacity) * 100;
    
    let description = '';
    switch (trafficLevel) {
      case 'low':
        description = 'Smooth highway driving, optimal efficiency';
        break;
      case 'medium':
        description = 'Normal city traffic conditions';
        break;
      case 'high':
        description = 'Heavy traffic with frequent stops';
        break;
    }
    
    return {
      kWh: Math.round(kWh * 10) / 10,
      percentage: Math.round(percentage),
      description,
    };
  }

  /**
   * Calculate trip plan with all details
   */
  calculateTripPlan(
    startLocation: MumbaiLocation,
    endLocation: MumbaiLocation,
    batteryCapacity?: number
  ): TripPlan {
    const distance = this.calculateDistance(
      startLocation.lat,
      startLocation.lng,
      endLocation.lat,
      endLocation.lng
    );
    
    // Estimate time based on medium traffic
    const estimatedTime = Math.round((distance / this.AVERAGE_SPEEDS.medium) * 60);
    
    const capacity = batteryCapacity || this.DEFAULT_BATTERY_CAPACITY;
    
    return {
      startLocation,
      endLocation,
      distance: Math.round(distance * 10) / 10,
      estimatedTime,
      batteryConsumption: {
        lowTraffic: this.calculateBatteryConsumption(distance, 'low', capacity),
        mediumTraffic: this.calculateBatteryConsumption(distance, 'medium', capacity),
        highTraffic: this.calculateBatteryConsumption(distance, 'high', capacity),
      },
    };
  }

  /**
   * Find charging stations along the route
   * Returns stations within specified radius of the route
   */
  findStationsAlongRoute(
    startLocation: MumbaiLocation,
    endLocation: MumbaiLocation,
    allStations: any[],
    maxDistanceFromRoute: number = 5 // km
  ): StationWithDistance[] {
    const stationsWithDistance: StationWithDistance[] = [];
    
    // For simplicity, find stations between start and end coordinates
    const minLat = Math.min(startLocation.lat, endLocation.lat);
    const maxLat = Math.max(startLocation.lat, endLocation.lat);
    const minLng = Math.min(startLocation.lng, endLocation.lng);
    const maxLng = Math.max(startLocation.lng, endLocation.lng);
    
    allStations.forEach(station => {
      // Check if station is within bounding box
      if (
        station.latitude >= minLat - 0.05 &&
        station.latitude <= maxLat + 0.05 &&
        station.longitude >= minLng - 0.05 &&
        station.longitude <= maxLng + 0.05
      ) {
        // Calculate distance from start
        const distanceFromStart = this.calculateDistance(
          startLocation.lat,
          startLocation.lng,
          station.latitude,
          station.longitude
        );
        
        // Calculate perpendicular distance from route (simplified)
        const distanceFromEnd = this.calculateDistance(
          endLocation.lat,
          endLocation.lng,
          station.latitude,
          station.longitude
        );
        
        const routeDistance = this.calculateDistance(
          startLocation.lat,
          startLocation.lng,
          endLocation.lat,
          endLocation.lng
        );
        
        // Simplified check: if sum of distances to start and end is close to route distance
        const distanceFromRoute = (distanceFromStart + distanceFromEnd - routeDistance) / 2;
        
        if (distanceFromRoute <= maxDistanceFromRoute) {
          stationsWithDistance.push({
            station,
            distanceFromRoute: Math.round(distanceFromRoute * 10) / 10,
            distanceFromStart: Math.round(distanceFromStart * 10) / 10,
          });
        }
      }
    });
    
    // Sort by distance from start
    return stationsWithDistance.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
  }

  /**
   * Get time estimate for different traffic conditions
   */
  getTimeEstimates(distance: number): {
    lowTraffic: number;
    mediumTraffic: number;
    highTraffic: number;
  } {
    return {
      lowTraffic: Math.round((distance / this.AVERAGE_SPEEDS.low) * 60),
      mediumTraffic: Math.round((distance / this.AVERAGE_SPEEDS.medium) * 60),
      highTraffic: Math.round((distance / this.AVERAGE_SPEEDS.high) * 60),
    };
  }

  /**
   * Check if trip is feasible with current battery level
   */
  isTripFeasible(
    currentBatteryPercentage: number,
    requiredBatteryPercentage: number,
    bufferPercentage: number = 10
  ): { feasible: boolean; message: string } {
    const totalRequired = requiredBatteryPercentage + bufferPercentage;
    
    if (currentBatteryPercentage >= totalRequired) {
      return {
        feasible: true,
        message: `Trip is feasible with ${currentBatteryPercentage - totalRequired}% buffer remaining`,
      };
    } else {
      const deficit = totalRequired - currentBatteryPercentage;
      return {
        feasible: false,
        message: `Need ${deficit}% more battery. Consider charging before trip.`,
      };
    }
  }
}

export const tripPlannerService = new TripPlannerService();
export default tripPlannerService;

