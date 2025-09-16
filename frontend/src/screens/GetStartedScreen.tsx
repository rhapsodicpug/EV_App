/**
 * Get Started Onboarding Screen
 * Modern, animated onboarding experience for first-time users
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  HelpCircle,
  UserPlus,
  LogIn,
  Zap,
  Shield,
  Clock,
  MapPin,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Color palette for the onboarding screen
const ONBOARDING_COLORS = {
  primary: '#00A8FF',
  secondary: '#8B5CF6',
  success: '#10B981',
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  border: '#3A3A3A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
};

interface GetStartedScreenProps {
  onNavigateToAuth: () => void;
  onNavigateToLogin: () => void;
}

const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onNavigateToAuth,
  onNavigateToLogin,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // State for dynamic content
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Features to showcase
  const features = [
    {
      icon: Zap,
      title: 'Fast Charging',
      description: 'Find ultra-fast charging stations near you',
    },
    {
      icon: MapPin,
      title: 'Smart Navigation',
      description: 'Get directions to the nearest available charger',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live charging status and availability',
    },
  ];

  // Start animations on mount
  useEffect(() => {
    startAnimations();
    startFeatureRotation();
  }, []);

  const startAnimations = () => {
    // Main content animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for background elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startFeatureRotation = () => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const handleCreateAccount = () => {
    onNavigateToAuth();
  };

  const handleSignIn = () => {
    console.log('🔐 Sign in button pressed');
    onNavigateToLogin();
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Welcome to EV Charging App!\n\n• Create an account to get started\n• Sign in if you already have an account\n• Use social media for quick access\n\nNeed more help? Contact our support team.',
      [{ text: 'Got it!' }]
    );
  };

  const renderAuroraBackground = () => (
    <View style={styles.auroraContainer}>
      {/* Aurora blur effects */}
      <Animated.View
        style={[
          styles.auroraBlur,
          styles.auroraBlur1,
          {
            transform: [
              {
                translateX: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
              },
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                scale: floatingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.2, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.auroraBlur,
          styles.auroraBlur2,
          {
            transform: [
              {
                translateX: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
              {
                scale: floatingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1.1, 0.9, 1.1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.auroraBlur,
          styles.auroraBlur3,
          {
            transform: [
              {
                translateX: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
              {
                scale: floatingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.3, 0.8],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );

  const renderFeatureShowcase = () => {
    const FeatureIcon = features[currentFeature].icon;
    
    return (
      <Animated.View
        style={[
          styles.featureShowcase,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.featureIconContainer,
            {
              transform: [
                {
                  scale: isAnimating ? 1.2 : 1,
                },
              ],
            },
          ]}
        >
          <FeatureIcon size={32} color={ONBOARDING_COLORS.primary} />
        </Animated.View>
        <Text style={styles.featureTitle}>{features[currentFeature].title}</Text>
        <Text style={styles.featureDescription}>
          {features[currentFeature].description}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={ONBOARDING_COLORS.background} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[ONBOARDING_COLORS.background, ONBOARDING_COLORS.surface]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Aurora background effects */}
        {renderAuroraBackground()}
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.helpButton} onPress={handleHelp}>
            <HelpCircle size={20} color={ONBOARDING_COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Main content */}
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
          {/* Title */}
          <Text style={styles.title}>Get started</Text>
          
          {/* Feature showcase */}
          {renderFeatureShowcase()}
        </Animated.View>

        {/* Bottom section with buttons */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 30],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Create Account Button */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <UserPlus size={20} color={ONBOARDING_COLORS.text.primary} />
              <Text style={styles.createAccountText}>Create account</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <LogIn size={20} color={ONBOARDING_COLORS.text.primary} />
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>

          {/* Separator */}
          <Text style={styles.separatorText}>Or continue with</Text>

          {/* Social Media Buttons */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('Google Login', 'Google login functionality would be implemented here')}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('Apple Login', 'Apple login functionality would be implemented here')}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_COLORS.background,
  },

  backgroundGradient: {
    flex: 1,
  },

  auroraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  auroraBlur: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.3,
  },

  auroraBlur1: {
    width: 300,
    height: 300,
    backgroundColor: ONBOARDING_COLORS.primary,
    top: -100,
    left: -50,
    shadowColor: ONBOARDING_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },

  auroraBlur2: {
    width: 250,
    height: 250,
    backgroundColor: ONBOARDING_COLORS.secondary,
    top: height * 0.3,
    right: -80,
    shadowColor: ONBOARDING_COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
  },

  auroraBlur3: {
    width: 200,
    height: 200,
    backgroundColor: ONBOARDING_COLORS.success,
    bottom: -50,
    left: width * 0.2,
    shadowColor: ONBOARDING_COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },

  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ONBOARDING_COLORS.text.secondary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: ONBOARDING_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: 0.5,
  },

  featureShowcase: {
    alignItems: 'center',
    marginBottom: 40,
  },

  featureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${ONBOARDING_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: `${ONBOARDING_COLORS.primary}30`,
  },

  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ONBOARDING_COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  featureDescription: {
    fontSize: 16,
    color: ONBOARDING_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },

  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  createAccountButton: {
    backgroundColor: ONBOARDING_COLORS.success,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: ONBOARDING_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  createAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: ONBOARDING_COLORS.text.primary,
    marginLeft: 8,
  },

  signInButton: {
    backgroundColor: ONBOARDING_COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ONBOARDING_COLORS.border,
  },

  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: ONBOARDING_COLORS.text.primary,
    marginLeft: 8,
  },

  separatorText: {
    fontSize: 14,
    color: ONBOARDING_COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 16,
  },

  socialButton: {
    backgroundColor: ONBOARDING_COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ONBOARDING_COLORS.border,
  },

  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: ONBOARDING_COLORS.text.primary,
  },
});

export default GetStartedScreen;
