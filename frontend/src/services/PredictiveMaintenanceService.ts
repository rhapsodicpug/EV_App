/**
 * Predictive Maintenance Service
 * Monitors vehicle health and predicts maintenance needs
 */

export interface MaintenanceItem {
  id: string;
  name: string;
  category: 'battery' | 'tires' | 'brakes' | 'cooling' | 'software' | 'general';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  estimatedTime: number; // hours
  lastService: string;
  nextService: string;
  mileageInterval: number;
  timeInterval: number; // months
  isOverdue: boolean;
  confidence: number; // 0-1
}

export interface VehicleHealth {
  overallHealth: number; // 0-100
  batteryHealth: number;
  tireHealth: number;
  brakeHealth: number;
  coolingHealth: number;
  softwareHealth: number;
  lastUpdated: string;
}

export interface MaintenanceAlert {
  id: string;
  type: 'scheduled' | 'predictive' | 'overdue' | 'urgent';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  maintenanceItem: MaintenanceItem;
  predictedDate: string;
  confidence: number;
  isRead: boolean;
  createdAt: string;
}

export interface UsagePattern {
  dailyMileage: number;
  weeklyMileage: number;
  monthlyMileage: number;
  averageSpeed: number;
  chargingFrequency: number;
  fastChargingRatio: number;
  temperatureExposure: number;
  drivingStyle: 'conservative' | 'moderate' | 'aggressive';
}

export interface MaintenancePrediction {
  item: MaintenanceItem;
  predictedFailureDate: string;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  costImpact: 'low' | 'medium' | 'high';
}

class PredictiveMaintenanceService {
  private static instance: PredictiveMaintenanceService;
  private maintenanceItems: MaintenanceItem[] = [];
  private vehicleHealth: VehicleHealth | null = null;
  private usagePattern: UsagePattern | null = null;
  private alerts: MaintenanceAlert[] = [];

  static getInstance(): PredictiveMaintenanceService {
    if (!PredictiveMaintenanceService.instance) {
      PredictiveMaintenanceService.instance = new PredictiveMaintenanceService();
    }
    return PredictiveMaintenanceService.instance;
  }

  /**
   * Initialize predictive maintenance system
   */
  async initialize(vehicleId: string): Promise<void> {
    try {
      await this.loadMaintenanceItems();
      await this.loadVehicleHealth();
      await this.loadUsagePattern();
      await this.generatePredictions();
    } catch (error) {
      console.error('Failed to initialize predictive maintenance:', error);
      throw error;
    }
  }

  /**
   * Load maintenance items (mock implementation)
   */
  private async loadMaintenanceItems(): Promise<void> {
    const items: MaintenanceItem[] = [
      {
        id: 'battery_inspection',
        name: 'Battery System Inspection',
        category: 'battery',
        description: 'Comprehensive battery health check and calibration',
        priority: 'medium',
        estimatedCost: 150,
        estimatedTime: 2,
        lastService: '2024-01-15',
        nextService: '2024-07-15',
        mileageInterval: 10000,
        timeInterval: 6,
        isOverdue: false,
        confidence: 0.85,
      },
      {
        id: 'tire_rotation',
        name: 'Tire Rotation & Alignment',
        category: 'tires',
        description: 'Rotate tires and check alignment',
        priority: 'medium',
        estimatedCost: 80,
        estimatedTime: 1,
        lastService: '2024-02-01',
        nextService: '2024-08-01',
        mileageInterval: 8000,
        timeInterval: 6,
        isOverdue: false,
        confidence: 0.90,
      },
      {
        id: 'brake_inspection',
        name: 'Brake System Inspection',
        category: 'brakes',
        description: 'Check brake pads, rotors, and fluid',
        priority: 'high',
        estimatedCost: 200,
        estimatedTime: 2,
        lastService: '2023-12-01',
        nextService: '2024-06-01',
        mileageInterval: 15000,
        timeInterval: 6,
        isOverdue: false,
        confidence: 0.75,
      },
      {
        id: 'cooling_system',
        name: 'Cooling System Service',
        category: 'cooling',
        description: 'Check coolant levels and system integrity',
        priority: 'medium',
        estimatedCost: 120,
        estimatedTime: 1.5,
        lastService: '2024-01-01',
        nextService: '2024-07-01',
        mileageInterval: 12000,
        timeInterval: 6,
        isOverdue: false,
        confidence: 0.80,
      },
      {
        id: 'software_update',
        name: 'Software Update',
        category: 'software',
        description: 'Vehicle software and firmware updates',
        priority: 'low',
        estimatedCost: 0,
        estimatedTime: 0.5,
        lastService: '2024-03-01',
        nextService: '2024-06-01',
        mileageInterval: 0,
        timeInterval: 3,
        isOverdue: false,
        confidence: 0.95,
      },
    ];

    this.maintenanceItems = items;
  }

  /**
   * Load vehicle health data (mock implementation)
   */
  private async loadVehicleHealth(): Promise<void> {
    const health: VehicleHealth = {
      overallHealth: 87,
      batteryHealth: 91,
      tireHealth: 85,
      brakeHealth: 78,
      coolingHealth: 92,
      softwareHealth: 95,
      lastUpdated: new Date().toISOString(),
    };

    this.vehicleHealth = health;
  }

  /**
   * Load usage pattern data (mock implementation)
   */
  private async loadUsagePattern(): Promise<void> {
    const pattern: UsagePattern = {
      dailyMileage: 45,
      weeklyMileage: 315,
      monthlyMileage: 1350,
      averageSpeed: 35,
      chargingFrequency: 3.2,
      fastChargingRatio: 0.3,
      temperatureExposure: 25,
      drivingStyle: 'moderate',
    };

    this.usagePattern = pattern;
  }

  /**
   * Generate maintenance predictions
   */
  private async generatePredictions(): Promise<void> {
    const predictions: MaintenanceAlert[] = [];

    this.maintenanceItems.forEach(item => {
      const prediction = this.predictMaintenanceNeed(item);
      if (prediction) {
        predictions.push(prediction);
      }
    });

    this.alerts = predictions;
  }

  /**
   * Predict maintenance need for a specific item
   */
  private predictMaintenanceNeed(item: MaintenanceItem): MaintenanceAlert | null {
    const now = new Date();
    const nextServiceDate = new Date(item.nextService);
    const daysUntilService = Math.ceil((nextServiceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine alert type and priority
    let alertType: 'scheduled' | 'predictive' | 'overdue' | 'urgent';
    let priority: 'low' | 'medium' | 'high' | 'urgent';

    if (daysUntilService < 0) {
      alertType = 'overdue';
      priority = 'urgent';
    } else if (daysUntilService <= 7) {
      alertType = 'urgent';
      priority = 'high';
    } else if (daysUntilService <= 30) {
      alertType = 'scheduled';
      priority = 'medium';
    } else if (daysUntilService <= 60) {
      alertType = 'predictive';
      priority = 'low';
    } else {
      return null; // No alert needed
    }

    // Adjust based on usage pattern
    const adjustedPriority = this.adjustPriorityBasedOnUsage(item, priority);

    return {
      id: `alert_${item.id}_${Date.now()}`,
      type: alertType,
      title: this.getAlertTitle(item, alertType),
      message: this.getAlertMessage(item, daysUntilService),
      priority: adjustedPriority,
      maintenanceItem: item,
      predictedDate: nextServiceDate.toISOString(),
      confidence: item.confidence,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Adjust priority based on usage patterns
   */
  private adjustPriorityBasedOnUsage(item: MaintenanceItem, basePriority: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (!this.usagePattern) return basePriority as any;

    let adjustment = 0;

    // High mileage usage
    if (this.usagePattern.monthlyMileage > 2000) {
      adjustment += 1;
    }

    // Aggressive driving
    if (this.usagePattern.drivingStyle === 'aggressive') {
      adjustment += 1;
    }

    // High temperature exposure
    if (this.usagePattern.temperatureExposure > 30) {
      adjustment += 1;
    }

    // Frequent fast charging (for battery items)
    if (item.category === 'battery' && this.usagePattern.fastChargingRatio > 0.5) {
      adjustment += 1;
    }

    // Adjust priority
    const priorityLevels = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorityLevels.indexOf(basePriority);
    const newIndex = Math.min(currentIndex + adjustment, priorityLevels.length - 1);

    return priorityLevels[newIndex] as 'low' | 'medium' | 'high' | 'urgent';
  }

  /**
   * Get alert title
   */
  private getAlertTitle(item: MaintenanceItem, type: string): string {
    switch (type) {
      case 'overdue':
        return `Overdue: ${item.name}`;
      case 'urgent':
        return `Urgent: ${item.name}`;
      case 'scheduled':
        return `Scheduled: ${item.name}`;
      case 'predictive':
        return `Upcoming: ${item.name}`;
      default:
        return item.name;
    }
  }

  /**
   * Get alert message
   */
  private getAlertMessage(item: MaintenanceItem, daysUntilService: number): string {
    if (daysUntilService < 0) {
      return `This maintenance item is overdue by ${Math.abs(daysUntilService)} days. Please schedule service soon.`;
    } else if (daysUntilService === 0) {
      return 'This maintenance item is due today. Please schedule service.';
    } else if (daysUntilService <= 7) {
      return `This maintenance item is due in ${daysUntilService} days. Please schedule service soon.`;
    } else if (daysUntilService <= 30) {
      return `This maintenance item is due in ${daysUntilService} days. Consider scheduling service.`;
    } else {
      return `This maintenance item is due in ${daysUntilService} days. Plan ahead for service.`;
    }
  }

  /**
   * Get all maintenance alerts
   */
  getMaintenanceAlerts(): MaintenanceAlert[] {
    return this.alerts.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get vehicle health
   */
  getVehicleHealth(): VehicleHealth | null {
    return this.vehicleHealth;
  }

  /**
   * Get maintenance items
   */
  getMaintenanceItems(): MaintenanceItem[] {
    return this.maintenanceItems;
  }

  /**
   * Get usage pattern
   */
  getUsagePattern(): UsagePattern | null {
    return this.usagePattern;
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  /**
   * Get maintenance predictions
   */
  getMaintenancePredictions(): MaintenancePrediction[] {
    const predictions: MaintenancePrediction[] = [];

    this.maintenanceItems.forEach(item => {
      const prediction = this.generateMaintenancePrediction(item);
      predictions.push(prediction);
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate maintenance prediction for an item
   */
  private generateMaintenancePrediction(item: MaintenanceItem): MaintenancePrediction {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Analyze risk factors based on usage pattern
    if (this.usagePattern) {
      if (this.usagePattern.monthlyMileage > 2000) {
        riskFactors.push('High mileage usage');
        recommendations.push('Consider more frequent inspections');
      }

      if (this.usagePattern.drivingStyle === 'aggressive') {
        riskFactors.push('Aggressive driving style');
        recommendations.push('Drive more conservatively to extend component life');
      }

      if (this.usagePattern.temperatureExposure > 30) {
        riskFactors.push('High temperature exposure');
        recommendations.push('Park in shaded areas when possible');
      }

      if (item.category === 'battery' && this.usagePattern.fastChargingRatio > 0.5) {
        riskFactors.push('Frequent fast charging');
        recommendations.push('Use slower charging speeds when possible');
      }
    }

    // Calculate cost impact
    let costImpact: 'low' | 'medium' | 'high' = 'low';
    if (item.estimatedCost > 300) {
      costImpact = 'high';
    } else if (item.estimatedCost > 150) {
      costImpact = 'medium';
    }

    // Predict failure date (simplified calculation)
    const now = new Date();
    const nextServiceDate = new Date(item.nextService);
    const daysUntilService = Math.ceil((nextServiceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Adjust based on risk factors
    const riskAdjustment = riskFactors.length * 7; // 7 days per risk factor
    const predictedFailureDate = new Date(now.getTime() + (daysUntilService - riskAdjustment) * 24 * 60 * 60 * 1000);

    return {
      item,
      predictedFailureDate: predictedFailureDate.toISOString(),
      confidence: item.confidence,
      riskFactors,
      recommendations,
      costImpact,
    };
  }

  /**
   * Get maintenance statistics
   */
  getMaintenanceStats(): {
    totalItems: number;
    overdueItems: number;
    upcomingItems: number;
    totalCost: number;
    averageHealth: number;
  } {
    const totalItems = this.maintenanceItems.length;
    const overdueItems = this.maintenanceItems.filter(item => item.isOverdue).length;
    const upcomingItems = this.alerts.filter(alert => alert.type === 'scheduled' || alert.type === 'predictive').length;
    const totalCost = this.maintenanceItems.reduce((sum, item) => sum + item.estimatedCost, 0);
    const averageHealth = this.vehicleHealth ? this.vehicleHealth.overallHealth : 0;

    return {
      totalItems,
      overdueItems,
      upcomingItems,
      totalCost,
      averageHealth,
    };
  }

  /**
   * Update maintenance item
   */
  updateMaintenanceItem(itemId: string, updates: Partial<MaintenanceItem>): void {
    const index = this.maintenanceItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.maintenanceItems[index] = { ...this.maintenanceItems[index], ...updates };
      this.generatePredictions(); // Regenerate predictions
    }
  }

  /**
   * Add custom maintenance item
   */
  addMaintenanceItem(item: Omit<MaintenanceItem, 'id'>): MaintenanceItem {
    const newItem: MaintenanceItem = {
      id: `custom_${Date.now()}`,
      ...item,
    };

    this.maintenanceItems.push(newItem);
    this.generatePredictions(); // Regenerate predictions
    return newItem;
  }

  /**
   * Delete maintenance item
   */
  deleteMaintenanceItem(itemId: string): void {
    this.maintenanceItems = this.maintenanceItems.filter(item => item.id !== itemId);
    this.alerts = this.alerts.filter(alert => alert.maintenanceItem.id !== itemId);
  }
}

export default PredictiveMaintenanceService;
