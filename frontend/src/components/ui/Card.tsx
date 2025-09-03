import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  elevation?: 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'extraLarge';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  elevation = 'level1',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'large',
  onPress,
  style,
  disabled = false,
}) => {
  const { colors } = useThemeColors();
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        ...Elevation[elevation as keyof typeof Elevation] as ViewStyle,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
      },
      filled: {
        backgroundColor: colors.surface,
        elevation: 0,
        shadowOpacity: 0,
      },
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: Spacing.sm },
      medium: { padding: Spacing.md },
      large: { padding: Spacing.lg },
    };

    const marginStyles: Record<string, ViewStyle> = {
      none: {},
      small: { margin: Spacing.sm },
      medium: { margin: Spacing.md },
      large: { margin: Spacing.lg },
    };

    const borderRadiusStyles: Record<string, ViewStyle> = {
      small: { borderRadius: BorderRadius.sm },
      medium: { borderRadius: BorderRadius.md },
      large: { borderRadius: BorderRadius.lg },
      extraLarge: { borderRadius: BorderRadius.xl },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...borderRadiusStyles[borderRadius],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};

export default Card;
