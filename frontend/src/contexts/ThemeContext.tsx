import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme color definitions with better contrast
export const THEME_COLORS = {
  dark: {
    background: '#0A0A0A',        // Deeper black for better contrast
    surface: '#1A1A1A',           // Dark gray for cards
    surfaceSecondary: '#2A2A2A',  // Lighter dark gray
    card: '#1F1F1F',              // Card background
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      light: 'rgba(255, 255, 255, 0.15)',
      medium: 'rgba(255, 255, 255, 0.25)',
    },
    text: {
      primary: '#FFFFFF',         // Pure white for maximum contrast
      secondary: '#B8B8B8',       // Light gray for secondary text
      tertiary: '#8A8A8A',        // Medium gray for tertiary text
      disabled: '#5A5A5A',        // Dark gray for disabled text
    },
    accent: '#8cd279',            // Lime green accent
    success: '#4CAF50',           // Green for success states
    warning: '#FF9800',           // Orange for warnings
    error: '#F44336',             // Red for errors
    info: '#2196F3',              // Blue for info
    // Gradient colors for dark theme
    gradient: {
      primary: ['#1A1A1A', '#2A2A2A', '#1F1F1F'],
      accent: ['#8cd279', '#7BC96A', '#6AB85A'],
      surface: ['#1A1A1A', '#2A2A2A'],
    },
    // Shadow colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      heavy: 'rgba(0, 0, 0, 0.7)',
    },
  },
};

export interface Theme {
  colors: typeof THEME_COLORS.dark;
  isDark: boolean;
  mode: 'dark';
}

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark') => void;
  getThemeMode: () => 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always use dark mode - no theme switching
  const isDarkMode = true;
  const themeMode: 'dark' = 'dark';
  const currentTheme = THEME_COLORS.dark;

  const theme: Theme = {
    colors: currentTheme,
    isDark: isDarkMode,
    mode: themeMode,
  };

  const toggleTheme = () => {
    // No-op since we're always using dark mode
    console.log('Theme switching disabled - always using dark mode');
  };

  const setThemeMode = (mode: 'dark') => {
    // No-op since we're always using dark mode
    console.log('Theme switching disabled - always using dark mode');
  };

  const getThemeMode = () => 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        setThemeMode,
        getThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Backward compatibility function for existing code
export const useThemeColors = () => {
  const { theme } = useTheme();
  return {
    colors: theme.colors,
    isDark: theme.isDark,
    isDarkMode: theme.isDark,
  };
};

// Additional compatibility functions
export const useIsDark = () => {
  const { theme } = useTheme();
  return theme.isDark;
};

// Utility functions for theme-aware styling (dark mode only)
export const getThemeAwareStyle = (theme: Theme, lightStyle: any, darkStyle: any) => {
  return darkStyle; // Always return dark style
};

export const getThemeAwareColor = (theme: Theme, lightColor: string, darkColor: string) => {
  return darkColor; // Always return dark color
};

// Common theme-aware styles (dark mode only)
export const getCommonStyles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border.subtle,
  },
  text: {
    primary: {
      color: theme.colors.text.primary,
    },
    secondary: {
      color: theme.colors.text.secondary,
    },
    tertiary: {
      color: theme.colors.text.tertiary,
    },
  },
  border: {
    subtle: {
      borderColor: theme.colors.border.subtle,
    },
    light: {
      borderColor: theme.colors.border.light,
    },
  },
  shadow: {
    light: {
      shadowColor: theme.colors.shadow.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: theme.colors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
});
