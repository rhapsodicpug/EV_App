/**
 * Theme Context for Light/Dark Mode Support
 * Provides theme switching functionality with smooth transitions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeTokens } from './DesignSystem';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme context type
interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  isDark: boolean;
  colors: typeof ThemeTokens.light.colors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme storage key
const THEME_STORAGE_KEY = '@ev_charging_app:theme_mode';

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Get current theme based on mode and system preference
  const getCurrentTheme = (mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Update theme when mode or system preference changes
  useEffect(() => {
    const currentTheme = getCurrentTheme(themeMode);
    setTheme(currentTheme);
  }, [themeMode, systemColorScheme]);

  // Save theme mode to storage
  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    saveThemeMode(newMode);
  };

  // Set specific theme mode
  const setThemeModeHandler = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };

  // Get theme colors
  const colors = theme === 'dark' ? ThemeTokens.dark.colors : ThemeTokens.light.colors;

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    isDark: theme === 'dark',
    colors,
    toggleTheme,
    setThemeMode: setThemeModeHandler,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to get theme colors
export const useThemeColors = () => {
  const { colors, isDark } = useTheme();
  return { colors, isDark };
};

// Hook to check if dark mode is active
export const useIsDark = () => {
  const { isDark } = useTheme();
  return isDark;
};
