/**
 * Enhanced Glassmorphic Card Component
 * Premium glassmorphism effect with depth, motion, and interactivity
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { EnhancedColors, Gradients, Shadows, BorderRadius, Spacing, Typography } from './EnhancedDesignSystem';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'interactive';
  disabled?: boolean;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  onPress,
  style,
  size = 'medium',
  variant = 'default',
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.8, { duration: 150 });
    glowOpacity.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 150 });
    glowOpacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: Spacing.md,
          minHeight: 100,
        };
      case 'large':
        return {
          padding: Spacing.xl,
          minHeight: 180,
        };
      default:
        return {
          padding: Spacing.lg,
          minHeight: 140,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...Shadows.glass.large,
          backgroundColor: EnhancedColors.glass.surface,
        };
      case 'interactive':
        return {
          ...Shadows.glass.medium,
          backgroundColor: EnhancedColors.glass.surface,
        };
      default:
        return {
          ...Shadows.glass.small,
          backgroundColor: EnhancedColors.glass.surface,
        };
    }
  };

  const CardContent = (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={Gradients.glass.card}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Glassmorphism Overlay */}
      <View style={styles.glassOverlay} />

      {/* Glow Effect */}
      <Animated.View style={[styles.glowEffect, glowStyle]} />

      {/* Content */}
      <View style={[styles.content, getSizeStyles()]}>
        {children}
      </View>
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={[styles.wrapper, style]}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: EnhancedColors.glass.border,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: EnhancedColors.glass.surface,
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.lg + 2,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: EnhancedColors.glass.glow,
    ...Shadows.glow.primary,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
});

export default GlassmorphicCard;
