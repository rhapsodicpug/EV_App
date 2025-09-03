/**
 * EV Charging App Design System
 * A comprehensive design system based on Material Design 3 principles
 * Enhanced with Tesla-inspired design elements
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ==================== COLOR SYSTEM ====================

export const Colors = {
  // Primary Brand Colors - Tesla-inspired Electric Blue
  primary: {
    50: '#EFF6FF',   // Lightest blue tint
    100: '#DBEAFE',  // Very light blue
    200: '#BFDBFE',  // Light blue
    300: '#93C5FD',  // Medium light blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Main brand color - Tesla blue
    600: '#2563EB',  // Darker blue
    700: '#1D4ED8',  // Dark blue
    800: '#1E40AF',  // Very dark blue
    900: '#1E3A8A',  // Deepest blue
  },

  // Secondary Colors - Electric Green/Mint
  secondary: {
    50: '#F0FDF4',   // Lightest green tint
    100: '#DCFCE7',  // Very light green
    200: '#BBF7D0',  // Light green
    300: '#86EFAC',  // Medium light green
    400: '#4ADE80',  // Medium green
    500: '#22C55E',  // Main secondary color - Electric green
    600: '#16A34A',  // Darker green
    700: '#15803D',  // Dark green
    800: '#166534',  // Very dark green
    900: '#14532D',  // Deepest green
  },

  // Accent Colors - Premium Gold & Electric Cyan
  accent: {
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B', // Premium gold
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    cyan: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4', // Electric cyan
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
    },
    green: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E', // Success green
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316', // Warning orange
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444', // Error red
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Info blue
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
  },

  // Neutral Colors - Carbon Black to Pearl White
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F8FAFC',  // Pearl white
      100: '#F1F5F9', // Light pearl
      200: '#E2E8F0', // Very light gray
      300: '#CBD5E1', // Light gray
      400: '#94A3B8', // Medium light gray
      500: '#64748B', // Medium gray (Slate)
      600: '#475569', // Medium dark gray
      700: '#334155', // Dark gray
      800: '#1E293B', // Very dark gray
      900: '#0F172A', // Carbon black
    },
  },

  // Semantic Colors - Enhanced for better contrast
  semantic: {
    success: '#22C55E',    // Electric green
    warning: '#F97316',    // Amber orange
    error: '#EF4444',      // Crimson red
    info: '#3B82F6',       // Sky blue
    disabled: '#94A3B8',   // Medium gray
  },

  // Glass Morphism Colors
  glass: {
    primary: 'rgba(59, 130, 246, 0.1)',    // Blue glass
    secondary: 'rgba(34, 197, 94, 0.1)',   // Green glass
    surface: 'rgba(255, 255, 255, 0.1)',    // White glass
    dark: 'rgba(15, 23, 42, 0.1)',          // Dark glass
    blur: 'rgba(255, 255, 255, 0.8)',       // Blur overlay
  },
};

// ==================== TYPOGRAPHY SYSTEM ====================

export const Typography = {
  // Font Families - Inter-inspired system fonts
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    light: 'System',
  },

  // Font Sizes - Enhanced scale with better hierarchy
  fontSize: {
    display: {
      large: 48,    // Hero titles
      medium: 40,   // Large headings
      small: 32,    // Section titles
    },
    headline: {
      large: 28,    // Main headings
      medium: 24,   // Sub headings
      small: 20,    // Card titles
    },
    title: {
      large: 18,    // Important text
      medium: 16,    // Body text
      small: 14,    // Secondary text
    },
    body: {
      large: 16,    // Main content
      medium: 14,   // Regular content
      small: 12,    // Small text
    },
    label: {
      large: 14,    // Form labels
      medium: 12,   // Small labels
      small: 11,    // Micro text
    },
    code: {
      large: 14,    // Technical data
      medium: 12,   // Code snippets
      small: 10,    // Small code
    },
  },

  // Font Weights - Enhanced for better hierarchy
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights - Optimized for readability
  lineHeight: {
    tight: 1.2,     // Headings
    normal: 1.4,    // Body text
    relaxed: 1.6,   // Long text
    loose: 1.8,     // Spacious text
  },

  // Letter Spacing - Enhanced for better legibility
  letterSpacing: {
    tight: -0.5,    // Headings
    normal: 0,      // Body text
    wide: 0.5,      // Labels
    wider: 1,       // Display text
  },
};

// ==================== SPACING SYSTEM ====================

export const Spacing = {
  // Base spacing unit (8px grid system)
  base: 8,

  // Spacing scale - Enhanced for better rhythm
  xs: 4,     // 4px  - Micro spacing
  sm: 8,     // 8px  - Small spacing
  md: 16,    // 16px - Medium spacing
  lg: 24,    // 24px - Large spacing
  xl: 32,    // 32px - Extra large spacing
  xxl: 48,   // 48px - Section spacing
  xxxl: 64,  // 64px - Page spacing
  huge: 96,  // 96px - Hero spacing

  // Container widths - Mobile-first responsive
  container: {
    sm: 320,  // Small mobile
    md: 375,  // Standard mobile
    lg: 414,  // Large mobile
    xl: 768,  // Tablet
  },

  // Component spacing
  component: {
    padding: {
      sm: 12,   // Small components
      md: 16,   // Medium components
      lg: 20,   // Large components
      xl: 24,   // Extra large components
    },
    margin: {
      sm: 8,    // Small margins
      md: 16,   // Medium margins
      lg: 24,   // Large margins
      xl: 32,   // Extra large margins
    },
  },
};

// ==================== BORDER RADIUS SYSTEM ====================

export const BorderRadius = {
  // Border radius scale - Enhanced for modern design
  none: 0,
  xs: 2,      // Micro elements
  sm: 4,      // Small elements
  md: 8,      // Medium elements
  lg: 12,     // Large elements
  xl: 16,     // Extra large elements
  xxl: 24,    // Hero elements
  full: 9999, // Circular elements

  // Component-specific border radius
  component: {
    button: 8,      // Interactive elements
    card: 16,       // Content containers
    input: 12,      // Form elements
    modal: 20,      // Overlays
    avatar: 50,     // Profile images
    badge: 20,      // Status indicators
    chip: 24,       // Filter chips
  },
};

// ==================== ELEVATION SYSTEM ====================

export const Elevation = {
  // Material Design elevation levels - Enhanced for better depth
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  level3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  level4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  level5: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },

  // Glass morphism effects
  glass: {
    light: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    dark: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

// ==================== ANIMATION SYSTEM ====================

export const Animation = {
  // Duration - Enhanced timing for better UX
  duration: {
    instant: 50,    // Immediate feedback
    fast: 150,      // Quick interactions
    normal: 250,    // Standard transitions
    slow: 350,      // Smooth animations
    verySlow: 500,  // Complex animations
  },

  // Easing - Enhanced curves for natural motion
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Scale - Enhanced press feedback
  scale: {
    small: 0.98,    // Subtle feedback
    medium: 0.95,   // Standard feedback
    large: 0.9,     // Strong feedback
  },

  // Opacity - Enhanced transparency levels
  opacity: {
    disabled: 0.5,  // Disabled state
    overlay: 0.6,   // Background overlay
    modal: 0.9,     // Modal background
    ghost: 0.3,     // Ghost elements
  },

  // Spring configurations
  spring: {
    light: {
      tension: 100,
      friction: 8,
    },
    medium: {
      tension: 150,
      friction: 10,
    },
    heavy: {
      tension: 200,
      friction: 12,
    },
  },
};

// ==================== LAYOUT SYSTEM ====================

export const Layout = {
  // Screen dimensions
  screen: {
    width: screenWidth,
    height: screenHeight,
  },

  // Breakpoints - Enhanced for better responsiveness
  breakpoints: {
    mobile: 480,    // Small mobile
    tablet: 768,    // Tablet
    desktop: 1024,  // Desktop
    wide: 1440,     // Wide desktop
  },

  // Container max widths - Mobile-first approach
  container: {
    mobile: screenWidth - 32,  // Full width minus margins
    tablet: 720,              // Standard tablet width
    desktop: 1200,            // Standard desktop width
    wide: 1400,               // Wide desktop width
  },

  // Grid system - Enhanced for flexibility
  grid: {
    columns: 12,              // 12-column grid
    gutter: 16,               // Standard gutter
    margin: 16,               // Standard margin
    breakpoints: {
      mobile: 4,              // 4 columns on mobile
      tablet: 8,              // 8 columns on tablet
      desktop: 12,            // 12 columns on desktop
    },
  },

  // Aspect ratios
  aspectRatio: {
    square: 1,                // 1:1
    landscape: 16 / 9,        // 16:9
    portrait: 9 / 16,        // 9:16
    wide: 21 / 9,             // 21:9
  },
};

// ==================== COMPONENT TOKENS ====================

export const ComponentTokens = {
  // Button - Enhanced for better interaction
  button: {
    height: {
      small: 36,     // Compact buttons
      medium: 44,    // Standard buttons
      large: 52,     // Large buttons
      huge: 60,      // Hero buttons
    },
    padding: {
      horizontal: 20,  // Generous horizontal padding
      vertical: 12,    // Comfortable vertical padding
    },
    borderRadius: BorderRadius.component.button,
    fontSize: {
      small: Typography.fontSize.label.large,
      medium: Typography.fontSize.body.medium,
      large: Typography.fontSize.title.small,
    },
  },

  // Card - Enhanced for modern design
  card: {
    padding: 20,                    // Generous padding
    borderRadius: BorderRadius.component.card,
    elevation: Elevation.level2,     // Subtle elevation
    margin: Spacing.component.margin.md,
  },

  // Input - Enhanced for better UX
  input: {
    height: 52,                      // Taller for better touch targets
    padding: 16,                     // Comfortable padding
    borderRadius: BorderRadius.component.input,
    borderWidth: 1.5,                // Slightly thicker borders
    fontSize: Typography.fontSize.body.medium,
  },

  // Modal - Enhanced for modern overlays
  modal: {
    borderRadius: BorderRadius.component.modal,
    elevation: Elevation.level4,     // Strong elevation
    padding: 24,                     // Generous padding
  },

  // Avatar - Enhanced sizing
  avatar: {
    small: 36,                       // Small avatars
    medium: 48,                      // Standard avatars
    large: 64,                       // Large avatars
    huge: 80,                        // Hero avatars
    borderRadius: BorderRadius.component.avatar,
  },

  // Badge - New component token
  badge: {
    padding: {
      horizontal: 8,
      vertical: 4,
    },
    borderRadius: BorderRadius.component.badge,
    fontSize: Typography.fontSize.label.small,
  },

  // Chip - New component token
  chip: {
    height: 32,
    padding: {
      horizontal: 12,
      vertical: 6,
    },
    borderRadius: BorderRadius.component.chip,
    fontSize: Typography.fontSize.label.medium,
  },
};

// ==================== THEME TOKENS ====================

export const ThemeTokens = {
  // Light theme - Enhanced with new color palette
  light: {
    colors: {
      primary: Colors.primary[500],
      secondary: Colors.secondary[500],
      accent: {
        gold: Colors.accent.gold[500],
        cyan: Colors.accent.cyan[500],
      },
      background: Colors.neutral.white,
      surface: Colors.neutral.gray[50],
      text: {
        primary: Colors.neutral.gray[900],
        secondary: Colors.neutral.gray[600],
        tertiary: Colors.neutral.gray[400],
        disabled: Colors.neutral.gray[300],
        inverse: Colors.neutral.white,
      },
      border: Colors.neutral.gray[200],
      shadow: Colors.neutral.black,
      glass: Colors.glass.surface,
    },
  },

  // Dark theme - Enhanced with new color palette
  dark: {
    colors: {
      primary: Colors.primary[400],
      secondary: Colors.secondary[400],
      accent: {
        gold: Colors.accent.gold[400],
        cyan: Colors.accent.cyan[400],
      },
      background: Colors.neutral.gray[900],
      surface: Colors.neutral.gray[800],
      text: {
        primary: Colors.neutral.gray[100],
        secondary: Colors.neutral.gray[300],
        tertiary: Colors.neutral.gray[400],
        disabled: Colors.neutral.gray[600],
        inverse: Colors.neutral.gray[900],
      },
      border: Colors.neutral.gray[700],
      shadow: Colors.neutral.black,
      glass: Colors.glass.dark,
    },
  },
};

// ==================== EXPORT ALL ====================

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Elevation,
  Animation,
  Layout,
  ComponentTokens,
  ThemeTokens,
};
