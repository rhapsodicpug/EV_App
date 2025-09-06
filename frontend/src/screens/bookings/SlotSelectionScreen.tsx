import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, Colors } from '../../design';
import Button from '../../components/ui/Button';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Liquid colors matching HomeScreen
const LIQUID_COLORS = {
  primary: '#00A8FF', // Electric blue
  secondary: '#6366F1', // Indigo purple
  tertiary: '#06B6D4', // Cyan teal
  background: '#0F0F0F', // Very dark gray
  sheet: '#101010', // Dark gray for rising sheet
  surface: '#1A1A1A', // Surface color
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  isConflict?: boolean;
  slotNumber: number;
  timestamp: number; // Unix timestamp for sorting
  dayLabel?: string; // For day separators
}

interface SlotSelectionScreenProps {
  route: {
    params: {
      station: {
        id: string;
        name: string;
        address: string;
        chargerTypes: string[];
        basePrice: number;
        amenities: string[];
      };
    };
  };
  navigation: any;
}

const generateTimelineSlots = (basePrice: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  // Generate slots for 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    
    // Add day separator
    if (dayOffset === 0) {
      slots.push({
        id: `day_separator_${dayOffset}`,
        startTime: 'Today',
        endTime: '',
        duration: 0,
        price: 0,
        isAvailable: false,
        slotNumber: 0,
        timestamp: currentDate.getTime(),
        dayLabel: 'Today',
      });
    } else if (dayOffset === 1) {
      slots.push({
        id: `day_separator_${dayOffset}`,
        startTime: 'Tomorrow',
        endTime: '',
        duration: 0,
        price: 0,
        isAvailable: false,
        slotNumber: 0,
        timestamp: currentDate.getTime(),
        dayLabel: 'Tomorrow',
      });
    } else {
      slots.push({
        id: `day_separator_${dayOffset}`,
        startTime: currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        endTime: '',
        duration: 0,
        price: 0,
        isAvailable: false,
        slotNumber: 0,
        timestamp: currentDate.getTime(),
        dayLabel: currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      });
    }
    
    // Generate hourly slots for this day (6 AM to 10 PM)
    for (let hour = 6; hour < 22; hour++) {
      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);
      
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        id: `slot_${dayOffset}_${hour}`,
        startTime,
        endTime,
        duration: 60,
        price: basePrice + Math.floor(Math.random() * 20),
        isAvailable: Math.random() > 0.3,
        isConflict: Math.random() > 0.8,
        slotNumber: hour % 3 + 1,
        timestamp: slotDate.getTime(),
      });
    }
  }
  
  return slots;
};

export const SlotSelectionScreen: React.FC<SlotSelectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { station } = route.params || {};

  // Default station data if not provided
  const defaultStation = {
    id: 'default',
    name: 'Default Station',
    address: 'Default Address',
    chargerTypes: ['DC_FAST'],
    basePrice: 10,
    amenities: [],
  };

  const currentStation = station || defaultStation;

  // Fallback theme colors in case hook fails
  const fallbackColors = {
    primary: LIQUID_COLORS.primary,
    secondary: LIQUID_COLORS.secondary,
    surface: LIQUID_COLORS.surface,
    background: LIQUID_COLORS.background,
    border: 'rgba(255, 255, 255, 0.2)',
    text: {
      primary: LIQUID_COLORS.text.primary,
      secondary: LIQUID_COLORS.text.secondary,
      muted: LIQUID_COLORS.text.muted,
    },
  };

  // Try to get theme colors, fallback if not available
  let colors;
  try {
    const themeColors = useThemeColors();
    colors = themeColors?.colors || fallbackColors;
  } catch (error) {
    console.warn('Failed to get theme colors, using fallback:', error);
    colors = fallbackColors;
  }

  // Safety check for chargerTypes
  const chargerTypes = currentStation.chargerTypes || ['DC_FAST'];
  const basePrice = currentStation.basePrice || 10;

  // State management
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedChargerType, setSelectedChargerType] = useState(chargerTypes[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationCard, setShowConfirmationCard] = useState(false);

  // Animation values for Liquid Hero
  const liquidAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(1)).current;
  const sheetTranslateY = useRef(new Animated.Value(height * 0.4)).current;
  const confirmationCardTranslateY = useRef(new Animated.Value(height)).current;
  const confirmationCardOpacity = useRef(new Animated.Value(0)).current;

  // Parallax effect for liquid background
  const liquidTranslateY = scrollY.interpolate({
    inputRange: [-height * 0.6, 0, height * 0.6],
    outputRange: [height * 0.3, 0, -height * 0.2],
    extrapolate: 'clamp',
  });

  // Hero content fade effect
  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.2, height * 0.4],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  // Sheet slide up effect
  const sheetTop = scrollY.interpolate({
    inputRange: [0, height * 0.3],
    outputRange: [height * 0.4, height * 0.1],
    extrapolate: 'clamp',
  });

  // Generate time slots (6 AM to 10 PM, 30-minute intervals)
  const generateTimeSlots = (basePrice: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 6;
    const endHour = 22;

    let slotId = 0;
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 30;
        const endHourCalc = endMinute >= 60 ? hour + 1 : hour;
        const endMinuteCalc = endMinute % 60;
        const endTime = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`;

        slots.push({
          id: `slot_${slotId}`,
          startTime,
          endTime,
          duration: 30,
          price: basePrice + Math.floor(Math.random() * 15),
          isAvailable: Math.random() > 0.4,
          isConflict: Math.random() > 0.85,
          slotNumber: slotId % 3 + 1, // Rotate between 3 slots
        });
        slotId++;
      }
    }

    return slots;
  };

  // Load time slots when charger type changes
  useEffect(() => {
    loadTimeSlots();
  }, [selectedChargerType]);

  // Start liquid animation on mount
  useEffect(() => {
    // Start liquid blob animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(liquidAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load available time slots from API
  const loadTimeSlots = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const slots = generateTimelineSlots(basePrice);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setIsLoading(false);
    }
  };

  const availableSlots = timeSlots.filter(slot => slot.isAvailable);
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (slot: TimeSlot) => {
    return selectedSlot?.id === slot.id;
  };
  
  const handleSlotSelect = (slot: TimeSlot) => {
    // Skip day separators
    if (slot.dayLabel) return;
    
    if (!slot.isAvailable) {
      Alert.alert('Slot Unavailable', 'This time slot is not available.');
      return;
    }

    if (slot.isConflict) {
      Alert.alert('Conflict Detected', 'This slot conflicts with your existing bookings.');
      return;
    }

    setSelectedSlot(slot);
    setShowConfirmationCard(true);

    // Animate confirmation card slide up
    Animated.parallel([
      Animated.timing(confirmationCardTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmationCardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert('No Slot Selected', 'Please select a time slot to continue.');
      return;
    }
    
    const slotDate = new Date(selectedSlot.timestamp);
    
    navigation.navigate('BookingConfirmation', {
      booking: {
        id: `BK${Date.now()}`,
        stationName: currentStation.name,
        stationAddress: currentStation.address,
        date: slotDate.toLocaleDateString(),
        time: selectedSlot.startTime,
        duration: selectedSlot.duration / 60,
        slotNumber: selectedSlot.slotNumber,
        chargerType: selectedChargerType,
        amount: selectedSlot.price,
        totalAmount: selectedSlot.price,
      },
    });
  };

  const handleCloseConfirmationCard = () => {
    setShowConfirmationCard(false);
    setSelectedSlot(null);

    // Animate confirmation card slide down
    Animated.parallel([
      Animated.timing(confirmationCardTranslateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmationCardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const renderTimeline = () => (
    <View style={styles.timelineContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineScrollContent}
        decelerationRate="fast"
        snapToInterval={120} // Snap to each slot
        snapToAlignment="start"
      >
        {timeSlots.map((slot) => {
          if (slot.dayLabel) {
            // Render day separator
            return (
              <View key={slot.id} style={styles.daySeparator}>
                <View style={styles.daySeparatorLine} />
                <Text style={styles.daySeparatorText}>{slot.dayLabel}</Text>
                <View style={styles.daySeparatorLine} />
              </View>
            );
          }

          const isSlotSelected = isSelected(slot);
          const getSlotState = () => {
            if (slot.isConflict) return 'conflict';
            if (!slot.isAvailable) return 'unavailable';
            if (isSlotSelected) return 'selected';
            return 'available';
          };

          const slotState = getSlotState();
          const slotStyles = getSlotStyles(slotState, colors);

          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timelineSlot,
                slotStyles.button,
              ]}
              onPress={() => handleSlotSelect(slot)}
              disabled={!slot.isAvailable}
            >
              {slotState === 'selected' && (
                <LinearGradient
                  colors={[colors.primary, Colors.semantic.success]}
                  style={styles.timelineSlotGradient}
                />
              )}
              <Text style={[styles.timelineSlotTime, slotStyles.text]}>
                {slot.startTime}
              </Text>
              <Text style={[styles.timelineSlotPrice, slotStyles.subtext]}>
                ₹{slot.price}
              </Text>
              {slotState === 'conflict' && (
                <Ionicons
                  name="warning"
                  size={12}
                  color={Colors.neutral.white}
                  style={styles.conflictIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
  
  const renderChargerTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Charger Type
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chargerTypes.map((type) => {
          const isSelected = selectedChargerType === type;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.chargerTypeButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedChargerType(type)}
            >
              <Text
                style={[
                  styles.chargerTypeButtonText,
                  { color: isSelected ? Colors.neutral.white : colors.text.primary },
                ]}
              >
                {type.replace('_', ' ')}
              </Text>
              <Text
                style={[
                  styles.chargerTypeButtonSubtext,
                  { color: isSelected ? Colors.neutral.white : colors.text.secondary },
                ]}
              >
                {type.includes('FAST') ? 'Fast' : 'Standard'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
  
  const renderConfirmationCard = () => {
    if (!selectedSlot || !showConfirmationCard) return null;

    const slotDate = new Date(selectedSlot.timestamp);

    return (
      <Animated.View
        style={[
          styles.confirmationCard,
          {
            transform: [{ translateY: confirmationCardTranslateY }],
            opacity: confirmationCardOpacity,
          },
        ]}
      >
        <View style={styles.confirmationCardContent}>
          {/* Frosted glass background */}
          <View style={styles.confirmationCardBackground} />
          
          {/* Header */}
          <View style={styles.confirmationCardHeader}>
            <TouchableOpacity
              style={styles.confirmationCloseButton}
              onPress={handleCloseConfirmationCard}
            >
              <Ionicons name="close" size={24} color={LIQUID_COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.confirmationCardTitle}>Booking Summary</Text>
            <View style={styles.confirmationCloseButton} />
          </View>

          {/* Details */}
          <View style={styles.confirmationDetails}>
            <View style={styles.confirmationDetailRow}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <View style={styles.confirmationDetailText}>
                <Text style={styles.confirmationDetailLabel}>Station</Text>
                <Text style={styles.confirmationDetailValue}>{currentStation.name}</Text>
              </View>
            </View>

            <View style={styles.confirmationDetailRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <View style={styles.confirmationDetailText}>
                <Text style={styles.confirmationDetailLabel}>Date</Text>
                <Text style={styles.confirmationDetailValue}>
                  {slotDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.confirmationDetailRow}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <View style={styles.confirmationDetailText}>
                <Text style={styles.confirmationDetailLabel}>Time</Text>
                <Text style={styles.confirmationDetailValue}>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.confirmationDetailRow}>
              <Ionicons name="flash" size={20} color={colors.primary} />
              <View style={styles.confirmationDetailText}>
                <Text style={styles.confirmationDetailLabel}>Charger Type</Text>
                <Text style={styles.confirmationDetailValue}>{selectedChargerType.replace('_', ' ')}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.confirmationPriceSection}>
            <Text style={styles.confirmationPriceLabel}>Total Amount</Text>
            <Text style={styles.confirmationPriceValue}>₹{selectedSlot.price}</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmationButton}
            onPress={handleConfirmBooking}
          >
            <LinearGradient
              colors={[colors.primary, Colors.semantic.success]}
              style={styles.confirmationButtonGradient}
            >
              <Text style={styles.confirmationButtonText}>Confirm & Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const getSlotStyles = (state: string, colors: any) => {
    switch (state) {
      case 'selected':
        return {
          button: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          },
          text: { color: Colors.neutral.white, fontWeight: '700' },
          subtext: { color: Colors.neutral.white, opacity: 0.9 },
        };
      case 'available':
        return {
          button: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          },
          text: { color: colors.text.primary },
          subtext: { color: colors.text.secondary },
        };
      case 'conflict':
        return {
          button: {
            backgroundColor: Colors.semantic.error,
            borderColor: Colors.semantic.error,
            borderWidth: 1,
          },
          text: { color: Colors.neutral.white },
          subtext: { color: Colors.neutral.white, opacity: 0.8 },
        };
      case 'unavailable':
        return {
          button: {
            backgroundColor: Colors.neutral.gray,
            borderColor: Colors.neutral.gray,
            borderWidth: 1,
            opacity: 0.5,
          },
          text: { color: Colors.neutral.gray, textDecorationLine: 'line-through' },
          subtext: { color: Colors.neutral.gray, textDecorationLine: 'line-through' },
        };
      default:
        return {
          button: { backgroundColor: colors.surface },
          text: { color: colors.text.primary },
          subtext: { color: colors.text.secondary },
        };
    }
  };
  
  const renderConfirmationSummary = () => {
    if (!selectedSlot) return null;

    return (
      <Animated.View
        style={[
          styles.confirmationCard,
          {
            height: confirmationHeight,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '10']}
          style={styles.confirmationGradient}
        >
          <View style={styles.confirmationHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={[styles.confirmationTitle, { color: colors.text.primary }]}>
              Booking Summary
            </Text>
          </View>

          <View style={styles.confirmationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="business" size={16} color={colors.text.secondary} />
              <Text style={[styles.detailText, { color: colors.text.primary }]}>
                {currentStation.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color={colors.text.secondary} />
              <Text style={[styles.detailText, { color: colors.text.primary }]}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color={colors.text.secondary} />
              <Text style={[styles.detailText, { color: colors.text.primary }]}>
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.priceSummary}>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ₹{selectedSlot.price}
            </Text>
            <Text style={[styles.durationText, { color: colors.text.secondary }]}>
              for {selectedSlot.duration} minutes
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderPriceBreakdown = () => {
    if (!selectedSlot) return null;

    return (
      <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.priceTitle, { color: colors.text.primary }]}>
          Price Breakdown
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.text.secondary }]}>
            Base Rate ({selectedSlot.duration} mins)
          </Text>
          <Text style={[styles.priceValue, { color: colors.text.primary }]}>
            ₹{selectedSlot.price}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.text.secondary }]}>
            Service Fee
          </Text>
          <Text style={[styles.priceValue, { color: colors.text.primary }]}>
            ₹5
          </Text>
        </View>

        <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />

        <View style={styles.priceRow}>
          <Text style={[styles.totalLabel, { color: colors.text.primary }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ₹{selectedSlot.price + 5}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Liquid Hero Section */}
        <Animated.View style={[styles.heroContainer, { transform: [{ translateY: liquidTranslateY }] }]}>
          <Animated.View
            style={[
              styles.liquidBackground,
              {
                transform: [
                  {
                    scale: liquidAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                LIQUID_COLORS.primary,
                LIQUID_COLORS.secondary,
                LIQUID_COLORS.tertiary,
                LIQUID_COLORS.primary,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {/* Animated liquid blobs */}
              <Animated.View
                style={[
                  styles.liquidBlob,
                  styles.blob1,
                  {
                    transform: [
                      {
                        translateX: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 30],
                        }),
                      },
                      {
                        translateY: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.liquidBlob,
                  styles.blob2,
                  {
                    transform: [
                      {
                        translateX: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -25],
                        }),
                      },
                      {
                        translateY: liquidAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 15],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </LinearGradient>
          </Animated.View>

          {/* Floating Hero Content */}
          <Animated.View style={[styles.heroContent, { opacity: heroContentOpacity }]}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.heroBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={LIQUID_COLORS.text.primary} />
            </TouchableOpacity>

            {/* Station Name */}
            <Text style={styles.heroStationName}>{currentStation.name}</Text>
            <Text style={styles.heroStationAddress}>{currentStation.address}</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Main Content Area - Timeline */}
      <View style={styles.mainContentArea}>
        <View style={styles.timelineWrapper}>
          {/* Interactive Timeline */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Loading available slots...
              </Text>
            </View>
          ) : (
            renderTimeline()
          )}
        </View>
      </View>

      {/* Confirmation Card */}
      {renderConfirmationCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: LIQUID_COLORS.background,
    paddingBottom: 90, // Safe area padding for bottom navigation
  },

  // Header Section
  headerSection: {
    height: height * 0.4, // Fixed height for header
    position: 'relative',
    overflow: 'hidden',
  },

  // Liquid Hero Section
  heroContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  liquidBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  liquidBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blob1: {
    top: 50,
    right: 30,
  },
  blob2: {
    bottom: 80,
    left: 20,
  },

  // Floating Hero Content
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heroBackButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroStationName: {
    fontSize: 32,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroStationAddress: {
    fontSize: 16,
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Main Content Area
  mainContentArea: {
    flex: 1, // This will expand to fill available space
    backgroundColor: LIQUID_COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  // Timeline Wrapper
  timelineWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 16,
  },

  // Timeline Styles
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  timelineScrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  timelineSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 80,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineSlotTime: {
    fontSize: 16,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  timelineSlotPrice: {
    fontSize: 12,
    color: LIQUID_COLORS.text.secondary,
  },
  timelineSlotGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
  daySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 8,
  },
  daySeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  daySeparatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
    marginHorizontal: 16,
    textAlign: 'center',
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: LIQUID_COLORS.text.secondary,
    fontStyle: 'italic',
  },

  // Conflict Icon
  conflictIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  // Confirmation Footer
  confirmationFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LIQUID_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  confirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  confirmationDetails: {
    flex: 1,
  },
  confirmationStationName: {
    fontSize: 16,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
    marginBottom: 4,
  },
  confirmationTimeSlot: {
    fontSize: 12,
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 2,
  },
  confirmationPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.primary,
  },
  confirmButton: {
    backgroundColor: LIQUID_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: LIQUID_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },

  // Confirmation Card Styles
  confirmationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    zIndex: 1000,
  },
  confirmationCardContent: {
    flex: 1,
    backgroundColor: LIQUID_COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  confirmationCardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
  },
  confirmationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmationCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },
  confirmationDetails: {
    padding: 24,
    flex: 1,
  },
  confirmationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationDetailText: {
    marginLeft: 16,
    flex: 1,
  },
  confirmationDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 4,
  },
  confirmationDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },
  confirmationPriceSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  confirmationPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LIQUID_COLORS.text.secondary,
    marginBottom: 8,
  },
  confirmationPriceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: LIQUID_COLORS.primary,
  },
  confirmationButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmationButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: LIQUID_COLORS.text.primary,
  },
});
