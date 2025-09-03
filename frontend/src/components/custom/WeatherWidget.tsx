/**
 * Enhanced Weather Widget Component
 * Weather integration for EV charging planning
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer,
  Battery,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

const { width } = Dimensions.get('window');

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  windSpeed: number;
  chargingEfficiency: number;
  recommendation: string;
  isOptimal: boolean;
  nextOptimalTime?: string;
}

interface WeatherWidgetProps {
  data: WeatherData;
  onPress?: () => void;
  variant?: 'compact' | 'detailed' | 'full';
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  data,
  onPress,
  variant = 'detailed',
}) => {
  const { colors } = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (data.isOptimal) {
      // Pulse animation for optimal charging conditions
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [data.isOptimal]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return Sun;
      case 'cloudy':
        return Cloud;
      case 'rainy':
        return CloudRain;
      case 'stormy':
        return CloudRain;
      default:
        return Sun;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return Colors.semantic.success;
    if (efficiency >= 70) return Colors.semantic.warning;
    return Colors.semantic.error;
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 90) return CheckCircle;
    if (efficiency >= 70) return AlertTriangle;
    return Battery;
  };

  const WeatherIcon = getWeatherIcon(data.condition);
  const EfficiencyIcon = getEfficiencyIcon(data.chargingEfficiency);
  const efficiencyColor = getEfficiencyColor(data.chargingEfficiency);

  const dynamicStyles = {
    container: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: variant === 'compact' ? Spacing.md : Spacing.lg,
      marginBottom: Spacing.md,
      ...Elevation.level2,
      ...(data.isOptimal && {
        borderWidth: 2,
        borderColor: Colors.semantic.success,
        ...Elevation.level3,
      }),
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: variant === 'compact' ? Spacing.sm : Spacing.md,
    },
    title: {
      fontSize: variant === 'compact' ? 14 : 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    weatherIcon: {
      width: variant === 'compact' ? 32 : 40,
      height: variant === 'compact' ? 32 : 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary + '20',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    content: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    temperature: {
      fontSize: variant === 'compact' ? 20 : 24,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    details: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    detailRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.xs,
    },
    detailText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginLeft: Spacing.xs,
    },
    efficiencyBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: efficiencyColor + '20',
    },
    efficiencyText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: efficiencyColor,
      marginLeft: Spacing.xs,
    },
    recommendation: {
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    recommendationText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: 'italic' as const,
    },
    optimalIndicator: {
      position: 'absolute' as const,
      top: Spacing.sm,
      right: Spacing.sm,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.semantic.success,
    },
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={dynamicStyles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {data.isOptimal && (
          <Animated.View 
            style={[
              dynamicStyles.optimalIndicator,
              { transform: [{ scale: pulseAnim }] }
            ]} 
          />
        )}

        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Weather for Charging</Text>
          <View style={dynamicStyles.weatherIcon}>
            <WeatherIcon 
              size={variant === 'compact' ? 20 : 24} 
              color={colors.primary} 
            />
          </View>
        </View>

        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.temperature}>{data.temperature}°C</Text>
          
          <View style={dynamicStyles.details}>
            <View style={dynamicStyles.detailRow}>
              <Thermometer size={12} color={colors.text.secondary} />
              <Text style={dynamicStyles.detailText}>
                Humidity: {data.humidity}%
              </Text>
            </View>
            
            <View style={dynamicStyles.detailRow}>
              <Wind size={12} color={colors.text.secondary} />
              <Text style={dynamicStyles.detailText}>
                Wind: {data.windSpeed} km/h
              </Text>
            </View>
            
            <View style={dynamicStyles.efficiencyBadge}>
              <EfficiencyIcon size={12} color={efficiencyColor} />
              <Text style={dynamicStyles.efficiencyText}>
                {data.chargingEfficiency}% Efficiency
              </Text>
            </View>
          </View>
        </View>

        {variant !== 'compact' && (
          <View style={dynamicStyles.recommendation}>
            <Text style={dynamicStyles.recommendationText}>
              {data.recommendation}
            </Text>
            {data.nextOptimalTime && (
              <View style={dynamicStyles.detailRow}>
                <Clock size={12} color={colors.text.secondary} />
                <Text style={dynamicStyles.detailText}>
                  Next optimal time: {data.nextOptimalTime}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mock weather data generator
export const generateMockWeather = (): WeatherData => {
  const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'] as const;
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temperature = Math.floor(Math.random() * 30) + 10;
  const humidity = Math.floor(Math.random() * 40) + 40;
  const windSpeed = Math.floor(Math.random() * 20) + 5;
  const chargingEfficiency = Math.floor(Math.random() * 30) + 70;
  const isOptimal = chargingEfficiency >= 85;

  let recommendation = '';
  if (isOptimal) {
    recommendation = 'Perfect conditions for fast charging!';
  } else if (chargingEfficiency >= 75) {
    recommendation = 'Good conditions for charging.';
  } else {
    recommendation = 'Consider charging during off-peak hours.';
  }

  return {
    temperature,
    condition,
    humidity,
    windSpeed,
    chargingEfficiency,
    recommendation,
    isOptimal,
    nextOptimalTime: isOptimal ? undefined : 'Tomorrow 6-8 AM',
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WeatherWidget;
