/**
 * BlurComponent
 * High-end, multi-layered frosted glass blur effects
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export type BlurIntensity = 'light' | 'medium' | 'strong' | 'ultra' | 'extreme';

interface BlurComponentProps {
  children?: React.ReactNode;
  intensity?: BlurIntensity;
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
}

const BlurComponent: React.FC<BlurComponentProps> = ({
  children,
  intensity = 'medium',
  style,
  overlay = true,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  overlayOpacity = 0.3,
  borderRadius = 16,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.1)',
  shadow = true,
  shadowColor = '#000000',
  shadowOpacity = 0.25,
  shadowRadius = 12,
  shadowOffset = { width: 0, height: 4 },
}) => {
  const getBlurAmount = (intensity: BlurIntensity): number => {
    switch (intensity) {
      case 'light':
        return 5;
      case 'medium':
        return 15;
      case 'strong':
        return 25;
      case 'ultra':
        return 40;
      case 'extreme':
        return 60;
      default:
        return 15;
    }
  };

  const getBlurType = (intensity: BlurIntensity): 'light' | 'regular' | 'prominent' | 'ultraThin' | 'thin' | 'extraDark' => {
    switch (intensity) {
      case 'light':
        return 'light';
      case 'medium':
        return 'regular';
      case 'strong':
        return 'prominent';
      case 'ultra':
        return 'ultraThin';
      case 'extreme':
        return 'extraDark';
      default:
        return 'regular';
    }
  };

  const blurAmount = getBlurAmount(intensity);
  const blurType = getBlurType(intensity);

  const containerStyle: ViewStyle = {
    borderRadius,
    borderWidth,
    borderColor,
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
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
      >
        {overlay && (
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: overlayColor,
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

// Header blur component specifically for headers
export const HeaderBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <BlurComponent
      intensity="ultra"
      overlay={true}
      overlayColor="rgba(0, 0, 0, 0.4)"
      overlayOpacity={0.4}
      borderRadius={0}
      borderWidth={0}
      shadow={false}
      style={[styles.headerBlur, style]}
      {...props}
    >
      {children}
    </BlurComponent>
  );
};

// Card blur component for cards and modals
export const CardBlur: React.FC<BlurComponentProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <BlurComponent
      intensity="strong"
      overlay={true}
      overlayColor="rgba(255, 255, 255, 0.05)"
      overlayOpacity={0.05}
      borderRadius={16}
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.15)"
      shadow={true}
      shadowColor="#000000"
      shadowOpacity={0.3}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 8 }}
      style={[styles.cardBlur, style]}
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
  ...props
}) => {
  return (
    <BlurComponent
      intensity="medium"
      overlay={true}
      overlayColor="rgba(255, 255, 255, 0.1)"
      overlayOpacity={0.1}
      borderRadius={12}
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.2)"
      shadow={true}
      shadowColor="#000000"
      shadowOpacity={0.2}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 4 }}
      style={[styles.buttonBlur, style]}
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
});

export default BlurComponent;
