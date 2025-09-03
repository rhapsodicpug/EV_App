/**
 * Design System Index
 * Central export point for all design system components and utilities
 */

// Design System Core
export * from './DesignSystem';

// Enhanced Design Utilities
export * from './DesignUtilities';

// Enhanced Color Scheme
export * from './ColorScheme';

// Theme System
export * from './ThemeContext';
export * from './ThemeToggle';

// Component Library
export * from './ComponentLibrary';

// Splash Screen
export * from './SplashScreen';

// Re-export commonly used components for convenience
export {
  // Typography
  TypographyText,
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  TitleLarge,
  TitleMedium,
  TitleSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
  
  // Components
  Button,
  Card,
  Spacer,
  Divider,
  Badge,
  Container,
} from './ComponentLibrary';

export {
  // Theme
  useTheme,
  useThemeColors,
  useIsDark,
} from './ThemeContext';

export {
  // Theme Toggle
  ThemeToggle,
} from './ThemeToggle';

export {
  // Splash Screen
  SplashScreen,
} from './SplashScreen';

// Enhanced Design Utilities - Direct exports for convenience
export {
  GlassMorphism,
  Gradients,
  Shadows,
  AnimationPresets,
  Responsive,
  PlatformUtils,
  Accessibility,
  Performance,
} from './DesignUtilities';
