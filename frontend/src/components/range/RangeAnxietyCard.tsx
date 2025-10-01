/**
 * Range Anxiety Card Component
 * Displays range information and anxiety level
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Battery, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { useRangeAnxiety } from '../../contexts/RangeAnxietyContext';

interface RangeAnxietyCardProps {
  currentBattery: number;
  destination?: string;
  onPress?: () => void;
  showDetails?: boolean;
}

const RangeAnxietyCard: React.FC<RangeAnxietyCardProps> = ({ 
  currentBattery, 
  destination,
  onPress, 
  showDetails = true 
}) => {
  const { vehicleSpecs, calculateCurrentRange, getRangeAnxietyLevel } = useRangeAnxiety();

  if (!vehicleSpecs) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading range data...</Text>
        </View>
      </View>
    );
  }

  const currentRange = calculateCurrentRange(currentBattery);
  const anxietyLevel = getRangeAnxietyLevel(currentRange, 200); // Default 200km requirement

  const getAnxietyColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#B0B0B0';
    }
  };

  const getAnxietyIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle size={20} color="#10B981" />;
      case 'medium': return <Info size={20} color="#F59E0B" />;
      case 'high': return <AlertTriangle size={20} color="#EF4444" />;
      default: return <Info size={20} color="#B0B0B0" />;
    }
  };

  const getAnxietyMessage = (level: string) => {
    switch (level) {
      case 'low': return 'Range looks good for most trips';
      case 'medium': return 'Consider charging before long trips';
      case 'high': return 'Low battery - charge soon';
      default: return 'Range status unknown';
    }
  };

  const CardContent = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Battery size={24} color={getAnxietyColor(anxietyLevel)} />
          <Text style={styles.title}>Range Status</Text>
        </View>
        {getAnxietyIcon(anxietyLevel)}
      </View>

      {/* Current Range */}
      <View style={styles.rangeSection}>
        <Text style={[styles.rangeValue, { color: getAnxietyColor(anxietyLevel) }]}>
          {currentRange.toFixed(0)} km
        </Text>
        <Text style={styles.rangeLabel}>Available Range</Text>
        <Text style={styles.batteryPercentage}>{currentBattery}% battery</Text>
      </View>

      {/* Anxiety Level */}
      <View style={styles.anxietySection}>
        <View style={[styles.anxietyBadge, { backgroundColor: getAnxietyColor(anxietyLevel) + '20' }]}>
          <Text style={[styles.anxietyText, { color: getAnxietyColor(anxietyLevel) }]}>
            {anxietyLevel.toUpperCase()} ANXIETY
          </Text>
        </View>
        <Text style={styles.anxietyMessage}>{getAnxietyMessage(anxietyLevel)}</Text>
      </View>

      {/* Destination Info */}
      {destination && (
        <View style={styles.destinationSection}>
          <MapPin size={16} color="#8cd279" />
          <Text style={styles.destinationText}>{destination}</Text>
        </View>
      )}

      {/* Details */}
      {showDetails && (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Max Range</Text>
            <Text style={styles.detailValue}>{vehicleSpecs.maxRange} km</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Efficiency</Text>
            <Text style={styles.detailValue}>{vehicleSpecs.efficiency} km/kWh</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Battery Capacity</Text>
            <Text style={styles.detailValue}>{vehicleSpecs.batteryCapacity} kWh</Text>
          </View>
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

  rangeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },

  rangeValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },

  rangeLabel: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  batteryPercentage: {
    fontSize: 14,
    color: '#8cd279',
    marginTop: 4,
  },

  anxietySection: {
    alignItems: 'center',
    marginBottom: 16,
  },

  anxietyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },

  anxietyText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  anxietyMessage: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
  },

  destinationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },

  destinationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },

  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    paddingTop: 16,
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
});

export default RangeAnxietyCard;
