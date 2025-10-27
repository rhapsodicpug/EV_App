/**
 * Range Calculator
 * Calculates battery range, safety distances, and charging needs
 */

export interface RangeEstimate {
  conservative: number;
  normal: number;
  maximum: number;
  unit: 'km' | 'miles';
}

export interface ChargingPlan {
  currentBattery: number;
  targetBattery: number;
  batteryNeeded: number;
  estimatedTime: string;
  estimatedCost: number;
}

export interface TripAnalysis {
  routeDistance: number;
  currentRange: number;
  canReach: boolean;
  shortage: number;
  recommendedStops: Array<{
    stationName: string;
    location: string;
    chargeFrom: number;
    chargeTo: number;
    estimatedCost: number;
    estimatedTime: number;
  }>;
  totalTime: number;
  totalCost: number;
}

class RangeCalculator {
  private static instance: RangeCalculator;
  
  // Average kWh per km for common EVs
  private readonly AVERAGE_CONSUMPTION = 0.2; // kWh per km
  
  // Battery capacity for typical EV
  private readonly TYPICAL_BATTERY_CAPACITY = 50; // kWh

  static getInstance(): RangeCalculator {
    if (!RangeCalculator.instance) {
      RangeCalculator.instance = new RangeCalculator();
    }
    return RangeCalculator.instance;
  }

  /**
   * Calculate range estimate based on battery level
   */
  calculateRange(batteryLevel: number, batteryCapacity: number = this.TYPICAL_BATTERY_CAPACITY): RangeEstimate {
    const availableEnergy = (batteryLevel / 100) * batteryCapacity;
    
    // Conservative: city driving with AC on
    const conservative = availableEnergy / 0.25;
    
    // Normal: mixed driving
    const normal = availableEnergy / 0.20;
    
    // Maximum: highway driving with no AC
    const maximum = availableEnergy / 0.18;

    return {
      conservative: Math.round(conservative),
      normal: Math.round(normal),
      maximum: Math.round(maximum),
      unit: 'km',
    };
  }

  /**
   * Calculate if user can reach a destination
   */
  canReachDestination(
    batteryLevel: number,
    destinationDistance: number
  ): boolean {
    const range = this.calculateRange(batteryLevel);
    
    // Use conservative estimate for safety
    return range.conservative >= destinationDistance;
  }

  /**
   * Get safety margin for current battery
   */
  getSafetyMargin(batteryLevel: number): {
    safe: boolean;
    margin: number;
    recommendation: string;
  } {
    if (batteryLevel >= 50) {
      return {
        safe: true,
        margin: batteryLevel - 50,
        recommendation: 'You have plenty of charge',
      };
    }
    
    if (batteryLevel >= 30) {
      return {
        safe: true,
        margin: batteryLevel - 30,
        recommendation: 'Consider charging soon',
      };
    }
    
    if (batteryLevel >= 20) {
      return {
        safe: false,
        margin: batteryLevel - 20,
        recommendation: '⚠️ Low battery! Find charging nearby',
      };
    }
    
    return {
      safe: false,
      margin: batteryLevel,
      recommendation: '🚨 Critical battery! Charge immediately',
    };
  }

  /**
   * Calculate minimum charge needed for trip
   */
  calculateMinChargeNeeded(batteryLevel: number, tripDistance: number): number {
    const currentRange = this.calculateRange(batteryLevel).conservative;
    
    if (currentRange >= tripDistance) {
      return 0; // Already have enough
    }
    
    const shortage = tripDistance - currentRange;
    const percentageNeeded = (shortage / this.calculateRange(100).conservative) * 100;
    
    return Math.ceil(percentageNeeded) + 10; // Add 10% safety buffer
  }

  /**
   * Create charging plan
   */
  createChargingPlan(
    currentBattery: number,
    targetBattery: number,
    pricePerKwh: number
  ): ChargingPlan {
    const batteryNeeded = targetBattery - currentBattery;
    const energyNeeded = (batteryNeeded / 100) * this.TYPICAL_BATTERY_CAPACITY;
    
    // Estimate time (assume DC fast charging at 50kW)
    const minutes = (energyNeeded / 50) * 60;
    const estimatedTime = minutes < 30 
      ? 'Less than 30 minutes'
      : minutes < 60
      ? '30-60 minutes'
      : `${Math.ceil(minutes / 60)}-${Math.ceil(minutes / 60) + 1} hours`;
    
    const estimatedCost = energyNeeded * pricePerKwh;
    
    return {
      currentBattery,
      targetBattery,
      batteryNeeded,
      estimatedTime,
      estimatedCost: Math.round(estimatedCost),
    };
  }

  /**
   * Analyze trip and suggest charging stops
   */
  analyzeTrip(
    batteryLevel: number,
    tripDistance: number,
    availableStations: Array<{
      name: string;
      location: string;
      distance: number; // Distance from current location
      pricePerKwh: number;
      hasDCFast: boolean;
    }>
  ): TripAnalysis {
    const range = this.calculateRange(batteryLevel);
    const canReach = range.conservative >= tripDistance;
    const shortage = Math.max(0, tripDistance - range.conservative);
    
    if (canReach) {
      return {
        routeDistance: tripDistance,
        currentRange: range.conservative,
        canReach: true,
        shortage: 0,
        recommendedStops: [],
        totalTime: 0,
        totalCost: 0,
      };
    }
    
    // Need charging stops
    let distanceRemaining = tripDistance;
    let currentBattery = batteryLevel;
    const recommendedStops = [];
    let totalCost = 0;
    let totalTime = 0;
    
    for (const station of availableStations.sort((a, b) => a.distance - b.distance)) {
      if (distanceRemaining <= 0) break;
      
      // Calculate how much to charge
      const batteryAfterCharge = Math.min(90, currentBattery + 40); // Charge to 90% or add 40%
      const chargingBattery = batteryAfterCharge - currentBattery;
      
      const plan = this.createChargingPlan(currentBattery, batteryAfterCharge, station.pricePerKwh);
      
      recommendedStops.push({
        stationName: station.name,
        location: station.location,
        chargeFrom: currentBattery,
        chargeTo: batteryAfterCharge,
        estimatedCost: plan.estimatedCost,
        estimatedTime: plan.estimatedTime === 'Less than 30 minutes' ? 15 : 
                        plan.estimatedTime === '30-60 minutes' ? 45 : 90,
      });
      
      totalCost += plan.estimatedCost;
      totalTime += recommendedStops[recommendedStops.length - 1].estimatedTime;
      
      // Update state
      currentBattery = batteryAfterCharge;
      const newRange = this.calculateRange(currentBattery);
      distanceRemaining = Math.max(0, distanceRemaining - newRange.normal);
    }
    
    return {
      routeDistance: tripDistance,
      currentRange: range.conservative,
      canReach: false,
      shortage,
      recommendedStops,
      totalTime,
      totalCost,
    };
  }

  /**
   * Get charging recommendations based on battery level
   */
  getChargingRecommendations(batteryLevel: number): {
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestedActions: string[];
  } {
    if (batteryLevel >= 70) {
      return {
        priority: 'low',
        message: 'Battery is in good condition',
        suggestedActions: [
          'You can wait to charge',
          'Consider off-peak hours for cheaper rates',
        ],
      };
    }
    
    if (batteryLevel >= 50) {
      return {
        priority: 'low',
        message: 'Battery is at moderate level',
        suggestedActions: [
          'Consider charging soon',
          'You can drive comfortably for short distances',
        ],
      };
    }
    
    if (batteryLevel >= 30) {
      return {
        priority: 'medium',
        message: 'Battery is getting low',
        suggestedActions: [
          'Find nearby charging station',
          'Consider charging before long trips',
          'Plan your route to include charging stops',
        ],
      };
    }
    
    if (batteryLevel >= 20) {
      return {
        priority: 'high',
        message: '⚠️ Low battery warning!',
        suggestedActions: [
          'Find nearest charging station immediately',
          'Avoid long drives',
          'Conserve battery: turn off AC, drive slowly',
        ],
      };
    }
    
    return {
      priority: 'critical',
      message: '🚨 Critical battery! Charge immediately',
      suggestedActions: [
        'Navigate to nearest station NOW',
        'Switch to emergency mode',
        'Don\'t make unnecessary trips',
      ],
    };
  }
}

export default RangeCalculator;

