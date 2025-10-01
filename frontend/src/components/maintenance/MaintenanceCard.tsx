/**
 * Maintenance Card Component
 * Displays maintenance information and alerts
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Calendar,
  TrendingUp,
  Battery,
  Car,
  Thermometer,
  Cpu
} from 'lucide-react-native';
import { usePredictiveMaintenance } from '../../contexts/PredictiveMaintenanceContext';

interface MaintenanceCardProps {
  onPress?: () => void;
  showAlerts?: boolean;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ 
  onPress, 
  showAlerts = true 
}) => {
  const { vehicleHealth, alerts, getMaintenanceStats } = usePredictiveMaintenance();

  if (!vehicleHealth) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading maintenance data...</Text>
        </View>
      </View>
    );
  }

  const stats = getMaintenanceStats();
  const urgentAlerts = alerts.filter(alert => alert.priority === 'urgent' || alert.priority === 'high');
  const upcomingAlerts = alerts.filter(alert => alert.priority === 'medium' || alert.priority === 'low');

  const getHealthColor = (health: number) => {
    if (health >= 90) return '#10B981'; // Green
    if (health >= 80) return '#F59E0B'; // Yellow
    if (health >= 70) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) return <CheckCircle size={20} color="#10B981" />;
    if (health >= 80) return <CheckCircle size={20} color="#F59E0B" />;
    if (health >= 70) return <AlertTriangle size={20} color="#F97316" />;
    return <AlertTriangle size={20} color="#EF4444" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'battery': return <Battery size={16} color="#8cd279" />;
      case 'tires': return <Car size={16} color="#F59E0B" />;
      case 'brakes': return <AlertTriangle size={16} color="#EF4444" />;
      case 'cooling': return <Thermometer size={16} color="#3B82F6" />;
      case 'software': return <Cpu size={16} color="#8B5CF6" />;
      default: return <Wrench size={16} color="#B0B0B0" />;
    }
  };

  const CardContent = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Wrench size={24} color={getHealthColor(vehicleHealth.overallHealth)} />
          <Text style={styles.title}>Vehicle Maintenance</Text>
        </View>
        {getHealthIcon(vehicleHealth.overallHealth)}
      </View>

      {/* Overall Health */}
      <View style={styles.healthSection}>
        <Text style={[styles.healthPercentage, { color: getHealthColor(vehicleHealth.overallHealth) }]}>
          {vehicleHealth.overallHealth}%
        </Text>
        <Text style={styles.healthLabel}>Overall Health</Text>
      </View>

      {/* Health Breakdown */}
      <View style={styles.healthBreakdown}>
        <View style={styles.healthItem}>
          <Battery size={16} color="#8cd279" />
          <Text style={styles.healthItemLabel}>Battery</Text>
          <Text style={styles.healthItemValue}>{vehicleHealth.batteryHealth}%</Text>
        </View>
        <View style={styles.healthItem}>
          <Car size={16} color="#F59E0B" />
          <Text style={styles.healthItemLabel}>Tires</Text>
          <Text style={styles.healthItemValue}>{vehicleHealth.tireHealth}%</Text>
        </View>
        <View style={styles.healthItem}>
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.healthItemLabel}>Brakes</Text>
          <Text style={styles.healthItemValue}>{vehicleHealth.brakeHealth}%</Text>
        </View>
        <View style={styles.healthItem}>
          <Thermometer size={16} color="#3B82F6" />
          <Text style={styles.healthItemLabel}>Cooling</Text>
          <Text style={styles.healthItemValue}>{vehicleHealth.coolingHealth}%</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.overdueItems}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.upcomingItems}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#8cd279' }]}>₹{stats.totalCost}</Text>
          <Text style={styles.statLabel}>Est. Cost</Text>
        </View>
      </View>

      {/* Alerts */}
      {showAlerts && (urgentAlerts.length > 0 || upcomingAlerts.length > 0) && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>Maintenance Alerts</Text>
          
          {urgentAlerts.slice(0, 2).map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <AlertTriangle size={16} color="#EF4444" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            </View>
          ))}
          
          {upcomingAlerts.slice(0, 1).map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <Clock size={16} color="#F59E0B" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },

  loadingText: {
    color: '#B0B0B0',
    fontSize: 14,
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  healthSection: {
    alignItems: 'center',
    marginBottom: 20,
  },

  healthPercentage: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },

  healthLabel: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  healthBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },

  healthItem: {
    alignItems: 'center',
  },

  healthItemLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
  },

  healthItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },

  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },

  alertsSection: {
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    paddingTop: 16,
  },

  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  alertContent: {
    flex: 1,
    marginLeft: 8,
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  alertMessage: {
    fontSize: 12,
    color: '#B0B0B0',
    lineHeight: 16,
  },
});

export default MaintenanceCard;
