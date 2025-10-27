/**
 * Context Collection Modal
 * Gathers user context for personalized recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Battery, Clock, MapPin, Target, CheckCircle } from 'lucide-react-native';

export interface UserContext {
  batteryLevel: number | null;
  urgency: 'urgent' | 'soon' | 'later' | 'planning' | null;
  preferences: {
    distance: boolean;
    speed: boolean;
    price: boolean;
    amenities: boolean;
  };
}

interface ContextCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onContextSubmit: (context: UserContext) => void;
}

const BATTERY_LEVELS = [
  { value: 15, label: 'Critical (<20%)', color: '#EF4444' },
  { value: 30, label: 'Low (20-40%)', color: '#F59E0B' },
  { value: 55, label: 'Normal (40-70%)', color: '#3B82F6' },
  { value: 85, label: 'Good (70%+)', color: '#10B981' },
];

const URGENCY_OPTIONS = [
  { value: 'urgent' as const, label: '🚨 Urgent (need now)', color: '#EF4444' },
  { value: 'soon' as const, label: '⏰ Soon (within hour)', color: '#F59E0B' },
  { value: 'later' as const, label: '📅 Later today', color: '#3B82F6' },
  { value: 'planning' as const, label: '🗓️ Planning ahead', color: '#10B981' },
];

const PREFERENCE_OPTIONS = [
  { key: 'distance' as const, label: '📍 Nearest station', icon: 'MapPin' },
  { key: 'speed' as const, label: '⚡ Fastest charging', icon: 'Zap' },
  { key: 'price' as const, label: '💰 Cheapest option', icon: 'DollarSign' },
  { key: 'amenities' as const, label: '🛍️ Best amenities', icon: 'Coffee' },
];

const ContextCollectionModal: React.FC<ContextCollectionModalProps> = ({
  visible,
  onClose,
  onContextSubmit,
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<UserContext['urgency']>(null);
  const [preferences, setPreferences] = useState<UserContext['preferences']>({
    distance: false,
    speed: false,
    price: false,
    amenities: false,
  });

  const handlePreferenceToggle = (key: keyof UserContext['preferences']) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (batteryLevel === null || urgency === null) {
      Alert.alert('Missing Information', 'Please provide battery level and urgency.');
      return;
    }

    const context: UserContext = {
      batteryLevel,
      urgency,
      preferences,
    };

    onContextSubmit(context);
    
    // Reset form
    setBatteryLevel(null);
    setUrgency(null);
    setPreferences({
      distance: false,
      speed: false,
      price: false,
      amenities: false,
    });
    onClose();
  };

  const selectedCount = Object.values(preferences).filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Let me understand your needs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Step 1: Battery Level */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Battery size={20} color="#8cd279" />
                <Text style={styles.sectionTitle}>What's your battery level?</Text>
              </View>
              <View style={styles.optionsGrid}>
                {BATTERY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.optionCard,
                      batteryLevel === level.value && styles.optionCardSelected,
                    ]}
                    onPress={() => setBatteryLevel(level.value)}
                  >
                    <View style={[styles.optionIndicator, { backgroundColor: level.color }]} />
                    <Text style={[
                      styles.optionText,
                      batteryLevel === level.value && styles.optionTextSelected,
                    ]}>
                      {level.label}
                    </Text>
                    {batteryLevel === level.value && (
                      <CheckCircle size={16} color="#8cd279" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Step 2: Urgency */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color="#8cd279" />
                <Text style={styles.sectionTitle}>When do you need it?</Text>
              </View>
              <View style={styles.optionsGrid}>
                {URGENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionCard,
                      urgency === option.value && styles.optionCardSelected,
                    ]}
                    onPress={() => setUrgency(option.value)}
                  >
                    <View style={[styles.optionIndicator, { backgroundColor: option.color }]} />
                    <Text style={[
                      styles.optionText,
                      urgency === option.value && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {urgency === option.value && (
                      <CheckCircle size={16} color="#8cd279" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Step 3: Preferences */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#8cd279" />
                <Text style={styles.sectionTitle}>What's important? (Optional)</Text>
                <Text style={styles.sectionSubtitle}>
                  Select {selectedCount > 0 ? selectedCount : 'any'} preference{selectedCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.optionsGrid}>
                {PREFERENCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionCard,
                      preferences[option.key] && styles.optionCardSelected,
                    ]}
                    onPress={() => handlePreferenceToggle(option.key)}
                  >
                    <Text style={[
                      styles.optionText,
                      preferences[option.key] && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {preferences[option.key] && (
                      <CheckCircle size={16} color="#8cd279" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!batteryLevel || !urgency) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!batteryLevel || !urgency}
          >
            <Text style={styles.submitButtonText}>
              Find My Perfect Charging Station
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginLeft: 28,
    marginTop: 4,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#3A4A3A',
    borderColor: '#8cd279',
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionTextSelected: {
    color: '#8cd279',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#8cd279',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

export default ContextCollectionModal;

