/**
 * Splash Screen
 * Shows while checking authentication status
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

const SplashScreen: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>EV Charging App</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Powering Your Journey</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: Spacing.xl,
  },
  loader: {
    marginTop: Spacing.lg,
  },
});

export default SplashScreen;
