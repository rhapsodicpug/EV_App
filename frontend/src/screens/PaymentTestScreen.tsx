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
      // STEP 1: Fetch the order_id from YOUR server
      const response = await fetch('http://192.168.1.9:8000/api/payment/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${'your-token-here'}`, // Add auth token if needed
        },
        body: JSON.stringify({ amount: amount }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order from backend.');
      }
      
      const { order_id, key_id } = await response.json();
      console.log('✅ Order ID received:', order_id);
      console.log('🔑 Key ID received:', key_id);
      
      // STEP 2: Create proper Razorpay checkout URL
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?key_id=${key_id}&order_id=${order_id}&amount=${amount * 100}&currency=INR&name=EV%20Charging%20App&description=Payment%20Test&prefill[email]=user@example.com&prefill[contact]=9999999999&prefill[name]=Test%20User&theme[color]=%2300A8FF`;
      
      console.log('🌐 Opening Razorpay checkout URL:', checkoutUrl);
      
      // STEP 3: Open the Razorpay checkout page in WebBrowser
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#00A8FF',
        showTitle: true,
        enableBarCollapsing: false,
      });
      
      console.log('🌐 WebBrowser result:', result);
      
      // Simulate successful payment for testing
      Alert.alert(
        'Payment Test Complete',
        `Order ID: ${order_id}\nAmount: ₹${amount}\nStatus: Test Complete\n\nNote: This is a test environment. In production, you would handle the actual payment response.`,
        [{ text: 'OK' }]
      );
      
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
        This will open Razorpay checkout in a web browser
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
