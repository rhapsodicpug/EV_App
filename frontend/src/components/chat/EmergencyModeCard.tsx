/**
 * Emergency Mode Card
 * Displays when battery is critical
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, MapPin, Zap } from 'lucide-react-native';
import { PersonalizedRecommendation } from '../../services/RecommendationEngine';

interface EmergencyModeCardProps {
  batteryLevel: number;
  recommendations: PersonalizedRecommendation[];
  onBookStation: (station: PersonalizedRecommendation) => void;
  onShowAll: () => void;
}

const EmergencyModeCard: React.FC<EmergencyModeCardProps> = ({
  batteryLevel,
  recommendations,
  onBookStation,
  onShowAll,
}) => {
  const topRecommendation = recommendations[0];

  if (!topRecommendation) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Warning Header */}
      <View style={styles.warningHeader}>
        <AlertTriangle size={24} color="#EF4444" />
        <Text style={styles.warningTitle}>🚨 Emergency: Low Battery</Text>
        <Text style={styles.warningSubtitle}>
          Your battery is at {batteryLevel}% - Charge immediately
        </Text>
      </View>

      {/* Top Recommendation */}
      <View style={styles.stationCard}>
        <View style={styles.stationHeader}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color="#8cd279" />
          </View>
          <View style={styles.stationInfo}>
            <Text style={styles.stationName}>{topRecommendation.name}</Text>
            <Text style={styles.stationAddress}>
              {topRecommendation.address || 'Location: ' + (topRecommendation.location?.coordinates ? 
                `${topRecommendation.location.coordinates[1]}, ${topRecommendation.location.coordinates[0]}` : 'Available')}
            </Text>
          </View>
        </View>

        <View style={styles.stationDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Distance:</Text>
            <Text style={styles.detailValue}>{topRecommendation.distance_km || 'Unknown'} km away</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⚡ Speed:</Text>
            <Text style={styles.detailValue}>DC Fast available</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Est. Cost:</Text>
            <Text style={styles.detailValue}>₹{topRecommendation.estimatedCost}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Time:</Text>
            <Text style={styles.detailValue}>{topRecommendation.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.recommendationBox}>
          <Zap size={16} color="#8cd279" />
          <Text style={styles.recommendationText}>
            {topRecommendation.whyRecommended}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onBookStation(topRecommendation)}
          >
            <Text style={styles.primaryButtonText}>🚗 Book & Navigate</Text>
          </TouchableOpacity>
          {recommendations.length > 1 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onShowAll}
            >
              <Text style={styles.secondaryButtonText}>
                View {recommendations.length - 1} more options
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  warningHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 8,
  },
  warningSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
    textAlign: 'center',
  },
  stationCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A4A4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  stationDetails: {
    marginTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recommendationBox: {
    backgroundColor: '#3A4A3A',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#8cd279',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#8cd279',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8cd279',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8cd279',
  },
});

export default EmergencyModeCard;

