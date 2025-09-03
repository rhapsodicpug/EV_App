/**
 * Interactive Map Screen - Coming Soon Placeholder
 * Premium animated coming soon screen for Google Maps integration
 */

import React, { useEffect, useRef } from 'react';
import { ViewStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
// Gyroscope import removed due to package compatibility issues

const { width, height } = Dimensions.get('window');

const InteractiveMapScreen: React.FC = () => {
  // Animated values for the coming soon screen
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.95);
  const rotationAnim = useSharedValue(0);
  const meshOpacityAnim = useSharedValue(0.6);
  const meshScaleAnim = useSharedValue(1);
  const contentFloatAnim = useSharedValue(0);

  // Individual dot animations - create animated values for each dot's position
  const dotCount = 30;
  const dotPositions = Array.from({ length: dotCount }, () => ({
    x: useSharedValue(Math.random() * 100),
    y: useSharedValue(Math.random() * 100),
    speedX: Math.random() * 2 - 1, // Random speed between -1 and 1
    speedY: Math.random() * 2 - 1, // Random speed between -1 and 1
    color: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, 255, 0.5)`,
  }));

  // Ref to track component mount status
  const isMountedRef = useRef(true);

  // Function to animate a single dot continuously
  const animateDot = (dot: typeof dotPositions[0], index: number) => {
    if (!isMountedRef.current) return;

    // Calculate new position
    const newX = dot.x.value + dot.speedX;
    const newY = dot.y.value + dot.speedY;

    // Bounce off edges
    let finalX = newX;
    let finalY = newY;

    if (newX <= 0 || newX >= 100) {
      dot.speedX *= -1; // Reverse direction
      finalX = Math.max(0, Math.min(100, newX));
    }

    if (newY <= 0 || newY >= 100) {
      dot.speedY *= -1; // Reverse direction
      finalY = Math.max(0, Math.min(100, newY));
    }

    // Animate to new position
    dot.x.value = withTiming(finalX, { duration: 100 });
    dot.y.value = withTiming(finalY, { duration: 100 });

    // Schedule next animation
    setTimeout(() => animateDot(dot, index), 100);
  };

  useEffect(() => {
    // Animate on mount
    fadeAnim.value = withTiming(1, { duration: 800 });
    scaleAnim.value = withTiming(1, { duration: 800 });

    // Continuous rotation animation for globe icon
    rotationAnim.value = withRepeat(
      withTiming(360, { duration: 12000 }), // 12 seconds for smooth, continuous rotation
      -1, // Repeat indefinitely
      false // Don't reverse
    );

    // Continuous mesh pattern animation for dynamic background
    meshOpacityAnim.value = withRepeat(
      withTiming(0.8, { duration: 8000 }),
      -1,
      true // Reverse for breathing effect
    );

    meshScaleAnim.value = withRepeat(
      withTiming(1.05, { duration: 10000 }),
      -1,
      true // Reverse for subtle scaling
    );

    // Subtle floating animation for content
    contentFloatAnim.value = withRepeat(
      withTiming(5, { duration: 6000 }),
      -1,
      true // Reverse for floating effect
    );

    // Start animating all dots
    dotPositions.forEach((dot, index) => {
      // Add slight delay for each dot to create organic movement
      setTimeout(() => animateDot(dot, index), index * 50);
    });

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  // Globe icon rotation animation
  const globeRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationAnim.value}deg` }],
  }));

  // Mesh pattern animation for dynamic background
  const meshPatternStyle = useAnimatedStyle(() => ({
    opacity: meshOpacityAnim.value,
    transform: [{ scale: meshScaleAnim.value }],
  }));

  // Content floating animation
  const contentFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentFloatAnim.value }],
  }));

  // Create animated styles for each dot
  const dotAnimatedStyles = dotPositions.map((dot) =>
    useAnimatedStyle(() => ({
      left: `${dot.x.value}%`,
      top: `${dot.y.value}%`,
    }))
  );

  // Handler for Notify Me button
  const handleNotifyMe = () => {
    Alert.alert(
      'Notification Set! 🎉',
      'We\'ll notify you as soon as the map feature is ready.',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View
        style={[
          styles.gradientBackground,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23', '#1a1a2e']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Animated mesh overlay with moving dots */}
          <Animated.View style={[styles.meshPattern, meshPatternStyle]}>
            {dotPositions.map((dot, i) => (
              <Animated.View
                key={`mesh-dot-${i}`}
                style={[
                  styles.meshDot,
                  dotAnimatedStyles[i],
                  {
                    backgroundColor: dot.color,
                  }
                ]}
              />
            ))}
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Noise Texture Overlay */}
      <View style={styles.noiseOverlay} />

      {/* Main Content */}
      <Animated.View style={[styles.contentContainer, contentFloatStyle]}>
        {/* Status Bar Space */}
        <View style={{ height: 44 }} />

        {/* Centered Content */}
        <View style={styles.centerContent}>
          {/* Icon with Rotation */}
          <View style={styles.iconContainer}>
            <Animated.View style={globeRotationStyle}>
              <Ionicons name="map" size={80} color="#e0e0e0" />
            </Animated.View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            A Better Map is on the Way
          </Text>

          {/* Subheading */}
          <Text style={styles.subheading}>
            We're crafting a seamless, best-in-class mapping experience{'\n'}to help you find chargers instantly.
          </Text>

          {/* Notify Me Button */}
          <TouchableOpacity
            style={styles.notifyButton}
            onPress={handleNotifyMe}
            activeOpacity={0.8}
          >
            <Text style={styles.notifyButtonText}>
              Notify Me When It's Ready
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  meshPattern: {
    flex: 1,
    position: 'relative',
  },
  meshDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 40,
    opacity: 0.8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 32,
  },
  notifyButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
    alignItems: 'center',
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    opacity: 0.3,
  },
});

export default InteractiveMapScreen;
