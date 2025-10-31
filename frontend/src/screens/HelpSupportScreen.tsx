/**
 * Help & Support Screen
 * Clean, modern help interface with FAQ, contact options, and user guides
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  BackHandler,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Phone,
  Book,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import AlertService from '../services/AlertService';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const HELP_COLORS = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#3A3A3A',
  border: '#4A4A4A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#666666',
  },
  accent: '#8cd279',
  icon: '#FFFFFF',
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

interface UserGuide {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // FAQ Data
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I book a charging slot?',
      answer: 'To book a charging slot, simply navigate to the Stations tab, select your preferred charging station, choose your date and time, select the duration, and proceed to payment. You can also use the map view to find nearby stations.',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, UPI payments, and digital wallets like Paytm, PhonePe, and Google Pay. You can also add multiple payment methods to your account.',
    },
    {
      id: '3',
      question: 'How do I cancel a booking?',
      answer: 'You can cancel your booking by going to the Bookings section in your profile, selecting the booking you want to cancel, and tapping the "Cancel Booking" button. Cancellations are free up to 2 hours before your scheduled time.',
    },
    {
      id: '4',
      question: 'What if the charging station is not working?',
      answer: 'If you encounter any issues with a charging station, please contact our support team immediately. We will help you find an alternative station and may provide compensation for the inconvenience.',
    },
    {
      id: '5',
      question: 'How do I add my vehicle information?',
      answer: 'Go to your Profile, select "My Vehicles", and tap "Add Vehicle". Enter your vehicle details including make, model, year, and charging specifications. This helps us provide better recommendations.',
    },
  ];

  // Contact Options
  const contactOptions: ContactOption[] = [
    {
      id: '1',
      title: 'Live Chat',
      icon: <MessageCircle size={24} color={HELP_COLORS.icon} />,
      action: () => handleLiveChat(),
    },
    {
      id: '2',
      title: 'Email',
      icon: <Mail size={24} color={HELP_COLORS.icon} />,
      action: () => handleEmail(),
    },
    {
      id: '3',
      title: 'Phone',
      icon: <Phone size={24} color={HELP_COLORS.icon} />,
      action: () => handlePhone(),
    },
  ];

  // User Guides
  const userGuides: UserGuide[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      icon: <Book size={24} color={HELP_COLORS.icon} />,
      action: () => handleGettingStarted(),
    },
    {
      id: '2',
      title: 'Booking Tutorial',
      icon: <Book size={24} color={HELP_COLORS.icon} />,
      action: () => handleBookingTutorial(),
    },
    {
      id: '3',
      title: 'Payment Guide',
      icon: <Book size={24} color={HELP_COLORS.icon} />,
      action: () => handlePaymentGuide(),
    },
  ];

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // FAQ toggle handler
  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Contact action handlers
  const handleLiveChat = () => {
    AlertService.info(
      'Live Chat',
      'Live chat feature will be available soon. For now, please use email or phone support.'
    );
  };

  const handleEmail = () => {
    const email = 'support@evcharging.com';
    const subject = 'EV Charging App Support';
    const body = 'Hi, I need help with...';
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          AlertService.error('Error', 'Email app is not available on this device');
        }
      })
      .catch((err) => {
        AlertService.error('Error', 'Failed to open email app');
      });
  };

  const handlePhone = () => {
    const phoneNumber = '+91 8291661002';
    
    AlertService.confirm(
      'Call Support',
      `Call our support team at ${phoneNumber}?`,
      () => {
        const phoneUrl = `tel:${phoneNumber.replace(/\s/g, '')}`;
        Linking.canOpenURL(phoneUrl)
          .then((supported) => {
            if (supported) {
              Linking.openURL(phoneUrl);
            } else {
              AlertService.error('Error', 'Phone app is not available on this device');
            }
          })
          .catch((err) => {
            AlertService.error('Error', 'Failed to open phone app');
          });
      },
      undefined,
      'Call',
      'Cancel'
    );
  };

  // User guide handlers
  const handleGettingStarted = () => {
    // @ts-ignore
    navigation.navigate('GettingStartedTutorial');
  };

  const handleBookingTutorial = () => {
    // @ts-ignore
    navigation.navigate('BookingTutorial');
  };

  const handlePaymentGuide = () => {
    // @ts-ignore
    navigation.navigate('PaymentGuide');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={HELP_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={HELP_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                {expandedFAQ === item.id ? (
                  <ChevronUp size={20} color={HELP_COLORS.icon} />
                ) : (
                  <ChevronDown size={20} color={HELP_COLORS.icon} />
                )}
              </View>
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Us Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.contactItem}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={styles.contactContent}>
                {option.icon}
                <Text style={styles.contactText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Guides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Guides</Text>
          {userGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideItem}
              onPress={guide.action}
              activeOpacity={0.7}
            >
              <View style={styles.guideContent}>
                {guide.icon}
                <Text style={styles.guideText}>{guide.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HELP_COLORS.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: HELP_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HELP_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HELP_COLORS.text.primary,
  },

  headerRight: {
    width: 40,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: HELP_COLORS.text.primary,
    marginBottom: 16,
  },

  // FAQ Styles
  faqItem: {
    backgroundColor: HELP_COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HELP_COLORS.border,
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: HELP_COLORS.text.primary,
    flex: 1,
    marginRight: 12,
  },

  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: HELP_COLORS.border,
  },

  faqAnswerText: {
    fontSize: 14,
    fontWeight: '400',
    color: HELP_COLORS.text.secondary,
    lineHeight: 20,
    marginTop: 12,
  },

  // Contact Styles
  contactItem: {
    backgroundColor: HELP_COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HELP_COLORS.border,
  },

  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  contactText: {
    fontSize: 16,
    fontWeight: '500',
    color: HELP_COLORS.text.primary,
    marginLeft: 12,
  },

  // Guide Styles
  guideItem: {
    backgroundColor: HELP_COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HELP_COLORS.border,
  },

  guideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  guideText: {
    fontSize: 16,
    fontWeight: '500',
    color: HELP_COLORS.text.primary,
    marginLeft: 12,
  },

  // Bottom spacing
  bottomSpacing: {
    height: 100,
  },
});

export default HelpSupportScreen;