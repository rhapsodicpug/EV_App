import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import CustomModal from '../components/ui/CustomModal';

// Color Palette - will be overridden by theme
const COLORS = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    light: '#404040',
  },
  accent: '#8cd279',
  error: '#FF6B6B',
};

interface PreferenceItem {
  id: string;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const AppPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State for preferences
  const [preferences, setPreferences] = useState({
    darkMode: true, // Always true - app only uses dark mode
    chargingComplete: false,
    lowBattery: false,
    chargingSounds: false,
  });

  // State for modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreferenceToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Theme toggle disabled - always using dark mode

  const renderPreferenceItem = (item: PreferenceItem) => (
    <View key={item.id} style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.preferenceSubtitle, { color: theme.colors.text.secondary }]}>
          {item.subtitle}
        </Text>
      </View>
      <Switch
        value={item.value}
        onValueChange={item.onToggle}
        trackColor={{
          false: theme.colors.border.light,
          true: theme.colors.accent,
        }}
        thumbColor={item.value ? theme.colors.text.primary : theme.colors.text.secondary}
        ios_backgroundColor={theme.colors.border.light}
      />
    </View>
  );

  const appearanceItems: PreferenceItem[] = [
    {
      id: 'darkMode',
      title: 'Dark mode',
      subtitle: 'Always enabled - app uses dark theme',
      value: true,
      onToggle: () => {}, // Disabled - always dark mode
    },
  ];

  const notificationItems: PreferenceItem[] = [
    {
      id: 'chargingComplete',
      title: 'Charging complete',
      subtitle: 'When charging is complete',
      value: preferences.chargingComplete,
      onToggle: (value) => handlePreferenceToggle('chargingComplete', value),
    },
    {
      id: 'lowBattery',
      title: 'Low battery',
      subtitle: 'When your battery is low',
      value: preferences.lowBattery,
      onToggle: (value) => handlePreferenceToggle('lowBattery', value),
    },
  ];

  const soundItems: PreferenceItem[] = [
    {
      id: 'chargingSounds',
      title: 'Charging sounds',
      subtitle: 'When charging starts or stops',
      value: preferences.chargingSounds,
      onToggle: (value) => handlePreferenceToggle('chargingSounds', value),
    },
  ];

  const renderSection = (title: string, items: PreferenceItem[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      <View style={styles.preferenceItems}>
        {items.map(renderPreferenceItem)}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Preferences
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BlurView
          style={[styles.contentContainer, { backgroundColor: theme.colors.surface }]}
          intensity={25}
          tint="dark"
        >
          {renderSection('Appearance', appearanceItems)}
          {renderSection('Notifications', notificationItems)}
          {renderSection('Sound', soundItems)}
        </BlurView>
      </ScrollView>

      {/* Custom Modals */}
      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Theme changed successfully!"
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowSuccessModal(false)}
      />

      <CustomModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  preferenceItems: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AppPreferencesScreen;
