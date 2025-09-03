import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors, Colors, Spacing, BorderRadius } from '../../design';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { clearError } = useAuth();
  const { colors } = useThemeColors();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual password reset API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      Alert.alert(
        'Reset Link Sent', 
        'If an account with that email exists, you will receive password reset instructions shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🔐</Text>
            <View style={[styles.logoGlow, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Enter your email to receive reset instructions</Text>
          <View style={[styles.headerAccent, { backgroundColor: colors.primary }]} />
        </View>

        {isSuccess ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.semantic.success} />
            <Text style={[styles.successTitle, { color: Colors.semantic.success }]}>Check Your Email</Text>
            <Text style={[styles.successText, { color: colors.text.secondary }]}>
              We've sent password reset instructions to {email}
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={24} color={colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.text.disabled}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {emailError ? <Text style={[styles.fieldError, { color: Colors.semantic.error }]}>{emailError}</Text> : null}
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: colors.primary }, isLoading && styles.resetButtonDisabled]} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={goToLogin}>
              <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.1,
  },
  headerAccent: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputIconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  fieldError: {
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
  },
  resetButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    minHeight: 50,
    justifyContent: 'center',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  backButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  backButtonText: {
    fontSize: 12,
  },
});

export default ForgotPasswordScreen;
