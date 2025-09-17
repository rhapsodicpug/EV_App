/**
 * Payment Guide Tutorial Screen
 * Comprehensive guide for payment methods and billing
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
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Smartphone,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const TUTORIAL_COLORS = {
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
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  icon: '#FFFFFF',
};

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  tips?: string[];
  warnings?: string[];
}

const PaymentGuide: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [currentStep, setCurrentStep] = useState(0);

  // Payment guide steps
  const paymentSteps: PaymentStep[] = [
    {
      id: '1',
      title: 'Payment Methods',
      description: 'Learn about all supported payment options',
      icon: <CreditCard size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Credit Cards (Visa, MasterCard, American Express)',
        'Debit Cards from major banks',
        'UPI payments (PhonePe, Google Pay, Paytm)',
        'Digital wallets and mobile payments',
      ],
      tips: [
        'Save payment methods for faster checkout',
        'Set a default payment method',
        'Keep payment methods updated',
      ],
    },
    {
      id: '2',
      title: 'Adding Payment Methods',
      description: 'How to securely add new payment options',
      icon: <Smartphone size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Go to Profile → Payment Methods',
        'Tap "Add Payment Method"',
        'Choose your preferred payment type',
        'Enter payment details securely',
        'Verify and save your payment method',
      ],
      tips: [
        'Use a strong, unique password for your account',
        'Enable two-factor authentication',
        'Keep your payment apps updated',
      ],
      warnings: [
        'Never share your payment details with anyone',
        'Always use secure networks for payments',
      ],
    },
    {
      id: '3',
      title: 'Pricing Structure',
      description: 'Understand how charging costs are calculated',
      icon: <DollarSign size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Pricing based on charging duration',
        'Different rates for AC and DC chargers',
        'Peak and off-peak hour pricing',
        'Transparent cost breakdown before booking',
      ],
      tips: [
        'Book during off-peak hours for better rates',
        'Check pricing before confirming booking',
        'DC fast chargers cost more but save time',
      ],
    },
    {
      id: '4',
      title: 'Payment Security',
      description: 'Your payment information is always protected',
      icon: <Shield size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'End-to-end encryption for all transactions',
        'PCI DSS compliant payment processing',
        'No storage of sensitive payment data',
        'Secure tokenization for saved methods',
      ],
      tips: [
        'Look for the lock icon in your browser',
        'Use trusted payment gateways only',
        'Monitor your account for unauthorized charges',
      ],
      warnings: [
        'Report any suspicious activity immediately',
        'Never enter payment details on unsecured sites',
      ],
    },
    {
      id: '5',
      title: 'Billing & Receipts',
      description: 'How to access your payment history and receipts',
      icon: <Clock size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Instant email receipts after payment',
        'Access billing history in your profile',
        'Download receipts for expense tracking',
        'Monthly billing summaries available',
      ],
      tips: [
        'Keep receipts for business expense claims',
        'Set up email notifications for payments',
        'Download receipts before they expire',
      ],
    },
    {
      id: '6',
      title: 'Refunds & Cancellations',
      description: 'Understanding our refund and cancellation policy',
      icon: <CheckCircle size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Free cancellation up to 2 hours before booking',
        'Automatic refunds for cancelled bookings',
        'Refund processing time: 3-5 business days',
        'Contact support for refund assistance',
      ],
      tips: [
        'Cancel early to avoid cancellation fees',
        'Check refund status in your profile',
        'Keep booking confirmations for reference',
      ],
      warnings: [
        'Late cancellations may incur fees',
        'No refunds for no-shows',
      ],
    },
  ];

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, currentStep]);

  const handleBackPress = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    if (currentStep < paymentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const currentStepData = paymentSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={TUTORIAL_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={TUTORIAL_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Guide</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {paymentSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {paymentSteps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Content */}
        <View style={styles.stepContainer}>
          <View style={styles.iconContainer}>
            {currentStepData.icon}
          </View>
          
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>

          {/* Step Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Key Points:</Text>
            {currentStepData.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <CheckCircle size={20} color={TUTORIAL_COLORS.success} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>

          {/* Tips Section */}
          {currentStepData.tips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
              {currentStepData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipText}>• {tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Warnings Section */}
          {currentStepData.warnings && (
            <View style={styles.warningsContainer}>
              <Text style={styles.warningsTitle}>⚠️ Important:</Text>
              {currentStepData.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <AlertCircle size={16} color={TUTORIAL_COLORS.warning} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === paymentSteps.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <ArrowRight size={20} color={TUTORIAL_COLORS.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TUTORIAL_COLORS.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: TUTORIAL_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TUTORIAL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TUTORIAL_COLORS.text.primary,
  },

  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: TUTORIAL_COLORS.text.secondary,
  },

  // Progress Styles
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TUTORIAL_COLORS.border,
    marginHorizontal: 4,
  },

  progressDotActive: {
    backgroundColor: TUTORIAL_COLORS.accent,
  },

  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: TUTORIAL_COLORS.text.secondary,
    textAlign: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TUTORIAL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: TUTORIAL_COLORS.accent,
  },

  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TUTORIAL_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TUTORIAL_COLORS.text.primary,
    marginBottom: 16,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  detailText: {
    fontSize: 15,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.primary,
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
  },

  // Tips Styles
  tipsContainer: {
    width: '100%',
    backgroundColor: TUTORIAL_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: TUTORIAL_COLORS.accent,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TUTORIAL_COLORS.text.primary,
    marginBottom: 12,
  },

  tipItem: {
    marginBottom: 8,
  },

  tipText: {
    fontSize: 14,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    lineHeight: 20,
  },

  // Warnings Styles
  warningsContainer: {
    width: '100%',
    backgroundColor: TUTORIAL_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: TUTORIAL_COLORS.warning,
  },

  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TUTORIAL_COLORS.text.primary,
    marginBottom: 12,
  },

  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  warningText: {
    fontSize: 14,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },

  // Navigation Styles
  navigationContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Buffer space to prevent content from being hidden by navigation bar
  },

  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: TUTORIAL_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  nextButton: {
    backgroundColor: TUTORIAL_COLORS.accent,
  },

  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8,
  },
});

export default PaymentGuide;
