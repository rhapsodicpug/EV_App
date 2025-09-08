import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const PaymentTestScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async () => {
    console.log('Attempting to initiate payment...');
    setIsProcessing(true);
    const amount = 5; // Test amount: ₹5.00

    try {
      // STEP 1: Fetch the payment URL from YOUR server
      const response = await fetch('http://192.168.1.9:8000/api/payment/create-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${'your-token-here'}`, // Add auth token if needed
        },
        body: JSON.stringify({ 
          amount: amount,
          user_name: 'Test User',
          user_email: 'test@example.com',
          booking_id: 'test-booking-123'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment link from backend.');
      }
      
      const { payment_url } = await response.json();
      console.log('✅ Payment URL received:', payment_url);
      
      // STEP 2: Open the Razorpay payment link in WebBrowser
      console.log('🌐 Opening Razorpay payment link:', payment_url);
      
      const result = await WebBrowser.openBrowserAsync(payment_url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#00A8FF',
        showTitle: true,
        enableBarCollapsing: false,
      });
      
      console.log('🌐 WebBrowser result:', result);
      
      // Handle the browser closing
      if (result.type === 'cancel' || result.type === 'dismiss') {
        Alert.alert(
          "Payment session closed", 
          "Please check 'My Bookings' to see if your payment was successful."
        );
      } else {
        Alert.alert(
          'Payment Test Complete',
          `Amount: ₹${amount}\nStatus: Payment link opened successfully\n\nNote: This is a test environment. In production, you would handle the actual payment response via webhooks.`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Payment Test Error:', error);
      Alert.alert('Payment Test Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, isProcessing && styles.buttonDisabled]} 
        onPress={initiatePayment}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? 'Processing...' : 'Pay ₹5.00 (Test)'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.infoText}>
        This will open Razorpay payment link in a web browser
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#101010',
    padding: 20,
  },
  button: { 
    backgroundColor: '#00A8FF', 
    padding: 20, 
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  infoText: {
    color: '#B3B3B3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PaymentTestScreen;
