import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';
import Button from '../../components/ui/Button';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  isConflict?: boolean;
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

const generateTimeSlots = (basePrice: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 6;
  const endHour = 22;
  
  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    slots.push({
      id: `slot_${hour}`,
      startTime,
      endTime,
      duration: 60,
      price: basePrice + Math.floor(Math.random() * 20),
      isAvailable: Math.random() > 0.3,
      isConflict: Math.random() > 0.8,
    });
  }
  
  return slots;
};

export const SlotSelectionScreen: React.FC<SlotSelectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors } = useThemeColors();
  const { station } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedChargerType, setSelectedChargerType] = useState(station.chargerTypes[0]);
  
  const timeSlots = generateTimeSlots(station.basePrice);
  const availableSlots = timeSlots.filter(slot => slot.isAvailable);
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (slot: TimeSlot) => {
    return selectedSlot?.id === slot.id;
  };
  
  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      Alert.alert('Slot Unavailable', 'This time slot is not available.');
      return;
    }
    
    if (slot.isConflict) {
      Alert.alert('Conflict Detected', 'This slot conflicts with your existing bookings.');
      return;
    }
    
    setSelectedSlot(slot);
  };
  
  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert('No Slot Selected', 'Please select a time slot to continue.');
      return;
    }
    
    navigation.navigate('BookingConfirmation', {
      booking: {
        id: `BK${Date.now()}`,
        stationName: station.name,
        stationAddress: station.address,
        date: selectedDate.toLocaleDateString(),
        time: selectedSlot.startTime,
        duration: selectedSlot.duration / 60,
        slotNumber: parseInt(selectedSlot.id.split('_')[1]),
        chargerType: selectedChargerType,
        amount: selectedSlot.price,
        totalAmount: selectedSlot.price,
      },
    });
  };
  
  const renderDateSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Select Date
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dateButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isToday(date) ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  { color: isSelected ? Colors.neutral.white : colors.text.primary },
                ]}
              >
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text
                style={[
                  styles.dateButtonSubtext,
                  { color: isSelected ? Colors.neutral.white : colors.text.secondary },
                ]}
              >
                {date.getDate()}
              </Text>
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
        {station.chargerTypes.map((type) => {
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
  
  const renderTimeSlots = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Available Time Slots
      </Text>
      <View style={styles.timeSlotsGrid}>
        {timeSlots.map((slot) => {
          const isSlotSelected = isSelected(slot);
          const slotColor = slot.isConflict
            ? Colors.semantic.error
            : slot.isAvailable
            ? colors.primary
            : colors.border;
          
          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotButton,
                {
                  backgroundColor: isSlotSelected ? slotColor : colors.surface,
                  borderColor: slot.isConflict ? Colors.semantic.error : colors.border,
                },
              ]}
              onPress={() => handleSlotSelect(slot)}
              disabled={!slot.isAvailable}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  {
                    color: isSlotSelected
                      ? Colors.neutral.white
                      : slot.isConflict
                      ? Colors.neutral.white
                      : colors.text.primary,
                  },
                ]}
              >
                {slot.startTime}
              </Text>
              <Text
                style={[
                  styles.timeSlotSubtext,
                  {
                    color: isSlotSelected
                      ? Colors.neutral.white
                      : slot.isConflict
                      ? Colors.neutral.white
                      : colors.text.secondary,
                  },
                ]}
              >
                ₹{slot.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
  
  const renderPriceBreakdown = () => {
    if (!selectedSlot) return null;
    
    return (
      <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.priceTitle, { color: colors.text.primary }]}>
          Price Breakdown
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.text.secondary }]}>
            Base Rate ({selectedSlot.duration / 60} hour)
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.neutral.white }]}>
          Select Time Slot
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Station Info */}
      <View style={[styles.stationInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.stationName, { color: colors.text.primary }]}>
          {station.name}
        </Text>
        <Text style={[styles.stationAddress, { color: colors.text.secondary }]}>
          {station.address}
        </Text>
        <View style={styles.stationDetails}>
          <Text style={[styles.stationDetailText, { color: colors.text.secondary }]}>
            {availableSlots.length} slots available
          </Text>
          <Text style={[styles.stationDetailText, { color: colors.text.secondary }]}>
            Base rate: ₹{station.basePrice}/hour
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDateSelector()}
        {renderChargerTypeSelector()}
        {renderTimeSlots()}
        {renderPriceBreakdown()}
        
        {selectedSlot && (
          <View style={styles.selectedSlotInfo}>
            <Text style={[styles.selectedSlotText, { color: colors.text.secondary }]}>
              Selected: {selectedSlot.startTime} - {selectedSlot.endTime}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Confirm Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title={`Confirm Booking - ₹${selectedSlot ? selectedSlot.price + 5 : 0}`}
          onPress={handleConfirmBooking}
          variant="primary"
          size="large"
          disabled={!selectedSlot}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 60,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  stationInfo: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  stationAddress: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  stationDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stationDetailText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  dateButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 60,
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateButtonSubtext: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  chargerTypeButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  chargerTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chargerTypeButtonSubtext: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlotButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    width: '30%',
    minWidth: 80,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotSubtext: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  priceCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Elevation.level1,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedSlotInfo: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  selectedSlotText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
