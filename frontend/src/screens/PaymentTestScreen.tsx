import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '../contexts/AuthContext';

// Liquid colors inspired by HomeScreen
const LIQUID_COLORS = {
  primary: '#00A8FF', // Electric blue
  secondary: '#6366F1', // Indigo purple
  tertiary: '#06B6D4', // Cyan teal
  success: '#10B981', // Emerald green
  background: '#0F0F0F', // Very dark gray
  surface: '#1A1A1A', // Surface color
  card: '#252525', // Card background
  border: '#333333', // Border color
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

const PaymentTestScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const testPayment = async () => {
    setIsProcessing(true);

    try {
      console.log('🧪 Testing payment flow...');

      // Test amount
      const testAmount = 5;

      // 1. Get the order_id from backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.9:8000'}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: testAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      const { order_id, key_id } = await response.json();
      console.log('✅ Order created successfully:', order_id);
      console.log('🔑 Key ID received:', key_id);
      console.log('💰 Amount being charged:', testAmount);

      // 2. Create proper Razorpay checkout URL
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?key_id=${key_id}&order_id=${order_id}&amount=${testAmount * 100}&currency=INR&name=EV%20Charging%20App&description=Payment%20Test&prefill[email]=${encodeURIComponent(user?.email || 'user@example.com')}&prefill[contact]=${user?.phone || '9999999999'}&prefill[name]=${encodeURIComponent(user?.name || 'User')}&theme[color]=${encodeURIComponent(LIQUID_COLORS.primary)}`;
      
      console.log('🌐 Opening Razorpay checkout URL:', checkoutUrl);
      
      // 3. Open the proper Razorpay checkout page
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: LIQUID_COLORS.primary,
        showTitle: true,
        enableBarCollapsing: false,
      });
      
      console.log('🌐 WebBrowser result:', result);
      
      // Simulate successful payment for testing
      Alert.alert(
        'Payment Test Complete',
        `Order ID: ${order_id}\nAmount: ₹${testAmount}\nStatus: Simulated Success`,
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
      <StatusBar barStyle="light-content" backgroundColor={LIQUID_COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Test</Text>
        <Text style={styles.headerSubtitle}>Test Razorpay integration</Text>
      </View>

      {/* Test Content */}
      <View style={styles.content}>
        <View style={styles.testCard}>
          <Ionicons name="card-outline" size={48} color={LIQUID_COLORS.primary} />
          <Text style={styles.testTitle}>Payment Integration Test</Text>
          <Text style={styles.testDescription}>
            This will test the complete payment flow:
            {'\n'}• Create order on backend
            {'\n'}• Open Razorpay checkout
            {'\n'}• Simulate payment success
          </Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testPayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={[LIQUID_COLORS.primary, LIQUID_COLORS.tertiary]}
            style={styles.testButtonGradient}
          >
            <Text style={styles.testButtonText}>
              {isProcessing ? 'Testing...' : 'Test Payment (₹5)'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Debug Info */}
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>User: {user?.email || 'Not logged in'}</Text>
          <Text style={styles.debugText}>Token: {token ? 'Present' : 'Missing'}</Text>
          <Text style={styles.debugText}>API URL: {process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.9:8000'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.background,
  },
  
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: LIQUID_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: LIQUID_COLORS.border,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: LIQUID_COLORS.text.secondary,
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  testCard: {
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
  },
  
  testTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  testDescription: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  
  testButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  testButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
  },
  
  debugCard: {
    backgroundColor: LIQUID_COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: LIQUID_COLORS.border,
  },
  
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 12,
  },
  
  debugText: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 4,
  },
});

export default PaymentTestScreen;
