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

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    color: LIQUID_COLORS.primary,
  },
  {
    id: 'upi',
    name: 'UPI Payment',
    icon: Smartphone,
    color: LIQUID_COLORS.success,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    color: LIQUID_COLORS.tertiary,
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

  // Reset state on component mount to ensure fresh start
  useEffect(() => {
    console.log('🔄 Resetting confirmation state on component mount');
    setIsConfirmed(false);
    setIsProcessing(false);
  }, []);

  // Animation refs for liquid hero effect
  const scrollY = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;

  // Hero content fade animation (scroll-based blurring)
  const heroFade = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Hero translation animation for collapsing effect
  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Sticky header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [-30, 0],
    extrapolate: 'clamp',
  });

  // Start liquid animation on mount
  React.useEffect(() => {
    Animated.timing(liquidAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  // Create a booking object from the route params - handle both new and legacy formats
  const booking = startTime ? {
    // New flexible booking format
    id: Date.now().toString(),
    stationName: station?.name || 'Unknown Station',
    stationAddress: station?.address || 'Address not available',
    date: new Date().toDateString(), // Current date for new bookings
    time: startTime.displayTime,
    duration: duration,
    endTime: endTime,
    slotNumber: 1, // Default slot number for flexible bookings
    chargerType: station?.charging_slots?.[0]?.charger_type || 'DC_FAST',
    amount: cost,
    totalAmount: cost,
  } : {
    // Legacy format for backward compatibility
    id: Date.now().toString(),
    stationName: station?.name || 'Unknown Station',
    stationAddress: station?.address || 'Address not available',
    date: selectedDate?.toDateString() || new Date().toDateString(),
    time: selectedSlot?.time || 'Unknown time',
    duration: selectedSlot?.duration || 0,
    slotNumber: selectedSlot?.slotNumber || 1,
    chargerType: selectedSlot?.chargerType || 'DC_FAST',
    amount: selectedSlot?.price || 0,
    totalAmount: totalPrice || 0,
  };

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
      
      const bookingData = {
        station_id: stationId,
        start_time: startTime.toISOString(),
        duration_minutes: route.params?.duration || 60,
        notes: `Payment ID: ${paymentData.razorpay_payment_id}`,
      };

      console.log('📋 Booking data:', bookingData);

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
        throw new Error('Failed to create order');
      }

      const { order_id, key_id } = await response.json();
      console.log('✅ Order created successfully:', order_id);
      console.log('🔑 Key ID received:', key_id);
      console.log('💰 Amount being charged:', amount);

      // 2. Create Razorpay payment link URL
      const paymentLinkUrl = `https://rzp.io/l/${order_id}`;
      
      console.log('🌐 Opening Razorpay payment link:', paymentLinkUrl);
      console.log('🔍 Full payment details:', {
        order_id,
        key_id,
        amount,
        paymentLinkUrl,
        stationName
      });

      // 3. Use Native Razorpay SDK
      console.log('🔄 Opening Native Razorpay Checkout...');
      
      const options = {
        description: `EV Charging Slot Booking - ${stationName}`,
        image: 'https://via.placeholder.com/100x100/00A8FF/FFFFFF?text=EV',
        currency: 'INR',
        key: key_id,
        amount: amount * 100, // Convert to paise
        name: 'EV Charging App',
        order_id: order_id,
        prefill: {
          email: user?.email || 'user@example.com',
          contact: user?.phone || '9999999999',
          name: user?.name || 'User',
        },
        theme: { color: LIQUID_COLORS.primary },
      };

      console.log('💳 Razorpay options:', options);

      // Create proper Razorpay checkout URL
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?key=${key_id}&order_id=${order_id}&amount=${amount * 100}&currency=INR&name=EV Charging App&description=EV Charging Slot Booking - ${stationName}&prefill[email]=${user?.email || 'user@example.com'}&prefill[contact]=${user?.phone || '9999999999'}&prefill[name]=${user?.name || 'User'}&theme[color]=${LIQUID_COLORS.primary}`;
      
      console.log('🌐 Opening Razorpay checkout URL:', checkoutUrl);
      
      // Open the proper Razorpay checkout page
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
      
      // Use the mock payment data instead of the actual Razorpay response
      const data = mockPaymentData;
      
      // Handle success - Create booking after payment
      console.log('✅ Payment Successful:', data);
        
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
        // Handle failure
        console.error('❌ Payment Error:', error);
        
        if (error.code === 'PAYMENT_CANCELLED') {
          Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
        } else {
          Alert.alert('Payment Failed', `Reason: ${error.description || 'Unknown error'}`);
        }
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
    const bookingAmount = route.params?.cost || route.params?.totalPrice || 5;
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

        {/* Sticky Header */}
        <Animated.View style={[styles.stickyHeader, {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }]
        }]}>
          <Text style={styles.stickyHeaderTitle}>Booking Confirmed</Text>
          <Ionicons name="checkmark-circle" size={24} color={LIQUID_COLORS.success} />
        </Animated.View>

        {/* Liquid Hero Section */}
        <Animated.View style={[styles.heroContainer, { 
          opacity: heroFade,
          transform: [{ translateY: heroTranslate }]
        }]}>
          <Animated.View
            style={[
              styles.liquidBackground,
              {
                transform: [
                  {
                    scale: liquidAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                LIQUID_COLORS.success,
                LIQUID_COLORS.primary,
                LIQUID_COLORS.tertiary,
                LIQUID_COLORS.success,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {/* Animated liquid blobs */}
              <Animated.View
                style={[
                  styles.liquidBlob,
                  styles.blob1,
                  {
                    transform: [
                      {
                        translateX: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 30],
                        }),
                      },
                      {
                        translateY: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.liquidBlob,
                  styles.blob2,
                  {
                    transform: [
                      {
                        translateX: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -25],
                        }),
                      },
                      {
                        translateY: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 15],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </LinearGradient>
          </Animated.View>

          {/* Success Content */}
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={64} color={LIQUID_COLORS.text.primary} />
            </View>
            <Text style={styles.successTitle}>
              Booking Confirmed!
            </Text>
            <Text style={styles.successSubtitle}>
              Your charging session has been successfully booked
            </Text>
          </View>
        </Animated.View>

        {/* Rising Sheet */}
        <Animated.ScrollView
          style={styles.risingSheet}
          contentContainerStyle={styles.sheetContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Inner Shadow */}
          <View style={styles.innerShadow} />

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Access Code</Text>
            <Text style={styles.sectionSubtitle}>
              Show this at the charging station
            </Text>
            <View style={styles.qrCode}>
              <Text style={styles.qrText}>
                QR Code Placeholder
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingIdLabel}>
              Booking ID: {booking.id}
            </Text>
            <Text style={styles.stationName}>
              {booking.stationName}
            </Text>
            <Text style={styles.stationAddress}>
              {booking.stationAddress}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewBooking}
            >
              <Text style={styles.secondaryButtonText}>View Booking Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToHome}
            >
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />

      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, {
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslate }]
      }]}>
        <Text style={styles.stickyHeaderTitle}>Confirm Booking</Text>
        <Ionicons name="card-outline" size={24} color={LIQUID_COLORS.primary} />
      </Animated.View>

      {/* Liquid Hero Section */}
      <Animated.View style={[styles.heroContainer, { 
        opacity: heroFade,
        transform: [{ translateY: heroTranslate }]
      }]}>
        <Animated.View
          style={[
            styles.liquidBackground,
            {
              transform: [
                {
                  scale: liquidAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              LIQUID_COLORS.primary,
              LIQUID_COLORS.secondary,
              LIQUID_COLORS.tertiary,
              LIQUID_COLORS.primary,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Animated liquid blobs */}
            <Animated.View
              style={[
                styles.liquidBlob,
                styles.blob1,
                {
                  transform: [
                    {
                      translateX: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 30],
                      }),
                    },
                    {
                      translateY: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.liquidBlob,
                styles.blob2,
                {
                  transform: [
                    {
                      translateX: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -25],
                      }),
                    },
                    {
                      translateY: liquidAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15],
                      }),
                    },
                  ],
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroHeadline}>
            Confirm Your Booking
          </Text>
          <Text style={styles.heroSubheadline}>
            Review your charging session details
          </Text>
        </View>
      </Animated.View>

      {/* Rising Sheet */}
      <Animated.ScrollView
        style={styles.risingSheet}
        contentContainerStyle={styles.sheetContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Inner Shadow */}
        <View style={styles.innerShadow} />

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Station</Text>
            <Text style={styles.summaryValue}>{booking.stationName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Start Time</Text>
            <Text style={styles.summaryValue}>
              {booking.date} at {booking.time}
            </Text>
          </View>

          {booking.endTime && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>End Time</Text>
              <Text style={styles.summaryValue}>{booking.endTime}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>
              {startTime ? `${booking.duration} minutes` : `${booking.duration} hours`}
            </Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: LIQUID_COLORS.primary }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalAmount, { color: LIQUID_COLORS.primary }]}>
              ₹{booking.totalAmount}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                {
                  backgroundColor: paymentMethod === method.id ? LIQUID_COLORS.surface : LIQUID_COLORS.card,
                  borderColor: paymentMethod === method.id ? method.color : LIQUID_COLORS.surface,
                },
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentOptionContent}>
                <method.icon
                  size={24}
                  color={paymentMethod === method.id ? LIQUID_COLORS.text.primary : method.color}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    {
                      color: paymentMethod === method.id ? LIQUID_COLORS.text.primary : LIQUID_COLORS.text.secondary,
                    },
                  ]}
                >
                  {method.name}
                </Text>
              </View>
              {paymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={LIQUID_COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              opacity: isProcessing ? 0.6 : 1,
            }
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={
              isProcessing
                ? [LIQUID_COLORS.surface, LIQUID_COLORS.surface]
                : [LIQUID_COLORS.primary, LIQUID_COLORS.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processing...' : 'Confirm & Pay'}
            </Text>
            {!isProcessing && <Ionicons name="arrow-forward" size={20} color={LIQUID_COLORS.text.primary} />}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.background,
  },

  // Sticky Header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: LIQUID_COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50, // Account for status bar
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: LIQUID_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },

  stickyHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },
  // Liquid Hero Section
  heroContainer: {
    height: height * 0.5, // 50% of screen height
    position: 'relative',
    overflow: 'hidden',
  },

  liquidBackground: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  liquidBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  blob1: {
    top: 50,
    right: 30,
  },

  blob2: {
    bottom: 80,
    left: 20,
  },

  // Hero Content
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Account for status bar
  },

  heroHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  heroSubheadline: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },

  // Rising Sheet
  risingSheet: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.sheet,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // Overlap with hero
  },

  sheetContent: {
    paddingTop: 40, // Account for rounded corners
    paddingBottom: 100, // Account for tab bar
    paddingHorizontal: 24,
  },

  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Cards
  summaryCard: {
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: LIQUID_COLORS.text.secondary,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'right',
    flex: 1,
  },

  priceDivider: {
    height: 1,
    backgroundColor: LIQUID_COLORS.border,
    marginVertical: 16,
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIQUID_COLORS.primary,
  },

  // Payment Methods
  paymentCard: {
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  paymentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 20,
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },

  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
  },

  // Confirm Button
  confirmButton: {
    marginBottom: 24,
  },

  confirmButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LIQUID_COLORS.text.primary,
  },

  // Success Screen Styles
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  successIconContainer: {
    marginBottom: 24,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  successSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },

  // QR Code Section
  qrSection: {
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  qrCode: {
    width: 150,
    height: 150,
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
  },

  qrText: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
  },

  // Booking Details
  bookingDetails: {
    backgroundColor: LIQUID_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  bookingIdLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LIQUID_COLORS.text.muted,
    marginBottom: 8,
  },

  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },

  stationAddress: {
    fontSize: 14,
    fontWeight: '400',
    color: LIQUID_COLORS.text.secondary,
  },

  // Action Buttons
  actionButtons: {
    gap: 12,
  },

  secondaryButton: {
    backgroundColor: LIQUID_COLORS.card,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
  },

  primaryButton: {
    backgroundColor: LIQUID_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
  },
});
