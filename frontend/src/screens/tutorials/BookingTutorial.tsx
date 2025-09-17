/**
 * Booking Tutorial Screen
 * Step-by-step guide for booking charging slots
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  Search,
  Filter,
  Navigation,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const TUTORIAL_COLORS = {
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
  success: '#10B981',
  icon: '#FFFFFF',
};

interface BookingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  tips?: string[];
}

const BookingTutorial: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [currentStep, setCurrentStep] = useState(0);

  // Booking tutorial steps
  const bookingSteps: BookingStep[] = [
    {
      id: '1',
      title: 'Find a Charging Station',
      description: 'Discover available charging stations near your location',
      icon: <Search size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Open the Stations tab from the bottom navigation',
        'Browse stations on the map or list view',
        'Use the search bar to find specific locations',
        'Check real-time availability status',
      ],
      tips: [
        'Green dots indicate available stations',
        'Orange dots show limited availability',
        'Red dots mean fully occupied',
      ],
    },
    {
      id: '2',
      title: 'Filter Your Search',
      description: 'Narrow down stations based on your preferences',
      icon: <Filter size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Filter by charger type (AC/DC)',
        'Set maximum distance from your location',
        'Filter by availability status',
        'Choose stations with specific amenities',
      ],
      tips: [
        'DC fast chargers are ideal for quick top-ups',
        'AC chargers are better for longer sessions',
        'Check if the station has parking facilities',
      ],
    },
    {
      id: '3',
      title: 'Select Your Station',
      description: 'Choose the perfect charging station for your needs',
      icon: <MapPin size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Tap on a station to view details',
        'Check pricing and charging rates',
        'Review station amenities and reviews',
        'Get directions to the station',
      ],
      tips: [
        'Read user reviews for better insights',
        'Check if the station is 24/7 available',
        'Verify parking availability',
      ],
    },
    {
      id: '4',
      title: 'Choose Date & Time',
      description: 'Select when you want to charge your vehicle',
      icon: <Calendar size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Pick your preferred date (up to 30 days ahead)',
        'Select your start time from available slots',
        'Choose charging duration (5 min to 8 hours)',
        'Review the total cost before booking',
      ],
      tips: [
        'Book in advance for popular time slots',
        'Consider off-peak hours for better rates',
        'Factor in travel time to the station',
      ],
    },
    {
      id: '5',
      title: 'Review & Confirm',
      description: 'Double-check your booking details before payment',
      icon: <CheckCircle size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Verify station location and details',
        'Confirm date, time, and duration',
        'Review pricing breakdown',
        'Check cancellation policy',
      ],
      tips: [
        'Free cancellation up to 2 hours before',
        'Late arrivals may result in slot cancellation',
        'Keep your booking confirmation handy',
      ],
    },
    {
      id: '6',
      title: 'Complete Payment',
      description: 'Secure payment to confirm your booking',
      icon: <CreditCard size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Choose your preferred payment method',
        'Enter payment details securely',
        'Review final booking summary',
        'Receive instant confirmation',
      ],
      tips: [
        'Save payment methods for faster future bookings',
        'Check for any promotional discounts',
        'Keep payment receipts for records',
      ],
    },
    {
      id: '7',
      title: 'Navigate to Station',
      description: 'Get directions and arrive at your booked station',
      icon: <Navigation size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Use the built-in navigation feature',
        'Check real-time traffic conditions',
        'Arrive 5-10 minutes before your slot',
        'Scan the QR code at the station',
      ],
      tips: [
        'Enable location services for accurate directions',
        'Have your booking confirmation ready',
        'Contact support if you can\'t find the station',
      ],
    },
  ];

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, currentStep]);

  const handleBackPress = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    if (currentStep < bookingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const currentStepData = bookingSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={TUTORIAL_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={TUTORIAL_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Tutorial</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {bookingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {bookingSteps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Content */}
        <View style={styles.stepContainer}>
          <View style={styles.iconContainer}>
            {currentStepData.icon}
          </View>
          
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>

          {/* Step Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Steps:</Text>
            {currentStepData.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>

          {/* Tips Section */}
          {currentStepData.tips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
              {currentStepData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipText}>• {tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === bookingSteps.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <ArrowRight size={20} color={TUTORIAL_COLORS.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TUTORIAL_COLORS.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: TUTORIAL_COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TUTORIAL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TUTORIAL_COLORS.text.primary,
  },

  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: TUTORIAL_COLORS.text.secondary,
  },

  // Progress Styles
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TUTORIAL_COLORS.border,
    marginHorizontal: 4,
  },

  progressDotActive: {
    backgroundColor: TUTORIAL_COLORS.accent,
  },

  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: TUTORIAL_COLORS.text.secondary,
    textAlign: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TUTORIAL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: TUTORIAL_COLORS.accent,
  },

  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TUTORIAL_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TUTORIAL_COLORS.text.primary,
    marginBottom: 16,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TUTORIAL_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: TUTORIAL_COLORS.background,
  },

  detailText: {
    fontSize: 15,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },

  // Tips Styles
  tipsContainer: {
    width: '100%',
    backgroundColor: TUTORIAL_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: TUTORIAL_COLORS.accent,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TUTORIAL_COLORS.text.primary,
    marginBottom: 12,
  },

  tipItem: {
    marginBottom: 8,
  },

  tipText: {
    fontSize: 14,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    lineHeight: 20,
  },

  // Navigation Styles
  navigationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  nextButton: {
    backgroundColor: TUTORIAL_COLORS.accent,
  },

  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: TUTORIAL_COLORS.background,
    marginRight: 8,
  },
});

export default BookingTutorial;
