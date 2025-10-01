/**
 * Dynamic Pricing Service
 * Provides real-time pricing information and dynamic rate updates
 */

export interface PricingRule {
  id: string;
  name: string;
  type: 'time_based' | 'demand_based' | 'seasonal' | 'peak_hours' | 'weekend';
  conditions: PricingCondition[];
  multiplier: number; // Price multiplier (1.0 = normal price)
  isActive: boolean;
  priority: number; // Higher number = higher priority
  description: string;
}

export interface PricingCondition {
  field: 'hour' | 'day' | 'month' | 'demand' | 'occupancy';
  operator: 'equals' | 'between' | 'greater_than' | 'less_than';
  value: any;
}

export interface StationPricing {
  stationId: string;
  stationName: string;
  basePrice: number; // Base price per kWh
  currentPrice: number; // Current price per kWh
  pricingRules: PricingRule[];
  lastUpdated: string;
  nextUpdate: string;
  demandLevel: 'low' | 'medium' | 'high';
  occupancyRate: number; // 0-100
  peakHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  offPeakHours: {
    start: string;
    end: string;
  };
}

export interface PriceHistory {
  timestamp: string;
  price: number;
  demandLevel: string;
  occupancyRate: number;
}

export interface PricingAlert {
  id: string;
  type: 'price_drop' | 'price_rise' | 'peak_hours' | 'off_peak' | 'special_offer';
  title: string;
  message: string;
  currentPrice: number;
  previousPrice: number;
  savings?: number;
  stationId: string;
  stationName: string;
  validUntil?: string;
  actionText?: string;
  actionUrl?: string;
}

export interface DynamicPricingContext {
  currentTime: string;
  currentDay: string;
  currentMonth: string;
  demandLevel: 'low' | 'medium' | 'high';
  occupancyRate: number;
  weatherCondition?: string;
  specialEvents?: string[];
}

class DynamicPricingService {
  private static instance: DynamicPricingService;
  private pricingRules: PricingRule[] = [];
  private stationsPricing: Map<string, StationPricing> = new Map();
  private priceHistory: Map<string, PriceHistory[]> = new Map();
  private alerts: PricingAlert[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): DynamicPricingService {
    if (!DynamicPricingService.instance) {
      DynamicPricingService.instance = new DynamicPricingService();
    }
    return DynamicPricingService.instance;
  }

  /**
   * Initialize dynamic pricing system
   */
  async initialize(): Promise<void> {
    try {
      await this.loadPricingRules();
      await this.initializeStationsPricing();
      this.startPriceUpdates();
    } catch (error) {
      console.error('Failed to initialize dynamic pricing:', error);
      throw error;
    }
  }

  /**
   * Load pricing rules (mock implementation)
   */
  private async loadPricingRules(): Promise<void> {
    const rules: PricingRule[] = [
      {
        id: 'peak_hours_morning',
        name: 'Morning Peak Hours',
        type: 'peak_hours',
        conditions: [
          { field: 'hour', operator: 'between', value: [7, 10] }
        ],
        multiplier: 1.2,
        isActive: true,
        priority: 10,
        description: 'Higher rates during morning commute hours',
      },
      {
        id: 'peak_hours_evening',
        name: 'Evening Peak Hours',
        type: 'peak_hours',
        conditions: [
          { field: 'hour', operator: 'between', value: [17, 20] }
        ],
        multiplier: 1.3,
        isActive: true,
        priority: 10,
        description: 'Higher rates during evening commute hours',
      },
      {
        id: 'weekend_discount',
        name: 'Weekend Discount',
        type: 'weekend',
        conditions: [
          { field: 'day', operator: 'equals', value: 'weekend' }
        ],
        multiplier: 0.85,
        isActive: true,
        priority: 5,
        description: 'Discounted rates on weekends',
      },
      {
        id: 'high_demand',
        name: 'High Demand',
        type: 'demand_based',
        conditions: [
          { field: 'demand', operator: 'equals', value: 'high' }
        ],
        multiplier: 1.4,
        isActive: true,
        priority: 15,
        description: 'Increased rates during high demand periods',
      },
      {
        id: 'low_demand',
        name: 'Low Demand',
        type: 'demand_based',
        conditions: [
          { field: 'demand', operator: 'equals', value: 'low' }
        ],
        multiplier: 0.8,
        isActive: true,
        priority: 8,
        description: 'Reduced rates during low demand periods',
      },
      {
        id: 'night_discount',
        name: 'Night Time Discount',
        type: 'time_based',
        conditions: [
          { field: 'hour', operator: 'between', value: [22, 6] }
        ],
        multiplier: 0.7,
        isActive: true,
        priority: 12,
        description: 'Discounted rates during night hours',
      },
    ];

    this.pricingRules = rules;
  }

  /**
   * Initialize station pricing data (mock implementation)
   */
  private async initializeStationsPricing(): Promise<void> {
    const stations = [
      {
        id: 'station_1',
        name: 'Downtown Charging Hub',
        basePrice: 0.35,
        demandLevel: 'medium',
        occupancyRate: 65,
        peakHours: { start: '07:00', end: '10:00' },
        offPeakHours: { start: '22:00', end: '06:00' },
      },
      {
        id: 'station_2',
        name: 'Airport Charging Station',
        basePrice: 0.45,
        demandLevel: 'high',
        occupancyRate: 85,
        peakHours: { start: '17:00', end: '20:00' },
        offPeakHours: { start: '02:00', end: '06:00' },
      },
      {
        id: 'station_3',
        name: 'Mall Charging Point',
        basePrice: 0.30,
        demandLevel: 'low',
        occupancyRate: 30,
        peakHours: { start: '12:00', end: '14:00' },
        offPeakHours: { start: '22:00', end: '06:00' },
      },
    ];

    stations.forEach(station => {
      const pricing = this.calculateStationPricing(station);
      this.stationsPricing.set(station.id, pricing);

      // Initialize price history
      const history: PriceHistory[] = [];
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i);
        history.push({
          timestamp: timestamp.toISOString(),
          price: pricing.currentPrice + (Math.random() - 0.5) * 0.1,
          demandLevel: pricing.demandLevel,
          occupancyRate: pricing.occupancyRate + (Math.random() - 0.5) * 20,
        });
      }
      this.priceHistory.set(station.id, history);
    });
  }

  /**
   * Calculate current pricing for a station
   */
  private calculateStationPricing(station: any): StationPricing {
    const context = this.getCurrentContext();
    let finalMultiplier = 1.0;

    // Apply pricing rules in priority order
    const applicableRules = this.pricingRules
      .filter(rule => rule.isActive && this.checkRuleConditions(rule, context))
      .sort((a, b) => b.priority - a.priority);

    applicableRules.forEach(rule => {
      finalMultiplier *= rule.multiplier;
    });

    const currentPrice = station.basePrice * finalMultiplier;

    return {
      stationId: station.id,
      stationName: station.name,
      basePrice: station.basePrice,
      currentPrice,
      pricingRules: applicableRules,
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 60000).toISOString(), // Update every minute
      demandLevel: station.demandLevel,
      occupancyRate: station.occupancyRate,
      peakHours: station.peakHours,
      offPeakHours: station.offPeakHours,
    };
  }

  /**
   * Check if pricing rule conditions are met
   */
  private checkRuleConditions(rule: PricingRule, context: DynamicPricingContext): boolean {
    return rule.conditions.every(condition => {
      switch (condition.field) {
        case 'hour':
          const currentHour = parseInt(context.currentTime.split(':')[0]);
          if (condition.operator === 'between') {
            const [start, end] = condition.value;
            return currentHour >= start && currentHour <= end;
          }
          break;
        case 'day':
          if (condition.operator === 'equals') {
            return context.currentDay === condition.value;
          }
          break;
        case 'demand':
          if (condition.operator === 'equals') {
            return context.demandLevel === condition.value;
          }
          break;
      }
      return false;
    });
  }

  /**
   * Get current pricing context
   */
  private getCurrentContext(): DynamicPricingContext {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();

    let currentTime = `${hour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let currentDay = 'weekday';
    let demandLevel: 'low' | 'medium' | 'high' = 'medium';

    // Determine day type
    if (day === 0 || day === 6) {
      currentDay = 'weekend';
    }

    // Determine demand level based on time and day
    if (currentDay === 'weekend') {
      demandLevel = 'low';
    } else if (hour >= 7 && hour <= 10) {
      demandLevel = 'high'; // Morning commute
    } else if (hour >= 17 && hour <= 20) {
      demandLevel = 'high'; // Evening commute
    } else if (hour >= 22 || hour <= 6) {
      demandLevel = 'low'; // Night time
    }

    return {
      currentTime,
      currentDay,
      currentMonth: month.toString(),
      demandLevel,
      occupancyRate: 50, // This would come from real-time data
    };
  }

  /**
   * Get current pricing for a station
   */
  getStationPricing(stationId: string): StationPricing | null {
    return this.stationsPricing.get(stationId) || null;
  }

  /**
   * Get pricing for all stations
   */
  getAllStationsPricing(): StationPricing[] {
    return Array.from(this.stationsPricing.values());
  }

  /**
   * Get price history for a station
   */
  getPriceHistory(stationId: string, hours: number = 24): PriceHistory[] {
    const history = this.priceHistory.get(stationId) || [];
    return history.slice(-hours);
  }

  /**
   * Get pricing alerts
   */
  getPricingAlerts(): PricingAlert[] {
    return this.alerts.sort((a, b) => 
      new Date(b.validUntil || b.createdAt).getTime() - new Date(a.validUntil || a.createdAt).getTime()
    );
  }

  /**
   * Check for pricing changes and create alerts
   */
  private checkPricingChanges(): void {
    this.stationsPricing.forEach((pricing, stationId) => {
      const history = this.priceHistory.get(stationId) || [];
      const latestPrice = history[history.length - 1]?.price || pricing.currentPrice;
      const currentPrice = pricing.currentPrice;

      if (currentPrice < latestPrice * 0.8) {
        // Price drop
        this.createPricingAlert({
          type: 'price_drop',
          title: 'Price Drop Alert',
          message: `Great news! Charging rates at ${pricing.stationName} have dropped by ${(1 - currentPrice/latestPrice) * 100}.1f%.`,
          currentPrice,
          previousPrice: latestPrice,
          savings: latestPrice - currentPrice,
          stationId,
          stationName: pricing.stationName,
          validUntil: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          actionText: 'Book Now',
          actionUrl: `/stations/${stationId}`,
        });
      } else if (currentPrice > latestPrice * 1.2) {
        // Price rise
        this.createPricingAlert({
          type: 'price_rise',
          title: 'Price Increase',
          message: `Charging rates at ${pricing.stationName} have increased by ${(currentPrice/latestPrice - 1) * 100}.1f%.`,
          currentPrice,
          previousPrice: latestPrice,
          stationId,
          stationName: pricing.stationName,
          validUntil: new Date(Date.now() + 3600000).toISOString(),
        });
      }

      // Check for off-peak hours
      if (this.isOffPeakTime(pricing)) {
        this.createPricingAlert({
          type: 'off_peak',
          title: 'Off-Peak Hours',
          message: `It's off-peak time at ${pricing.stationName}! Enjoy discounted rates.`,
          currentPrice,
          previousPrice: pricing.basePrice * 1.2,
          savings: (pricing.basePrice * 1.2) - currentPrice,
          stationId,
          stationName: pricing.stationName,
          validUntil: this.getOffPeakEndTime(pricing),
          actionText: 'Charge Now',
          actionUrl: `/stations/${stationId}`,
        });
      }
    });
  }

  /**
   * Create pricing alert
   */
  private createPricingAlert(alert: Omit<PricingAlert, 'id' | 'createdAt'>): void {
    const newAlert: PricingAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...alert,
    };

    this.alerts.unshift(newAlert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  /**
   * Check if current time is off-peak
   */
  private isOffPeakTime(pricing: StationPricing): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return currentTime >= pricing.offPeakHours.start && currentTime <= pricing.offPeakHours.end;
  }

  /**
   * Get off-peak end time
   */
  private getOffPeakEndTime(pricing: StationPricing): string {
    const endTime = new Date();
    const [hours, minutes] = pricing.offPeakHours.end.split(':');
    endTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return endTime.toISOString();
  }

  /**
   * Start automatic price updates
   */
  private startPriceUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateAllStationPricing();
      this.checkPricingChanges();
    }, 60000); // Update every minute
  }

  /**
   * Update pricing for all stations
   */
  private updateAllStationPricing(): void {
    this.stationsPricing.forEach((pricing, stationId) => {
      // Update occupancy rate (simulate real-time changes)
      const occupancyChange = (Math.random() - 0.5) * 10;
      const newOccupancy = Math.max(0, Math.min(100, pricing.occupancyRate + occupancyChange));

      // Recalculate pricing with new context
      const updatedPricing = {
        ...pricing,
        occupancyRate: newOccupancy,
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + 60000).toISOString(),
      };

      // Recalculate current price based on new occupancy
      const baseMultiplier = updatedPricing.pricingRules.reduce((acc, rule) => acc * rule.multiplier, 1.0);
      const occupancyMultiplier = 1 + (newOccupancy / 100) * 0.3; // Up to 30% increase at 100% occupancy
      updatedPricing.currentPrice = updatedPricing.basePrice * baseMultiplier * occupancyMultiplier;

      this.stationsPricing.set(stationId, updatedPricing);

      // Update price history
      const history = this.priceHistory.get(stationId) || [];
      history.push({
        timestamp: new Date().toISOString(),
        price: updatedPricing.currentPrice,
        demandLevel: updatedPricing.demandLevel,
        occupancyRate: newOccupancy,
      });

      // Keep only last 24 hours
      if (history.length > 1440) {
        this.priceHistory.set(stationId, history.slice(-1440));
      }
    });
  }

  /**
   * Get best pricing options
   */
  getBestPricingOptions(): StationPricing[] {
    const allPricing = this.getAllStationsPricing();
    return allPricing
      .sort((a, b) => a.currentPrice - b.currentPrice)
      .slice(0, 5);
  }

  /**
   * Get pricing statistics
   */
  getPricingStats(): {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    priceRange: number;
    totalStations: number;
  } {
    const allPricing = this.getAllStationsPricing();
    const prices = allPricing.map(p => p.currentPrice);

    return {
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      priceRange: Math.max(...prices) - Math.min(...prices),
      totalStations: allPricing.length,
    };
  }

  /**
   * Predict future pricing
   */
  predictPricing(stationId: string, hoursAhead: number = 24): { time: string; predictedPrice: number }[] {
    const station = this.stationsPricing.get(stationId);
    if (!station) return [];

    const predictions = [];
    const now = new Date();

    for (let i = 1; i <= hoursAhead; i++) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const context = {
        currentTime: `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`,
        currentDay: futureTime.getDay() === 0 || futureTime.getDay() === 6 ? 'weekend' : 'weekday',
        currentMonth: futureTime.getMonth().toString(),
        demandLevel: this.predictDemandLevel(futureTime),
        occupancyRate: station.occupancyRate + (Math.random() - 0.5) * 20,
      };

      const multiplier = this.calculateMultiplier(context);
      const predictedPrice = station.basePrice * multiplier;

      predictions.push({
        time: futureTime.toISOString(),
        predictedPrice,
      });
    }

    return predictions;
  }

  /**
   * Predict demand level for future time
   */
  private predictDemandLevel(time: Date): 'low' | 'medium' | 'high' {
    const hour = time.getHours();
    const day = time.getDay();

    if (day === 0 || day === 6) return 'low';
    if (hour >= 7 && hour <= 10) return 'high';
    if (hour >= 17 && hour <= 20) return 'high';
    if (hour >= 22 || hour <= 6) return 'low';
    return 'medium';
  }

  /**
   * Calculate price multiplier for context
   */
  private calculateMultiplier(context: DynamicPricingContext): number {
    let multiplier = 1.0;

    // Apply pricing rules
    const applicableRules = this.pricingRules
      .filter(rule => rule.isActive && this.checkRuleConditions(rule, context))
      .sort((a, b) => b.priority - a.priority);

    applicableRules.forEach(rule => {
      multiplier *= rule.multiplier;
    });

    // Apply occupancy factor
    multiplier *= 1 + (context.occupancyRate / 100) * 0.3;

    return multiplier;
  }

  /**
   * Stop price updates
   */
  stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get pricing rules
   */
  getPricingRules(): PricingRule[] {
    return this.pricingRules;
  }

  /**
   * Update pricing rule
   */
  updatePricingRule(ruleId: string, updates: Partial<PricingRule>): void {
    const index = this.pricingRules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.pricingRules[index] = { ...this.pricingRules[index], ...updates };
    }
  }
}

export default DynamicPricingService;
