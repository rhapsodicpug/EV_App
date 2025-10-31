/**
 * Two-Factor Authentication Setup Screen
 * Allows users to enable 2FA with Google Authenticator
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Clipboard,
} from 'react-native';
import { ArrowLeft, Copy, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import api from '../../services/api';
import AlertService from '../../services/AlertService';

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

const TwoFactorSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQRCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    setupTwoFactor();
  }, []);

  const setupTwoFactor = async () => {
    try {
      setIsLoading(true);
      const response = await api.request('POST', '/auth/2fa/setup');
      setSecret(response.secret);
      setQRCode(response.qr_code);
      setBackupCodes(response.backup_codes);
    } catch (error: any) {
      AlertService.error('Error', error.response?.data?.detail || 'Failed to setup 2FA', () => navigation.goBack());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    Clipboard.setString(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    Clipboard.setString(backupCodes.join('\n'));
    AlertService.success('Copied', 'Backup codes copied to clipboard');
  };

  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      AlertService.error('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsSaving(true);
      await api.request('POST', '/auth/2fa/enable', { code: verificationCode });
      setShowBackupCodes(true);
    } catch (error: any) {
      AlertService.error('Error', error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    AlertService.success(
      '2FA Enabled',
      'Two-factor authentication has been enabled successfully!',
      () => navigation.goBack()
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Setting up 2FA...</Text>
      </View>
    );
  }

  if (showBackupCodes) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Backup Codes</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionTitle}>Save Your Backup Codes</Text>
          <Text style={styles.description}>
            Store these backup codes in a safe place. Each code can be used once if you lose access to your
            authenticator app.
          </Text>

          <View style={styles.backupCodesContainer}>
            {backupCodes.map((code, index) => (
              <View key={index} style={styles.backupCodeItem}>
                <Text style={styles.backupCodeNumber}>{index + 1}.</Text>
                <Text style={styles.backupCodeText}>{code}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyBackupCodes}
            activeOpacity={0.8}
          >
            <Copy size={20} color={COLORS.text.primary} />
            <Text style={styles.copyButtonText}>Copy All Codes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>Finish Setup</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup 2FA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Scan QR Code */}
        <View style={styles.section}>
          <Text style={styles.stepNumber}>Step 1</Text>
          <Text style={styles.sectionTitle}>Scan QR Code</Text>
          <Text style={styles.description}>
            Open Google Authenticator or any TOTP app and scan this QR code:
          </Text>

          <View style={styles.qrCodeContainer}>
            {qrCode ? (
              <QRCode
                value={`data:image/png;base64,${qrCode}`}
                size={200}
                backgroundColor={COLORS.surface}
                color={COLORS.text.primary}
              />
            ) : (
              <ActivityIndicator size="large" color={COLORS.accent} />
            )}
          </View>
        </View>

        {/* Step 2: Manual Entry (Optional) */}
        <View style={styles.section}>
          <Text style={styles.stepNumber}>Step 2 (Optional)</Text>
          <Text style={styles.sectionTitle}>Or Enter Secret Manually</Text>
          <Text style={styles.description}>
            If you can't scan the QR code, enter this secret key manually:
          </Text>

          <View style={styles.secretContainer}>
            <Text style={styles.secretText}>{secret}</Text>
            <TouchableOpacity
              style={styles.copyIconButton}
              onPress={handleCopySecret}
              activeOpacity={0.8}
            >
              {copiedSecret ? (
                <Check size={20} color={COLORS.success} />
              ) : (
                <Copy size={20} color={COLORS.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 3: Verify */}
        <View style={styles.section}>
          <Text style={styles.stepNumber}>Step 3</Text>
          <Text style={styles.sectionTitle}>Verify Your Code</Text>
          <Text style={styles.description}>
            Enter the 6-digit code from your authenticator app:
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor={COLORS.text.tertiary}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isSaving}
          />

          <TouchableOpacity
            style={[styles.enableButton, isSaving && styles.enableButtonDisabled]}
            onPress={handleEnable2FA}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.enableButtonText}>Enable 2FA</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: 32,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  qrCodeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  secretContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  secretText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    fontFamily: 'monospace',
  },
  copyIconButton: {
    padding: 8,
  },
  codeInput: {
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
    marginBottom: 16,
  },
  enableButton: {
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
  },
  enableButtonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  backupCodesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  backupCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backupCodeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginRight: 12,
    width: 24,
  },
  backupCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  finishButton: {
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
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

export default TwoFactorSetupScreen;

