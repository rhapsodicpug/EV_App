/**
 * EXAMPLE: How to use PaymentService in your React Native component
 * This file demonstrates the production-ready payment flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import paymentService, { PaymentResult } from './src/services/PaymentService';
import { useAuth } from './src/contexts/AuthContext';

interface BookingPaymentScreenProps {
  bookingId: string;
  amount: number;
  stationName: string;
}

const BookingPaymentScreen: React.FC<BookingPaymentScreenProps> = ({
  bookingId,
  amount,
  stationName,
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handlePayment = async () => {
    // Prevent multiple clicks
    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      await paymentService.initiatePayment(
        bookingId,
        amount,
        `Charging session at ${stationName}`,
        {
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
          contact: user?.phone || '9999999999',
        },
        // ✅ Success callback
        (result: PaymentResult) => {
          console.log('🎉 Payment successful!', result);
          setIsProcessing(false);
          setIsVerifying(false);
          setPaymentStatus('success');
          
          // Show success message
          Alert.alert(
            'Payment Successful! 🎉',
            'Your booking has been confirmed.',
            [
              {
                text: 'View Booking',
                onPress: () => {
                  // Navigate to booking details or success screen
                  navigation.navigate('BookingConfirmed', {
                    bookingId: bookingId,
                    paymentId: result.payment_id,
                  });
                },
              },
            ]
          );
        },
        // ❌ Failure callback
        (result: PaymentResult) => {
          console.error('❌ Payment failed:', result);
          setIsProcessing(false);
          setIsVerifying(false);
          setPaymentStatus('failed');
          
          // Show detailed error message
          Alert.alert(
            'Payment Failed',
            result.message,
            result.payment_id
              ? [
                  {
                    text: 'Contact Support',
                    onPress: () => {
                      // Navigate to support screen with payment details
                      navigation.navigate('Support', {
                        paymentId: result.payment_id,
                        orderId: result.order_id,
                        errorCode: result.error_code,
                      });
                    },
                  },
                  { text: 'Try Again', onPress: handlePayment },
                  { text: 'Cancel', style: 'cancel' },
                ]
              : [
                  { text: 'Try Again', onPress: handlePayment },
                  { text: 'Cancel', style: 'cancel' },
                ]
          );
        },
        // 🔄 Verifying callback (optional - for showing loading state)
        () => {
          console.log('🔄 Verifying payment...');
          setIsVerifying(true);
        }
      );
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      setIsProcessing(false);
      setIsVerifying(false);
      setPaymentStatus('failed');
      
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Booking Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.stationName}>{stationName}</Text>
        <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay:</Text>
          <Text style={styles.amount}>₹{amount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Button */}
      <TouchableOpacity
        style={[
          styles.payButton,
          (isProcessing || isVerifying) && styles.payButtonDisabled,
        ]}
        onPress={handlePayment}
        disabled={isProcessing || isVerifying}
        activeOpacity={0.8}
      >
        {isProcessing || isVerifying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1A1A1A" size="small" />
            <Text style={styles.payButtonText}>
              {isVerifying ? 'Verifying Payment...' : 'Processing...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.payButtonText}>Pay ₹{amount.toFixed(2)}</Text>
        )}
      </TouchableOpacity>

      {/* Status Messages */}
      {isVerifying && (
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            🔄 Verifying your payment, please wait...
          </Text>
        </View>
      )}

      {paymentStatus === 'failed' && (
        <View style={[styles.statusCard, styles.errorCard]}>
          <Text style={styles.errorText}>
            ❌ Payment failed. Please try again or contact support if the issue persists.
          </Text>
        </View>
      )}

      {/* Payment Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Secure Payment</Text>
        <Text style={styles.infoText}>
          • Your payment is processed securely via Razorpay
        </Text>
        <Text style={styles.infoText}>
          • All major cards, UPI, and net banking supported
        </Text>
        <Text style={styles.infoText}>
          • Your booking will be confirmed immediately after payment
        </Text>
      </View>

      {/* Terms */}
      <Text style={styles.termsText}>
        By proceeding, you agree to our Terms & Conditions
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  detailsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stationName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  amountLabel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8cd279',
  },
  payButton: {
    backgroundColor: '#8cd279',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#8cd279',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusCard: {
    backgroundColor: 'rgba(140, 210, 121, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.3)',
  },
  statusText: {
    fontSize: 14,
    color: '#8cd279',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
    lineHeight: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default BookingPaymentScreen;

