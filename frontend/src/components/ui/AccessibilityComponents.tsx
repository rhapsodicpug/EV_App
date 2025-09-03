import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab' | 'menuitem';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  leftIcon?: string;
  rightIcon?: string;
  style?: any;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  leftIcon,
  rightIcon,
  style,
  disabled = false,
}) => {
  const { colors } = useThemeColors();

  const handlePress = () => {
    // Provide haptic feedback for accessibility
    AccessibilityInfo.announceForAccessibility(title);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityActions={[
        { name: 'activate', label: 'Activate button' },
      ]}
    >
      {leftIcon && (
        <Ionicons 
          name={leftIcon as any} 
          size={20} 
          color={Colors.neutral.white}
          accessible={false}
        />
      )}
      <Text style={[styles.text, { color: Colors.neutral.white }]}>
        {title}
      </Text>
      {rightIcon && (
        <Ionicons 
          name={rightIcon as any} 
          size={20} 
          color={Colors.neutral.white}
          accessible={false}
        />
      )}
    </TouchableOpacity>
  );
};

interface AccessibleCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: any;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}) => {
  const { colors } = useThemeColors();

  const handlePress = () => {
    if (onPress) {
      AccessibilityInfo.announceForAccessibility(title);
      onPress();
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        style,
      ]}
      onPress={handlePress}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityActions={onPress ? [
        { name: 'activate', label: 'Activate card' },
      ] : undefined}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </CardComponent>
  );
};

interface AccessibleImageProps {
  source: any;
  alt: string;
  style?: any;
  onPress?: () => void;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  source,
  alt,
  style,
  onPress,
}) => {
  const ImageComponent = onPress ? TouchableOpacity : View;

  return (
    <ImageComponent
      style={style}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={alt}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityActions={onPress ? [
        { name: 'activate', label: 'View image' },
      ] : undefined}
    >
      {/* Image component would go here */}
      <View style={[styles.imagePlaceholder, style]}>
        <Text>Image: {alt}</Text>
      </View>
    </ImageComponent>
  );
};

// Screen Reader Announcement Hook
export const useScreenReader = () => {
  const announce = React.useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const isScreenReaderEnabled = React.useCallback(async () => {
    return await AccessibilityInfo.isScreenReaderEnabled();
  }, []);

  return { announce, isScreenReaderEnabled };
};

// Focus Management Hook
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = React.useState<string | null>(null);

  const setFocus = React.useCallback((elementId: string) => {
    setFocusedElement(elementId);
    AccessibilityInfo.announceForAccessibility(`Focused on ${elementId}`);
  }, []);

  const clearFocus = React.useCallback(() => {
    setFocusedElement(null);
  }, []);

  return { focusedElement, setFocus, clearFocus };
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minHeight: 48, // Minimum touch target size for accessibility
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: BorderRadius.md,
    ...Elevation.level1,
    overflow: 'hidden',
    minHeight: 48, // Minimum touch target size
  },
  cardHeader: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  cardContent: {
    padding: Spacing.md,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
});
