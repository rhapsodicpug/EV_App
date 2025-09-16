/**
 * Splash Screen
 * Shows while checking authentication status
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors, THEME_COLORS } from '../contexts/ThemeContext';

const SplashScreen: React.FC = () => {
  // Use fallback theme if ThemeProvider is not available
  let colors;
  try {
    const themeContext = useThemeColors();
    colors = themeContext.colors;
  } catch (error) {
    // Fallback to dark theme if ThemeProvider is not available
    colors = THEME_COLORS.dark;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>EV Charging App</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Powering Your Journey</Text>
      <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 32,
  },
  loader: {
    marginTop: 24,
  },
});

export default SplashScreen;
