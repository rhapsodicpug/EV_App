import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import {
  Bell,
  Car,
  CreditCard,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
// import PremiumModal from '../components/ui/PremiumModal'; // Temporarily disabled due to import issues


// Sophisticated Color Palette
const COLORS = {
  background: '#101010',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#00A8FF',
  accentLight: '#4DC3FF',
};

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  type: 'toggle' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  // Modal state - temporarily disabled
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    icon: 'help-circle-outline',
    title: 'Feature Coming Soon',
    message: 'Our team is hard at work building this. It will be available in a future update!',
    buttonText: 'Got It',
  });

  // State for settings
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailUpdates: false,
    promotions: false,
  });

  // Update interactive settings with proper state binding
  const interactiveSettings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: Bell,
      type: 'toggle',
      value: settings.pushNotifications,
      onToggle: (value) => setSettings(prev => ({ ...prev, pushNotifications: value })),
    },
    {
      id: 'vehicle-details',
      title: 'My Vehicle',
      subtitle: 'Manage vehicle information',
      icon: Car,
      type: 'navigation',
      onPress: () => handleSettingPress('vehicle-details'),
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      icon: CreditCard,
      type: 'navigation',
      onPress: () => handleSettingPress('payment-methods'),
    },
  ];

  // Helper functions
  const getUserName = (user: any) => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };


  // Modal handlers
  const showFeatureModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

  const hideFeatureModal = () => {
    setModalVisible(false);
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'notifications':
        showFeatureModal({
          icon: 'notifications-outline',
          title: 'Notification Settings',
          message: 'Customize your notification preferences. Choose which updates you want to receive and how.',
        });
        break;
      case 'vehicle-details':
        showFeatureModal({
          icon: 'car-outline',
          title: 'Vehicle Management',
          message: 'Manage your vehicle information, charging preferences, and add multiple vehicles to your account.',
        });
        break;
      case 'payment-methods':
        showFeatureModal({
          icon: 'card-outline',
          title: 'Payment Methods',
          message: 'Securely manage your payment options. Add, edit, or remove payment methods for seamless charging.',
        });
        break;
      case 'help-support':
        showFeatureModal({
          icon: 'help-circle-outline',
          title: 'Help & Support',
          message: 'Get help with using the app, find answers to common questions, or contact our support team.',
        });
        break;
      case 'send-feedback':
        showFeatureModal({
          icon: 'mail-outline',
          title: 'Send Feedback',
          message: 'Share your thoughts, suggestions, or report issues. Your feedback helps us improve the app.',
        });
        break;
      case 'about-app':
        showFeatureModal({
          icon: 'information-circle-outline',
          title: 'About App',
          message: 'Detailed app information, version history, and acknowledgments. Learn more about our mission and team.',
        });
        break;
      case 'logout':
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
          ]
        );
        break;
      default:
        showFeatureModal({
          icon: 'rocket-outline',
          title: 'Feature Coming Soon',
          message: `${settingId} functionality is being developed and will be available soon!`,
        });
    }
  };


  // Navigation links section
  const navigationLinks: SettingItem[] = [
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      type: 'navigation',
      onPress: () => handleSettingPress('help-support'),
    },
    {
      id: 'send-feedback',
      title: 'Send Feedback',
      subtitle: 'Share your thoughts with us',
      icon: MessageCircle,
      type: 'navigation',
      onPress: () => handleSettingPress('send-feedback'),
    },
    {
      id: 'about-app',
      title: 'About App',
      subtitle: 'App information and version',
      icon: HelpCircle,
      type: 'navigation',
      onPress: () => handleSettingPress('about-app'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Sophisticated Textured Background */}
      <View style={styles.backgroundTexture} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Refined Profile Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('EditProfile');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.userName}>{getUserName(user)}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <ChevronRight size={20} color={COLORS.text.tertiary} style={styles.headerChevron} />
        </TouchableOpacity>

        {/* Interactive Settings Section */}
        <View style={styles.interactiveSection}>
          <View style={styles.interactiveContainer}>
            {interactiveSettings.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.interactiveRow}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle'}
                  activeOpacity={0.7}
                >
                  {/* Icon */}
                  <View style={styles.rowIcon}>
                    <item.icon size={20} color={COLORS.text.secondary} />
                  </View>

                  {/* Content */}
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                  </View>

                  {/* Control */}
                  <View style={styles.rowControl}>
                    {item.type === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{
                          false: COLORS.surface,
                          true: COLORS.accent,
                        }}
                        thumbColor={item.value ? COLORS.text.primary : COLORS.text.secondary}
                        ios_backgroundColor={COLORS.surface}
                      />
                    )}
                    {item.type === 'navigation' && (
                      <ChevronRight size={16} color={COLORS.text.tertiary} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Separator */}
                {index < interactiveSettings.length - 1 && (
                  <View style={styles.interactiveSeparator} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Navigation Links Section */}
        <View style={styles.navigationSection}>
          {navigationLinks.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.navigationRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={styles.navIcon}>
                  <item.icon size={18} color={COLORS.text.secondary} />
                </View>

                {/* Content */}
                <View style={styles.navContent}>
                  <Text style={styles.navTitle}>{item.title}</Text>
                  <Text style={styles.navSubtitle}>{item.subtitle}</Text>
                </View>

                {/* Chevron */}
                <ChevronRight size={16} color={COLORS.text.tertiary} />
              </TouchableOpacity>

              {/* Separator */}
              {index < navigationLinks.length - 1 && (
                <View style={styles.navigationSeparator} />
              )}
            </View>
          ))}
        </View>

        {/* Log Out Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => handleSettingPress('logout')}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={COLORS.accent} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Premium Modal - temporarily disabled due to import issues */}
      {/* <PremiumModal
        visible={modalVisible}
        onClose={hideFeatureModal}
        icon={modalConfig.icon}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
      /> */}
    </View>
  );
};

// Sophisticated Styles for Profile & Settings Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Subtle Textured Background
  backgroundTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    opacity: 0.98,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  // Refined Profile Header
  header: {
    paddingVertical: 32,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
    marginBottom: 32,
    position: 'relative',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text.secondary,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  headerChevron: {
    position: 'absolute',
    right: 0,
    top: 32,
  },

  // Interactive Settings Section
  interactiveSection: {
    marginBottom: 48,
  },
  interactiveContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    overflow: 'hidden',
  },
  interactiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.secondary,
    fontFamily: 'Inter-Regular',
  },
  rowControl: {
    marginLeft: 16,
  },
  interactiveSeparator: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginHorizontal: 20,
  },

  // Navigation Links Section
  navigationSection: {
    marginBottom: 48,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  navIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.text.tertiary,
    fontFamily: 'Inter-Regular',
  },
  navigationSeparator: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 8,
  },

  // Log Out Button
  logoutSection: {
    paddingTop: 32,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
});

export default ProfileScreen;
