/**
 * Enhanced Confirm Booking Screen
 * Modern booking confirmation with detailed information
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  Star,
  ChevronLeft,
  Check,
  AlertCircle,
  CreditCard,
  Battery,
  Navigation,
  Shield,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Premium Confirm Booking Colors
const CONFIRM_COLORS = {
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

interface ConfirmBookingScreenProps {
  route: {
    params: {
      station: any;
      startTime: any;
      duration: number;
      cost: number;
      selectedDate: Date;
    };
  };
}

const ConfirmBookingScreen: React.FC<ConfirmBookingScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { station, startTime, duration, cost, selectedDate } = route.params;

  // State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate end time
  const endTime = new Date(startTime.time);
  endTime.setMinutes(endTime.getMinutes() + duration);

  // Payment methods
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      color: CONFIRM_COLORS.primary,
      description: 'Visa, MasterCard, RuPay',
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Battery,
      color: CONFIRM_COLORS.success,
      description: 'PhonePe, GPay, Paytm',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Shield,
      color: CONFIRM_COLORS.secondary,
      description: 'Paytm Wallet, FreeCharge',
    },
  ];

  // Booking Summary Component
  const BookingSummary = () => (
    <Animated.View
      style={[
        styles.summaryCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[CONFIRM_COLORS.card, CONFIRM_COLORS.surface]}
        style={styles.summaryGradient}
      >
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Zap size={24} color={CONFIRM_COLORS.primary} />
          </View>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
        </View>

        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <MapPin size={16} color={CONFIRM_COLORS.text.secondary} />
              <Text style={styles.summaryLabel}>Station</Text>
            </View>
            <Text style={styles.summaryValue}>{station?.name || 'EV Station'}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Calendar size={16} color={CONFIRM_COLORS.text.secondary} />
              <Text style={styles.summaryLabel}>Date</Text>
            </View>
            <Text style={styles.summaryValue}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Clock size={16} color={CONFIRM_COLORS.text.secondary} />
              <Text style={styles.summaryLabel}>Time</Text>
            </View>
            <Text style={styles.summaryValue}>
              {startTime.displayTime} - {endTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Battery size={16} color={CONFIRM_COLORS.text.secondary} />
              <Text style={styles.summaryLabel}>Duration</Text>
            </View>
            <Text style={styles.summaryValue}>{duration} minutes</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>₹{cost}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Payment Method Component
  const PaymentMethodSelector = () => (
    <Animated.View
      style={[
        styles.paymentCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.paymentTitle}>Payment Method</Text>
      
      {paymentMethods.map((method, index) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === method.id && styles.paymentMethodSelected,
          ]}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <View style={styles.paymentMethodContent}>
            <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
              <method.icon size={20} color={method.color} />
            </View>
            
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              <Text style={styles.paymentMethodDesc}>{method.description}</Text>
            </View>
            
            <View style={[
              styles.radioButton,
              selectedPaymentMethod === method.id && styles.radioButtonSelected,
            ]}>
              {selectedPaymentMethod === method.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  // Terms and Conditions Component
  const TermsAndConditions = () => (
    <Animated.View
      style={[
        styles.termsCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
      >
        <View style={[
          styles.checkbox,
          agreedToTerms && styles.checkboxSelected,
        ]}>
          {agreedToTerms && <Check size={16} color={CONFIRM_COLORS.text.primary} />}
        </View>
        
        <View style={styles.termsContent}>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const handleConfirmBooking = () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions to continue.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('BookingConfirmation', {
        station,
        startTime,
        duration,
        cost,
        selectedDate,
        paymentMethod: selectedPaymentMethod,
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CONFIRM_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={CONFIRM_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <BookingSummary />

        {/* Payment Method */}
        <PaymentMethodSelector />

        {/* Terms and Conditions */}
        <TermsAndConditions />

        {/* Additional Info */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.infoHeader}>
            <AlertCircle size={20} color={CONFIRM_COLORS.warning} />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              • Your booking will be confirmed after successful payment
            </Text>
            <Text style={styles.infoText}>
              • You can cancel up to 30 minutes before your slot
            </Text>
            <Text style={styles.infoText}>
              • Please arrive within 15 minutes of your booking time
            </Text>
            <Text style={styles.infoText}>
              • Contact support if you need assistance
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!agreedToTerms || isProcessing) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!agreedToTerms || isProcessing}
        >
          <LinearGradient
            colors={agreedToTerms && !isProcessing 
              ? [CONFIRM_COLORS.primary, CONFIRM_COLORS.secondary]
              : [CONFIRM_COLORS.border, CONFIRM_COLORS.border]
            }
            style={styles.confirmButtonGradient}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processing...' : `Confirm & Pay ₹${cost}`}
            </Text>
            {!isProcessing && (
              <Check size={20} color={CONFIRM_COLORS.text.primary} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIRM_COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CONFIRM_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
  },
  headerRight: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Summary Card
  summaryCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: CONFIRM_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
  },
  summaryContent: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: CONFIRM_COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: CONFIRM_COLORS.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: CONFIRM_COLORS.border,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: CONFIRM_COLORS.primary,
  },

  // Payment Card
  paymentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
    marginBottom: 16,
  },
  paymentMethod: {
    backgroundColor: CONFIRM_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: CONFIRM_COLORS.primary,
    backgroundColor: CONFIRM_COLORS.primary + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: CONFIRM_COLORS.text.primary,
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 14,
    color: CONFIRM_COLORS.text.secondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CONFIRM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: CONFIRM_COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CONFIRM_COLORS.primary,
  },

  // Terms Card
  termsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CONFIRM_COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: CONFIRM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: CONFIRM_COLORS.primary,
    borderColor: CONFIRM_COLORS.primary,
  },
  termsContent: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: CONFIRM_COLORS.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: CONFIRM_COLORS.primary,
    fontWeight: '500',
  },

  // Info Card
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: CONFIRM_COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: CONFIRM_COLORS.warning,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
    marginLeft: 8,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: CONFIRM_COLORS.text.secondary,
    lineHeight: 20,
  },

  // Bottom Container
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: CONFIRM_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: CONFIRM_COLORS.border,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: CONFIRM_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIRM_COLORS.text.primary,
  },
});

export default ConfirmBookingScreen;
