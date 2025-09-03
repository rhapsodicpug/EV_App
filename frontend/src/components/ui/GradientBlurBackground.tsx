/**
 * Gradient Blur Background Component
 * Advanced gradient blur effects for modern UI
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, Colors, BorderRadius } from '../../design';

interface GradientBlurBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'premium';
  intensity?: 'light' | 'medium' | 'strong';
  borderRadius?: number;
  style?: ViewStyle;
}

const GradientBlurBackground: React.FC<GradientBlurBackgroundProps> = ({
  children,
  variant = 'primary',
  intensity = 'medium',
  borderRadius = BorderRadius.xl,
  style,
}) => {
  const { colors } = useThemeColors();

  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'primary':
        return [
          'rgba(59, 130, 246, 0.95)',
          'rgba(37, 99, 235, 0.9)',
          'rgba(29, 78, 216, 0.85)',
        ];
      case 'secondary':
        return [
          'rgba(34, 197, 94, 0.95)',
          'rgba(22, 163, 74, 0.9)',
          'rgba(21, 128, 61, 0.85)',
        ];
      case 'glass':
        return [
          'rgba(255, 255, 255, 0.25)',
          'rgba(255, 255, 255, 0.15)',
          'rgba(255, 255, 255, 0.1)',
        ];
      case 'premium':
        return [
          'rgba(245, 158, 11, 0.95)',
          'rgba(217, 119, 6, 0.9)',
          'rgba(180, 83, 9, 0.85)',
        ];
      default:
        return [
          'rgba(59, 130, 246, 0.95)',
          'rgba(37, 99, 235, 0.9)',
          'rgba(29, 78, 216, 0.85)',
        ];
    }
  };

  const getBlurIntensity = () => {
    switch (intensity) {
      case 'light':
        return 10;
      case 'medium':
        return 20;
      case 'strong':
        return 30;
      default:
        return 20;
    }
  };

  const getBorderStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'premium':
        return {
          borderWidth: 1,
          borderColor: 'rgba(245, 158, 11, 0.4)',
        };
      default:
        return {
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
    }
  };

  const getShadowStyle = () => {
    switch (intensity) {
      case 'light':
        return {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        };
      case 'medium':
        return {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        };
      case 'strong':
        return {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 16,
        };
      default:
        return {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          ...getBorderStyle(),
          ...getShadowStyle(),
        },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            borderRadius,
          },
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 0,
  },
});

export default GradientBlurBackground;
