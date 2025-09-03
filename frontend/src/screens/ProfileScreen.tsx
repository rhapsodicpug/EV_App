import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import PremiumModal from '../components/ui/PremiumModal';

const { width } = Dimensions.get('window');

// Premium colors for Profile Dashboard
const PROFILE_COLORS = {
  primary: '#00A8FF',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  glass: 'rgba(42, 42, 42, 0.8)',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    icon: 'rocket-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Feature Coming Soon',
    message: 'Our team is hard at work building this. It will be available in a future update!',
    buttonText: 'Got It',
  });

  // Helper functions
  const getUserName = (user: any) => {
    return user?.name || user?.email?.split('@')[0] || 'You';
  };

  const getUserInitials = (user: any) => {
    const name = getUserName(user);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Navigation handlers
  const handleProfilePress = () => {
    // @ts-ignore
    navigation.navigate('EditProfile');
  };

  const handleVehiclePress = () => {
    // @ts-ignore
    navigation.navigate('VehicleInfo');
  };

  const handleSettingsPress = () => {
    // @ts-ignore
    navigation.navigate('Settings');
  };

  // Modal handlers
  const showFeatureModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

  const hideFeatureModal = () => {
    setModalVisible(false);
  };

  const handleHelpPress = () => {
    showFeatureModal({
      icon: 'help-circle-outline',
      title: 'Help & Support',
      message: 'Our comprehensive help center is being developed. You\'ll find guides, FAQs, and contact options for all your questions.',
    });
  };

  const handleFeedbackPress = () => {
    showFeatureModal({
      icon: 'chatbubble-outline',
      title: 'Send Feedback',
      message: 'We\'re building a feedback system where you can share your thoughts, report bugs, and suggest improvements to make the app better.',
    });
  };

  const handleAboutPress = () => {
    showFeatureModal({
      icon: 'information-circle-outline',
      title: 'About App',
      message: 'Detailed app information, version history, and acknowledgments are being prepared. Learn more about our mission and team.',
    });
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Personal Profile Header */}
        <TouchableOpacity style={styles.profileHeader} onPress={handleProfilePress}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{getUserName(user)}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={PROFILE_COLORS.text.muted} />
        </TouchableOpacity>

        {/* Primary Widgets */}
        <View style={styles.primaryWidgets}>
          {/* My Vehicle Widget */}
          <TouchableOpacity style={styles.primaryWidget} onPress={handleVehiclePress}>
            <LinearGradient
              colors={[PROFILE_COLORS.glass, 'rgba(32, 32, 32, 0.9)']}
              style={styles.widgetGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.widgetContent}>
                <View style={styles.widgetIcon}>
                  <Ionicons name="car-outline" size={32} color={PROFILE_COLORS.primary} />
                </View>
                <Text style={styles.widgetTitle}>My Vehicle</Text>
                <Text style={styles.widgetSubtitle}>Tesla Model 3</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Settings Widget */}
          <TouchableOpacity style={styles.primaryWidget} onPress={handleSettingsPress}>
            <LinearGradient
              colors={[PROFILE_COLORS.glass, 'rgba(32, 32, 32, 0.9)']}
              style={styles.widgetGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.widgetContent}>
                <View style={styles.widgetIcon}>
                  <Ionicons name="settings-outline" size={32} color={PROFILE_COLORS.primary} />
                </View>
                <Text style={styles.widgetTitle}>Settings</Text>
                <Text style={styles.widgetSubtitle}>Notifications, Privacy</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Secondary List Section */}
        <View style={styles.secondarySection}>
          <Text style={styles.sectionTitle}>More</Text>

          <View style={styles.listContainer}>
            {/* Help & Support */}
            <TouchableOpacity style={styles.listItem} onPress={handleHelpPress}>
              <View style={styles.listIcon}>
                <Ionicons name="help-circle-outline" size={20} color={PROFILE_COLORS.primary} />
              </View>
              <Text style={styles.listText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color={PROFILE_COLORS.text.muted} />
            </TouchableOpacity>
            <View style={styles.separator} />

            {/* Send Feedback */}
            <TouchableOpacity style={styles.listItem} onPress={handleFeedbackPress}>
              <View style={styles.listIcon}>
                <Ionicons name="chatbubble-outline" size={20} color={PROFILE_COLORS.primary} />
              </View>
              <Text style={styles.listText}>Send Feedback</Text>
              <Ionicons name="chevron-forward" size={16} color={PROFILE_COLORS.text.muted} />
            </TouchableOpacity>
            <View style={styles.separator} />

            {/* About App */}
            <TouchableOpacity style={styles.listItem} onPress={handleAboutPress}>
              <View style={styles.listIcon}>
                <Ionicons name="information-circle-outline" size={20} color={PROFILE_COLORS.primary} />
              </View>
              <Text style={styles.listText}>About App</Text>
              <Ionicons name="chevron-forward" size={16} color={PROFILE_COLORS.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Action */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Modal */}
        <PremiumModal
          visible={modalVisible}
          onClose={hideFeatureModal}
          icon={modalConfig.icon}
          title={modalConfig.title}
          message={modalConfig.message}
          buttonText={modalConfig.buttonText}
        />

      </ScrollView>
    </View>
  );
};

// Premium Dashboard Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: PROFILE_COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PROFILE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: PROFILE_COLORS.text.primary,
    letterSpacing: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: PROFILE_COLORS.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: PROFILE_COLORS.text.secondary,
  },

  // Primary Widgets
  primaryWidgets: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  primaryWidget: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  widgetGradient: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  widgetContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  widgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  widgetSubtitle: {
    fontSize: 12,
    color: PROFILE_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Secondary List Section
  secondarySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PROFILE_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  listContainer: {
    backgroundColor: PROFILE_COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: PROFILE_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: PROFILE_COLORS.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: PROFILE_COLORS.background,
    marginHorizontal: 20,
  },

  // Log Out Section
  logoutSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.error,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
