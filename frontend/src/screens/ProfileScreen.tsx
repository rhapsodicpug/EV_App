import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import CustomModal from '../components/ui/CustomModal';
import {
  ArrowLeft,
  User,
  Car,
  CreditCard,
  Settings,
  Globe,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Color Palette matching the design
const COLORS = {
  background: '#1A1A1A',
  surface: '#1A1A1A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#8cd279', // Lime green theme
  error: '#FF6B6B',
};

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  isDestructive?: boolean;
}

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  
  // State for modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'profile':
        // @ts-ignore
        navigation.navigate('EditProfile');
        break;
      case 'vehicles':
        // @ts-ignore
        navigation.navigate('MyVehicle');
        break;
      case 'payment-methods':
        // @ts-ignore
        navigation.navigate('PaymentMethods');
        break;
      case 'app-preferences':
        // @ts-ignore
        navigation.navigate('AppPreferences');
        break;
      case 'language':
        Alert.alert('Language', 'Language settings functionality coming soon!');
        break;
      case 'help-support':
        // @ts-ignore
        navigation.navigate('HelpSupport');
        break;
      case 'logout':
        setShowLogoutModal(true);
        break;
      case 'delete-account':
        setShowDeleteModal(true);
        break;
      default:
        Alert.alert('Coming Soon', `${settingId} functionality is being developed!`);
    }
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Edit profile',
      icon: User,
      onPress: () => handleSettingPress('profile'),
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      subtitle: 'Manage your vehicles',
      icon: Car,
      onPress: () => handleSettingPress('vehicles'),
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      subtitle: 'Manage payment methods',
      icon: CreditCard,
      onPress: () => handleSettingPress('payment-methods'),
    },
    {
      id: 'app-preferences',
      title: 'App Preferences',
      subtitle: 'App preferences',
      icon: Settings,
      onPress: () => handleSettingPress('app-preferences'),
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'Language settings',
      icon: Globe,
      onPress: () => handleSettingPress('language'),
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Help & Support',
      icon: HelpCircle,
      onPress: () => handleSettingPress('help-support'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOut,
      onPress: () => handleSettingPress('logout'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.settingsItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsItemLeft}>
                <View style={[
                  styles.iconContainer,
                  item.isDestructive && styles.destructiveIconContainer
                ]}>
                  <item.icon 
                    size={24} 
                    color={item.isDestructive ? COLORS.error : COLORS.text.primary} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.settingsItemTitle,
                    item.isDestructive && styles.destructiveText
                  ]}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text style={styles.settingsItemSubtitle}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Button Container - Same as BookSlot and Payment screens */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleSettingPress('delete-account')}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Modals */}
      <CustomModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        options={[
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Log Out',
            onPress: logout,
            style: 'destructive',
          },
        ]}
        onClose={() => setShowLogoutModal(false)}
      />

      <CustomModal
        visible={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        options={[
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => {
              Alert.alert('Account Deletion', 'Account deletion functionality coming soon!');
            },
            style: 'destructive',
          },
        ]}
        onClose={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 0, // Remove bottom padding since buttonContainer handles it
  },
  settingsItem: {
    marginBottom: 16,
  },
  settingsItemContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  destructiveText: {
    color: COLORS.error,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  
  // Button Container - Same as BookSlot and Payment screens
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding to avoid bottom navigation overlap
  },
  
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  deleteButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;