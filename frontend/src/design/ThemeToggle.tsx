/**
 * Theme Toggle Component
 * Provides a beautiful theme switching interface
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { Colors, Spacing, BorderRadius, Elevation } from './DesignSystem';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = false,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

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
          backgroundColor: isDark ? Colors.primary[600] : Colors.neutral.gray[300],
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { left: isDark ? currentSize.width - 24 : 2 }]}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={currentSize.iconSize}
          color={isDark ? Colors.neutral.white : Colors.neutral.gray[600]}
        />
      </View>
      
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: isDark ? Colors.neutral.white : Colors.neutral.gray[600] }]}>
            {isDark ? 'Dark' : 'Light'}
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
