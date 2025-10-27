/**
 * Animated Button Component
 * Button with animated gradient glow border effect
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  loading = false,
}) => {
  const glowingAnimatedValue = useRef(new Animated.Value(0)).current;

  // Animated gradient glow effect - seamless border animation
  useEffect(() => {
    // Create a seamless chasing light effect around the border
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(glowingAnimatedValue, {
          toValue: 1,
          duration: 20000, // 20 seconds for continuous seamless loop
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    };
    if (!disabled && !loading) {
      startAnimation();
    }
  }, [disabled, loading]);

  const isPrimary = variant === 'primary';

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.gradientBorder,
          {
            opacity: disabled || loading ? 0.4 : glowingAnimatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.7, 1, 0.7],
            }),
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            ...StyleSheet.absoluteFillObject,
            transform: [
              {
                rotate: glowingAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={['#8cd279', '#4ADE80', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              ...StyleSheet.absoluteFillObject,
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>
      </Animated.View>
      <TouchableOpacity
        style={[
          styles.buttonContent,
          isPrimary ? styles.primaryContent : styles.secondaryContent,
          disabled && styles.disabledContent,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isPrimary ? '#000000' : '#8cd279'} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              isPrimary ? styles.primaryText : styles.secondaryText,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: 12,
    padding: 2,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    position: 'relative',
    zIndex: 1,
  },
  primaryContent: {
    backgroundColor: '#8cd279',
  },
  secondaryContent: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  disabledContent: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: '#000000',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
});

export default AnimatedButton;

