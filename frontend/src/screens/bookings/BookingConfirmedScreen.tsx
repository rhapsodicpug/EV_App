import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { CheckCircle, Calendar, MapPin, Clock, Zap, ArrowLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
  const tickScale = useSharedValue(0);
  const tickOpacity = useSharedValue(0);
  const tickRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  
  // Celebration effects
  const pulseScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Epic celebration animation sequence
    const startCelebration = () => {
      // Main tick animation with multiple effects
      tickScale.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withSpring(1.3, { damping: 6, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      
      tickOpacity.value = withTiming(1, { duration: 200 });
      tickRotation.value = withSequence(
        withTiming(360, { duration: 800 }),
        withRepeat(withTiming(0, { duration: 1000 }), 2, true)
      );

      // Pulse effect
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        3,
        false
      );

      // Sparkle effects
      sparkleOpacity.value = withDelay(500, withTiming(1, { duration: 200 }));
      sparkleRotation.value = withDelay(500, withRepeat(withTiming(360, { duration: 2000 }), -1, false));

      // Bounce effect
      bounceY.value = withDelay(300, withRepeat(
        withSequence(
          withSpring(-10, { damping: 8, stiffness: 100 }),
          withSpring(0, { damping: 8, stiffness: 100 })
        ),
        2,
        false
      ));

      // Glow effect
      glowOpacity.value = withDelay(200, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 2000 }),
        withTiming(0, { duration: 500 })
      ));

      // Show content after celebration
      setTimeout(() => {
        contentOpacity.value = withTiming(1, { duration: 400 });
        contentTranslateY.value = withSpring(0, { damping: 8, stiffness: 100 });
      }, 1500);
    };

    startCelebration();
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
  const tickStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: tickScale.value },
      { rotate: `${tickRotation.value}deg` },
      { translateY: bounceY.value },
    ],
    opacity: tickOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.2], [0.3, 0.1], Extrapolate.CLAMP),
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
    opacity: sparkleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
    opacity: contentOpacity.value,
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
          <Text style={styles.headerTitle}>Booking Confirmed</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderTickAnimation = () => (
    <View style={styles.celebrationContainer}>
      {/* Glow background */}
      <Animated.View style={[styles.glowBackground, glowStyle]} />
      
      {/* Pulse rings */}
      <Animated.View style={[styles.pulseRing1, pulseStyle]} />
      <Animated.View style={[styles.pulseRing2, pulseStyle]} />
      <Animated.View style={[styles.pulseRing3, pulseStyle]} />
      
      {/* Sparkle effects */}
      <Animated.View style={[styles.sparkle1, sparkleStyle]} />
      <Animated.View style={[styles.sparkle2, sparkleStyle]} />
      <Animated.View style={[styles.sparkle3, sparkleStyle]} />
      <Animated.View style={[styles.sparkle4, sparkleStyle]} />
      
      {/* Main tick */}
      <Animated.View style={[styles.tickContainer, tickStyle]}>
        <CheckCircle size={120} color={CONFIRMED_COLORS.success} fill={CONFIRMED_COLORS.success} />
      </Animated.View>
    </View>
  );

  const renderBookingDetails = () => (
    <Animated.View style={[styles.bookingDetailsCard, contentStyle]}>
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleViewBooking}>
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
          <Text style={styles.secondaryButtonText}>Book Another Slot</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CONFIRMED_COLORS.background} />
      
      {renderHeader()}
      {renderTickAnimation()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.successMessage, contentStyle]}>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your charging slot has been successfully booked. You'll receive a confirmation email shortly.
          </Text>
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

  // Celebration Animation Styles
  celebrationContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  glowBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: CONFIRMED_COLORS.success,
    opacity: 0.2,
  },

  // Pulse rings
  pulseRing1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: CONFIRMED_COLORS.success,
  },
  pulseRing2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: CONFIRMED_COLORS.success,
  },
  pulseRing3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: CONFIRMED_COLORS.success,
  },

  // Sparkle effects
  sparkle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: CONFIRMED_COLORS.success,
    borderRadius: 4,
    top: 20,
    left: 20,
  },
  sparkle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: CONFIRMED_COLORS.accent,
    borderRadius: 3,
    top: 30,
    right: 25,
  },
  sparkle3: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: CONFIRMED_COLORS.secondary,
    borderRadius: 5,
    bottom: 40,
    left: 15,
  },
  sparkle4: {
    position: 'absolute',
    width: 7,
    height: 7,
    backgroundColor: CONFIRMED_COLORS.success,
    borderRadius: 3.5,
    bottom: 30,
    right: 20,
  },

  tickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CONFIRMED_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 200,
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
