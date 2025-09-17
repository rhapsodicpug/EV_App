import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useBookings } from '../contexts/BookingContext';

const PAYMENT_COLORS = {
  background: '#000000',
  surface: '#1A1A1A',
  primary: '#8cd279',
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    placeholder: '#666666',
  },
  border: '#333333',
  success: '#8cd279',
};

interface PaymentScreenProps {
  navigation: any;
  route: {
    params: {
      booking: any;
      totalAmount: number;
    };
  };
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { booking, totalAmount } = route.params;
  const { addBooking } = useBookings();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePay = async () => {
    // TODO: Implement payment processing
    console.log('Processing payment...', {
      paymentMethod: selectedPaymentMethod,
      cardNumber,
      expiryDate,
      cvc,
      nameOnCard,
      billingAddress,
      totalAmount,
    });
    
    try {
      // Add booking to context (mock payment success)
      await addBooking({
        stationId: booking.stationId,
        stationName: booking.stationName,
        stationAddress: booking.stationAddress,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        price: totalAmount,
      });
      
      // Navigate to booking confirmed screen
      navigation.navigate('BookingConfirmed', {
        booking,
        totalAmount,
      });
    } catch (error) {
      console.error('Failed to add booking:', error);
      // Still navigate to confirmation even if context fails
      navigation.navigate('BookingConfirmed', {
        booking,
        totalAmount,
      });
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PAYMENT_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={PAYMENT_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          
          <TouchableOpacity
            style={styles.paymentMethodOption}
            onPress={() => handlePaymentMethodSelect('card')}
          >
            <Text style={styles.paymentMethodText}>Credit or debit card</Text>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'card' && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethodOption}
            onPress={() => handlePaymentMethodSelect('wallet')}
          >
            <Text style={styles.paymentMethodText}>Digital wallet</Text>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'wallet' && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethodOption}
            onPress={() => handlePaymentMethodSelect('stored')}
          >
            <Text style={styles.paymentMethodText}>Stored payment method</Text>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'stored' && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        {selectedPaymentMethod === 'card' && (
          <View style={styles.section}>
            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor={PAYMENT_COLORS.text.placeholder}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                placeholderTextColor={PAYMENT_COLORS.text.placeholder}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="numeric"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVC"
                placeholderTextColor={PAYMENT_COLORS.text.placeholder}
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name on card"
              placeholderTextColor={PAYMENT_COLORS.text.placeholder}
              value={nameOnCard}
              onChangeText={setNameOnCard}
            />

            <TextInput
              style={styles.input}
              placeholder="Billing address"
              placeholderTextColor={PAYMENT_COLORS.text.placeholder}
              value={billingAddress}
              onChangeText={setBillingAddress}
            />
          </View>
        )}

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>

        {/* Pay Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePay}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAYMENT_COLORS.background,
    paddingBottom: 100, // Buffer space to prevent content from being hidden by navigation bar
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: PAYMENT_COLORS.background,
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PAYMENT_COLORS.text.primary,
  },

  headerRight: {
    width: 40,
  },

  // Content Styles
  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PAYMENT_COLORS.text.primary,
    marginBottom: 16,
  },

  // Payment Method Styles
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PAYMENT_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.border,
  },

  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: PAYMENT_COLORS.text.primary,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PAYMENT_COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PAYMENT_COLORS.text.primary,
  },

  // Input Styles
  input: {
    backgroundColor: PAYMENT_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: PAYMENT_COLORS.text.primary,
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.border,
    marginBottom: 16,
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },

  halfInput: {
    flex: 1,
    marginBottom: 16,
  },

  // Amount Section
  amountSection: {
    backgroundColor: PAYMENT_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.border,
  },

  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: PAYMENT_COLORS.text.secondary,
    marginBottom: 8,
  },

  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: PAYMENT_COLORS.text.primary,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  payButton: {
    backgroundColor: PAYMENT_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});

export default PaymentScreen;
