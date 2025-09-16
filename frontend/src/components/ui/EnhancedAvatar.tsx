/**
 * Enhanced Avatar Component
 * Circular avatar with glow effects and hover animations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { EnhancedColors, Gradients, BorderRadius, Shadows, Typography } from '../design/EnhancedDesignSystem';

interface EnhancedAvatarProps {
  size?: number;
  source?: { uri: string } | null;
  name?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showGlow?: boolean;
  animated?: boolean;
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  size = 80,
  source,
  name = 'User',
  onPress,
  style,
  showGlow = true,
  animated = true,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = () => {
    if (!animated) return;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    glowOpacity.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    if (!animated) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    glowOpacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AvatarContent = (
    <Animated.View style={[styles.container, animatedStyle, { width: size, height: size }]}>
      {/* Glow Effect */}
      {showGlow && (
        <Animated.View style={[styles.glowEffect, glowStyle, { width: size + 8, height: size + 8 }]} />
      )}

      {/* Avatar Border */}
      <View style={[styles.border, { width: size, height: size, borderRadius: size / 2 }]}>
        <LinearGradient
          colors={Gradients.primary}
          style={[styles.borderGradient, { borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Avatar Content */}
      <View style={[styles.content, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}>
        {source ? (
          // TODO: Implement Image component when available
          <View style={styles.imagePlaceholder}>
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
              {getInitials(name)}
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={Gradients.primary}
            style={[styles.gradientBackground, { borderRadius: (size - 4) / 2 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
              {getInitials(name)}
            </Text>
          </LinearGradient>
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={style}
      >
        {AvatarContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
      {AvatarContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: EnhancedColors.glass.glow,
    ...Shadows.glow.primary,
  },
  border: {
    position: 'absolute',
    padding: 2,
  },
  borderGradient: {
    flex: 1,
  },
  content: {
    backgroundColor: EnhancedColors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EnhancedColors.background.tertiary,
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: Typography.fontWeight.bold,
    color: EnhancedColors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
  },
});

export default EnhancedAvatar;
