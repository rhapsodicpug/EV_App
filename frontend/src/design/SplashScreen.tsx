/**
 * Custom Splash Screen Component
 * Brand-consistent loading animation with smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from './ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Elevation } from './DesignSystem';
import { HeadlineLarge, BodyMedium } from './ComponentLibrary';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  duration = 2000,
}) => {
  const { colors } = useThemeColors();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    const animations = [
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Logo scale and fade in
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
    ];

    // Run animations sequentially
    Animated.sequence([
      ...animations,
      // Hold for a moment
      Animated.delay(duration - 1300),
      // Fade out
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: backgroundOpacity,
        },
      ]}
    >
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons
              name="flash"
              size={48}
              color={Colors.neutral.white}
            />
          </View>
        </Animated.View>
      </View>

      {/* Text Container */}
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: textOpacity },
        ]}
      >
        <HeadlineLarge
          style={[styles.title, { color: colors.primary }]}
        >
          EV Charging
        </HeadlineLarge>
        <BodyMedium
          style={[styles.subtitle, { color: colors.text.secondary }]}
        >
          Power your journey
        </BodyMedium>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.level3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
