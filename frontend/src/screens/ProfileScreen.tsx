import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import CustomModal from '../components/ui/CustomModal';
import AlertService from '../services/AlertService';
import {
  ArrowLeft,
  User,
  Car,
  CreditCard,
  HelpCircle,
  LogOut,
  Bot,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Reload user data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const response = await api.request('GET', '/users/me');
      setTwoFactorEnabled(response.two_factor_enabled || false);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
      case 'two-factor':
        if (twoFactorEnabled) {
          // Confirm disable 2FA
          AlertService.destructiveConfirm(
            'Disable 2FA',
            'Are you sure you want to disable two-factor authentication?',
            () => disable2FA(),
            undefined,
            'Disable',
            'Cancel'
          );
        } else {
          // @ts-ignore
          navigation.navigate('TwoFactorSetup');
        }
        break;
      case 'help-support':
        // @ts-ignore
        navigation.navigate('HelpSupport');
        break;
      case 'chatbot':
        // @ts-ignore
        navigation.navigate('Chatbot');
        break;
      case 'logout':
        setShowLogoutModal(true);
        break;
      default:
        AlertService.info('Coming Soon', `${settingId} functionality is being developed!`);
    }
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  const disable2FA = async () => {
    setShowPasswordModal(true);
  };

  const handleDisable2FA = async () => {
    if (!password) {
      AlertService.error('Error', 'Password is required');
      return;
    }
    try {
      await api.request('POST', '/auth/2fa/disable', { password });
      setTwoFactorEnabled(false);
      setShowPasswordModal(false);
      setPassword('');
      AlertService.success('Success', '2FA has been disabled');
    } catch (error: any) {
      AlertService.error('Error', error.response?.data?.detail || 'Failed to disable 2FA');
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
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      subtitle: twoFactorEnabled ? '✓ Enabled' : 'Enable 2FA',
      icon: Shield,
      onPress: () => handleSettingPress('two-factor'),
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Help & Support',
      icon: HelpCircle,
      onPress: () => handleSettingPress('help-support'),
    },
    {
      id: 'chatbot',
      title: 'EV Assistant',
      subtitle: 'AI-powered support',
      icon: Bot,
      onPress: () => handleSettingPress('chatbot'),
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

      {/* Password Input Modal for 2FA */}
      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPassword('');
        }}
      >
        <View style={styles.passwordModalOverlay}>
          <View style={styles.passwordModalContainer}>
            <Text style={styles.passwordModalTitle}>Confirm Password</Text>
            <Text style={styles.passwordModalMessage}>
              Enter your password to disable 2FA
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={COLORS.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
            />

            <View style={styles.passwordModalButtons}>
              <TouchableOpacity
                style={[styles.passwordModalButton, styles.passwordModalCancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                <Text style={styles.passwordModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.passwordModalButton, styles.passwordModalConfirmButton]}
                onPress={handleDisable2FA}
              >
                <Text style={styles.passwordModalConfirmText}>Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100, // Extra padding to avoid bottom navigation overlap
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
  
  // Password Modal Styles
  passwordModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passwordModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  passwordModalMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  passwordInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  passwordModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  passwordModalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordModalCancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  passwordModalConfirmButton: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passwordModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  passwordModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;