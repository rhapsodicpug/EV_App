/**
 * Login Screen
 * Clean, modern login interface matching the provided design
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

// Color palette for the login screen
const LOGIN_COLORS = {
  primary: '#00A8FF',
  secondary: '#8B5CF6',
  success: '#10B981',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#3A3A3A',
  border: '#4A4A4A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
  green: '#8cd279', // App's lime green accent
  greenDark: '#6fb560',
  greenLight: '#a3e290',
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA Modal state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check if we're in 2FA flow on mount
  useEffect(() => {
    const check2FAStatus = async () => {
      const is2FAPending = await AsyncStorage.getItem('is2FAPending');
      const savedEmail = await AsyncStorage.getItem('2fa_email');
      console.log('🔐 LoginScreen mounted - is2FAPending:', is2FAPending);
      console.log('🔐 LoginScreen mounted - savedEmail:', savedEmail);
      
      if (is2FAPending === 'true' && savedEmail) {
        console.log('🔐 Restoring 2FA modal');
        setUserEmail(savedEmail);
        setShow2FAModal(true);
      }
    };
    check2FAStatus();
  }, []);

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Debug: Log when 2FA modal visibility changes
  useEffect(() => {
    console.log('🔐 2FA Modal visibility changed:', show2FAModal);
  }, [show2FAModal]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Auth context
  const { login, checkAuthStatus, clear2FAPending } = useAuth();

  // Start animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Login attempt starting...');
      const response = await login({ email: email.trim(), password });
      
      console.log('🔐 Login response:', response);
      
      // Check if 2FA is required
      if (response && response.two_factor_required) {
        console.log('🔐 2FA required, showing modal');
        console.log('🔐 Setting userEmail to:', email.trim());
        console.log('🔐 Setting show2FAModal to true');
        
        // Save email to AsyncStorage to restore modal on remount
        await AsyncStorage.setItem('2fa_email', email.trim());
        console.log('🔐 Saved email to AsyncStorage');
        
        setUserEmail(email.trim());
        setShow2FAModal(true);
        console.log('🔐 Modal state updated, should be visible now');
        return; // Don't proceed with normal login
      } else {
        console.log('🔐 No 2FA required, normal login');
        console.log('🔐 Response:', response);
      }
      // Otherwise navigation will be handled by AuthContext
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      console.log('🔐 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      console.log('🔐 Verifying 2FA code...');
      
      const response = await api.request('POST', '/auth/2fa/verify', {
        email: userEmail,
        code: twoFactorCode,
      });

      console.log('🔐 2FA verification response:', response);

      // Save token to AsyncStorage with the correct key
      await AsyncStorage.setItem('@ev_charging_app:auth_token', response.access_token);
      console.log('🔐 Token saved to AsyncStorage with key: @ev_charging_app:auth_token');
      
      // Clear 2FA flags (IMPORTANT: This clears both ref and storage)
      await clear2FAPending();
      console.log('🔐 2FA flags cleared via clear2FAPending');
      
      // Close modal
      setShow2FAModal(false);
      setTwoFactorCode('');
      
      console.log('🔐 2FA verification successful');
      
      // Now trigger auth context to check authentication status
      // This will fetch the user profile and update the auth state
      // causing the AppNavigator to automatically navigate to Main
      console.log('🔐 Triggering auth status check...');
      await checkAuthStatus();
      console.log('🔐 Auth status updated, should navigate to Main now');
      
    } catch (error: any) {
      console.error('🔐 2FA verification error:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Invalid verification code. Please try again.');
      setTwoFactorCode(''); // Clear the code on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose2FAModal = async () => {
    // Clear 2FA flags
    await clear2FAPending();
    console.log('🔐 2FA flags cleared (modal closed)');
    
    setShow2FAModal(false);
    setTwoFactorCode('');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleBack = () => {
    // Navigate to the BackToGetStarted screen instead of trying to go back
    navigation.navigate('BackToGetStarted');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={LOGIN_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={LOGIN_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={LOGIN_COLORS.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Mail size={20} color={LOGIN_COLORS.text.tertiary} style={styles.inputIcon} />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={LOGIN_COLORS.text.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff size={20} color={LOGIN_COLORS.text.tertiary} />
            ) : (
              <Eye size={20} color={LOGIN_COLORS.text.tertiary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity style={styles.signUpContainer} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 2FA Verification Modal */}
      <Modal
        visible={show2FAModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose2FAModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.shieldIconContainer}>
                <Shield size={40} color={LOGIN_COLORS.green} strokeWidth={2.5} />
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleClose2FAModal}
              >
                <X size={24} color={LOGIN_COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code from your authenticator app
            </Text>

            {/* Code Input */}
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor={LOGIN_COLORS.text.tertiary}
              keyboardType="number-pad"
              maxLength={6}
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              editable={!isVerifying}
              autoFocus={true}
            />

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isVerifying && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify2FA}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.modalHelpText}>
              Can't access your authenticator app? Contact support for help.
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: LOGIN_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LOGIN_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LOGIN_COLORS.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },

  input: {
    backgroundColor: LOGIN_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: LOGIN_COLORS.text.primary,
    borderWidth: 1,
    borderColor: LOGIN_COLORS.border,
  },

  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },

  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },

  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: LOGIN_COLORS.text.secondary,
    fontWeight: '500',
  },

  loginButton: {
    backgroundColor: LOGIN_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: LOGIN_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LOGIN_COLORS.text.primary,
  },

  signUpContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },

  signUpText: {
    fontSize: 14,
    color: LOGIN_COLORS.text.secondary,
    fontWeight: '500',
  },

  // 2FA Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: LOGIN_COLORS.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.2)',
    shadowColor: LOGIN_COLORS.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  shieldIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(140, 210, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(140, 210, 121, 0.3)',
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LOGIN_COLORS.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 15,
    color: LOGIN_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },

  codeInput: {
    backgroundColor: LOGIN_COLORS.card,
    borderRadius: 16,
    padding: 18,
    fontSize: 28,
    color: LOGIN_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 10,
    fontWeight: '700',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: LOGIN_COLORS.green,
    shadowColor: LOGIN_COLORS.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  verifyButton: {
    backgroundColor: LOGIN_COLORS.green,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: LOGIN_COLORS.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },

  verifyButtonDisabled: {
    opacity: 0.5,
    backgroundColor: LOGIN_COLORS.card,
  },

  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  modalHelpText: {
    fontSize: 13,
    color: LOGIN_COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;