import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePaymentMethods } from '../contexts/PaymentMethodContext';
import { BlurView } from 'expo-blur';
import CustomModal from '../components/ui/CustomModal';

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
};

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  name: string;
  details: string;
  icon: string;
  isDefault: boolean;
}

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { paymentMethods, isLoading, error, deletePaymentMethod } = usePaymentMethods();
  
  // State for modals
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
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

  const handleAddPaymentMethod = () => {
    // @ts-ignore
    navigation.navigate('AddPaymentMethod');
  };

  const handlePaymentMethodPress = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentMethodModal(true);
  };

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowDeleteModal(true);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!selectedPaymentMethod) return;
    try {
      await deletePaymentMethod(selectedPaymentMethod.id);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to delete payment method. Please try again.');
      setShowErrorModal(true);
    }
  };

  const renderPaymentMethodItem = (paymentMethod: PaymentMethod) => (
    <View key={paymentMethod.id} style={styles.paymentMethodItem}>
      <TouchableOpacity
        style={styles.paymentMethodContent}
        onPress={() => handlePaymentMethodPress(paymentMethod)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentMethodIcon}>
          <CreditCard size={24} color={COLORS.text.primary} />
        </View>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodName}>{paymentMethod.name}</Text>
          <Text style={styles.paymentMethodDetails}>{paymentMethod.details}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePaymentMethod(paymentMethod)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CreditCard size={60} color={COLORS.text.tertiary} />
      <Text style={styles.emptyStateText}>No payment methods added yet</Text>
      <Text style={styles.emptyStateSubtext}>Add your first payment method to get started</Text>
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {paymentMethods.length > 0 ? (
          <View style={styles.content}>
            {/* Credit and Debit Cards Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Credit and Debit Cards</Text>
              <View style={styles.paymentMethodsList}>
                {paymentMethods
                  .filter(method => method.type === 'card')
                  .map(renderPaymentMethodItem)}
              </View>
            </View>

            {/* Digital Wallets Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Digital Wallets</Text>
              <View style={styles.paymentMethodsList}>
                {paymentMethods
                  .filter(method => method.type === 'wallet')
                  .map(renderPaymentMethodItem)}
              </View>
            </View>
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Add Payment Method Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
          >
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Modals */}
      <CustomModal
        visible={showPaymentMethodModal}
        title="Payment Method"
        message={selectedPaymentMethod ? selectedPaymentMethod.details : ''}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowPaymentMethodModal(false)}
      />

      <CustomModal
        visible={showDeleteModal}
        title="Delete Payment Method"
        message={selectedPaymentMethod ? `Are you sure you want to delete ${selectedPaymentMethod.name}? This action cannot be undone.` : ''}
        options={[
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: confirmDeletePaymentMethod,
            style: 'destructive',
          },
        ]}
        onClose={() => setShowDeleteModal(false)}
      />

      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Payment method deleted successfully!"
        options={[{
          text: 'OK',
          onPress: () => {},
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
    paddingBottom: 100, // Buffer space to prevent button from being hidden by navigation bar
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    marginBottom: 12,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
});

export default PaymentMethodsScreen;