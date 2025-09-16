import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import CustomModal from '../components/ui/CustomModal';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePaymentMethods } from '../contexts/PaymentMethodContext';

// Color Palette matching the design
const COLORS = {
  background: '#1A1A1A',
  surface: '#1A1A1A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    light: '#404040',
  },
  accent: '#8cd279', // Lime green theme
  error: '#FF6B6B',
  inputBackground: '#2A2A2A',
};

const PAYMENT_TYPES = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'wallet', name: 'Digital Wallet', icon: Smartphone },
];

const CARD_TYPES = [
  'Visa',
  'Mastercard',
  'American Express',
  'Discover',
  'RuPay',
];

const WALLET_TYPES = [
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Samsung Pay',
  'PhonePe',
  'Paytm',
  'Amazon Pay',
  'Mobikwik',
];

const AddPaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addPaymentMethod } = usePaymentMethods();
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    type: '',
    cardType: '',
    walletType: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for modals
  const [showCardTypeModal, setShowCardTypeModal] = useState(false);
  const [showWalletTypeModal, setShowWalletTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePaymentMethod = async () => {
    if (!formData.type) {
      setErrorMessage('Please select a payment method type');
      setShowErrorModal(true);
      return;
    }

    if (formData.type === 'card') {
      if (!formData.cardType || !formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
        setErrorMessage('Please fill in all card details');
        setShowErrorModal(true);
        return;
      }
    } else if (formData.type === 'wallet') {
      if (!formData.walletType) {
        setErrorMessage('Please select a wallet type');
        setShowErrorModal(true);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Create payment method data based on type
      let paymentMethodData;
      
      if (formData.type === 'card') {
        paymentMethodData = {
          type: 'card' as const,
          name: 'Card',
          details: `${formData.cardType} •••• ${formData.cardNumber.slice(-4)}`,
          icon: 'credit-card',
          isDefault: formData.isDefault,
        };
      } else {
        paymentMethodData = {
          type: 'wallet' as const,
          name: formData.walletType,
          details: formData.walletType,
          icon: 'smartphone',
          isDefault: formData.isDefault,
        };
      }

      await addPaymentMethod(paymentMethodData);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to add payment method. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentTypeSelection = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Payment Method Type</Text>
      <View style={styles.paymentTypeContainer}>
        {PAYMENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.paymentTypeOption,
              formData.type === type.id && styles.paymentTypeOptionSelected
            ]}
            onPress={() => handleInputChange('type', type.id)}
          >
            <type.icon 
              size={24} 
              color={formData.type === type.id ? '#000000' : COLORS.text.secondary} 
            />
            <Text style={[
              styles.paymentTypeText,
              formData.type === type.id && styles.paymentTypeTextSelected
            ]}>
              {type.name}
            </Text>
            {formData.type === type.id && (
              <Check size={20} color="#000000" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCardForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Card Type</Text>
        <View style={styles.selectContainer}>
          <Text style={styles.selectText}>
            {formData.cardType || 'Select card type'}
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCardTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={styles.textInput}
          value={formData.cardNumber}
          onChangeText={(value) => handleInputChange('cardNumber', value)}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={COLORS.text.tertiary}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={styles.textInput}
            value={formData.expiryDate}
            onChangeText={(value) => handleInputChange('expiryDate', value)}
            placeholder="MM/YY"
            placeholderTextColor={COLORS.text.tertiary}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.textInput}
            value={formData.cvv}
            onChangeText={(value) => handleInputChange('cvv', value)}
            placeholder="123"
            placeholderTextColor={COLORS.text.tertiary}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={styles.textInput}
          value={formData.cardholderName}
          onChangeText={(value) => handleInputChange('cardholderName', value)}
          placeholder="John Doe"
          placeholderTextColor={COLORS.text.tertiary}
          autoCapitalize="words"
        />
      </View>
    </>
  );

  const renderWalletForm = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Wallet Type</Text>
      <View style={styles.selectContainer}>
        <Text style={styles.selectText}>
          {formData.walletType || 'Select wallet type'}
        </Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowWalletTypeModal(true)}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content with Keyboard Handling */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            {renderPaymentTypeSelection()}
            
            {formData.type === 'card' && renderCardForm()}
            {formData.type === 'wallet' && renderWalletForm()}

            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleInputChange('isDefault', !formData.isDefault)}
              >
                <View style={[
                  styles.checkbox,
                  formData.isDefault && styles.checkboxSelected
                ]}>
                  {formData.isDefault && (
                    <Check size={16} color="#000000" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSavePaymentMethod}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Payment Method'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Modals */}
      <CustomModal
        visible={showCardTypeModal}
        title="Select Card Type"
        message="Choose a card type"
        options={CARD_TYPES.map(type => ({
          text: type,
          onPress: () => handleInputChange('cardType', type),
        })).concat([{ text: 'Cancel', onPress: () => {}, style: 'cancel' }])}
        onClose={() => setShowCardTypeModal(false)}
      />

      <CustomModal
        visible={showWalletTypeModal}
        title="Select Wallet Type"
        message="Choose a wallet type"
        options={WALLET_TYPES.map(type => ({
          text: type,
          onPress: () => handleInputChange('walletType', type),
        })).concat([{ text: 'Cancel', onPress: () => {}, style: 'cancel' }])}
        onClose={() => setShowWalletTypeModal(false)}
      />

      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Payment method added successfully!"
        options={[{
          text: 'OK',
          onPress: () => navigation.goBack(),
        }]}
        onClose={() => setShowSuccessModal(false)}
      />

      <CustomModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100, // Extra padding for button and keyboard
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  paymentTypeContainer: {
    gap: 12,
  },
  paymentTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  paymentTypeOptionSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  paymentTypeText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
  paymentTypeTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  selectButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
});

export default AddPaymentMethodScreen;
