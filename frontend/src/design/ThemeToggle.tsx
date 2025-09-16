/**
 * Theme Toggle Component
 * Provides a beautiful theme switching interface
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius, Elevation } from './DesignSystem';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = false,
}) => {
  const { colors } = useThemeColors();

  const sizes = {
    small: { width: 40, height: 24, iconSize: 14 },
    medium: { width: 48, height: 28, iconSize: 16 },
    large: { width: 56, height: 32, iconSize: 18 },
  };

  const currentSize = sizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: currentSize.width,
          height: currentSize.height,
          backgroundColor: colors.accent,
        },
      ]}
      onPress={() => {}} // Disabled - always dark mode
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { left: currentSize.width - 24 }]}>
        <Ionicons
          name="moon"
          size={currentSize.iconSize}
          color={colors.text.primary}
        />
      </View>
      
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Dark
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Elevation.level1,
  },
  iconContainer: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Elevation.level2,
  },
  labelContainer: {
    marginLeft: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
