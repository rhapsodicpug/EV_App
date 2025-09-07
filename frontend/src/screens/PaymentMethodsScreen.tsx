import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  CreditCard,
  ChevronLeft,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Clean Color Palette
const COLORS = {
  background: '#101010',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#00A8FF',
  accentLight: '#4DC3FF',
  success: '#10B981',
  error: '#FF6B6B',
};

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'HDFC Credit Card',
      details: '**** **** **** 1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'upi',
      name: 'Google Pay',
      details: 'user@okhdfcbank',
      isDefault: false,
    },
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose payment method type:',
      [
        { text: 'Credit/Debit Card', onPress: () => addCard() },
        { text: 'UPI', onPress: () => addUPI() },
        { text: 'Digital Wallet', onPress: () => addWallet() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addCard = () => {
    Alert.alert('Add Card', 'Card addition feature coming soon!', [
      { text: 'OK' }
    ]);
  };

  const addUPI = () => {
    Alert.alert('Add UPI', 'UPI addition feature coming soon!', [
      { text: 'OK' }
    ]);
  };

  const addWallet = () => {
    Alert.alert('Add Wallet', 'Digital wallet feature coming soon!', [
      { text: 'OK' }
    ]);
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove ${method.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(pm => pm.id !== method.id));
            Alert.alert('Success', 'Payment method removed successfully');
          }
        },
      ]
    );
  };

  const handleSetDefault = (method: PaymentMethod) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({
        ...pm,
        isDefault: pm.id === method.id
      }))
    );
    Alert.alert('Success', `${method.name} set as default payment method`);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard size={24} color={COLORS.accent} />;
      case 'upi':
        return <Text style={styles.upiIcon}>₹</Text>;
      case 'wallet':
        return <Text style={styles.walletIcon}>💳</Text>;
      default:
        return <CreditCard size={24} color={COLORS.accent} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>

          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.iconContainer}>
                  {getPaymentIcon(method.type)}
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDetailsText}>{method.details}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.paymentActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePaymentMethod(method)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add Payment Method */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.8}
        >
          <Plus size={24} color={COLORS.accent} />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Secure Payments</Text>
          <Text style={styles.infoText}>
            Your payment information is encrypted and securely stored. We never store your full card details.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Premium Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },

  // Payment Method Cards
  paymentMethodCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  upiIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  walletIcon: {
    fontSize: 20,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  paymentDetailsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  defaultBadge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Payment Actions
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setDefaultButton: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  deleteButton: {
    padding: 8,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.accent,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginLeft: 12,
  },

  // Info Section
  infoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceLight + '50',
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default PaymentMethodsScreen;
