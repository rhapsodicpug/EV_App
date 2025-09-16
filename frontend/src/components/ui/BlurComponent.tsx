/**
 * BlurComponent
 * Best-in-class iOS-inspired multi-layered blur effects with adaptive materials
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

export type BlurIntensity = 'subtle' | 'light' | 'medium' | 'strong' | 'ultra' | 'extreme';
export type BlurMaterial = 'xlight' | 'light' | 'regular' | 'dark' | 'prominent' | 'ultraThin' | 'extraDark';
export type ThemeMode = 'light' | 'dark' | 'auto';

interface BlurComponentProps {
  children?: React.ReactNode;
  intensity?: BlurIntensity;
  material?: BlurMaterial;
  theme?: ThemeMode;
  style?: ViewStyle;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: { width: number; height: number };
  adaptive?: boolean; // Enable adaptive materials based on theme
}

const BlurComponent: React.FC<BlurComponentProps> = ({
  children,
  intensity = 'medium',
  material,
  theme = 'dark',
  style,
  overlay = true,
  overlayColor,
  overlayOpacity = 0.3,
  borderRadius = 16,
  borderWidth = 1,
  borderColor,
  shadow = true,
  shadowColor = '#000000',
  shadowOpacity = 0.25,
  shadowRadius = 12,
  shadowOffset = { width: 0, height: 4 },
  adaptive = true,
}) => {
  // iOS-inspired blur intensity hierarchy
  const getBlurAmount = (intensity: BlurIntensity): number => {
    switch (intensity) {
      case 'subtle':
        return 5;   // Background wallpaper
      case 'light':
        return 10;  // Secondary elements
      case 'medium':
        return 15;  // Primary UI surfaces
      case 'strong':
        return 25;  // Cards and widgets
      case 'ultra':
        return 40;  // Modals and popups
      case 'extreme':
        return 60;  // Overlay modals
      default:
        return 15;
    }
  };

  // Adaptive material system based on theme
  const getAdaptiveMaterial = (theme: ThemeMode, material?: BlurMaterial): 'light' | 'regular' | 'prominent' | 'ultraThin' | 'dark' | 'extraDark' => {
    if (material) {
      // Map our custom types to the actual BlurView types
      switch (material) {
        case 'xlight':
          return 'light';
        case 'light':
          return 'light';
        case 'regular':
          return 'regular';
        case 'dark':
          return 'dark';
        case 'prominent':
          return 'prominent';
        case 'ultraThin':
          return 'ultraThin';
        case 'extraDark':
          return 'extraDark';
        default:
          return 'regular';
      }
    }
    
    if (adaptive) {
      switch (theme) {
        case 'light':
          return 'light';
        case 'dark':
          return 'dark';
        case 'auto':
          return 'regular';
        default:
          return 'dark';
      }
    }
    
    return 'regular';
  };

  // Get adaptive overlay color
  const getAdaptiveOverlayColor = (theme: ThemeMode): string => {
    if (overlayColor) return overlayColor;
    
    switch (theme) {
      case 'light':
        return 'rgba(255, 255, 255, 0.1)';
      case 'dark':
        return 'rgba(0, 0, 0, 0.3)';
      case 'auto':
        return 'rgba(0, 0, 0, 0.2)';
      default:
        return 'rgba(0, 0, 0, 0.3)';
    }
  };

  // Get adaptive border color
  const getAdaptiveBorderColor = (theme: ThemeMode): string => {
    if (borderColor) return borderColor;
    
    switch (theme) {
      case 'light':
        return 'rgba(0, 0, 0, 0.1)';
      case 'dark':
        return 'rgba(255, 255, 255, 0.1)';
      case 'auto':
        return 'rgba(255, 255, 255, 0.05)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const blurAmount = getBlurAmount(intensity);
  const adaptiveMaterial = getAdaptiveMaterial(theme, material);
  const adaptiveOverlayColor = getAdaptiveOverlayColor(theme);
  const adaptiveBorderColor = getAdaptiveBorderColor(theme);

  const containerStyle: ViewStyle = {
    borderRadius,
    borderWidth,
    borderColor: adaptiveBorderColor,
    overflow: 'hidden',
    ...(shadow && {
      shadowColor,
      shadowOpacity,
      shadowRadius,
      shadowOffset,
      elevation: 8,
    }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      <BlurView
        style={styles.blurView}
        intensity={blurAmount}
        tint={theme === 'light' ? 'light' : 'dark'}
      >
        {overlay && (
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: adaptiveOverlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}
        {children}
      </BlurView>
    </View>
  );
};

// Multi-layer blur component for extreme effects
export const MultiLayerBlur: React.FC<BlurComponentProps> = ({
  children,
  intensity = 'ultra',
  style,
  ...props
}) => {
  return (
    <View style={[styles.multiLayerContainer, style]}>
      {/* Background blur layer */}
      <BlurView
        style={styles.backgroundBlur}
        blurType="extraDark"
        blurAmount={80}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.9)"
      />
      
      {/* Mid blur layer */}
      <BlurView
        style={styles.midBlur}
        blurType="prominent"
        blurAmount={40}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
      />
      
      {/* Foreground blur layer */}
      <BlurView
        style={styles.foregroundBlur}
        blurType="regular"
        blurAmount={20}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
      />
      
      {/* Content overlay */}
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
};

// iOS-inspired specialized blur components

// Primary UI Surfaces (Cards & Navigation) - Moderate blur
export const PrimaryBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="medium"
      theme={theme}
      adaptive={true}
      overlay={true}
      borderRadius={16}
      borderWidth={1}
      shadow={true}
      shadowColor={theme === 'light' ? '#000000' : '#FFFFFF'}
      shadowOpacity={0.15}
      shadowRadius={12}
      shadowOffset={{ width: 0, height: 6 }}
      style={StyleSheet.flatten([styles.primaryBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Secondary Surfaces (Pop-ups & Modals) - Strong blur
export const SecondaryBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="ultra"
      theme={theme}
      adaptive={true}
      overlay={true}
      borderRadius={20}
      borderWidth={1}
      shadow={true}
      shadowColor={theme === 'light' ? '#000000' : '#FFFFFF'}
      shadowOpacity={0.25}
      shadowRadius={20}
      shadowOffset={{ width: 0, height: 10 }}
      style={StyleSheet.flatten([styles.secondaryBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Header blur component specifically for headers
export const HeaderBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="strong"
      theme={theme}
      adaptive={true}
      overlay={true}
      borderRadius={0}
      borderWidth={0}
      shadow={false}
      style={StyleSheet.flatten([styles.headerBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Card blur component for cards and widgets
export const CardBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="strong"
      theme={theme}
      adaptive={true}
      overlay={true}
      borderRadius={16}
      borderWidth={1}
      shadow={true}
      shadowColor={theme === 'light' ? '#000000' : '#FFFFFF'}
      shadowOpacity={0.2}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 8 }}
      style={StyleSheet.flatten([styles.cardBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Button blur component for interactive elements
export const ButtonBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="medium"
      theme={theme}
      adaptive={true}
      overlay={true}
      borderRadius={12}
      borderWidth={1}
      shadow={true}
      shadowColor={theme === 'light' ? '#000000' : '#FFFFFF'}
      shadowOpacity={0.15}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 4 }}
      style={StyleSheet.flatten([styles.buttonBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Background wallpaper blur component
export const WallpaperBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  theme = 'dark',
  ...props
}) => {
  return (
    <BlurComponent
      intensity="subtle"
      theme={theme}
      adaptive={true}
      overlay={false}
      borderRadius={0}
      borderWidth={0}
      shadow={false}
      style={StyleSheet.flatten([styles.wallpaperBlur, style])}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  multiLayerContainer: {
    position: 'relative',
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  midBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  foregroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentOverlay: {
    position: 'relative',
    zIndex: 1,
  },
  // iOS-inspired specialized blur styles
  primaryBlur: {
    marginBottom: 16,
  },
  secondaryBlur: {
    marginBottom: 20,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  cardBlur: {
    marginBottom: 16,
  },
  buttonBlur: {
    // Additional button-specific styles can be added here
  },
  wallpaperBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

export default BlurComponent;
