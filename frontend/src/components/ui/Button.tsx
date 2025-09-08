import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { ChevronRight, ChevronLeft, Plus, Check, X, AlertCircle } from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { colors } = useThemeColors();

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'chevron-forward':
      case 'arrow-forward':
        return ChevronRight;
      case 'chevron-back':
      case 'arrow-back':
        return ChevronLeft;
      case 'add':
      case 'plus':
        return Plus;
      case 'checkmark':
      case 'check':
        return Check;
      case 'close':
      case 'x':
        return X;
      case 'alert-circle':
      case 'warning':
        return AlertCircle;
      default:
        return ChevronRight;
    }
  };

  // Helper function to render icon
  const renderIcon = (icon: string | React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      // Convert string to Lucide icon
      const IconComponent = getIconComponent(icon);
      return React.createElement(IconComponent, {
        size: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
        color:
          variant === 'outline' || variant === 'text'
            ? disabled ? colors.text.secondary : colors.primary
            : disabled ? colors.text.secondary : Colors.neutral.white,
        style: getIconStyle(),
      });
    }
    
    // If it's already a ReactNode, render it directly
    return <Text style={getIconStyle()}>{icon}</Text>;
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...Elevation.level2,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: 56,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? colors.border : colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? colors.border : colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? colors.border : colors.primary,
      },
      text: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      error: {
        backgroundColor: disabled ? colors.border : Colors.semantic.error,
        borderWidth: 0,
      },
    };

    const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...widthStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: 'bold' as const,
      textAlign: 'center',
    };

    const sizeTextStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 12,
      },
      medium: {
        fontSize: 14,
      },
      large: {
        fontSize: 16,
      },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: {
        color: disabled ? colors.text.secondary : Colors.neutral.white,
      },
      secondary: {
        color: disabled ? colors.text.secondary : Colors.neutral.white,
      },
      outline: {
        color: disabled ? colors.text.secondary : colors.primary,
      },
      text: {
        color: disabled ? colors.text.secondary : colors.primary,
      },
      error: {
        color: disabled ? colors.text.secondary : Colors.neutral.white,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconStyle = () => ({
    marginHorizontal: Spacing.xs,
  });

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? colors.primary : Colors.neutral.white}
        />
      ) : (
        <>
          {leftIcon && renderIcon(leftIcon, 'left')}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && renderIcon(rightIcon, 'right')}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
