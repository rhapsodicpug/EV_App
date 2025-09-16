/**
 * Sign Up Screen
 * Clean, modern sign up interface matching the provided design
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
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { DynamicWallpaper } from '../../components';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Color palette for the sign up screen
const SIGNUP_COLORS = {
  primary: '#8cd279',
  secondary: '#8B5CF6',
  success: '#8cd279',
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

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const { register } = useAuth();

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

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google Sign Up', 'Google sign up functionality would be implemented here');
  };

  const handleAppleSignUp = () => {
    Alert.alert('Apple Sign Up', 'Apple sign up functionality would be implemented here');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <DynamicWallpaper theme="dark" variant="abstract">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <SafeAreaView style={styles.headerSafeArea}>
          <BlurView
            style={styles.headerContainer}
            intensity={50}
            tint="dark"
          >
            {/* Enhanced visual overlay for depth */}
            <View style={styles.headerOverlay} />
            
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ArrowLeft size={24} color={SIGNUP_COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Sign Up</Text>
              <View style={styles.headerSpacer} />
            </View>
          </BlurView>
        </SafeAreaView>

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
        {/* Full Name Input */}
        <BlurView
          style={styles.inputContainer}
          intensity={15}
          tint="dark"
        >
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={SIGNUP_COLORS.text.tertiary}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isLoading}
          />
          <User size={20} color={SIGNUP_COLORS.text.tertiary} style={styles.inputIcon} />
        </BlurView>

        {/* Email Input */}
        <BlurView
          style={styles.inputContainer}
          intensity={15}
          tint="dark"
        >
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={SIGNUP_COLORS.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Mail size={20} color={SIGNUP_COLORS.text.tertiary} style={styles.inputIcon} />
        </BlurView>

        {/* Phone Input */}
        <BlurView
          style={styles.inputContainer}
          intensity={15}
          tint="dark"
        >
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={SIGNUP_COLORS.text.tertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Phone size={20} color={SIGNUP_COLORS.text.tertiary} style={styles.inputIcon} />
        </BlurView>

        {/* Password Input */}
        <BlurView
          style={styles.inputContainer}
          intensity={15}
          tint="dark"
        >
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={SIGNUP_COLORS.text.tertiary}
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
              <EyeOff size={20} color={SIGNUP_COLORS.text.tertiary} />
            ) : (
              <Eye size={20} color={SIGNUP_COLORS.text.tertiary} />
            )}
          </TouchableOpacity>
        </BlurView>

        {/* Confirm Password Input */}
        <BlurView
          style={styles.inputContainer}
          intensity={15}
          tint="dark"
        >
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={SIGNUP_COLORS.text.tertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={SIGNUP_COLORS.text.tertiary} />
            ) : (
              <Eye size={20} color={SIGNUP_COLORS.text.tertiary} />
            )}
          </TouchableOpacity>
        </BlurView>

        {/* Sign Up Button */}
        <BlurView
          style={StyleSheet.flatten([styles.signUpButton, isLoading && styles.signUpButtonDisabled])}
          intensity={15}
          tint="dark"
        >
          <TouchableOpacity
            style={styles.signUpButtonTouchable}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </BlurView>

        {/* Or sign up with */}
        <Text style={styles.orText}>Or sign up with</Text>

        {/* Social Sign Up Buttons */}
        <View style={styles.socialButtonsContainer}>
          <BlurView
            style={styles.socialButton}
            intensity={15}
            tint="dark"
          >
            <TouchableOpacity
              style={styles.socialButtonTouchable}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </BlurView>

          <BlurView
            style={styles.socialButton}
            intensity={15}
            tint="dark"
          >
            <TouchableOpacity
              style={styles.socialButtonTouchable}
              onPress={handleAppleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </DynamicWallpaper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  headerSafeArea: {
    backgroundColor: SIGNUP_COLORS.background,
  },

  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SIGNUP_COLORS.text.primary,
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
    backgroundColor: SIGNUP_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: SIGNUP_COLORS.text.primary,
    borderWidth: 1,
    borderColor: SIGNUP_COLORS.border,
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

  signUpButton: {
    backgroundColor: SIGNUP_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: SIGNUP_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  signUpButtonDisabled: {
    opacity: 0.6,
  },

  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  orText: {
    fontSize: 14,
    color: SIGNUP_COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 20,
  },

  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },

  socialButton: {
    backgroundColor: SIGNUP_COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SIGNUP_COLORS.border,
  },

  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: SIGNUP_COLORS.text.primary,
    textAlign: 'center',
  },
  signUpButtonTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  socialButtonTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});

export default SignUpScreen;
