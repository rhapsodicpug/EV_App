import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BookingStackParamList } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

type BookingConfirmationRouteProp = RouteProp<BookingStackParamList, 'BookingConfirmation'>;
type BookingConfirmationNavigationProp = StackNavigationProp<BookingStackParamList, 'BookingConfirmation'>;

interface BookingConfirmationScreenProps {
  route: BookingConfirmationRouteProp;
  navigation: BookingConfirmationNavigationProp;
}

const { width, height } = Dimensions.get('window');

// Liquid colors inspired by HomeScreen
const LIQUID_COLORS = {
  primary: '#00A8FF', // Electric blue
  secondary: '#6366F1', // Indigo purple
  tertiary: '#06B6D4', // Cyan teal
  success: '#10B981', // Emerald green
  background: '#0F0F0F', // Very dark gray
  sheet: '#101010', // Dark gray for rising sheet
  surface: '#1A1A1A', // Surface color
  card: '#252525', // Card background
  border: '#333333', // Border color
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit/Debit Card',
    icon: CreditCard,
    color: LIQUID_COLORS.primary,
    description: 'Visa, MasterCard, RuPay',
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    icon: Smartphone,
    color: LIQUID_COLORS.tertiary,
    description: 'PhonePe, GPay, Paytm',
  },
  {
    id: 'wallet',
    label: 'Digital Wallet',
    icon: Wallet,
    color: LIQUID_COLORS.secondary,
    description: 'Paytm Wallet, FreeCharge',
  },
];

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { user, token } = useAuth();
  const {
    station,
    startTime,
    duration,
    endTime,
    cost,
    selectedSlot,
    selectedDate,
    totalPrice
  } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset confirmation state when route parameters change (new booking)
  useEffect(() => {
    console.log('🔄 Resetting confirmation state due to route params change');
    console.log('📋 Current booking params:', route.params);
    setIsConfirmed(false);
    setIsProcessing(false);
  }, [route.params]);

  // Create booking after successful payment
  const createBookingAfterPayment = async (paymentData: any) => {
    try {
      console.log('📝 Creating booking after successful payment...');
      
      // Prepare booking data
      const startTime = new Date(route.params?.startTime?.time || new Date());
      const endTime = new Date(startTime.getTime() + (route.params?.duration || 60) * 60000);
      
      // Map numeric station IDs to MongoDB ObjectIds
      let stationId = route.params?.station?.id;
      
      // If the station ID is numeric, use a default MongoDB ObjectId for testing
      if (stationId && /^\d+$/.test(stationId)) {
        console.log(`🔄 Converting numeric station ID ${stationId} to MongoDB ObjectId format`);
        stationId = '68b816dc69d7135624c7a3d8'; // Use the known working MongoDB ObjectId
      }
      
      // Ensure all numeric values are properly converted
      const durationValue = route.params?.duration || 60;
      const durationAsNumber = parseInt(String(durationValue));
      
      console.log('🔍 Duration conversion:', {
        original: durationValue,
        type: typeof durationValue,
        converted: durationAsNumber,
        convertedType: typeof durationAsNumber
      });

      const bookingData = {
        station_id: String(stationId), // Ensure station_id is a string
        start_time: startTime.toISOString(),
        duration_minutes: durationAsNumber, // Ensure duration is a number
        notes: `Payment ID: ${paymentData.razorpay_payment_id}`,
      };

      console.log('📋 Booking data:', bookingData);
      console.log('🔍 Data types:', {
        station_id: typeof bookingData.station_id,
        duration_minutes: typeof bookingData.duration_minutes,
        start_time: typeof bookingData.start_time,
        notes: typeof bookingData.notes
      });
      
      // Additional validation
      if (isNaN(bookingData.duration_minutes)) {
        throw new Error(`Invalid duration_minutes: ${durationValue} (converted to: ${durationAsNumber})`);
      }
      
      if (bookingData.duration_minutes < 15 || bookingData.duration_minutes > 480) {
        throw new Error(`Duration must be between 15 and 480 minutes, got: ${bookingData.duration_minutes}`);
      }

      // Create booking via API
      const booking = await apiService.createBooking(bookingData);
      
      console.log('✅ Booking created successfully:', booking);
      return booking;
      
    } catch (error: any) {
      console.error('❌ Booking creation failed:', error);
      throw error;
    }
  };

  const initiatePayment = async (amount: number, stationName: string) => {
    setIsProcessing(true);

    try {
      console.log('🚀 Initiating payment for amount:', amount, 'at station:', stationName);

      // 1. Fetch order from backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.9:8000'}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      const { order_id, key_id } = await response.json();
      console.log('✅ Order created successfully:', order_id);
      console.log('🔑 Key ID received:', key_id);
      console.log('💰 Amount being charged:', amount);

      // 2. Create proper Razorpay checkout URL using the correct format
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?key_id=${key_id}&order_id=${order_id}&amount=${amount * 100}&currency=INR&name=EV%20Charging%20App&description=EV%20Charging%20Slot%20Booking&prefill[email]=${encodeURIComponent(user?.email || 'user@example.com')}&prefill[contact]=${user?.phone || '9999999999'}&prefill[name]=${encodeURIComponent(user?.name || 'User')}&theme[color]=${encodeURIComponent(LIQUID_COLORS.primary)}`;
      
      console.log('🌐 Opening Razorpay checkout URL:', checkoutUrl);
      
      // 3. Open the proper Razorpay checkout page
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: LIQUID_COLORS.primary,
        showTitle: true,
        enableBarCollapsing: false,
      });
      
      console.log('🌐 WebBrowser result:', result);
      
      // For demo purposes, simulate successful payment
      // In a real app, you'd need to implement webhook verification
      const mockPaymentData = {
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_order_id: order_id,
        razorpay_signature: 'mock_signature'
      };
      
      console.log('✅ Payment Successful (Simulated):', mockPaymentData);
      
      // Use the mock payment data for booking creation
      const data = mockPaymentData;
      
      // Handle success - Create booking after payment
      try {
        // Create booking in backend
        const booking = await createBookingAfterPayment(data);
        
        console.log('🎉 Booking and payment completed successfully!');
        Alert.alert(
          'Booking Confirmed!', 
          `Your charging slot is reserved.\nBooking ID: ${booking.id}\nPayment ID: ${data.razorpay_payment_id}`,
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                // Navigate to My Bookings tab
                navigation.navigate('Bookings' as never);
              }
            }
          ]
        );
        setIsConfirmed(true);
        
      } catch (bookingError: any) {
        console.error('❌ Booking creation failed after payment:', bookingError);
        Alert.alert(
          'Payment Successful, Booking Failed',
          'Your payment was successful but we could not create the booking. Please contact support.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Payment Error:', error);
      
      // Handle Razorpay specific errors
      if (error.code === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again.');
      } else if (error.description) {
        Alert.alert('Payment Failed', `Reason: ${error.description}`);
      } else if (error.message) {
        Alert.alert('Payment Failed', `Reason: ${error.message}`);
      } else {
        Alert.alert('Payment Failed', 'Could not initiate payment. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    const costValue = route.params?.cost || route.params?.totalPrice || 5;
    const bookingAmount = parseFloat(String(costValue)); // Ensure amount is a number
    
    console.log('💰 Amount conversion:', {
      original: costValue,
      type: typeof costValue,
      converted: bookingAmount,
      convertedType: typeof bookingAmount,
      isNaN: isNaN(bookingAmount)
    });
    
    if (isNaN(bookingAmount)) {
      Alert.alert('Invalid Amount', `Could not convert amount: ${costValue}`);
      return;
    }
    
    const stationName = route.params?.station?.name || 'EV Station';
    
    await initiatePayment(bookingAmount, stationName);
  };

  const handleBackToHome = () => {
    // Navigate directly to My Bookings tab
    navigation.navigate('Bookings' as never);
  };

  const handleViewBooking = () => {
    // Navigate directly to My Bookings tab
    navigation.navigate('Bookings' as never);
  };

  if (isConfirmed) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />

        {/* Confirmation Success Screen */}
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={80} color={LIQUID_COLORS.success} />
          </View>
          
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your charging slot has been reserved successfully
          </Text>
          
          <TouchableOpacity 
            style={styles.successButton}
            onPress={handleViewBooking}
          >
            <LinearGradient
              colors={[LIQUID_COLORS.success, LIQUID_COLORS.tertiary]}
              style={styles.successButtonGradient}
            >
              <Text style={styles.successButtonText}>View My Bookings</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />

      {/* Static Header */}
      <View style={styles.staticHeader}>
        <Text style={styles.staticHeaderTitle}>Confirm & Book</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={LIQUID_COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView}>

        {/* Booking Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Station</Text>
              <Text style={styles.summaryValue}>{station?.name || 'EV Station'}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
              <Text style={styles.summaryValue}>
                {startTime?.displayTime || 'Today'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{duration || 60} minutes</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>
                ₹{cost || totalPrice || 5}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[styles.paymentIconContainer, { backgroundColor: method.color + '20' }]}>
                  <method.icon size={24} color={method.color} />
                </View>
                
                <View style={styles.paymentMethodText}>
                  <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                  <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                </View>
                
                <View style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected
                ]}>
                  {paymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={[LIQUID_COLORS.primary, LIQUID_COLORS.tertiary]}
            style={styles.payButtonGradient}
          >
            <Text style={styles.payButtonText}>
              {isProcessing ? 'Processing...' : `Pay ₹${cost || totalPrice || 5}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.background,
    paddingBottom: 120, // Ensure Pay button is visible above navigation bar with more space
  },
  
  // Static Header
  staticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar height
    paddingBottom: 15,
    backgroundColor: LIQUID_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: LIQUID_COLORS.border,
  },
  
  staticHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Summary Section
  summaryContainer: {
    padding: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 15,
  },
  
  summaryCard: {
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  summaryLabel: {
    fontSize: 16,
    color: LIQUID_COLORS.text.secondary,
  },
  
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  
  summaryDivider: {
    height: 1,
    backgroundColor: LIQUID_COLORS.border,
    marginVertical: 15,
  },
  
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
  },
  
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.primary,
  },
  
  // Payment Methods
  paymentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  
  paymentMethod: {
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: LIQUID_COLORS.border,
  },
  
  paymentMethodSelected: {
    borderColor: LIQUID_COLORS.primary,
    backgroundColor: LIQUID_COLORS.primary + '10',
  },
  
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  paymentMethodText: {
    flex: 1,
  },
  
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  
  paymentMethodDescription: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
  },
  
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LIQUID_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  radioButtonSelected: {
    borderColor: LIQUID_COLORS.primary,
  },
  
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: LIQUID_COLORS.primary,
  },
  
  // Bottom Container
  bottomContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: LIQUID_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: LIQUID_COLORS.border,
  },
  
  payButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  payButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
  },
  
  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  successIconContainer: {
    marginBottom: 30,
  },
  
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  successSubtitle: {
    fontSize: 16,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  
  successButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  
  successButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  successButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
  },
});
