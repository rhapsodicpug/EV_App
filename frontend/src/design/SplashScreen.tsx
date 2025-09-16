/**
 * Custom Splash Screen Component
 * Brand-consistent loading animation with smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, THEME_COLORS } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  duration = 2000,
}) => {
  // Use fallback theme if ThemeProvider is not available
  let colors;
  try {
    const themeContext = useThemeColors();
    colors = themeContext.colors;
  } catch (error) {
    // Fallback to dark theme if ThemeProvider is not available
    colors = THEME_COLORS.dark;
  }
  
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
          <View style={[styles.logo, { backgroundColor: colors.accent }]}>
            <Ionicons
              name="flash"
              size={48}
              color={colors.text.primary}
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
        <Animated.Text
          style={[styles.title, { color: colors.accent }]}
        >
          EV Charging
        </Animated.Text>
        <Animated.Text
          style={[styles.subtitle, { color: colors.text.secondary }]}
        >
          Power your journey
        </Animated.Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={[styles.loadingDot, { backgroundColor: colors.accent }]} />
        <View style={[styles.loadingDot, { backgroundColor: colors.accent }]} />
        <View style={[styles.loadingDot, { backgroundColor: colors.accent }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
