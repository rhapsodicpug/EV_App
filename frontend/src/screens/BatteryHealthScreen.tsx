/**
 * Battery Health Screen
 * Comprehensive battery health monitoring and insights
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { ArrowLeft, TrendingUp, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBatteryHealth } from '../contexts/BatteryHealthContext';
import BatteryHealthCard from '../components/battery/BatteryHealthCard';

const { width } = Dimensions.get('window');

const BatteryHealthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    healthData, 
    insights, 
    getChargingRecommendations, 
    predictHealth, 
    getHealthTrends 
  } = useBatteryHealth();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y'>('6m');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getTimeframeMonths = (timeframe: string) => {
    switch (timeframe) {
      case '3m': return 3;
      case '6m': return 6;
      case '1y': return 12;
      default: return 6;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} color="#EF4444" />;
      case 'info': return <Info size={20} color="#F59E0B" />;
      case 'success': return <CheckCircle size={20} color="#10B981" />;
      default: return <Info size={20} color="#F59E0B" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return '#EF4444';
      case 'info': return '#F59E0B';
      case 'success': return '#10B981';
      default: return '#F59E0B';
    }
  };

  const predictedHealth = predictHealth(getTimeframeMonths(selectedTimeframe));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battery Health</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Battery Health Overview */}
        <BatteryHealthCard showInsights={false} />

        {/* Health Prediction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Prediction</Text>
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <TrendingUp size={24} color="#8cd279" />
              <Text style={styles.predictionTitle}>Projected Health</Text>
            </View>
            
            <View style={styles.timeframeSelector}>
              {(['3m', '6m', '1y'] as const).map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.timeframeButtonActive
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe)}
                >
                  <Text style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe && styles.timeframeTextActive
                  ]}>
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.predictionValue}>
              <Text style={styles.predictionPercentage}>
                {predictedHealth.toFixed(1)}%
              </Text>
              <Text style={styles.predictionLabel}>
                in {selectedTimeframe === '3m' ? '3 months' : 
                    selectedTimeframe === '6m' ? '6 months' : '1 year'}
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  {getInsightIcon(insight.type)}
                  <Text style={[styles.insightTitle, { color: getInsightColor(insight.type) }]}>
                    {insight.title}
                  </Text>
                </View>
                <Text style={styles.insightMessage}>{insight.message}</Text>
                {insight.action && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{insight.action}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Charging Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Charging Recommendations</Text>
          <View style={styles.recommendationsCard}>
            {getChargingRecommendations().map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Trends</Text>
          <View style={styles.trendsCard}>
            <View style={styles.trendsHeader}>
              <Calendar size={20} color="#8cd279" />
              <Text style={styles.trendsTitle}>12-Month Trend</Text>
            </View>
            <View style={styles.trendsChart}>
              {getHealthTrends().map((trend, index) => (
                <View key={index} style={styles.trendBar}>
                  <View 
                    style={[
                      styles.trendBarFill,
                      { 
                        height: `${(trend.health / 100) * 60}%`,
                        backgroundColor: trend.health >= 90 ? '#10B981' : 
                                       trend.health >= 80 ? '#F59E0B' : '#EF4444'
                      }
                    ]}
                  />
                  <Text style={styles.trendLabel}>
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  predictionCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  timeframeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
  },

  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  timeframeButtonActive: {
    backgroundColor: '#8cd279',
  },

  timeframeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B0B0B0',
  },

  timeframeTextActive: {
    color: '#000000',
    fontWeight: '600',
  },

  predictionValue: {
    alignItems: 'center',
  },

  predictionPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8cd279',
    marginBottom: 4,
  },

  predictionLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },

  insightCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  insightMessage: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: '#8cd279',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },

  recommendationsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  recommendationText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  trendsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  trendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  trendsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },

  trendBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },

  trendBarFill: {
    width: '100%',
    borderRadius: 2,
    marginBottom: 8,
  },

  trendLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    textAlign: 'center',
  },
});

export default BatteryHealthScreen;
