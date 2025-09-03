/**
 * Design System Component Library
 * Reusable UI components built with the design system
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  TextProps,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Elevation, ComponentTokens } from './DesignSystem';
import { useThemeColors } from './ThemeContext';

// ==================== TYPOGRAPHY COMPONENTS ====================

interface TypographyProps extends TextProps {
  variant?: 'display' | 'headline' | 'title' | 'body' | 'label';
  size?: 'large' | 'medium' | 'small';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const TypographyText: React.FC<TypographyProps> = ({
  variant = 'body',
  size = 'medium',
  weight = 'regular',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { colors } = useThemeColors();
  
  const textStyle: TextStyle = {
    fontSize: Typography.fontSize[variant][size],
    fontWeight: Typography.fontWeight[weight] as any,
    color: color || colors.text.primary,
    textAlign: align,
    lineHeight: Typography.fontSize[variant][size] * Typography.lineHeight.normal,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// Typography variants
export const DisplayLarge = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="display" size="large" {...props} />
);

export const DisplayMedium = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="display" size="medium" {...props} />
);

export const DisplaySmall = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="display" size="small" {...props} />
);

export const HeadlineLarge = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="headline" size="large" {...props} />
);

export const HeadlineMedium = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="headline" size="medium" {...props} />
);

export const HeadlineSmall = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="headline" size="small" {...props} />
);

export const TitleLarge = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="title" size="large" {...props} />
);

export const TitleMedium = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="title" size="medium" {...props} />
);

export const TitleSmall = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="title" size="small" {...props} />
);

export const BodyLarge = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="body" size="large" {...props} />
);

export const BodyMedium = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="body" size="medium" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="body" size="small" {...props} />
);

export const LabelLarge = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="label" size="large" {...props} />
);

export const LabelMedium = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="label" size="medium" {...props} />
);

export const LabelSmall = (props: Omit<TypographyProps, 'variant' | 'size'>) => (
  <TypographyText variant="label" size="small" {...props} />
);

// ==================== BUTTON COMPONENTS ====================

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  children,
  ...props
}) => {
  const { colors } = useThemeColors();
  
  const buttonStyle: ViewStyle = {
    height: ComponentTokens.button.height[size],
    paddingHorizontal: ComponentTokens.button.padding.horizontal,
    paddingVertical: ComponentTokens.button.padding.vertical,
    borderRadius: ComponentTokens.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
    ...Elevation.level1,
  };

  // Variant styles
  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: Colors.semantic.error,
    },
  };

  const textColor = variant === 'outline' || variant === 'ghost' 
    ? colors.primary 
    : Colors.neutral.white;

  return (
    <TouchableOpacity
      style={[buttonStyle, variantStyles[variant], style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingSpinner, { borderColor: textColor }]} />
        </View>
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ==================== CARD COMPONENTS ====================

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: keyof typeof Elevation;
  padding?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'level1',
  padding = 'medium',
}) => {
  const { colors } = useThemeColors();
  
  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: ComponentTokens.card.borderRadius,
    padding: Spacing.component.padding[padding === 'small' ? 'sm' : padding === 'medium' ? 'md' : padding === 'large' ? 'lg' : 'md'],
    ...Elevation[elevation],
  };

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

// ==================== SPACER COMPONENTS ====================

interface SpacerProps {
  size?: keyof typeof Spacing;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  horizontal = false 
}) => {
  const spacerStyle: ViewStyle = {
    [horizontal ? 'width' : 'height']: Spacing[size],
  };

  return <View style={spacerStyle} />;
};

// ==================== DIVIDER COMPONENTS ====================

interface DividerProps {
  color?: string;
  thickness?: number;
  margin?: keyof typeof Spacing;
}

export const Divider: React.FC<DividerProps> = ({
  color,
  thickness = 1,
  margin = 'md',
}) => {
  const { colors } = useThemeColors();
  
  const dividerStyle: ViewStyle = {
    height: thickness,
    backgroundColor: color || colors.border,
    marginVertical: Spacing[margin] as number,
  };

  return <View style={dividerStyle} />;
};

// ==================== BADGE COMPONENTS ====================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
}) => {
  const { colors } = useThemeColors();
  
  const badgeColors = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: Colors.semantic.success,
    warning: Colors.semantic.warning,
    error: Colors.semantic.error,
    info: Colors.semantic.info,
  };

  const badgeSizes = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
  };

  const badgeStyle: ViewStyle = {
    backgroundColor: badgeColors[variant],
    borderRadius: BorderRadius.full,
    paddingHorizontal: badgeSizes[size].paddingHorizontal,
    paddingVertical: badgeSizes[size].paddingVertical,
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    color: Colors.neutral.white,
    fontSize: badgeSizes[size].fontSize,
    fontWeight: Typography.fontWeight.medium as any,
  };

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

// ==================== CONTAINER COMPONENTS ====================

interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'md',
  margin,
  style,
}) => {
  const containerStyle: ViewStyle = {
    padding: Spacing[padding] as number,
    margin: margin ? Spacing[margin] as number : undefined,
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  buttonText: {
    fontSize: Typography.fontSize.body.medium,
    fontWeight: Typography.fontWeight.medium as any,
  },
  loadingContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: 'transparent',
  },
});

// ==================== EXPORTS ====================
