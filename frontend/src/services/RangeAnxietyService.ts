/**
 * Range Anxiety Assistant Service
 * Provides route planning, charging stops, and range calculations
 */

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
}

export interface ChargingStop {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // km from start
  chargingSpeed: 'slow' | 'fast' | 'rapid';
  estimatedTime: number; // minutes
  cost: number; // estimated cost
  amenities: string[];
  availability: 'available' | 'busy' | 'full';
}

export interface RoutePlan {
  id: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  currentBattery: number; // percentage
  requiredBattery: number; // percentage needed
  chargingStops: ChargingStop[];
  routePolyline: string; // encoded polyline
  isFeasible: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  suggestions: string[];
}

export interface VehicleSpecs {
  batteryCapacity: number; // kWh
  efficiency: number; // km/kWh
  maxRange: number; // km at 100%
  fastChargingCapability: boolean;
  chargingCurve: {
    soc: number; // state of charge percentage
    power: number; // kW
  }[];
}

export interface RangeCalculation {
  currentRange: number; // km
  requiredRange: number; // km
  safetyMargin: number; // km
  isFeasible: boolean;
  confidence: number; // 0-1
}

class RangeAnxietyService {
  private static instance: RangeAnxietyService;
  private vehicleSpecs: VehicleSpecs | null = null;

  static getInstance(): RangeAnxietyService {
    if (!RangeAnxietyService.instance) {
      RangeAnxietyService.instance = new RangeAnxietyService();
    }
    return RangeAnxietyService.instance;
  }

  /**
   * Initialize vehicle specifications
   */
  async initializeVehicleSpecs(vehicleId: string): Promise<VehicleSpecs> {
    try {
      // In a real app, this would fetch from your backend
      const specs: VehicleSpecs = {
        batteryCapacity: 75.2, // kWh
        efficiency: 6.5, // km/kWh
        maxRange: 489, // km
        fastChargingCapability: true,
        chargingCurve: [
          { soc: 0, power: 150 },
          { soc: 20, power: 150 },
          { soc: 50, power: 120 },
          { soc: 80, power: 80 },
          { soc: 90, power: 40 },
          { soc: 100, power: 20 },
        ],
      };

      this.vehicleSpecs = specs;
      return specs;
    } catch (error) {
      console.error('Failed to initialize vehicle specs:', error);
      throw error;
    }
  }

  /**
   * Calculate current range based on battery percentage
   */
  calculateCurrentRange(batteryPercentage: number): number {
    if (!this.vehicleSpecs) {
      throw new Error('Vehicle specs not initialized');
    }

    return (this.vehicleSpecs.maxRange * batteryPercentage) / 100;
  }

  /**
   * Calculate required range for a trip
   */
  calculateRequiredRange(startPoint: RoutePoint, endPoint: RoutePoint): Promise<number> {
    return new Promise((resolve) => {
      // In a real app, this would use a routing service like Google Maps
      // For now, we'll use a simple distance calculation
      const distance = this.calculateDistance(startPoint, endPoint);
      
      // Add 20% safety margin
      const requiredRange = distance * 1.2;
      resolve(requiredRange);
    });
  }

  /**
   * Plan a route with charging stops
   */
  async planRoute(
    startPoint: RoutePoint,
    endPoint: RoutePoint,
    currentBattery: number
  ): Promise<RoutePlan> {
    if (!this.vehicleSpecs) {
      throw new Error('Vehicle specs not initialized');
    }

    const totalDistance = this.calculateDistance(startPoint, endPoint);
    const currentRange = this.calculateCurrentRange(currentBattery);
    const requiredRange = await this.calculateRequiredRange(startPoint, endPoint);

    // Check if trip is feasible
    const isFeasible = currentRange >= requiredRange;
    
    // Find charging stops if needed
    const chargingStops = isFeasible ? [] : await this.findChargingStops(
      startPoint,
      endPoint,
      currentRange,
      requiredRange
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(currentRange, requiredRange, chargingStops.length);

    // Generate warnings and suggestions
    const warnings = this.generateWarnings(currentRange, requiredRange, chargingStops);
    const suggestions = this.generateSuggestions(currentRange, requiredRange, chargingStops);

    return {
      id: `route_${Date.now()}`,
      startPoint,
      endPoint,
      totalDistance,
      estimatedDuration: totalDistance * 1.5, // Rough estimate: 1.5 minutes per km
      currentBattery,
      requiredBattery: (requiredRange / this.vehicleSpecs.maxRange) * 100,
      chargingStops,
      routePolyline: '', // Would be populated by routing service
      isFeasible,
      confidence,
      warnings,
      suggestions,
    };
  }

  /**
   * Find optimal charging stops along the route
   */
  private async findChargingStops(
    startPoint: RoutePoint,
    endPoint: RoutePoint,
    currentRange: number,
    requiredRange: number
  ): Promise<ChargingStop[]> {
    // In a real app, this would query your charging station database
    // For now, we'll return mock data
    const stops: ChargingStop[] = [];

    if (currentRange < requiredRange) {
      // Find charging stops at optimal intervals
      const interval = currentRange * 0.8; // Stop at 80% of current range
      let distance = 0;

      while (distance < this.calculateDistance(startPoint, endPoint)) {
        distance += interval;
        
        if (distance < this.calculateDistance(startPoint, endPoint)) {
          stops.push({
            id: `stop_${stops.length + 1}`,
            name: `Charging Station ${stops.length + 1}`,
            address: `Station Address ${stops.length + 1}`,
            coordinates: {
              latitude: startPoint.latitude + (distance / 1000) * 0.01,
              longitude: startPoint.longitude + (distance / 1000) * 0.01,
            },
            distance,
            chargingSpeed: 'fast',
            estimatedTime: 30,
            cost: 15.50,
            amenities: ['Restaurant', 'WiFi', 'Restroom'],
            availability: 'available',
          });
        }
      }
    }

    return stops;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate confidence level for the route
   */
  private calculateConfidence(currentRange: number, requiredRange: number, stopCount: number): 'high' | 'medium' | 'low' {
    const rangeRatio = currentRange / requiredRange;
    
    if (rangeRatio >= 1.2 && stopCount === 0) return 'high';
    if (rangeRatio >= 0.8 && stopCount <= 2) return 'medium';
    return 'low';
  }

  /**
   * Generate warnings for the route
   */
  private generateWarnings(currentRange: number, requiredRange: number, stops: ChargingStop[]): string[] {
    const warnings: string[] = [];

    if (currentRange < requiredRange) {
      warnings.push('Insufficient range for direct trip');
    }

    if (stops.length > 3) {
      warnings.push('Multiple charging stops required');
    }

    if (stops.some(stop => stop.availability !== 'available')) {
      warnings.push('Some charging stations may be busy');
    }

    return warnings;
  }

  /**
   * Generate suggestions for the route
   */
  private generateSuggestions(currentRange: number, requiredRange: number, stops: ChargingStop[]): string[] {
    const suggestions: string[] = [];

    if (currentRange < requiredRange) {
      suggestions.push('Consider charging before departure');
      suggestions.push('Plan for charging stops along the route');
    }

    if (stops.length > 0) {
      suggestions.push('Book charging slots in advance');
      suggestions.push('Check station availability before departure');
    }

    suggestions.push('Monitor battery usage during the trip');
    suggestions.push('Have backup charging options ready');

    return suggestions;
  }

  /**
   * Get range anxiety level
   */
  getRangeAnxietyLevel(currentRange: number, requiredRange: number): 'low' | 'medium' | 'high' {
    const ratio = currentRange / requiredRange;
    
    if (ratio >= 1.5) return 'low';
    if (ratio >= 1.0) return 'medium';
    return 'high';
  }

  /**
   * Get charging time estimate
   */
  getChargingTimeEstimate(currentSoc: number, targetSoc: number, chargingSpeed: 'slow' | 'fast' | 'rapid'): number {
    if (!this.vehicleSpecs) {
      throw new Error('Vehicle specs not initialized');
    }

    const socDifference = targetSoc - currentSoc;
    const energyNeeded = (socDifference / 100) * this.vehicleSpecs.batteryCapacity;

    // Average charging power based on speed
    const chargingPower = {
      slow: 7, // kW
      fast: 22, // kW
      rapid: 50, // kW
    };

    // Convert to minutes
    return (energyNeeded / chargingPower[chargingSpeed]) * 60;
  }

  /**
   * Get optimal charging strategy
   */
  getOptimalChargingStrategy(currentSoc: number, targetSoc: number): {
    recommendedSpeed: 'slow' | 'fast' | 'rapid';
    estimatedTime: number;
    cost: number;
    efficiency: number;
  } {
    const socDifference = targetSoc - currentSoc;
    
    // Recommend charging speed based on SOC difference
    let recommendedSpeed: 'slow' | 'fast' | 'rapid';
    if (socDifference <= 20) {
      recommendedSpeed = 'slow';
    } else if (socDifference <= 50) {
      recommendedSpeed = 'fast';
    } else {
      recommendedSpeed = 'rapid';
    }

    const estimatedTime = this.getChargingTimeEstimate(currentSoc, targetSoc, recommendedSpeed);
    
    // Rough cost calculation (would be more sophisticated in real app)
    const cost = (socDifference / 100) * 15; // $15 per 100% charge
    
    // Efficiency based on charging speed (slower = more efficient)
    const efficiency = {
      slow: 0.95,
      fast: 0.90,
      rapid: 0.85,
    };

    return {
      recommendedSpeed,
      estimatedTime,
      cost,
      efficiency: efficiency[recommendedSpeed],
    };
  }
}

export default RangeAnxietyService;
