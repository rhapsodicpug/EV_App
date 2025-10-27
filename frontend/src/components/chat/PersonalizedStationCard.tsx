/**
 * Personalized Station Card
 * Shows stations with personalized recommendations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Zap, DollarSign, Clock, CheckCircle, Star } from 'lucide-react-native';
import { PersonalizedRecommendation } from '../../services/RecommendationEngine';
import AnimatedButton from '../ui/AnimatedButton';

interface PersonalizedStationCardProps {
  recommendation: PersonalizedRecommendation;
  rank: number;
  onBook: (station: PersonalizedRecommendation) => void;
  onViewDetails: (station: PersonalizedRecommendation) => void;
}

const PersonalizedStationCard: React.FC<PersonalizedStationCardProps> = ({
  recommendation,
  rank,
  onBook,
  onViewDetails,
}) => {
  const rankColors = {
    1: '#8cd279', // First place
    2: '#3B82F6', // Second place
    3: '#F59E0B', // Third place
  };

  const rankIcon = rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <View style={styles.container}>
      {/* Rank Badge */}
      <View style={styles.rankContainer}>
        {rankIcon && <Text style={styles.rankIcon}>{rankIcon}</Text>}
        <Text style={[styles.rankText, { color: rankColors[rank as keyof typeof rankColors] || '#8cd279' }]}>
          #{rank}
        </Text>
      </View>

      {/* Station Info */}
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{recommendation.name}</Text>
        <Text style={styles.stationAddress}>
          {recommendation.address || 'Location available'}
        </Text>
      </View>

      {/* Why Recommended Box */}
      <View style={styles.recommendationBox}>
        <CheckCircle size={16} color="#8cd279" />
        <Text style={styles.recommendationText}>{recommendation.whyRecommended}</Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#8cd279" />
          <Text style={styles.detailValue}>{recommendation.distance_km || 'Unknown'} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Zap size={16} color="#8cd279" />
          <Text style={styles.detailValue}>DC Fast</Text>
        </View>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#8cd279" />
          <Text style={styles.detailValue}>₹{recommendation.estimatedCost}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color="#8cd279" />
          <Text style={styles.detailValue}>{recommendation.estimatedTime}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <AnimatedButton
          title="Book Now"
          onPress={() => onBook(recommendation)}
          variant="primary"
        />
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(recommendation)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3A3A3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stationInfo: {
    marginBottom: 12,
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
  recommendationBox: {
    backgroundColor: '#3A4A3A',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    color: '#8cd279',
    marginLeft: 6,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailValue: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8cd279',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
  },
});

export default PersonalizedStationCard;

