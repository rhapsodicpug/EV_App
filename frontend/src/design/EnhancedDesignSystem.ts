/**
 * Enhanced Design System - Project Elevate
 * Modern, fluid design system inspired by Framer's aesthetic
 * Features glassmorphism, depth, motion, and premium interactions
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ==================== ENHANCED COLOR SYSTEM ====================

export const EnhancedColors = {
  // Primary Accent Gradient - Blue to Purple
  primary: {
    50: '#F3E8FF',
    100: '#E1BEE7', 
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#7C3AED', // Main gradient start
    600: '#6D28D9',
    700: '#5B21B6',
    800: '#4F46E5', // Main gradient end
    900: '#3730A3',
  },

  // Background System - Charcoal with depth
  background: {
    primary: '#111111', // Main charcoal background
    secondary: '#1A1A1A', // Elevated surfaces
    tertiary: '#2A2A2A', // Cards and elevated elements
    glass: 'rgba(26, 26, 26, 0.8)', // Glassmorphism base
    noise: '#0F0F0F', // Subtle noise texture
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF', // Bright white for headings
    secondary: '#A1A1A1', // Light gray for body text
    tertiary: '#666666', // Muted gray for subtitles
    disabled: '#404040', // Disabled state
    inverse: '#000000', // Text on light backgrounds
  },

  // Glassmorphism Colors
  glass: {
    primary: 'rgba(124, 58, 237, 0.1)', // Purple glass tint
    secondary: 'rgba(79, 70, 229, 0.1)', // Blue glass tint
    surface: 'rgba(255, 255, 255, 0.05)', // White glass overlay
    border: 'rgba(255, 255, 255, 0.1)', // Subtle border
    glow: 'rgba(124, 58, 237, 0.3)', // Glow effect
  },

  // Interactive States
  interactive: {
    hover: 'rgba(255, 255, 255, 0.1)',
    pressed: 'rgba(255, 255, 255, 0.05)',
    focus: 'rgba(124, 58, 237, 0.2)',
    active: '#7C3AED',
  },

  // Semantic Colors
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// ==================== GRADIENT DEFINITIONS ====================

export const Gradients = {
  // Primary accent gradient
  primary: ['#7C3AED', '#4F46E5'] as const,
  
  // Background gradients
  background: {
    radial: ['rgba(124, 58, 237, 0.1)', 'rgba(79, 70, 229, 0.05)', 'transparent'] as const,
    subtle: ['rgba(17, 17, 17, 0.8)', 'rgba(26, 26, 26, 0.6)'] as const,
  },

  // Glassmorphism gradients
  glass: {
    card: ['rgba(26, 26, 26, 0.8)', 'rgba(42, 42, 42, 0.6)'],
    border: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  },

  // Interactive gradients
  interactive: {
    hover: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    pressed: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
  },
};

// ==================== TYPOGRAPHY SYSTEM ====================

export const Typography = {
  fontFamily: {
    primary: 'Inter',
    fallback: 'System',
  },

  fontSize: {
    h1: 32, // User name
    h2: 24, // Section titles
    h3: 20, // Card titles
    body: 16, // Body text
    caption: 14, // Subtitles
    small: 12, // Small text
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ==================== SPACING SYSTEM ====================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ==================== BORDER RADIUS ====================

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ==================== SHADOWS & ELEVATION ====================

export const Shadows = {
  // Glassmorphism shadows
  glass: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Glow effects
  glow: {
    primary: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    secondary: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// ==================== ANIMATION CONFIGURATIONS ====================

export const Animations = {
  // Spring configurations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
    bouncy: {
      damping: 15,
      stiffness: 400,
      mass: 0.6,
    },
    snappy: {
      damping: 25,
      stiffness: 500,
      mass: 0.4,
    },
  },

  // Timing configurations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Stagger delays
  stagger: {
    small: 50,
    medium: 100,
    large: 150,
  },
};

// ==================== LAYOUT CONSTANTS ====================

export const Layout = {
  screenWidth,
  screenHeight,
  
  // Bento Grid configurations
  bentoGrid: {
    columns: 2,
    gap: Spacing.md,
    cardMinHeight: 120,
    cardMaxHeight: 200,
  },

  // Profile header
  profileHeader: {
    height: 200,
    avatarSize: 80,
    completionBarHeight: 6,
  },

  // Bottom navigation
  bottomNav: {
    height: 80,
    pillHeight: 60,
    iconSize: 24,
  },
};

// ==================== COMPONENT TOKENS ====================

export const ComponentTokens = {
  // Glassmorphic Card
  glassCard: {
    backgroundColor: EnhancedColors.glass.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: EnhancedColors.glass.border,
    padding: Spacing.lg,
    ...Shadows.glass.medium,
  },

  // Interactive Button
  interactiveButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: EnhancedColors.glass.border,
  },

  // Avatar
  avatar: {
    size: Layout.profileHeader.avatarSize,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: EnhancedColors.glass.border,
  },

  // Progress Bar
  progressBar: {
    height: Layout.profileHeader.completionBarHeight,
    borderRadius: BorderRadius.full,
    backgroundColor: EnhancedColors.background.tertiary,
  },
};

// ==================== EXPORT ALL ====================

export default {
  colors: EnhancedColors,
  gradients: Gradients,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animations: Animations,
  layout: Layout,
  tokens: ComponentTokens,
};
