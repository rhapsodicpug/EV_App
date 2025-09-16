/**
 * Back to Get Started Screen
 * Simple screen that appears when user clicks back from Login
 * Matches the UI design and provides options to go back to Get Started flow
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, LogIn } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Color palette matching the login screen
const BACK_COLORS = {
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

const BackToGetStartedScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACK_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Choose how you'd like to continue
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGoToLogin}
            activeOpacity={0.8}
          >
            <LogIn size={24} color={BACK_COLORS.text.primary} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGoToSignUp}
            activeOpacity={0.8}
          >
            <UserPlus size={24} color={BACK_COLORS.text.primary} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACK_COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: BACK_COLORS.background,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BACK_COLORS.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'center',
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },

  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: BACK_COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: BACK_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  actionsContainer: {
    gap: 16,
  },

  actionButton: {
    backgroundColor: BACK_COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BACK_COLORS.border,
  },

  buttonIcon: {
    marginRight: 16,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BACK_COLORS.text.primary,
  },
});

export default BackToGetStartedScreen;
