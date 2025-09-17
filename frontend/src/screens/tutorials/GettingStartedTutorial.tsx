/**
 * Getting Started Tutorial Screen
 * Interactive tutorial to help new users understand the app
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
  Image,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  Calendar,
  User,
  Car,
  CreditCard,
  CheckCircle,
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

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const GettingStartedTutorial: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: '1',
      title: 'Welcome to EV Charging App',
      description: 'Your one-stop solution for finding and booking EV charging stations',
      icon: <Home size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Find nearby charging stations',
        'Book charging slots in advance',
        'Manage your vehicles and payments',
        'Track your charging history',
      ],
    },
    {
      id: '2',
      title: 'Find Charging Stations',
      description: 'Discover charging stations near you using our map and list views',
      icon: <MapPin size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Browse stations by location',
        'Filter by charger type and availability',
        'View real-time station status',
        'Get directions to your chosen station',
      ],
    },
    {
      id: '3',
      title: 'Book Your Charging Slot',
      description: 'Reserve your charging time slot in advance to avoid waiting',
      icon: <Calendar size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Select your preferred date and time',
        'Choose charging duration (5 min to 8 hours)',
        'Review pricing and confirm booking',
        'Receive booking confirmation',
      ],
    },
    {
      id: '4',
      title: 'Manage Your Profile',
      description: 'Set up your account with vehicle information and payment methods',
      icon: <User size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Add your vehicle details',
        'Set up payment methods',
        'Manage your booking history',
        'Update your preferences',
      ],
    },
    {
      id: '5',
      title: 'Add Your Vehicle',
      description: 'Configure your electric vehicle for better recommendations',
      icon: <Car size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Enter vehicle make, model, and year',
        'Specify battery capacity',
        'Set preferred charging types',
        'Get personalized recommendations',
      ],
    },
    {
      id: '6',
      title: 'Set Up Payments',
      description: 'Add payment methods for seamless booking experience',
      icon: <CreditCard size={48} color={TUTORIAL_COLORS.accent} />,
      details: [
        'Add credit/debit cards',
        'Set up UPI payments',
        'Enable digital wallets',
        'Manage payment preferences',
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
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={TUTORIAL_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={TUTORIAL_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Getting Started</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {tutorialSteps.map((_, index) => (
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
          {currentStep + 1} of {tutorialSteps.length}
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
            {currentStepData.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <CheckCircle size={20} color={TUTORIAL_COLORS.success} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
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
            {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
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
    paddingVertical: 40,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TUTORIAL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: TUTORIAL_COLORS.accent,
  },

  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TUTORIAL_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },

  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  detailsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  detailText: {
    fontSize: 16,
    fontWeight: '400',
    color: TUTORIAL_COLORS.text.primary,
    marginLeft: 12,
    flex: 1,
  },

  // Navigation Styles
  navigationContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Buffer space to prevent content from being hidden by navigation bar
  },

  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: TUTORIAL_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  nextButton: {
    backgroundColor: TUTORIAL_COLORS.accent,
  },

  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8,
  },
});

export default GettingStartedTutorial;
