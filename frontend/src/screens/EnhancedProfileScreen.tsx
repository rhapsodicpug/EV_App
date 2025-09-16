/**
 * Enhanced Profile Screen - Project Elevate
 * Modern, fluid profile screen with glassmorphism, depth, and premium interactions
 * Inspired by Framer's design aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  Bell,
  Car,
  CreditCard,
  HelpCircle,
  MessageCircle,
  LogOut,
  ChevronRight,
  Camera,
  Star,
  Calendar,
  MapPin,
} from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Enhanced Components
import {
  GlassmorphicCard,
  AnimatedProgressBar,
  EnhancedAvatar,
  BentoGrid,
  AnimatedToggle,
  GradientText,
} from '../components';

// Enhanced Design System
import {
  EnhancedColors,
  Gradients,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from '../design/EnhancedDesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  type: 'toggle' | 'navigation' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  size?: 'small' | 'medium' | 'large';
}

const EnhancedProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailUpdates: false,
    promotions: false,
  });

  // Profile completion calculation
  const profileCompletion = React.useMemo(() => {
    let completion = 0;
    if (user?.name) completion += 25;
    if (user?.email) completion += 25;
    if (user?.phone) completion += 25;
    // Add more profile fields as needed
    completion += 25; // Default completion for basic profile
    return Math.min(completion, 100);
  }, [user]);

  // Animate on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 300 }));
  }, []);

  const getUserName = (user: any) => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'vehicle-details':
        // @ts-ignore
        navigation.navigate('MyVehicle');
        break;
      case 'payment-methods':
        // @ts-ignore
        navigation.navigate('PaymentMethods');
        break;
      case 'help-support':
        // @ts-ignore
        navigation.navigate('HelpSupport');
        break;
      case 'feedback':
        // @ts-ignore
        navigation.navigate('Feedback');
        break;
      case 'about':
        // @ts-ignore
        navigation.navigate('About');
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  // Settings configuration
  const settingsItems: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Push notifications & alerts',
      icon: Bell,
      type: 'toggle',
      value: settings.pushNotifications,
      onToggle: (value) => setSettings(prev => ({ ...prev, pushNotifications: value })),
      size: 'medium',
    },
    {
      id: 'vehicle-details',
      title: 'My Vehicle',
      subtitle: 'Tesla Model 3 • ABC-1234',
      icon: Car,
      type: 'navigation',
      onPress: () => handleSettingPress('vehicle-details'),
      size: 'large',
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      subtitle: 'Visa •••• 4242',
      icon: CreditCard,
      type: 'navigation',
      onPress: () => handleSettingPress('payment-methods'),
      size: 'medium',
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Live chat & support',
      icon: HelpCircle,
      type: 'navigation',
      onPress: () => handleSettingPress('help-support'),
      size: 'medium',
    },
  ];

  const navigationItems: SettingItem[] = [
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve',
      icon: MessageCircle,
      type: 'navigation',
      onPress: () => handleSettingPress('feedback'),
      size: 'small',
    },
    {
      id: 'about',
      title: 'About App',
      subtitle: 'Version 1.0.0',
      icon: Star,
      type: 'navigation',
      onPress: () => handleSettingPress('about'),
      size: 'small',
    },
  ];

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  const renderSettingCard = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    return (
      <GlassmorphicCard
        key={item.id}
        onPress={item.onPress}
        size={item.size}
        variant="interactive"
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IconComponent 
                size={24} 
                color={EnhancedColors.text.primary} 
              />
            </View>
            {item.type === 'toggle' && (
              <AnimatedToggle
                value={item.value || false}
                onValueChange={item.onToggle || (() => {})}
                size="medium"
              />
            )}
            {item.type === 'navigation' && (
              <ChevronRight 
                size={20} 
                color={EnhancedColors.text.tertiary} 
              />
            )}
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
      </GlassmorphicCard>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={EnhancedColors.background.primary} />
      
      {/* Enhanced Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={Gradients.background.radial}
          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.noiseOverlay} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Profile Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <EnhancedAvatar
              size={80}
              name={getUserName(user)}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('EditProfile');
              }}
              showGlow={true}
            />

            {/* User Info */}
            <View style={styles.userInfo}>
              <GradientText
                gradient={Gradients.primary}
                fontSize={Typography.fontSize.h1}
                fontWeight={Typography.fontWeight.bold}
                style={styles.userName}
              >
                {getUserName(user)}
              </GradientText>
              
              <Text style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </Text>

              {/* Profile Completion */}
              <AnimatedProgressBar
                progress={profileCompletion}
                height={6}
                showPercentage={true}
                label="Profile Completion"
                style={styles.progressBar}
              />

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Calendar size={16} color={EnhancedColors.text.secondary} />
                  <Text style={styles.statText}>Member since 2024</Text>
                </View>
                <View style={styles.statItem}>
                  <MapPin size={16} color={EnhancedColors.text.secondary} />
                  <Text style={styles.statText}>56 trips completed</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Settings Grid */}
        <Animated.View style={[styles.settingsContainer, contentStyle]}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <BentoGrid columns={2} gap={Spacing.md} animated={true}>
            {settingsItems.map(renderSettingCard)}
          </BentoGrid>
        </Animated.View>

        {/* Additional Options */}
        <Animated.View style={[styles.additionalContainer, contentStyle]}>
          <Text style={styles.sectionTitle}>More</Text>
          <BentoGrid columns={2} gap={Spacing.md} animated={true}>
            {navigationItems.map(renderSettingCard)}
          </BentoGrid>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View style={[styles.logoutContainer, contentStyle]}>
          <GlassmorphicCard
            onPress={() => handleSettingPress('logout')}
            variant="elevated"
          >
            <View style={styles.logoutContent}>
              <LogOut size={24} color={EnhancedColors.semantic.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </View>
          </GlassmorphicCard>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EnhancedColors.background.primary,
  },

  // Background
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  noiseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: EnhancedColors.background.noise,
    opacity: 0.3,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },

  // Header
  header: {
    marginBottom: Spacing.xxl,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    width: '100%',
  },
  userName: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.regular,
    color: EnhancedColors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    color: EnhancedColors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },

  // Settings
  settingsContainer: {
    marginBottom: Spacing.xxl,
  },
  additionalContainer: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: EnhancedColors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.lg,
    letterSpacing: Typography.letterSpacing.tight,
  },

  // Card Content
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EnhancedColors.glass.surface,
    borderRadius: BorderRadius.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.semibold,
    color: EnhancedColors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
    color: EnhancedColors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },

  // Logout
  logoutContainer: {
    marginBottom: Spacing.xl,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  logoutText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: EnhancedColors.semantic.error,
    fontFamily: Typography.fontFamily.primary,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: Spacing.xxl,
  },
});

export default EnhancedProfileScreen;
