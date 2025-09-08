import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const navigation = useNavigation();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>ProfileScreen</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Coming Soon...</Text>
      
      {/* Payment Test Button */}
      <TouchableOpacity 
        style={[styles.testButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('PaymentTest' as never)}
      >
        <Text style={[styles.testButtonText, { color: colors.text.primary }]}>
          Test Payment Integration
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  testButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
