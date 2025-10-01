/**
 * Battery Health Monitoring Service
 * Tracks battery degradation, health predictions, and provides insights
 */

export interface BatteryHealthData {
  currentCapacity: number; // Current capacity in kWh
  originalCapacity: number; // Original capacity when new
  healthPercentage: number; // Battery health percentage
  cycleCount: number; // Number of charge cycles
  lastCalibration: string; // Last calibration date
  degradationRate: number; // Monthly degradation rate
  predictedLifespan: number; // Predicted lifespan in months
  temperatureImpact: number; // Temperature impact on health
  chargingPatternImpact: number; // Impact of charging patterns
}

export interface BatteryInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ChargingSession {
  id: string;
  startTime: string;
  endTime: string;
  startBattery: number;
  endBattery: number;
  chargingSpeed: 'slow' | 'fast' | 'rapid';
  temperature: number;
  duration: number; // in minutes
}

class BatteryHealthService {
  private static instance: BatteryHealthService;
  private healthData: BatteryHealthData | null = null;
  private chargingHistory: ChargingSession[] = [];

  static getInstance(): BatteryHealthService {
    if (!BatteryHealthService.instance) {
      BatteryHealthService.instance = new BatteryHealthService();
    }
    return BatteryHealthService.instance;
  }

  /**
   * Initialize battery health monitoring for a vehicle
   */
  async initializeBatteryHealth(vehicleId: string): Promise<BatteryHealthData> {
    try {
      // In a real app, this would fetch from your backend
      const healthData: BatteryHealthData = {
        currentCapacity: 75.2, // kWh
        originalCapacity: 82.0, // kWh
        healthPercentage: 91.7,
        cycleCount: 1247,
        lastCalibration: new Date().toISOString(),
        degradationRate: 0.8, // % per month
        predictedLifespan: 84, // months
        temperatureImpact: 2.3, // % impact
        chargingPatternImpact: 1.8, // % impact
      };

      this.healthData = healthData;
      return healthData;
    } catch (error) {
      console.error('Failed to initialize battery health:', error);
      throw error;
    }
  }

  /**
   * Get current battery health data
   */
  getBatteryHealth(): BatteryHealthData | null {
    return this.healthData;
  }

  /**
   * Calculate battery health based on charging patterns
   */
  calculateHealthFromCharging(chargingSessions: ChargingSession[]): BatteryHealthData {
    if (!this.healthData) {
      throw new Error('Battery health not initialized');
    }

    const totalSessions = chargingSessions.length;
    const fastChargingSessions = chargingSessions.filter(s => s.chargingSpeed === 'rapid').length;
    const highTempSessions = chargingSessions.filter(s => s.temperature > 35).length;
    
    // Calculate impact factors
    const fastChargingImpact = (fastChargingSessions / totalSessions) * 5; // 5% max impact
    const temperatureImpact = (highTempSessions / totalSessions) * 3; // 3% max impact
    
    // Calculate degradation
    const monthlyDegradation = 0.5 + fastChargingImpact + temperatureImpact;
    const currentHealth = Math.max(50, this.healthData.healthPercentage - monthlyDegradation);
    
    return {
      ...this.healthData,
      healthPercentage: currentHealth,
      degradationRate: monthlyDegradation,
      temperatureImpact: temperatureImpact,
      chargingPatternImpact: fastChargingImpact,
    };
  }

  /**
   * Get battery health insights and recommendations
   */
  getBatteryInsights(): BatteryInsight[] {
    if (!this.healthData) {
      return [];
    }

    const insights: BatteryInsight[] = [];

    // Health percentage insights
    if (this.healthData.healthPercentage < 80) {
      insights.push({
        type: 'warning',
        title: 'Battery Health Low',
        message: `Your battery health is at ${this.healthData.healthPercentage.toFixed(1)}%. Consider battery replacement soon.`,
        action: 'Schedule Service',
        priority: 'high',
      });
    } else if (this.healthData.healthPercentage < 90) {
      insights.push({
        type: 'info',
        title: 'Battery Health Good',
        message: `Your battery health is at ${this.healthData.healthPercentage.toFixed(1)}%. Continue current charging habits.`,
        priority: 'medium',
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Excellent Battery Health',
        message: `Your battery health is at ${this.healthData.healthPercentage.toFixed(1)}%. Keep up the great work!`,
        priority: 'low',
      });
    }

    // Degradation rate insights
    if (this.healthData.degradationRate > 1.5) {
      insights.push({
        type: 'warning',
        title: 'High Degradation Rate',
        message: 'Your battery is degrading faster than average. Consider slower charging speeds.',
        action: 'Optimize Charging',
        priority: 'high',
      });
    }

    // Temperature impact insights
    if (this.healthData.temperatureImpact > 2) {
      insights.push({
        type: 'info',
        title: 'Temperature Impact',
        message: 'High temperature charging detected. Try charging during cooler hours.',
        action: 'Schedule Charging',
        priority: 'medium',
      });
    }

    // Charging pattern insights
    if (this.healthData.chargingPatternImpact > 3) {
      insights.push({
        type: 'info',
        title: 'Fast Charging Impact',
        message: 'Frequent fast charging detected. Mix with slower charging for better health.',
        action: 'Balance Charging',
        priority: 'medium',
      });
    }

    return insights;
  }

  /**
   * Predict battery health for future dates
   */
  predictBatteryHealth(monthsAhead: number): number {
    if (!this.healthData) {
      return 0;
    }

    const currentHealth = this.healthData.healthPercentage;
    const degradationRate = this.healthData.degradationRate;
    const predictedHealth = currentHealth - (degradationRate * monthsAhead);
    
    return Math.max(0, predictedHealth);
  }

  /**
   * Get optimal charging recommendations
   */
  getChargingRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.healthData) {
      if (this.healthData.healthPercentage < 85) {
        recommendations.push('Use slower charging speeds (AC) when possible');
        recommendations.push('Avoid charging above 90% regularly');
        recommendations.push('Don\'t let battery drop below 20%');
      }

      if (this.healthData.temperatureImpact > 2) {
        recommendations.push('Charge during cooler hours (early morning/late evening)');
        recommendations.push('Park in shaded areas when possible');
      }

      if (this.healthData.chargingPatternImpact > 3) {
        recommendations.push('Limit rapid charging to essential trips only');
        recommendations.push('Use fast charging for 20-80% range');
      }
    }

    return recommendations;
  }

  /**
   * Record a charging session for health tracking
   */
  recordChargingSession(session: ChargingSession): void {
    this.chargingHistory.push(session);
    
    // Keep only last 100 sessions
    if (this.chargingHistory.length > 100) {
      this.chargingHistory = this.chargingHistory.slice(-100);
    }

    // Recalculate health if we have enough data
    if (this.chargingHistory.length >= 10) {
      this.healthData = this.calculateHealthFromCharging(this.chargingHistory);
    }
  }

  /**
   * Get charging history
   */
  getChargingHistory(): ChargingSession[] {
    return this.chargingHistory;
  }

  /**
   * Get battery health trends over time
   */
  getHealthTrends(): { date: string; health: number }[] {
    // In a real app, this would fetch historical data
    const trends = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const health = this.predictBatteryHealth(i);
      trends.push({
        date: date.toISOString().split('T')[0],
        health: Math.max(0, health),
      });
    }
    
    return trends;
  }
}

export default BatteryHealthService;
