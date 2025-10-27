import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  BackHandler,
} from 'react-native';
import { Calendar, MapPin, Clock, Zap, ArrowLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiAnimation from '../../components/ui/ConfettiAnimation';

const { width, height } = Dimensions.get('window');

const CONFIRMED_COLORS = {
  primary: '#8cd279',
  secondary: '#8B5CF6',
  success: '#8cd279',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#3A3A3A',
  border: '#4A4A4A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#666666',
  },
  accent: '#8cd279',
  warning: '#F59E0B',
  error: '#EF4444',
};

interface BookingConfirmedScreenProps {
  navigation: any;
  route: {
    params: {
      booking: any;
      totalAmount: number;
    };
  };
}

const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({ navigation, route }) => {
  const { booking, totalAmount } = route.params;
  
  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  
  // Wave reaction effects
  const titleScale = useSharedValue(1);
  const titleRotation = useSharedValue(0);
  const subtitleOpacity = useSharedValue(1);
  const subtitleY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardY = useSharedValue(0);
  const button1Scale = useSharedValue(1);
  const button2Scale = useSharedValue(1);
  
  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    // Show content immediately
    contentOpacity.value = withTiming(1, { duration: 400 });
    contentTranslateY.value = withSpring(0, { damping: 8, stiffness: 100 });

    // Enhanced wave reaction effects - simulating ripple effects from confetti
    const triggerReactions = () => {
      // First wave at 50ms
      setTimeout(() => {
        titleScale.value = withSequence(
          withTiming(1.08, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
        titleRotation.value = withSequence(
          withTiming(-2, { duration: 150 }),
          withTiming(2, { duration: 150 }),
          withTiming(0, { duration: 200 })
        );
      }, 50);

      // Second wave at 150ms
      setTimeout(() => {
        subtitleOpacity.value = withSequence(
          withTiming(0.7, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        subtitleY.value = withSequence(
          withTiming(-2, { duration: 200 }),
          withTiming(0, { duration: 250 })
        );
      }, 150);

      // Third wave at 250ms
      setTimeout(() => {
        cardScale.value = withSequence(
          withTiming(1.04, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
        cardY.value = withSequence(
          withTiming(-3, { duration: 200 }),
          withTiming(3, { duration: 200 }),
          withTiming(0, { duration: 250 })
        );
      }, 250);

      // Fourth wave at 350ms
      setTimeout(() => {
        button1Scale.value = withSequence(
          withTiming(1.06, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
      }, 350);

      // Fifth wave at 450ms
      setTimeout(() => {
        button2Scale.value = withSequence(
          withTiming(1.06, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
      }, 450);

      // Final reverberation at 550ms
      setTimeout(() => {
        titleScale.value = withSequence(
          withTiming(1.02, { duration: 150 }),
          withTiming(1, { duration: 200 })
        );
      }, 550);
    };

    triggerReactions();
  }, []);

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  const handleViewBooking = () => {
    navigation.navigate('Bookings');
  };

  const handleBookAnother = () => {
    navigation.navigate('StationList');
  };

  // Animated styles
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
    opacity: contentOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: titleScale.value },
      { rotate: `${titleRotation.value}deg` },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateY: cardY.value },
    ],
  }));

  const button1Style = useAnimatedStyle(() => ({
    transform: [{ scale: button1Scale.value }],
  }));

  const button2Style = useAnimatedStyle(() => ({
    transform: [{ scale: button2Scale.value }],
  }));

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['rgba(26, 26, 26, 0.95)', 'rgba(26, 26, 26, 0.8)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color={CONFIRMED_COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderBookingDetails = () => (
    <Animated.View style={[styles.bookingDetailsCard, contentStyle, cardStyle]}>
      <Text style={styles.cardTitle}>Booking Details</Text>
      
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <MapPin size={20} color={CONFIRMED_COLORS.accent} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Station</Text>
          <Text style={styles.detailValue}>{booking.stationName}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Calendar size={20} color={CONFIRMED_COLORS.accent} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>{booking.date} at {booking.time}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Clock size={20} color={CONFIRMED_COLORS.accent} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{booking.duration} minutes</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Zap size={20} color={CONFIRMED_COLORS.accent} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={styles.detailValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderActionButtons = () => (
    <Animated.View style={[styles.actionButtonsContainer, contentStyle]}>
      <Animated.View style={[styles.buttonContainer, button1Style]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleViewBooking}>
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, button2Style]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
          <Text style={styles.secondaryButtonText}>Book Another Slot</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CONFIRMED_COLORS.background} />
      
      {/* Confetti Animation */}
      <ConfettiAnimation />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.successMessage, contentStyle]}>
          <Animated.Text style={[styles.successTitle, titleStyle]}>Booking Confirmed!</Animated.Text>
          <Animated.Text style={[styles.successSubtitle, subtitleStyle]}>
            Your charging slot has been successfully booked. You'll receive a confirmation email shortly.
          </Animated.Text>
        </Animated.View>

        {renderBookingDetails()}
        {renderActionButtons()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIRMED_COLORS.background,
  },

  // Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },

  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CONFIRMED_COLORS.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  headerRight: {
    width: 40,
    height: 40,
  },

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Success Message
  successMessage: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 40,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CONFIRMED_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  successSubtitle: {
    fontSize: 16,
    color: CONFIRMED_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Booking Details Card
  bookingDetailsCard: {
    backgroundColor: CONFIRMED_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: CONFIRMED_COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIRMED_COLORS.text.primary,
    marginBottom: 20,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CONFIRMED_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 14,
    color: CONFIRMED_COLORS.text.secondary,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIRMED_COLORS.text.primary,
  },

  // Action Buttons
  actionButtonsContainer: {
    gap: 16,
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  primaryButton: {
    backgroundColor: CONFIRMED_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CONFIRMED_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },

  secondaryButton: {
    backgroundColor: CONFIRMED_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CONFIRMED_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
});

export default BookingConfirmedScreen;
