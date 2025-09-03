import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: any;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const { colors } = useThemeColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: colors.primary }];
      case 'secondary':
        return [...baseStyle, { backgroundColor: colors.secondary }];
      case 'outline':
        return [...baseStyle, { 
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        }];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'outline':
        return [...baseStyle, { color: colors.primary }];
      default:
        return [...baseStyle, { color: Colors.neutral.white }];
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <Animated.View style={styles.loadingContainer}>
            <Animated.View style={styles.spinner} />
          </Animated.View>
        ) : (
          <>
            {leftIcon && (
              <Ionicons 
                name={leftIcon as any} 
                size={getIconSize()} 
                color={variant === 'outline' ? colors.primary : Colors.neutral.white} 
              />
            )}
            <Text style={getTextStyle()}>{title}</Text>
            {rightIcon && (
              <Ionicons 
                name={rightIcon as any} 
                size={getIconSize()} 
                color={variant === 'outline' ? colors.primary : Colors.neutral.white} 
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const getIconSize = () => {
  return 20; // Default icon size
};

// Animated Card Component
interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  delay = 0,
}) => {
  const { colors } = useThemeColors();
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 500 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <CardComponent
        style={[
          styles.card,
          { backgroundColor: colors.surface },
          onPress && styles.cardPressable,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// Animated List Item
interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  onPress?: () => void;
  style?: any;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  onPress,
  style,
}) => {
  const translateX = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 14,
  },
  text: {
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
  },
  card: {
    borderRadius: BorderRadius.md,
    ...Elevation.level1,
    overflow: 'hidden',
  },
  cardPressable: {
    ...Elevation.level2,
  },
  listItem: {
    padding: Spacing.md,
    backgroundColor: 'transparent',
  },
});

export default AnimatedButton;
