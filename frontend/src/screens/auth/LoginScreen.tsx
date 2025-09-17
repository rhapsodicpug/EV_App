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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testNetworkConnection, logNetworkInfo } from '../../utils/networkTest';

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
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Auth context
  const { login } = useAuth();

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
      await login({ email: email.trim(), password });
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'Google login functionality would be implemented here');
  };

  const handleAppleLogin = () => {
    Alert.alert('Apple Login', 'Apple login functionality would be implemented here');
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

        {/* Or login with */}
        <Text style={styles.orText}>Or login with</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Network Test Button (Development Only) */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.networkTestButton}
            onPress={async () => {
              logNetworkInfo();
              const result = await testNetworkConnection();
              Alert.alert(
                'Network Test Result',
                result.success 
                  ? 'Network connection successful!' 
                  : `Network test failed: ${result.error}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.networkTestButtonText}>Test Network Connection</Text>
          </TouchableOpacity>
        )}

        {/* Sign Up Link */}
        <TouchableOpacity style={styles.signUpContainer} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
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

  orText: {
    fontSize: 14,
    color: LOGIN_COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 20,
  },

  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },

  socialButton: {
    backgroundColor: LOGIN_COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LOGIN_COLORS.border,
  },

  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: LOGIN_COLORS.text.primary,
  },

  networkTestButton: {
    backgroundColor: LOGIN_COLORS.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LOGIN_COLORS.border,
  },

  networkTestButtonText: {
    fontSize: 12,
    color: LOGIN_COLORS.text.secondary,
    fontWeight: '500',
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
});

export default LoginScreen;