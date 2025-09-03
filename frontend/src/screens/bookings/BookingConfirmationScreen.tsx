import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';
import Button from '../../components/ui/Button';

import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BookingStackParamList } from '../../types/api';

type BookingConfirmationRouteProp = RouteProp<BookingStackParamList, 'BookingConfirmation'>;
type BookingConfirmationNavigationProp = StackNavigationProp<BookingStackParamList, 'BookingConfirmation'>;

interface BookingConfirmationScreenProps {
  route: BookingConfirmationRouteProp;
  navigation: BookingConfirmationNavigationProp;
}

const { width } = Dimensions.get('window');

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'card-outline',
    color: Colors.semantic.info,
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: 'phone-portrait-outline',
    color: Colors.semantic.success,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: 'wallet-outline',
    color: Colors.semantic.warning,
  },
];

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors } = useThemeColors();
  const { station, selectedSlot, selectedDate, totalPrice } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Create a booking object from the route params
  const booking = {
    id: Date.now().toString(),
    stationName: station.name,
    stationAddress: station.address,
    date: selectedDate.toDateString(),
    time: selectedSlot.time,
    duration: selectedSlot.duration,
    slotNumber: selectedSlot.slotNumber,
    chargerType: selectedSlot.chargerType,
    amount: selectedSlot.price,
    totalAmount: totalPrice,
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 2000);
  };

  const handleBackToHome = () => {
    navigation.navigate('BookingsMain');
  };

  const handleViewBooking = () => {
    // Navigate back to bookings main since BookingDetail is not in this stack
    navigation.navigate('BookingsMain');
  };

  if (isConfirmed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={[styles.successIcon, { backgroundColor: Colors.semantic.success }]}>
              <Ionicons name="checkmark" size={48} color={Colors.neutral.white} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text.primary }]}>
              Booking Confirmed!
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.text.secondary }]}>
              Your charging session has been successfully booked
            </Text>
          </View>

          {/* QR Code Section */}
          <View style={[styles.qrSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.qrTitle, { color: colors.text.primary }]}>QR Code</Text>
            <Text style={[styles.qrSubtitle, { color: colors.text.secondary }]}>
              Show this at the charging station
            </Text>
            <View style={[styles.qrCode, { backgroundColor: colors.border }]}>
              <Text style={[styles.qrText, { color: colors.text.secondary }]}>
                QR Code Placeholder
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={[styles.bookingDetails, { backgroundColor: colors.surface }]}>
            <Text style={[styles.bookingIdLabel, { color: colors.text.secondary }]}>
              Booking ID: {booking.id}
            </Text>
            <Text style={[styles.stationName, { color: colors.text.primary }]}>
              {booking.stationName}
            </Text>
            <Text style={[styles.stationAddress, { color: colors.text.secondary }]}>
              {booking.stationAddress}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="View Booking Details"
              onPress={handleViewBooking}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
            <Button
              title="Back to Home"
              onPress={handleBackToHome}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Confirm Booking
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Review your booking details
          </Text>
        </View>

        {/* Booking Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
            Booking Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
              Station
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
              {booking.stationName}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
              Date & Time
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
              {booking.date} at {booking.time}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
              Duration
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
              {booking.duration} hours
            </Text>
          </View>
          
          <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.primary }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ₹{booking.totalAmount}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.paymentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.paymentTitle, { color: colors.text.primary }]}>
            Payment Method
          </Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                {
                  backgroundColor: paymentMethod === method.id ? colors.primary : colors.surface,
                  borderColor: paymentMethod === method.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={paymentMethod === method.id ? Colors.neutral.white : method.color}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    {
                      color: paymentMethod === method.id ? Colors.neutral.white : colors.text.primary,
                    },
                  ]}
                >
                  {method.name}
                </Text>
              </View>
              {paymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.neutral.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <Button
          title={isProcessing ? 'Processing...' : 'Confirm Booking'}
          onPress={handlePayment}
          variant="primary"
          size="large"
          disabled={isProcessing}
          style={styles.confirmButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Elevation.level1,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  priceDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Elevation.level1,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    marginBottom: Spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  qrSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Elevation.level1,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  qrSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  qrCode: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bookingDetails: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Elevation.level1,
  },
  bookingIdLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  stationAddress: {
    fontSize: 14,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
