import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../design';

const EditProfileScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { colors } = useThemeColors();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      padding: Spacing.lg,
      paddingTop: 60,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      color: Colors.neutral.white,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: Colors.neutral.white,
      opacity: 0.9,
      textAlign: 'center',
    },
    form: {
      padding: Spacing.lg,
    },
    inputGroup: {
      marginBottom: Spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      marginBottom: Spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      ...Elevation.level1,
    },
    input: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Elevation.level2,
    },
    cancelButton: {
      borderWidth: 1,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: 'bold' as const,
    },
    saveButton: {
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      marginLeft: Spacing.sm,
    },
  });

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Create updated user object
      const updatedUser = {
        ...user!,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        updated_at: new Date().toISOString(),
      };

      // Update user in context (this will also update AsyncStorage)
      updateUser(updatedUser);

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Full Name *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Email Address *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Phone Number</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number (optional)"
                placeholderTextColor={colors.text.secondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons name="checkmark" size={20} color={Colors.neutral.white} />
            <Text style={[styles.saveButtonText, { color: Colors.neutral.white }]}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
