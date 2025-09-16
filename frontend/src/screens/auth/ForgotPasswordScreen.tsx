/**
 * Forgot Password Screen
 * Clean, modern forgot password interface matching the provided design
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
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Color palette for the forgot password screen
const FORGOT_COLORS = {
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

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  
  // Form state
  const [email, setEmail] = useState('');
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

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement actual password reset API call
      // For now, just show a success message
      setTimeout(() => {
        Alert.alert(
          'Reset Link Sent',
          'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        setIsLoading(false);
      }, 1500);
      
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send reset link. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={FORGOT_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={FORGOT_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
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
        {/* Heading */}
        <Text style={styles.heading}>Enter your email</Text>
        
        {/* Instructions */}
        <Text style={styles.instructions}>
          We'll send you a link to reset your password.
        </Text>

        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={FORGOT_COLORS.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Mail size={20} color={FORGOT_COLORS.text.tertiary} style={styles.inputIcon} />
          </View>
        </View>
      </Animated.View>

      {/* Reset Password Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? 'Sending...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORGOT_COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: FORGOT_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FORGOT_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FORGOT_COLORS.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: FORGOT_COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'left',
  },

  instructions: {
    fontSize: 14,
    color: FORGOT_COLORS.text.secondary,
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 20,
  },

  inputSection: {
    marginBottom: 32,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: FORGOT_COLORS.text.primary,
    marginBottom: 8,
  },

  inputContainer: {
    position: 'relative',
  },

  input: {
    backgroundColor: FORGOT_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: FORGOT_COLORS.text.primary,
    borderWidth: 1,
    borderColor: FORGOT_COLORS.border,
  },

  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  resetButton: {
    backgroundColor: FORGOT_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FORGOT_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  resetButtonDisabled: {
    opacity: 0.6,
  },

  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: FORGOT_COLORS.text.primary,
  },
});

export default ForgotPasswordScreen;