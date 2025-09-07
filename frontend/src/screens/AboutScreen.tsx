import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import {
  Info,
  ChevronLeft,
  ExternalLink,
  Heart,
  Code,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Clean Color Palette
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
  success: '#10B981',
  error: '#FF6B6B',
};

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const appInfo = {
    name: 'EV Charge',
    version: '1.0.0',
    description: 'Find, book, and pay for electric vehicle charging stations with ease.',
  };

  const features = [
    {
      icon: '🔋',
      title: 'Smart Charging',
      description: 'Find optimal charging stations based on your location and vehicle type.',
    },
    {
      icon: '📅',
      title: 'Easy Booking',
      description: 'Book charging slots in advance to ensure availability when you need it.',
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Multiple payment options with secure, encrypted transactions.',
    },
    {
      icon: '📊',
      title: 'Usage Analytics',
      description: 'Track your charging history and carbon footprint savings.',
    },
  ];

  const links = [
    {
      title: 'Privacy Policy',
      url: 'https://evchargeapp.com/privacy',
      icon: Info,
    },
    {
      title: 'Terms of Service',
      url: 'https://evchargeapp.com/terms',
      icon: Code,
    },
    {
      title: 'Contact Us',
      url: 'https://evchargeapp.com/contact',
      icon: Users,
    },
  ];

  const openLink = (url: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.error('Cannot open URL:', url);
        }
      })
      .catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>🔌</Text>
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Version {appInfo.version}</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>

          {links.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkCard}
              onPress={() => openLink(link.url)}
              activeOpacity={0.7}
            >
              <View style={styles.linkIcon}>
                <link.icon size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <ExternalLink size={16} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>

          <View style={styles.creditsCard}>
            <Heart size={20} color={COLORS.error} />
            <Text style={styles.creditsText}>
              Made with ❤️ for electric vehicle enthusiasts everywhere
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Premium Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // App Info Section
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },

  // Feature Cards
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },

  // Link Cards
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },

  // Credits
  creditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  creditsText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
});

export default AboutScreen;
