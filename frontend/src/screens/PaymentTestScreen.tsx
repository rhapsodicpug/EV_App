import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env'; // Your public key

const PaymentTestScreen = () => {
  const initiatePayment = async () => {
    console.log('Attempting to initiate payment...');
    const amount = 500; // Test amount: ₹5.00

    try {
      // STEP 1: Fetch the order_id from YOUR server
      const response = await fetch('http://192.168.1.9:8000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to create order from backend.');
      }
      const { orderId } = await response.json();
      console.log('✅ Order ID received:', orderId);
      
      // STEP 2: Prepare options for Razorpay Checkout
      const options = {
        description: 'Test Payment',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        name: 'EV Charger App Test',
        order_id: orderId,
        theme: { color: '#00A8FF' },
      };
      
      // STEP 3: Open the NATIVE payment screen
      RazorpayCheckout.open(options)
        .then((data) => {
          Alert.alert('Success!', `Payment ID: ${data.razorpay_payment_id}`);
        })
        .catch((error) => {
          Alert.alert('Payment Failed', error.description);
        });
    } catch (error) {
      console.error('Error during payment initiation:', error);
      Alert.alert('Error', 'Could not connect to the server to start payment.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={initiatePayment}>
        <Text style={styles.buttonText}>Pay ₹5.00 (Test)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#101010' 
  },
  button: { 
    backgroundColor: '#00A8FF', 
    padding: 20, 
    borderRadius: 10 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

export default PaymentTestScreen;
