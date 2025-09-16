/**
 * Premium Settings Screen
 * Comprehensive settings with modern UI design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Wifi,
  MapPin,
  CreditCard,
  Car,
  Battery,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useThemeColors } from '../design';

const { width } = Dimensions.get('window');

// Premium Settings Colors
const SETTINGS_COLORS = {
  primary: '#00A8FF',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#252525',
  border: '#333333',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors } = useThemeColors();
  
  // State for settings
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoBooking, setAutoBooking] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  // Profile Section
  const ProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>
      <View style={styles.profileCard}>
        <LinearGradient
          colors={[SETTINGS_COLORS.primary, SETTINGS_COLORS.secondary]}
          style={styles.profileGradient}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={SETTINGS_COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  // Settings Item Component
  const SettingsItem: React.FC<{ item: SettingItem }> = ({ item }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
          <item.icon size={20} color={item.color || SETTINGS_COLORS.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: SETTINGS_COLORS.border, true: item.color + '40' }}
            thumbColor={item.value ? item.color : SETTINGS_COLORS.text.muted}
          />
        ) : (
          <ChevronRight size={20} color={SETTINGS_COLORS.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Settings Groups
  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get updates about your bookings',
          icon: Bell,
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
          color: SETTINGS_COLORS.primary,
        },
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'Find nearby charging stations',
          icon: MapPin,
          type: 'toggle' as const,
          value: locationServices,
          onToggle: setLocationServices,
          color: SETTINGS_COLORS.success,
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: darkMode ? Moon : Sun,
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
          color: SETTINGS_COLORS.warning,
        },
        {
          id: 'autoBooking',
          title: 'Auto Booking',
          subtitle: 'Automatically book available slots',
          icon: Battery,
          type: 'toggle' as const,
          value: autoBooking,
          onToggle: setAutoBooking,
          color: SETTINGS_COLORS.secondary,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'biometric',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          icon: Shield,
          type: 'toggle' as const,
          value: biometricAuth,
          onToggle: setBiometricAuth,
          color: SETTINGS_COLORS.success,
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Manage your data privacy',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon'),
          color: SETTINGS_COLORS.primary,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          icon: CreditCard,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Payment', 'Payment methods coming soon'),
          color: SETTINGS_COLORS.success,
        },
        {
          id: 'vehicle',
          title: 'My Vehicle',
          subtitle: 'Manage your EV details',
          icon: Car,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Vehicle', 'Vehicle settings coming soon'),
          color: SETTINGS_COLORS.warning,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English (US)',
          icon: Globe,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Language', 'Language selection coming soon'),
          color: SETTINGS_COLORS.secondary,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: HelpCircle,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Help', 'Help center coming soon'),
          color: SETTINGS_COLORS.primary,
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version 1.0.0',
          icon: User,
          type: 'navigation' as const,
          onPress: () => Alert.alert('About', 'EV Charging App v1.0.0'),
          color: SETTINGS_COLORS.text.muted,
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SETTINGS_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <ProfileSection />

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.settingsGroup}>
              {group.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <SettingsItem item={item} />
                  {itemIndex < group.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={[SETTINGS_COLORS.error, '#DC2626']}
              style={styles.logoutGradient}
            >
              <LogOut size={20} color={SETTINGS_COLORS.text.primary} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>EV Charging App v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SETTINGS_COLORS.background,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: SETTINGS_COLORS.text.primary,
    letterSpacing: 0.5,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SETTINGS_COLORS.text.primary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  // Profile Section
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: SETTINGS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: SETTINGS_COLORS.text.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: SETTINGS_COLORS.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: SETTINGS_COLORS.text.secondary,
    opacity: 0.8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Settings Group
  settingsGroup: {
    backgroundColor: SETTINGS_COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: SETTINGS_COLORS.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: SETTINGS_COLORS.text.secondary,
  },
  settingRight: {
    marginLeft: 16,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: SETTINGS_COLORS.border,
    marginLeft: 76, // Align with text content
  },

  // Logout Button
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: SETTINGS_COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: SETTINGS_COLORS.text.primary,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: SETTINGS_COLORS.text.muted,
    fontWeight: '500',
  },
});

export default SettingsScreen;