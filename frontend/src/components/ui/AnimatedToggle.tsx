/**
 * Enhanced Animated Toggle Switch
 * Smooth, fluid toggle with gradient fill and spring animations
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { EnhancedColors, Gradients, BorderRadius, Spacing } from '../design/EnhancedDesignSystem';

interface AnimatedToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  value,
  onValueChange,
  size = 'medium',
  disabled = false,
  style,
}) => {
  const toggleValue = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    toggleValue.value = withSpring(value ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
  }, [value]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 22,
          thumbSize: 18,
        };
      case 'large':
        return {
          width: 60,
          height: 34,
          thumbSize: 30,
        };
      default:
        return {
          width: 50,
          height: 28,
          thumbSize: 24,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      toggleValue.value,
      [0, 1],
      [EnhancedColors.background.tertiary, EnhancedColors.interactive.active],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      toggleValue.value,
      [0, 1],
      [2, sizeStyles.width - sizeStyles.thumbSize - 2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
    >
      <Animated.View
        style={[
          styles.track,
          trackStyle,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: sizeStyles.height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            thumbStyle,
            {
              width: sizeStyles.thumbSize,
              height: sizeStyles.thumbSize,
              borderRadius: sizeStyles.thumbSize / 2,
            },
          ]}
        >
          <LinearGradient
            colors={value ? Gradients.primary : ['#FFFFFF', '#F5F5F5']}
            style={[
              styles.thumbGradient,
              {
                borderRadius: sizeStyles.thumbSize / 2,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default AnimatedToggle;
