/**
 * Animated Progress Bar Component
 * Smooth, fluid progress indicator with gradient fill
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { EnhancedColors, Gradients, BorderRadius, Spacing, Typography } from '../design/EnhancedDesignSystem';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 6,
  showPercentage = true,
  label,
  style,
  animated = true,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 800,
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated]);

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animatedProgress.value,
      [0, 100],
      [0, 100],
      Extrapolate.CLAMP
    );

    return {
      width: `${width}%`,
    };
  });

  const percentageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedProgress.value,
      [0, 10],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Animated.Text style={[styles.percentage, percentageStyle]}>
              {Math.round(progress)}%
            </Animated.Text>
          )}
        </View>
      )}
      
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.progressContainer, progressStyle]}>
          <LinearGradient
            colors={Gradients.primary}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    color: EnhancedColors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },
  percentage: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: EnhancedColors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  track: {
    backgroundColor: EnhancedColors.background.tertiary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressContainer: {
    height: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: BorderRadius.full,
  },
});

export default AnimatedProgressBar;
