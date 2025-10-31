/**
 * Two-Factor Verification Screen
 * Verify 2FA code during login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Color Palette
const COLORS = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#8cd279',
  error: '#FF6B6B',
  success: '#10B981',
};

interface RouteParams {
  email: string;
}

const TwoFactorVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as RouteParams;
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      Alert.alert('Error', 'Please enter a valid verification code');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await api.request('POST', '/auth/2fa/verify', {
        email,
        code: verificationCode,
      });

      // Save token
      await AsyncStorage.setItem('token', response.access_token);
      
      // Navigate to main app (will be handled by AuthContext)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>2FA Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Shield size={64} color={COLORS.accent} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.description}>
          Enter the 6-digit code from your authenticator app or use a backup code
        </Text>

        {/* Code Input */}
        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor={COLORS.text.tertiary}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={8}  // Allow backup codes (8 chars)
          editable={!isVerifying}
          autoFocus
        />

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Lost access to your authenticator?{'\n'}
          Use one of your backup codes
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: 'monospace',
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  helpText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TwoFactorVerificationScreen;

