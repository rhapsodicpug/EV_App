import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import {
  HelpCircle,
  ChevronLeft,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  ExternalLink,
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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I find charging stations?',
      answer: 'Use the map view to locate nearby charging stations. You can filter by connector type, availability, and distance.',
    },
    {
      id: '2',
      question: 'How do I book a charging slot?',
      answer: 'Select a charging station from the list or map, choose your preferred time slot, and confirm your booking.',
    },
    {
      id: '3',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, UPI, and digital wallets. You can manage your payment methods in the app settings.',
    },
    {
      id: '4',
      question: 'How do I cancel a booking?',
      answer: 'Go to your bookings section and select the booking you want to cancel. Cancellation fees may apply.',
    },
  ];

  // Contact methods
  const contactMethods: ContactMethod[] = [
    {
      id: 'phone',
      title: 'Call Support',
      subtitle: 'Speak with our support team',
      icon: Phone,
      action: () => {
        const phoneNumber = 'tel:+919876543210';
        Linking.canOpenURL(phoneNumber)
          .then((supported) => {
            if (supported) {
              Linking.openURL(phoneNumber);
            } else {
              Alert.alert('Error', 'Phone calls are not supported on this device');
            }
          })
          .catch((err) => console.error('Error opening phone dialer:', err));
      },
    },
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'support@evchargeapp.com',
      icon: Mail,
      action: () => {
        const email = 'mailto:support@evchargeapp.com?subject=EV Charge App Support';
        Linking.canOpenURL(email)
          .then((supported) => {
            if (supported) {
              Linking.openURL(email);
            } else {
              Alert.alert('Error', 'Email is not configured on this device');
            }
          })
          .catch((err) => console.error('Error opening email:', err));
      },
    },
    {
      id: 'chat',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: MessageSquare,
      action: () => {
        Alert.alert('Live Chat', 'Live chat feature coming soon! Please use email or phone support for now.');
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openWebsite = () => {
    const url = 'https://evchargeapp.com/help';
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open web browser');
        }
      })
      .catch((err) => console.error('Error opening website:', err));
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.action}
              activeOpacity={0.7}
            >
              <View style={styles.contactIcon}>
                <method.icon size={24} color={COLORS.accent} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
              </View>
              <ExternalLink size={20} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqItems.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqToggle}>
                  {expandedFAQ === faq.id ? '−' : '+'}
                </Text>
              </View>

              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={openWebsite}
            activeOpacity={0.7}
          >
            <View style={styles.resourceIcon}>
              <FileText size={24} color={COLORS.accent} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Help Center</Text>
              <Text style={styles.resourceSubtitle}>Browse our comprehensive help articles</Text>
            </View>
            <ExternalLink size={20} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Need More Help?</Text>
          <Text style={styles.infoText}>
            Our support team is here to help you with any questions about charging stations, bookings, or using the app.
          </Text>
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

  // Contact Cards
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // FAQ Items
  faqItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 16,
  },
  faqToggle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 12,
    lineHeight: 20,
  },

  // Resource Cards
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // Info Section
  infoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceLight + '50',
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default HelpSupportScreen;
