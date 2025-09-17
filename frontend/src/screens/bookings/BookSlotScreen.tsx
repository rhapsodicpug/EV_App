/**
 * Book a Slot Screen
 * Simple booking interface with time selection and freehand duration input
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
  Platform,
  BackHandler,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { EVStation } from '../../types/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const BOOK_COLORS = {
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

interface BookSlotScreenProps {
  route: {
    params: {
      station: EVStation;
    };
  };
}

interface TimeOption {
  id: string;
  label: string;
  time: string;
  date: Date;
}

interface WheelPickerProps {
  data: string[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  itemHeight?: number;
}

interface DurationChip {
  id: string;
  label: string;
  minutes: number;
}

// Modern Wheel Picker Component with Enhanced Touch Response
const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedIndex,
  onSelectionChange,
  itemHeight = 50,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollTime = useRef(0);

  useEffect(() => {
    if (scrollViewRef.current && !isScrolling && !isDragging) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * itemHeight,
        animated: false,
      });
    }
  }, [selectedIndex, itemHeight, isScrolling, isDragging]);

  const handleScroll = (event: any) => {
    const currentTime = Date.now();
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    // Throttle scroll events for better performance
    if (currentTime - lastScrollTime.current > 16) { // ~60fps
      lastScrollTime.current = currentTime;
      
      if (index >= 0 && index < data.length && index !== selectedIndex) {
        onSelectionChange(index);
      }
    }
  };

  const handleScrollBeginDrag = () => {
    setIsDragging(true);
    setIsScrolling(true);
  };

  const handleScrollEndDrag = (event: any) => {
    setIsDragging(false);
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    if (index >= 0 && index < data.length) {
      onSelectionChange(index);
      // Smooth snap to position with animation
      scrollViewRef.current?.scrollTo({
        y: index * itemHeight,
        animated: true,
      });
    }
  };

  const handleMomentumScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleMomentumScrollEnd = (event: any) => {
    setIsScrolling(false);
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    if (index >= 0 && index < data.length) {
      onSelectionChange(index);
      // Final snap to position
      scrollViewRef.current?.scrollTo({
        y: index * itemHeight,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.wheelPickerContainer}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="center"
        decelerationRate={0.98} // Slower deceleration for smoother feel
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={8} // Higher frequency for smoother updates
        contentContainerStyle={styles.wheelPickerContent}
        bounces={false} // Disable bouncing for cleaner feel
        scrollsToTop={false}
        keyboardShouldPersistTaps="handled"
      >
        {data.map((item, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : Math.max(0.2, 1 - distance * 0.25);
          const scale = distance === 0 ? 1 : Math.max(0.85, 1 - distance * 0.08);
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.wheelPickerItem,
                { 
                  height: itemHeight, 
                  opacity, 
                  transform: [{ scale }],
                  // Add subtle shadow for selected item
                  shadowColor: index === selectedIndex ? BOOK_COLORS.accent : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: index === selectedIndex ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: index === selectedIndex ? 2 : 0,
                },
                index === selectedIndex && styles.wheelPickerItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.wheelPickerItemText,
                  index === selectedIndex && styles.wheelPickerItemTextSelected,
                ]}
              >
                {item}
              </Text>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Native Date/Time Picker System
const NativeDateTimePicker: React.FC<{
  selectedDate: Date;
  selectedTime: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}> = ({ selectedDate, selectedTime, onDateChange, onTimeChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      onTimeChange(selectedTime);
    }
  };

  return (
    <View style={styles.nativePickerContainer}>
      {/* Date Selector */}
      <TouchableOpacity
        style={styles.pickerRow}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.pickerRowContent}>
          <View style={styles.pickerRowLeft}>
            <Calendar size={20} color={BOOK_COLORS.accent} />
            <Text style={styles.pickerRowTitle}>Date</Text>
          </View>
          <Text style={styles.pickerRowValue}>{formatDate(selectedDate)}</Text>
        </View>
      </TouchableOpacity>

      {/* Time Selector */}
      <TouchableOpacity
        style={styles.pickerRow}
        onPress={() => setShowTimePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.pickerRowContent}>
          <View style={styles.pickerRowLeft}>
            <Clock size={20} color={BOOK_COLORS.accent} />
            <Text style={styles.pickerRowTitle}>Start Time</Text>
          </View>
          <Text style={styles.pickerRowValue}>{formatTime(selectedTime)}</Text>
        </View>
      </TouchableOpacity>

      {/* Native Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
        />
      )}

      {/* Native Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour={false}
        />
      )}
    </View>
  );
};

const BookSlotScreen: React.FC<BookSlotScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { station } = route.params;

  // Modal states
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  // State management for selections
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    const time = new Date();
    time.setHours(12, 30, 0, 0); // Default to 12:30 PM
    return time;
  });
  const [selectedDuration, setSelectedDuration] = useState<DurationChip | null>(null);
  const [price, setPrice] = useState<number>(0);

  // Duration chips
  const durationChips: DurationChip[] = [
    { id: '5min', label: '5 min', minutes: 5 },
    { id: '10min', label: '10 min', minutes: 10 },
    { id: '15min', label: '15 min', minutes: 15 },
    { id: '20min', label: '20 min', minutes: 20 },
    { id: '25min', label: '25 min', minutes: 25 },
    { id: '30min', label: '30 min', minutes: 30 },
    { id: '35min', label: '35 min', minutes: 35 },
    { id: '40min', label: '40 min', minutes: 40 },
    { id: '45min', label: '45 min', minutes: 45 },
    { id: '50min', label: '50 min', minutes: 50 },
    { id: '55min', label: '55 min', minutes: 55 },
    { id: '1hr', label: '1 hr', minutes: 60 },
    { id: '1hr15min', label: '1 hr 15 min', minutes: 75 },
    { id: '1hr30min', label: '1 hr 30 min', minutes: 90 },
    { id: '2hr', label: '2 hr', minutes: 120 },
    { id: '3hr', label: '3 hr', minutes: 180 },
    { id: '4hr', label: '4 hr', minutes: 240 },
    { id: '5hr', label: '5 hr', minutes: 300 },
    { id: '6hr', label: '6 hr', minutes: 360 },
    { id: '7hr', label: '7 hr', minutes: 420 },
    { id: '8hr', label: '8 hr', minutes: 480 },
  ];

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: date.toISOString().split('T')[0],
        date: date,
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        fullLabel: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
    }
    return dates;
  };

  // Generate time slots (every 30 minutes from 6 AM to 10 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push({
          id: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          time: time,
          label: time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        });
      }
    }
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  // Calculate price based on selected duration
  useEffect(() => {
    if (selectedDuration) {
      const hours = selectedDuration.minutes / 60;
      const basePrice = station.charging_slots?.[0]?.price_per_kwh || 12;
      const calculatedPrice = hours * basePrice;
      setPrice(calculatedPrice);
    } else {
      setPrice(0);
    }
  }, [selectedDuration, station]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
  };

  const handleDurationSelect = (duration: DurationChip) => {
    setSelectedDuration(duration);
  };

  // Modal handlers
  const handleDateSelect = (dateItem: any) => {
    setSelectedDate(dateItem.date);
    setShowDateModal(false);
  };

  const handleTimeSelect = (timeItem: any) => {
    setSelectedTime(timeItem.time);
    setShowTimeModal(false);
  };

  const handleDurationSelectModal = (duration: DurationChip) => {
    setSelectedDuration(duration);
    setShowDurationModal(false);
  };

  const handleBookSlot = () => {
    if (!selectedDuration) {
      Alert.alert('No Duration Selected', 'Please select a duration.');
      return;
    }

    // Format the selected date and time
    const dateString = selectedDate.toLocaleDateString();
    const timeString = selectedTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Navigate to payment screen
    navigation.navigate('Payment', {
      booking: {
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        date: dateString,
        time: timeString,
        duration: selectedDuration.minutes,
        price: price,
      },
      totalAmount: price,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOK_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={BOOK_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a slot</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDateModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.pickerButtonContent}>
              <View style={styles.pickerButtonLeft}>
                <Calendar size={20} color={BOOK_COLORS.accent} />
                <Text style={styles.pickerButtonTitle}>Date</Text>
              </View>
              <Text style={styles.pickerButtonValue}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTimeModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.pickerButtonContent}>
              <View style={styles.pickerButtonLeft}>
                <Clock size={20} color={BOOK_COLORS.accent} />
                <Text style={styles.pickerButtonTitle}>Start Time</Text>
              </View>
              <Text style={styles.pickerButtonValue}>
                {selectedTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDurationModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.pickerButtonContent}>
              <View style={styles.pickerButtonLeft}>
                <Clock size={20} color={BOOK_COLORS.accent} />
                <Text style={styles.pickerButtonTitle}>Duration</Text>
              </View>
              <Text style={styles.pickerButtonValue}>
                {selectedDuration ? selectedDuration.label : 'Select duration'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Price section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <Text style={styles.priceText}>
            ₹{price.toFixed(2)}
          </Text>
        </View>

        {/* Book slot button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookSlot}
            disabled={!selectedDuration}
          >
            <Text style={styles.bookButtonText}>Book slot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableDates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleDateSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.fullLabel}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={timeSlots}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTimeSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Duration Selection Modal */}
      <Modal
        visible={showDurationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Duration</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDurationModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={durationChips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleDurationSelectModal(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOK_COLORS.background,
    paddingBottom: 100, // Buffer space to prevent content from being hidden by navigation bar
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: BOOK_COLORS.background,
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
    color: BOOK_COLORS.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  headerRight: {
    width: 40,
    height: 40,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Buffer space to prevent button from being hidden by navigation bar
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOK_COLORS.text.primary,
    marginBottom: 16,
  },

  // Picker Button Styles
  pickerButton: {
    backgroundColor: BOOK_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BOOK_COLORS.border,
  },

  pickerButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pickerButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  pickerButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOK_COLORS.text.primary,
  },

  pickerButtonValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOK_COLORS.text.secondary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // Native Date/Time Picker Styles
  nativePickerContainer: {
    backgroundColor: BOOK_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  pickerRow: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BOOK_COLORS.border,
  },

  pickerRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  pickerRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOK_COLORS.text.primary,
  },

  pickerRowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOK_COLORS.text.secondary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // Enhanced Wheel Picker Styles
  wheelPickerContainer: {
    height: 120,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // Subtle background instead of transparent
  },

  wheelPickerContent: {
    paddingVertical: 40, // Increased padding for smoother scrolling
    paddingHorizontal: 8,
  },

  wheelPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginVertical: 2,
  },

  wheelPickerItemSelected: {
    backgroundColor: 'rgba(0, 168, 255, 0.15)', // Enhanced blue background
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 255, 0.4)', // Brighter border
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  wheelPickerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: BOOK_COLORS.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  wheelPickerItemTextSelected: {
    color: '#00A8FF', // Bright blue for selected text
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 168, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Duration Chips Styles (matching the photo)
  durationChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },

  durationChip: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BOOK_COLORS.text.secondary, // Light gray border matching photo
    minWidth: 80,
    alignItems: 'center',
  },

  durationChipSelected: {
    backgroundColor: BOOK_COLORS.accent,
    borderColor: BOOK_COLORS.accent,
  },

  durationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOK_COLORS.text.secondary, // Muted gray text matching photo
  },

  durationChipTextSelected: {
    color: '#000000',
  },

  // Price Styles
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOK_COLORS.text.primary,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  bookButton: {
    backgroundColor: BOOK_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BOOK_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: BOOK_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOK_COLORS.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOK_COLORS.text.primary,
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BOOK_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOK_COLORS.text.primary,
  },

  modalList: {
    flex: 1,
  },

  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOK_COLORS.border,
  },

  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOK_COLORS.text.primary,
  },
});

export default BookSlotScreen;
