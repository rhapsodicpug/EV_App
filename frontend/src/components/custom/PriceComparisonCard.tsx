/**
 * Price Comparison Card
 * Shows price comparisons between stations and time-based pricing
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DollarSign, TrendingDown, TrendingUp, Clock, Zap } from 'lucide-react-native';

export interface PriceData {
  stationName: string;
  currentPrice: number;
  offPeakPrice: number;
  savings: number;
  bestTime: string;
}

interface PriceComparisonCardProps {
  prices: PriceData[];
  onSelectTime?: (time: string) => void;
}

const PriceComparisonCard: React.FC<PriceComparisonCardProps> = ({ prices, onSelectTime }) => {
  if (!prices || prices.length === 0) {
    return null;
  }

  const cheapest = prices.reduce((min, p) => p.currentPrice < min.currentPrice ? p : min);
  const savings = prices.reduce((max, p) => p.savings > max ? p.savings : max, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DollarSign size={20} color="#8cd279" />
        <Text style={styles.title}>Price Comparison</Text>
      </View>

      {/* Price Savings Alert */}
      {savings > 0 && (
        <View style={styles.savingsAlert}>
          <TrendingDown size={16} color="#10B981" />
          <Text style={styles.savingsText}>
            Save up to ₹{savings} by charging at off-peak hours!
          </Text>
        </View>
      )}

      {/* Current vs Off-Peak Pricing */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionTitle}>Current Peak Rate vs Off-Peak</Text>
        
        {prices.map((price, index) => (
          <View key={index} style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.stationName}>{price.stationName}</Text>
              {index === prices.findIndex(p => p.savings === savings) && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>Best Deal</Text>
                </View>
              )}
            </View>
            
            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Peak Rate</Text>
                <Text style={styles.currentPrice}>₹{price.currentPrice}/kWh</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Off-Peak</Text>
                <Text style={styles.offPeakPrice}>₹{price.offPeakPrice}/kWh</Text>
              </View>
            </View>
            
            {price.savings > 0 && (
              <View style={styles.savingsRow}>
                <TrendingDown size={14} color="#10B981" />
                <Text style={styles.savingsAmount}>
                  Save ₹{price.savings} if you wait until {price.bestTime}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Time Slots */}
      <View style={styles.timeSlotsSection}>
        <Text style={styles.sectionTitle}>Pricing Throughout the Day</Text>
        <View style={styles.timeGrid}>
          {['6 AM', '12 PM', '6 PM', '10 PM', '12 AM'].map((time, index) => (
            <TouchableOpacity
              key={time}
              style={styles.timeSlot}
              onPress={() => onSelectTime?.(time)}
            >
              <Clock size={16} color="#8cd279" />
              <Text style={styles.timeText}>{time}</Text>
              <Text style={styles.timePrice}>
                ₹{index < 2 ? 8 - index : 5.5}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommendation */}
      <View style={styles.recommendationBox}>
        <Zap size={18} color="#8cd279" />
        <View style={styles.recommendationContent}>
          <Text style={styles.recommendationTitle}>💡 Smart Tip</Text>
          <Text style={styles.recommendationText}>
            Charge at {cheapest.bestTime} to save ₹{cheapest.savings} today!
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.bookLaterButton}>
          <Clock size={16} color="#8cd279" />
          <Text style={styles.bookLaterText}>Book at Cheapest Time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookNowButton}>
          <Zap size={16} color="#000000" />
          <Text style={styles.bookNowText}>Book Now Anyway</Text>
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
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  savingsAlert: {
    backgroundColor: '#103A1A',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  savingsText: {
    flex: 1,
    fontSize: 13,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '600',
  },
  pricingSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bestBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  offPeakPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#103A1A',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  savingsAmount: {
    flex: 1,
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  timeSlotsSection: {
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  timeText: {
    fontSize: 11,
    color: '#B0B0B0',
    marginTop: 4,
  },
  timePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  recommendationBox: {
    backgroundColor: '#3A4A3A',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 10,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8cd279',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#B0B0B0',
    lineHeight: 16,
  },
  actionButtons: {
    gap: 10,
  },
  bookLaterButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8cd279',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bookLaterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
    marginLeft: 6,
  },
  bookNowButton: {
    backgroundColor: '#8cd279',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bookNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 6,
  },
});

export default PriceComparisonCard;

