/**
 * Station Booking Screen - Simple Time Selection
 * Clean, standard booking interface with native time pickers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Modern dark theme
const THEME = {
  primary: '#00A8FF', // Electric blue accent
  background: '#121212', // Deep near-black background
  surface: '#1E1E1E', // Dark gray surfaces
  card: '#252525', // Slightly lighter card background
  border: '#333333', // Subtle borders
  text: {
    primary: '#FFFFFF', // White for primary text
    secondary: '#A9A9A9', // Light gray for labels
    muted: '#666666', // Muted gray
  },
};

interface StartTimeOption {
  id: string;
  time: string;
  hour: number;
  minute: number;
  displayTime: string;
  isAvailable: boolean;
}

interface StationBookingScreenProps {
  route: {
    params: {
      station: {
        id: string;
        name: string;
        address: string;
        chargerTypes: string[];
        basePrice: number;
        amenities: string[];
        location?: {
          coordinates: [number, number];
        };
        charging_slots?: any[];
        rating?: number;
        total_reviews?: number;
      };
    };
  };
  navigation: any;
}

const generateStartTimeOptions = (): StartTimeOption[] => {
  const options: StartTimeOption[] = [];

  // Generate start times from 6 AM to 10 PM in 5-minute intervals
  for (let hour = 6; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTimeForDisplay(hour, minute);

      options.push({
        id: `start_${hour}_${minute}`,
        time: timeString,
        hour,
        minute,
        displayTime,
        isAvailable: Math.random() > 0.2, // 80% availability
      });
    }
  }

  return options;
};

const formatTimeForDisplay = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute.toString().padStart(2, '0');
  return `${displayHour}:${minuteStr} ${period}`;
};

const calculateEndTime = (startTime: StartTimeOption, durationMinutes: number): string => {
  const startDate = new Date();
  startDate.setHours(startTime.hour, startTime.minute, 0, 0);
  startDate.setMinutes(startDate.getMinutes() + durationMinutes);

  const endHour = startDate.getHours();
  const endMinute = startDate.getMinutes();
  return formatTimeForDisplay(endHour, endMinute);
};

const calculateCost = (durationMinutes: number): number => {
  const basePrice = 10; // Default base price
  const hours = durationMinutes / 60;
  return Math.round(basePrice * hours * 100) / 100;
};

export const StationBookingScreen: React.FC<StationBookingScreenProps> = ({
  route,
  navigation,
}) => {
  const { station } = route.params || {};

  // State management for simple booking
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Theme colors
  const colors = {
    primary: THEME.primary,
    surface: THEME.surface,
    background: THEME.background,
    border: THEME.border,
    text: {
      primary: THEME.text.primary,
      secondary: THEME.text.secondary,
      muted: THEME.text.muted,
    },
  };

  // Generate available dates
  useEffect(() => {
    const generateDates = () => {
      const dates: Date[] = [];
      const today = new Date();

      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }

      setAvailableDates(dates);
    };

    generateDates();
  }, []);

  // Simple handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStartTime(null);
    setEndTime(null);
  };

  const handleStartTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
      // Reset end time if it's before the new start time
      if (endTime && selectedTime >= endTime) {
        setEndTime(null);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedTime) {
      // Validate that end time is after start time
      if (startTime && selectedTime <= startTime) {
        // If end time is not after start time, set it to 30 minutes after start time
        const validEndTime = new Date(startTime);
        validEndTime.setMinutes(validEndTime.getMinutes() + 30);
        setEndTime(validEndTime);
      } else {
        setEndTime(selectedTime);
      }
    }
  };

  const getDefaultEndTime = () => {
    if (startTime) {
      const defaultEnd = new Date(startTime);
      defaultEnd.setMinutes(defaultEnd.getMinutes() + 30); // Default to 30 minutes later
      return defaultEnd;
    }
    return new Date();
  };

  const calculateDuration = () => {
    if (startTime && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      return durationMinutes;
    }
    return 0;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleConfirmBooking = () => {
    if (startTime && endTime) {
      const duration = calculateDuration();

      navigation.navigate('Bookings', {
        screen: 'BookingConfirmation',
        params: {
          station: station,
          startTime: formatTime(startTime),
          duration: duration,
          endTime: formatTime(endTime),
          cost: calculateCost(duration),
        }
      });
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {station?.name || 'Station Name'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
    );
  };

  const renderDateSelector = () => {
    return (
      <View style={styles.dateSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {availableDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = index === 0;
            const isTomorrow = index === 1;

            return (
              <TouchableOpacity
                key={date.getTime()}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text style={[
                  styles.dateChipDay,
                  { color: isSelected ? colors.surface : colors.text.secondary }
                ]}>
                  {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.dateChipDate,
                  { color: isSelected ? colors.surface : colors.text.primary }
                ]}>
                  {date.getDate()}
                </Text>
                <Text style={[
                  styles.dateChipMonth,
                  { color: isSelected ? colors.surface : colors.text.muted }
                ]}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTimeInputs = () => {
    return (
      <View style={styles.timeInputsContainer}>
        {/* Start Time Input */}
        <TouchableOpacity
          style={[styles.timeInput, { borderColor: startTime ? colors.primary : colors.border }]}
          onPress={() => setShowStartPicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.timeInputLabel}>
              START TIME
            </Text>
          </View>
          <Text style={[styles.timeInputValue, { color: startTime ? colors.text.primary : colors.text.muted }]}>
            {formatTime(startTime)}
          </Text>
        </TouchableOpacity>

        {/* End Time Input */}
        <TouchableOpacity
          style={[styles.timeInput, { borderColor: endTime ? colors.primary : colors.border }]}
          onPress={() => setShowEndPicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.timeInputLabel}>
              END TIME
            </Text>
          </View>
          <Text style={[styles.timeInputValue, { color: endTime ? colors.text.primary : colors.text.muted }]}>
            {formatTime(endTime)}
          </Text>
        </TouchableOpacity>

        {/* Start Time Picker */}
        {showStartPicker && (
          <DateTimePicker
            value={startTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {/* End Time Picker */}
        {showEndPicker && (
          <DateTimePicker
            value={endTime || getDefaultEndTime()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleEndTimeChange}
            minimumDate={startTime || undefined}
          />
        )}
      </View>
    );
  };

  const renderSummary = () => {
    if (!startTime || !endTime) {
      return (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Select start and end times to see booking details
          </Text>
        </View>
      );
    }

    const duration = calculateDuration();
    const cost = calculateCost(duration);

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Duration:
          </Text>
          <Text style={styles.summaryValue}>
            {Math.floor(duration / 60)}h {duration % 60}m
          </Text>
        </View>

        <View style={[styles.summaryRow, { marginBottom: 0 }]}>
          <Text style={styles.summaryLabel}>
            Estimated Cost:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.primary, fontSize: 20, fontWeight: 'bold' }]}>
            ₹{cost}
          </Text>
        </View>
      </View>
    );
  };

  const renderConfirmButton = () => {
    const isComplete = startTime !== null && endTime !== null;

    return (
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              opacity: isComplete ? 1 : 0.5,
            }
          ]}
          onPress={handleConfirmBooking}
          disabled={!isComplete}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isComplete
                ? [colors.primary, '#0066CC'] // Gradient from primary to darker blue
                : [colors.surface, colors.surface] // Solid surface color when disabled
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Booking
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      {/* Header */}
      {renderHeader()}

      {/* Date Selector */}
      {renderDateSelector()}

      {/* Time Inputs */}
      {renderTimeInputs()}

      {/* Summary */}
      {renderSummary()}

      {/* Confirm Button */}
      {renderConfirmButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: 50,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.background,
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: THEME.text.primary,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 40, // Balance the back button
  },

  // Date Selector Styles
  dateSelectorContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },

  dateScrollContent: {
    paddingHorizontal: 0,
  },

  dateChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    backgroundColor: THEME.surface,
  },

  dateChipDay: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: THEME.text.secondary,
  },

  dateChipDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: THEME.text.primary,
  },

  dateChipMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: THEME.text.muted,
  },

  // Time Inputs Styles
  timeInputsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },

  timeInput: {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  timeInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1.5,
    color: THEME.text.secondary,
    textTransform: 'uppercase',
  },

  timeInputValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: THEME.text.primary,
  },

  // Summary Styles
  summaryContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  summaryText: {
    fontSize: 16,
    textAlign: 'center',
    color: THEME.text.secondary,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.text.secondary,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },

  // Confirm Button Styles
  confirmButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100, // Extra padding for bottom navigation
  },

  confirmButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  confirmButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.primary,
  },
});

export default StationBookingScreen;

