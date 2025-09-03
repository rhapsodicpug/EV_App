/**
 * Enhanced Design Utilities
 * Additional utilities for Phase 1 design system enhancements
 */

import { Dimensions, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Elevation, Animation } from './DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ==================== GLASS MORPHISM UTILITIES ====================

export const GlassMorphism = {
  // Glass background styles
  background: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      backgroundColor: 'rgba(15, 23, 42, 0.1)',
      backdropFilter: 'blur(20px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Glass card styles
  card: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: Colors.neutral.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    dark: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      shadowColor: Colors.neutral.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },

  // Glass button styles
  button: {
    light: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      backdropFilter: 'blur(12px)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    dark: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      backdropFilter: 'blur(12px)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
  },
};

// ==================== GRADIENT UTILITIES ====================

export const Gradients = {
  // Primary gradients
  primary: {
    start: Colors.primary[500],
    end: Colors.primary[700],
  },
  secondary: {
    start: Colors.secondary[500],
    end: Colors.secondary[700],
  },
  accent: {
    start: Colors.accent.cyan[500],
    end: Colors.accent.blue[500],
  },

  // Premium gradients
  premium: {
    start: Colors.accent.gold[500],
    end: Colors.accent.orange[500],
  },

  // Status gradients
  success: {
    start: Colors.semantic.success,
    end: Colors.accent.green[700],
  },
  warning: {
    start: Colors.semantic.warning,
    end: Colors.accent.orange[700],
  },
  error: {
    start: Colors.semantic.error,
    end: Colors.accent.red[700],
  },

  // Background gradients
  background: {
    light: {
      start: Colors.neutral.white,
      end: Colors.neutral.gray[50],
    },
    dark: {
      start: Colors.neutral.gray[900],
      end: Colors.neutral.gray[800],
    },
  },
};

// ==================== SHADOW UTILITIES ====================

export const Shadows = {
  // Enhanced shadow presets
  subtle: {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  strong: {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  // Colored shadows
  primary: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  success: {
    shadowColor: Colors.semantic.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    shadowColor: Colors.semantic.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// ==================== ANIMATION PRESETS ====================

export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: Animation.duration.normal,
    easing: Animation.easing.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: Animation.duration.fast,
    easing: Animation.easing.easeIn,
  },

  // Scale animations
  scaleIn: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: Animation.duration.normal,
    easing: Animation.easing.bounce,
  },
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.8, opacity: 0 },
    duration: Animation.duration.fast,
    easing: Animation.easing.easeIn,
  },

  // Slide animations
  slideUp: {
    from: { translateY: 50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: Animation.duration.normal,
    easing: Animation.easing.easeOut,
  },
  slideDown: {
    from: { translateY: -50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: Animation.duration.normal,
    easing: Animation.easing.easeOut,
  },

  // Press animations
  press: {
    scale: Animation.scale.medium,
    duration: Animation.duration.fast,
    easing: Animation.easing.easeOut,
  },

  // Pulse animations
  pulse: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    duration: Animation.duration.slow,
    easing: Animation.easing.easeInOut,
  },
};

// ==================== RESPONSIVE UTILITIES ====================

export const Responsive = {
  // Screen size helpers
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  isTablet: screenWidth >= 768,

  // Responsive spacing
  spacing: {
    xs: screenWidth < 375 ? 4 : 6,
    sm: screenWidth < 375 ? 8 : 12,
    md: screenWidth < 375 ? 16 : 20,
    lg: screenWidth < 375 ? 24 : 32,
    xl: screenWidth < 375 ? 32 : 48,
  },

  // Responsive font sizes
  fontSize: {
    display: screenWidth < 375 ? Typography.fontSize.display.small : Typography.fontSize.display.medium,
    headline: screenWidth < 375 ? Typography.fontSize.headline.small : Typography.fontSize.headline.medium,
    title: screenWidth < 375 ? Typography.fontSize.title.medium : Typography.fontSize.title.large,
    body: screenWidth < 375 ? Typography.fontSize.body.medium : Typography.fontSize.body.large,
  },

  // Responsive padding
  padding: {
    horizontal: screenWidth < 375 ? 16 : 20,
    vertical: screenWidth < 375 ? 16 : 24,
  },
};

// ==================== PLATFORM UTILITIES ====================

export const PlatformUtils = {
  // Platform-specific styles
  shadow: Platform.select({
    ios: {
      shadowColor: Colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),

  // Platform-specific animations
  animation: Platform.select({
    ios: {
      useNativeDriver: true,
    },
    android: {
      useNativeDriver: false,
    },
  }),

  // Platform-specific fonts
  fontFamily: Platform.select({
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      semibold: 'SF Pro Text',
      bold: 'SF Pro Text',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto',
      semibold: 'Roboto',
      bold: 'Roboto',
    },
  }),
};

// ==================== ACCESSIBILITY UTILITIES ====================

export const Accessibility = {
  // Minimum touch target size
  minTouchTarget: 44,

  // Contrast ratios
  contrast: {
    normal: 4.5,
    large: 3.0,
  },

  // Focus indicators
  focus: {
    borderWidth: 2,
    borderColor: Colors.primary[500],
    borderRadius: BorderRadius.sm,
  },

  // Screen reader labels
  labels: {
    button: (text: string) => `${text} button`,
    link: (text: string) => `${text} link`,
    image: (text: string) => `${text} image`,
  },
};

// ==================== PERFORMANCE UTILITIES ====================

export const Performance = {
  // Debounce delay
  debounceDelay: 300,

  // Throttle delay
  throttleDelay: 100,

  // Animation frame rate
  frameRate: 60,

  // Memory management
  memory: {
    maxCacheSize: 50,
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
  },
};

// ==================== EXPORT ALL ====================

export default {
  GlassMorphism,
  Gradients,
  Shadows,
  AnimationPresets,
  Responsive,
  PlatformUtils,
  Accessibility,
  Performance,
};
