/**
 * Unified Station Details & Booking Screen
 * All-in-one screen combining station details and booking functionality
 * Calendly-inspired UI with duration slider and real-time cost calculation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { useThemeColors } from '../../design';
import { EVStation } from '../../types/api';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Modern dark theme
const THEME = {
  primary: '#00A8FF', // Electric blue accent
  secondary: '#8B5CF6', // Purple accent
  success: '#10B981', // Green for available
  warning: '#F59E0B', // Orange for occupied
  error: '#EF4444', // Red for errors
  background: '#0A0A0A', // Deep black background
  surface: '#121212', // Dark gray surfaces
  card: '#1A1A1A', // Card background
  border: '#282828', // Subtle borders
  text: {
    primary: '#FFFFFF', // White for primary text
    secondary: '#A9A9A9', // Light gray for labels
    muted: '#666666', // Muted gray
  },
};

interface StationDetailsBookingScreenProps {
  route: {
    params: {
      station: EVStation;
    };
  };
}

interface TimeSlot {
  id: string;
  time: string;
  hour: number;
  minute: number;
  displayTime: string;
  isAvailable: boolean;
}

interface BookingSummary {
  startTime: string;
  endTime: string;
  duration: number;
  cost: number;
}

interface CollapsibleSection {
  id: string;
  title: string;
  icon: string;
  isExpanded: boolean;
}

const StationDetailsBookingScreen: React.FC<StationDetailsBookingScreenProps> = ({
  route,
}) => {
  const { colors } = useThemeColors();
  const navigation = useNavigation<NavigationProp<any>>();
  const { station } = route.params;

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(30); // minutes
  const [expandedTimeSlot, setExpandedTimeSlot] = useState<string | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStation, setCurrentStation] = useState<EVStation>(station);

  // Calculate available slots from current station data
  const availableSlots = currentStation?.charging_slots?.filter(slot => slot.status === 'AVAILABLE') || [];
  const totalSlots = currentStation?.charging_slots?.length || 0;
  const isStationFull = availableSlots.length === 0;
  const [collapsibleSections, setCollapsibleSections] = useState<CollapsibleSection[]>([
    { id: 'connectors', title: 'Connectors', icon: 'hardware-chip-outline', isExpanded: false },
    { id: 'amenities', title: 'Amenities', icon: 'storefront-outline', isExpanded: false },
    { id: 'reviews', title: 'Reviews', icon: 'star-outline', isExpanded: false },
  ]);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Fetch fresh station data on screen load
  useEffect(() => {
    const fetchStationData = async () => {
      try {
        console.log('🔄 Fetching fresh station data for:', station.id);
        const freshStation = await apiService.getStation(station.id);
        setCurrentStation(freshStation);
        console.log('✅ Fresh station data loaded:', {
          id: freshStation.id,
          name: freshStation.name,
          availableSlots: freshStation.charging_slots?.filter(slot => slot.status === 'AVAILABLE').length || 0,
          totalSlots: freshStation.charging_slots?.length || 0
        });
      } catch (error) {
        console.error('❌ Failed to fetch fresh station data:', error);
        // Keep using the original station data if fetch fails
      }
    };

    fetchStationData();
  }, [station.id]);

  // Shimmer animation
  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (isLoading) {
      startShimmer();
    }
  }, [isLoading, shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  // Utility function for handling missing data
  const formatData = (value: any, fallback: string = '--', suffix: string = '') => {
    if (value === null || value === undefined || value === '') {
      return `${fallback}${suffix}`;
    }
    return `${value}${suffix}`;
  };

  // Simulate loading completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  // Generate time slots for selected date
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip past times for today
        if (isToday && slotTime < now) continue;

        const displayTime = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        slots.push({
          id: `${hour}_${minute}`,
          time: slotTime.toISOString(),
          hour,
          minute,
          displayTime,
          isAvailable: Math.random() > 0.3, // Mock availability
        });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate booking summary
  useEffect(() => {
    if (selectedTimeSlot) {
      const startTime = new Date(selectedTimeSlot.time);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const cost = (duration / 60) * (currentStation.pricePerHour || 10); // Mock pricing

      setBookingSummary({
        startTime: startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        endTime: endTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        duration,
        cost: Math.round(cost * 100) / 100,
      });
    }
  }, [selectedTimeSlot, duration, station]);

  // Handle time slot selection
  const handleTimeSlotPress = (timeSlot: TimeSlot) => {
    if (!timeSlot.isAvailable) return;

    if (selectedTimeSlot?.id === timeSlot.id) {
      // Deselect if already selected
      setSelectedTimeSlot(null);
      setExpandedTimeSlot(null);
    } else {
      // Select new time slot
      setSelectedTimeSlot(timeSlot);
      setExpandedTimeSlot(timeSlot.id);
    }
  };

  // Handle booking confirmation
  const handleBookingConfirm = () => {
    if (!selectedTimeSlot || !bookingSummary) return;

    // Calculate end time from start time and duration
    const startTime = new Date(selectedTimeSlot.time);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Navigate to BookingConfirmation screen with all necessary booking details
    navigation.navigate('BookingConfirmation', {
      station: currentStation,
      startTime: {
        time: selectedTimeSlot.time,
        displayTime: bookingSummary.startTime,
      },
      endTime: endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      duration: duration,
      cost: bookingSummary.cost,
      selectedDate: selectedDate,
      totalPrice: bookingSummary.cost,
    });
  };

  // Toggle collapsible section
  const toggleSection = (sectionId: string) => {
    setCollapsibleSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  // Station Full Message Component
  const StationFullMessage = () => (
    <View style={styles.stationFullContainer}>
      <View style={styles.stationFullCard}>
        <AlertCircle size={48} color={THEME.error} />
        <Text style={styles.stationFullTitle}>Station is Full</Text>
        <Text style={styles.stationFullMessage}>
          No slots are currently available at this station. Please check back later or try a different location.
        </Text>
        <TouchableOpacity
          style={styles.stationFullButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.stationFullButtonText}>Find Another Station</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Duration slider component
  const DurationSlider = () => {
    const minDuration = 5;
    const maxDuration = 480; // 8 hours

    return (
      <View style={styles.durationContainer}>
        <Text style={styles.durationLabel}>Duration</Text>
        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={[styles.sliderButton, duration <= minDuration && styles.sliderButtonDisabled]}
            onPress={() => setDuration(Math.max(minDuration, duration - 15))}
            disabled={duration <= minDuration}
          >
            <Text style={styles.sliderButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.sliderValue}>
            <Text style={styles.sliderValueText}>{duration} min</Text>
          </View>

          <TouchableOpacity
            style={[styles.sliderButton, duration >= maxDuration && styles.sliderButtonDisabled]}
            onPress={() => setDuration(Math.min(maxDuration, duration + 15))}
            disabled={duration >= maxDuration}
          >
            <Text style={styles.sliderButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderContent}>
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      </View>

      {/* Hero Skeleton */}
      <Animated.View
        style={[
          styles.stationInfoCard,
          { marginHorizontal: 20, marginTop: 20 },
        ]}
      >
        <View style={styles.stationInfoContent}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonDetails}>
            <View style={styles.skeletonDetailRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonText} />
            </View>
            <View style={styles.skeletonDetailRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonText} />
            </View>
            <View style={styles.skeletonDetailRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonText} />
            </View>
          </View>
        </View>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </Animated.View>

      {/* Content Skeleton */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonDateSelector} />
        </View>

        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonTimeSlots}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.skeletonTimeSlot} />
            ))}
          </View>
        </View>

        {/* Collapsible Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Station Details</Text>
          {collapsibleSections.map((section) => (
            <View key={section.id}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.8}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Ionicons
                    name={section.icon as any}
                    size={20}
                    color={THEME.primary}
                  />
                  <Text style={styles.collapsibleHeaderText}>
                    {section.title}
                  </Text>
                </View>
                <Ionicons
                  name={section.isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={THEME.text.secondary}
                />
              </TouchableOpacity>

              {section.isExpanded && (
                <View style={styles.collapsibleContent}>
                  {section.id === 'connectors' && (
                    <View style={styles.connectorsList}>
                      {(currentStation.charging_slots || []).map((slot, index) => (
                        <View key={index} style={styles.connectorItem}>
                          <View style={styles.connectorInfo}>
                            <Text style={styles.connectorTitle}>
                              {formatData(slot.charger_type, 'Unknown Type')}
                            </Text>
                            <Text style={styles.connectorDetails}>
                              {formatData(slot.power_kw, '--', 'kW')} • {formatData(slot.connector_type, '--')}
                            </Text>
                          </View>
                          <View style={[
                            styles.connectorStatus,
                            { backgroundColor: slot.status === 'AVAILABLE' ? THEME.success : THEME.error }
                          ]}>
                            <Text style={styles.connectorStatusText}>
                              {formatData(slot.status, 'Unknown')}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {(currentStation.charging_slots || []).length === 0 && (
                        <Text style={styles.emptyText}>No connector information available</Text>
                      )}
                    </View>
                  )}

                  {section.id === 'amenities' && (
                    <View style={styles.amenitiesList}>
                      {(currentStation.amenities || []).map((amenity, index) => (
                        <View key={index} style={styles.amenityItem}>
                          <Ionicons name="checkmark-circle" size={16} color={THEME.success} />
                          <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                      ))}
                      {(currentStation.amenities || []).length === 0 && (
                        <Text style={styles.emptyText}>No amenities information available</Text>
                      )}
                    </View>
                  )}

                  {section.id === 'reviews' && (
                    <View style={styles.reviewsSection}>
                      <View style={styles.ratingOverview}>
                        <Text style={styles.ratingScore}>
                          {formatData(currentStation.rating, '--', '/5')}
                        </Text>
                        <View style={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name="star"
                              size={16}
                              color={(currentStation.rating || 0) >= star ? "#FFD700" : THEME.text.muted}
                            />
                          ))}
                        </View>
                        <Text style={styles.ratingCount}>
                          {formatData(null, '--', ' reviews')}
                        </Text>
                      </View>
                      <Text style={styles.emptyText}>Review system coming soon</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show station full message if no slots are available
  if (isStationFull) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={THEME.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.stationName}>{currentStation.name}</Text>
            <Text style={styles.stationAddress}>{currentStation.address}</Text>
          </View>
        </View>

        {/* Station Info Card */}
        <LinearGradient
          colors={[THEME.card, THEME.surface]}
          style={styles.stationInfoCard}
        >
          <View style={styles.stationInfoContent}>
            <View style={[styles.availabilityBadge, styles.availabilityBadgeFull]}>
              <Text style={styles.availabilityText}>
                {availableSlots.length} of {totalSlots} Available
              </Text>
            </View>

            <View style={styles.stationDetails}>
              <View style={styles.detailRow}>
                <MapPin size={16} color={THEME.primary} />
                <Text style={styles.detailText}>
                  {formatData(currentStation.distance, '--', 'km away')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Zap size={16} color={THEME.primary} />
                <Text style={styles.detailText}>
                  {formatData(currentStation.charging_slots?.map(slot => slot.charger_type).join(', '), '--', '')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.detailText}>
                  {formatData(currentStation.rating, '--', '/5')}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Station Full Message */}
        <StationFullMessage />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={THEME.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stationName}>{currentStation.name}</Text>
          <Text style={styles.stationAddress}>{currentStation.address}</Text>
        </View>
      </View>

      {/* Station Info Card */}
      <LinearGradient
        colors={[THEME.card, THEME.surface]}
        style={styles.stationInfoCard}
      >
        <View style={styles.stationInfoContent}>
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>
              {availableSlots.length} of {totalSlots} Available
            </Text>
          </View>

          <View style={styles.stationDetails}>
            <View style={styles.detailRow}>
              <MapPin size={16} color={THEME.primary} />
              <Text style={styles.detailText}>
                {formatData(currentStation.distance, '--', 'km away')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Zap size={16} color={THEME.primary} />
              <Text style={styles.detailText}>
                {formatData(currentStation.charging_slots?.map(slot => slot.charger_type).join(', '), '--', '')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.detailText}>
                {formatData(currentStation.rating, '--', '/5')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateSelector}>
            <TouchableOpacity style={styles.dateButton}>
              <Calendar size={20} color={THEME.primary} />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Start Time</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((timeSlot) => (
              <TouchableOpacity
                key={timeSlot.id}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot?.id === timeSlot.id && styles.timeSlotSelected,
                  !timeSlot.isAvailable && styles.timeSlotUnavailable,
                ]}
                onPress={() => handleTimeSlotPress(timeSlot)}
                disabled={!timeSlot.isAvailable}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot?.id === timeSlot.id && styles.timeSlotTextSelected,
                  !timeSlot.isAvailable && styles.timeSlotTextUnavailable,
                ]}>
                  {timeSlot.displayTime}
                </Text>

                {selectedTimeSlot?.id === timeSlot.id && (
                  <View style={styles.expandedContent}>
                    <DurationSlider />

                    {bookingSummary && (
                      <View style={styles.bookingSummary}>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Start:</Text>
                          <Text style={styles.summaryValue}>{bookingSummary.startTime}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>End:</Text>
                          <Text style={styles.summaryValue}>{bookingSummary.endTime}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Duration:</Text>
                          <Text style={styles.summaryValue}>{bookingSummary.duration} min</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.costRow]}>
                          <Text style={styles.summaryLabel}>Cost:</Text>
                          <Text style={styles.costValue}>₹{bookingSummary.cost}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Button */}
      {selectedTimeSlot && bookingSummary && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookingConfirm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[THEME.primary, THEME.secondary]}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bookButtonText}>
                Confirm & Book • ₹{bookingSummary.cost}
              </Text>
              <Check size={20} color={THEME.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingBottom: 40, // Additional buffer for navigation bar
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: THEME.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  stationName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text.primary,
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: THEME.text.secondary,
  },

  // Station Info Card
  stationInfoCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stationInfoContent: {
    padding: 20,
  },
  availabilityBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  stationDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: THEME.text.secondary,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200, // Extra space for bottom button + navigation bar
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 16,
  },

  // Date Selector
  dateSelector: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: THEME.text.primary,
    fontWeight: '500',
  },

  // Time Slots
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlot: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    borderColor: THEME.primary,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
  },
  timeSlotUnavailable: {
    backgroundColor: THEME.surface,
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 16,
    color: THEME.text.primary,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: THEME.primary,
    fontWeight: '600',
  },
  timeSlotTextUnavailable: {
    color: THEME.text.muted,
  },

  // Expanded Content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },

  // Duration Slider
  durationContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.surface,
    borderRadius: 8,
    padding: 8,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonDisabled: {
    backgroundColor: THEME.border,
  },
  sliderButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  sliderValue: {
    flex: 1,
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: THEME.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: THEME.text.primary,
    fontWeight: '500',
  },
  costRow: {
    marginBottom: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.success,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 140 : 120, // Generous space for navigation bar
    marginTop: 20, // Additional visual separation
    minHeight: 100, // Ensure enough height for button
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text.primary,
  },

  // Skeleton Styles
  skeletonBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#282828',
  },
  skeletonHeaderContent: {
    flex: 1,
    marginLeft: 16,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: '#282828',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 16,
    backgroundColor: '#282828',
    borderRadius: 4,
    width: '60%',
  },
  skeletonBadge: {
    height: 24,
    backgroundColor: '#282828',
    borderRadius: 12,
    width: 120,
    marginBottom: 16,
  },
  skeletonDetails: {
    gap: 12,
  },
  skeletonDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#282828',
    borderRadius: 4,
    flex: 1,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  skeletonSectionTitle: {
    height: 18,
    backgroundColor: '#282828',
    borderRadius: 4,
    width: 120,
    marginBottom: 16,
  },
  skeletonDateSelector: {
    height: 60,
    backgroundColor: '#282828',
    borderRadius: 12,
  },
  skeletonTimeSlots: {
    gap: 8,
  },
  skeletonTimeSlot: {
    height: 50,
    backgroundColor: '#282828',
    borderRadius: 12,
  },

  // Collapsible Sections
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: THEME.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapsibleHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  collapsibleContent: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  // Connectors Section
  connectorsList: {
    gap: 12,
  },
  connectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.card,
    borderRadius: 8,
  },
  connectorInfo: {
    flex: 1,
  },
  connectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 4,
  },
  connectorDetails: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  connectorStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectorStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.text.primary,
  },

  // Amenities Section
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    fontSize: 14,
    color: THEME.text.secondary,
  },

  // Reviews Section
  reviewsSection: {
    alignItems: 'center',
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingScore: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: THEME.text.secondary,
  },

  // Empty State
  emptyText: {
    fontSize: 14,
    color: THEME.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Station Full Styles
  stationFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stationFullCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    maxWidth: 400,
  },
  stationFullTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.error,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  stationFullMessage: {
    fontSize: 16,
    color: THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  stationFullButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  stationFullButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },

  // Availability Badge Full Style
  availabilityBadgeFull: {
    backgroundColor: THEME.error,
  },
});

export default StationDetailsBookingScreen;
