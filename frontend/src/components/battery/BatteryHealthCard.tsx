/**
 * Battery Health Card Component
 * Displays battery health information and insights
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Battery, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { useBatteryHealth } from '../../contexts/BatteryHealthContext';

interface BatteryHealthCardProps {
  onPress?: () => void;
  showInsights?: boolean;
}

const BatteryHealthCard: React.FC<BatteryHealthCardProps> = ({ 
  onPress, 
  showInsights = true 
}) => {
  const { healthData, insights, isLoading } = useBatteryHealth();

  if (isLoading || !healthData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading battery health...</Text>
        </View>
      </View>
    );
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return '#10B981'; // Green
    if (health >= 80) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) return <CheckCircle size={20} color="#10B981" />;
    if (health >= 80) return <Info size={20} color="#F59E0B" />;
    return <AlertTriangle size={20} color="#EF4444" />;
  };

  const getHealthStatus = (health: number) => {
    if (health >= 90) return 'Excellent';
    if (health >= 80) return 'Good';
    if (health >= 70) return 'Fair';
    return 'Poor';
  };

  const CardContent = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Battery size={24} color={getHealthColor(healthData.healthPercentage)} />
          <Text style={styles.title}>Battery Health</Text>
        </View>
        {getHealthIcon(healthData.healthPercentage)}
      </View>

      {/* Health Percentage */}
      <View style={styles.healthSection}>
        <Text style={[styles.healthPercentage, { color: getHealthColor(healthData.healthPercentage) }]}>
          {healthData.healthPercentage.toFixed(1)}%
        </Text>
        <Text style={styles.healthStatus}>{getHealthStatus(healthData.healthPercentage)}</Text>
      </View>

      {/* Health Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Capacity</Text>
          <Text style={styles.detailValue}>{healthData.currentCapacity} kWh</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Original Capacity</Text>
          <Text style={styles.detailValue}>{healthData.originalCapacity} kWh</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Charge Cycles</Text>
          <Text style={styles.detailValue}>{healthData.cycleCount.toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Degradation Rate</Text>
          <View style={styles.degradationContainer}>
            <TrendingDown size={16} color="#EF4444" />
            <Text style={styles.degradationValue}>{healthData.degradationRate.toFixed(1)}%/month</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {showInsights && insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Insights</Text>
          {insights.slice(0, 2).map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              {insight.type === 'warning' && <AlertTriangle size={16} color="#EF4444" />}
              {insight.type === 'info' && <Info size={16} color="#F59E0B" />}
              {insight.type === 'success' && <CheckCircle size={16} color="#10B981" />}
              <Text style={styles.insightText}>{insight.message}</Text>
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

  healthStatus: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  detailsSection: {
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },

  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  degradationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  degradationValue: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 4,
  },

  insightsSection: {
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    paddingTop: 16,
  },

  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  insightText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default BatteryHealthCard;
