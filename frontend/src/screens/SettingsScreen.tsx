import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../design';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import PremiumModal from '../components/ui/PremiumModal';

const { width } = Dimensions.get('window');

// Premium colors for Settings screen
const SETTINGS_COLORS = {
  primary: '#00A8FF',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#2A2A2A',
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
  icon: string;
  type: 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

const SettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    icon: 'rocket-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Feature Coming Soon',
    message: 'Our team is hard at work building this. It will be available in a future update!',
    buttonText: 'Got It',
  });

  // State for settings
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailUpdates: false,
    promotions: false,
  });

  // Helper functions
  const getUserName = (user: any) => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = (user: any) => {
    const name = getUserName(user);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handler functions
  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Modal handlers
  const showFeatureModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

  const hideFeatureModal = () => {
    setModalVisible(false);
  };

  const handleProfilePress = () => {
    showFeatureModal({
      icon: 'person-outline',
      title: 'Profile Editing',
      message: 'Profile editing features are currently being developed. Stay tuned for updates!',
    });
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'profile-details':
        showFeatureModal({
          icon: 'person-outline',
          title: 'Profile Details',
          message: 'Advanced profile editing features are coming soon. You\'ll be able to update your personal information, preferences, and more!',
        });
        break;
      case 'change-password':
        showFeatureModal({
          icon: 'key-outline',
          title: 'Password Management',
          message: 'Secure password change functionality is being implemented. You\'ll receive an email with reset instructions.',
        });
        break;
      case 'payment-methods':
        showFeatureModal({
          icon: 'card-outline',
          title: 'Payment Methods',
          message: 'Payment method management is being developed. You\'ll be able to add, edit, and remove payment options securely.',
        });
        break;
      case 'vehicle-details':
        showFeatureModal({
          icon: 'car-outline',
          title: 'Vehicle Management',
          message: 'Advanced vehicle management features are coming soon. You\'ll be able to add multiple vehicles and manage their settings.',
        });
        break;
      case 'appearance':
        showFeatureModal({
          icon: 'color-palette-outline',
          title: 'Appearance Settings',
          message: 'Theme customization options are being developed. You\'ll be able to choose from light, dark, and system themes.',
        });
        break;
      case 'language':
        showFeatureModal({
          icon: 'language-outline',
          title: 'Language Settings',
          message: 'Multi-language support is being implemented. The app will soon be available in multiple languages.',
        });
        break;
      case 'privacy-policy':
        showFeatureModal({
          icon: 'shield-checkmark-outline',
          title: 'Privacy Policy',
          message: 'Detailed privacy policy and data management options are being prepared. Your privacy and data security are our top priorities.',
        });
        break;
      case 'logout':
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => {
              // Handle logout
              Alert.alert('Logged Out', 'You have been logged out successfully.');
            }},
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

  // Settings sections data
  const settingsSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'profile-details',
          title: 'Profile Details',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          type: 'action',
          onPress: () => handleSettingPress('profile-details'),
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'key-outline',
          type: 'action',
          onPress: () => handleSettingPress('change-password'),
        },
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          subtitle: 'Manage payment options',
          icon: 'card-outline',
          type: 'action',
          onPress: () => handleSettingPress('payment-methods'),
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive important updates',
          icon: 'notifications-outline',
          type: 'toggle',
          value: settings.pushNotifications,
          onToggle: (value) => handleToggle('pushNotifications', value),
        },
        {
          id: 'email-updates',
          title: 'Email Updates',
          subtitle: 'Get updates via email',
          icon: 'mail-outline',
          type: 'toggle',
          value: settings.emailUpdates,
          onToggle: (value) => handleToggle('emailUpdates', value),
        },
        {
          id: 'promotions',
          title: 'Promotions',
          subtitle: 'Receive promotional offers',
          icon: 'gift-outline',
          type: 'toggle',
          value: settings.promotions,
          onToggle: (value) => handleToggle('promotions', value),
        },
      ],
    },
    {
      id: 'vehicle',
      title: 'Vehicle',
      items: [
        {
          id: 'vehicle-details',
          title: 'My Vehicle Details',
          subtitle: 'Manage vehicle information',
          icon: 'car-outline',
          type: 'action',
          onPress: () => handleSettingPress('vehicle-details'),
        },
      ],
    },
    {
      id: 'app',
      title: 'App',
      items: [
        {
          id: 'appearance',
          title: 'Appearance',
          subtitle: 'Light/Dark theme settings',
          icon: 'color-palette-outline',
          type: 'action',
          onPress: () => handleSettingPress('appearance'),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'Choose your preferred language',
          icon: 'language-outline',
          type: 'action',
          onPress: () => handleSettingPress('language'),
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-checkmark-outline',
          type: 'action',
          onPress: () => handleSettingPress('privacy-policy'),
        },
        {
          id: 'logout',
          title: 'Log Out',
          subtitle: 'Sign out of your account',
          icon: 'log-out-outline',
          type: 'action',
          onPress: () => handleSettingPress('logout'),
        },
      ],
    },
  ];

  // Filter settings based on search
  const filteredSections = searchQuery.trim()
    ? settingsSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter(section => section.items.length > 0)
    : settingsSections;

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>{getUserInitials(user)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{getUserName(user)}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={SETTINGS_COLORS.text.muted} />
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={SETTINGS_COLORS.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search settings..."
            placeholderTextColor={SETTINGS_COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={SETTINGS_COLORS.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Settings Sections */}
      <ScrollView
        style={styles.settingsScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settingsContainer}
      >
        {filteredSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionItems}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={item.onPress}
                    disabled={item.type === 'toggle'}
                  >
                    {/* Icon */}
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon as any} size={20} color={SETTINGS_COLORS.primary} />
                    </View>

                    {/* Content */}
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>

                    {/* Control */}
                    <View style={styles.settingControl}>
                      {item.type === 'toggle' && (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{
                            false: SETTINGS_COLORS.surface,
                            true: SETTINGS_COLORS.primary,
                          }}
                          thumbColor={item.value ? SETTINGS_COLORS.text.primary : SETTINGS_COLORS.text.secondary}
                        />
                      )}
                      {item.type === 'action' && (
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={SETTINGS_COLORS.text.muted}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Separator line (except for last item) */}
                  {index < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Premium Modal */}
      <PremiumModal
        visible={modalVisible}
        onClose={hideFeatureModal}
        icon={modalConfig.icon}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
      />
    </View>
  );
};

// Premium Styles for Settings Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SETTINGS_COLORS.background,
  },



  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: SETTINGS_COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SETTINGS_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: SETTINGS_COLORS.text.primary,
    letterSpacing: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: SETTINGS_COLORS.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: SETTINGS_COLORS.text.secondary,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SETTINGS_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: SETTINGS_COLORS.surface,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: SETTINGS_COLORS.text.primary,
    fontWeight: '500',
  },

  // Settings Sections
  settingsScrollView: {
    flex: 1,
  },
  settingsContainer: {
    padding: 24,
    paddingBottom: 100, // Account for tab bar
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SETTINGS_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },

  // Section Items
  sectionItems: {
    backgroundColor: SETTINGS_COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Icon
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SETTINGS_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  // Content
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SETTINGS_COLORS.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: SETTINGS_COLORS.text.secondary,
    lineHeight: 20,
  },

  // Control
  settingControl: {
    marginLeft: 12,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: SETTINGS_COLORS.background,
    marginHorizontal: 20,
  },
});

export default SettingsScreen;
