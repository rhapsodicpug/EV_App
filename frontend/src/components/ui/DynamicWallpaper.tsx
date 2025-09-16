/**
 * Dynamic Wallpaper Background
 * iOS-inspired dynamic wallpaper with subtle blur effect
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface DynamicWallpaperProps {
  children?: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'gradient' | 'abstract' | 'minimal';
}

const DynamicWallpaper: React.FC<DynamicWallpaperProps> = ({
  children,
  theme = 'dark',
  variant = 'gradient',
}) => {
  const getGradientColors = (theme: 'light' | 'dark' | 'auto', variant: string): [string, string, string, string] => {
    if (variant === 'abstract') {
      return theme === 'light' 
        ? ['#667eea', '#764ba2', '#f093fb', '#f5576c'] as [string, string, string, string]
        : ['#0c0c0c', '#1a1a2e', '#16213e', '#0f3460'] as [string, string, string, string];
    }
    
    if (variant === 'minimal') {
      return theme === 'light'
        ? ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'] as [string, string, string, string]
        : ['#0d1117', '#161b22', '#21262d', '#30363d'] as [string, string, string, string];
    }
    
    // Default gradient
    return theme === 'light'
      ? ['#ffecd2', '#fcb69f', '#ff8a80', '#ff7043'] as [string, string, string, string]
      : ['#0a0a0a', '#1a1a1a', '#2d2d2d', '#1a1a1a'] as [string, string, string, string];
  };

  const gradientColors = getGradientColors(theme, variant);

  return (
    <View style={styles.container}>
      {/* Base gradient background */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Subtle blur overlay for wallpaper effect */}
      <BlurView
        style={styles.wallpaperBlur}
        intensity={5}
        tint="dark"
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  wallpaperBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

export default DynamicWallpaper;
