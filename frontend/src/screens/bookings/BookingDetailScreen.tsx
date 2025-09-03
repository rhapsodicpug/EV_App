import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

const BookingDetailScreen: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>BookingDetailScreen</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Coming Soon...</Text>
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
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
  },
});

export default BookingDetailScreen;
