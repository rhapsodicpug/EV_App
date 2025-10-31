import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { X, MapPin, Navigation, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MUMBAI_LOCATIONS, MumbaiLocation, searchLocations } from '../../constants/mumbaiLocations';
import * as Haptics from 'expo-haptics';

interface TripPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanTrip: (startLocation: MumbaiLocation, endLocation: MumbaiLocation) => void;
}

const TripPlannerModal: React.FC<TripPlannerModalProps> = ({ visible, onClose, onPlanTrip }) => {
  const [startLocation, setStartLocation] = useState<MumbaiLocation | null>(null);
  const [endLocation, setEndLocation] = useState<MumbaiLocation | null>(null);
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);

  // Debug log and auto-focus
  React.useEffect(() => {
    console.log('🗺️ TripPlannerModal visible:', visible);
    if (visible) {
      // Auto-show suggestions for start location when modal opens
      setActiveInput('start');
    }
  }, [visible]);

  // Filter locations based on search query
  const filteredStartLocations = useMemo(() => {
    if (!startQuery) return MUMBAI_LOCATIONS;
    return searchLocations(startQuery);
  }, [startQuery]);

  const filteredEndLocations = useMemo(() => {
    if (!endQuery) return MUMBAI_LOCATIONS;
    return searchLocations(endQuery);
  }, [endQuery]);

  const handleStartLocationSelect = (location: MumbaiLocation) => {
    setStartLocation(location);
    setStartQuery(location.name);
    setActiveInput(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEndLocationSelect = (location: MumbaiLocation) => {
    setEndLocation(location);
    setEndQuery(location.name);
    setActiveInput(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePlanTrip = () => {
    if (startLocation && endLocation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPlanTrip(startLocation, endLocation);
      handleReset();
    }
  };

  const handleReset = () => {
    setStartLocation(null);
    setEndLocation(null);
    setStartQuery('');
    setEndQuery('');
    setActiveInput(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Navigation size={24} color="#8cd279" />
              </View>
              <Text style={styles.headerTitle}>Plan Your Trip</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Start Location */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Starting Point</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#8cd279" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Search starting location..."
                  placeholderTextColor="#666666"
                  value={startQuery}
                  onChangeText={setStartQuery}
                  onFocus={() => setActiveInput('start')}
                />
                {startQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setStartQuery(''); setStartLocation(null); }}>
                    <X size={18} color="#666666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Start Location Suggestions */}
              {activeInput === 'start' && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView 
                    style={styles.suggestionsList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredStartLocations.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        style={styles.suggestionItem}
                        onPress={() => handleStartLocationSelect(location)}
                      >
                        <MapPin size={16} color="#8cd279" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>{location.name}</Text>
                          <Text style={styles.suggestionArea}>{location.area}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* End Location */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Destination</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#EF4444" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Search destination..."
                  placeholderTextColor="#666666"
                  value={endQuery}
                  onChangeText={setEndQuery}
                  onFocus={() => setActiveInput('end')}
                />
                {endQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setEndQuery(''); setEndLocation(null); }}>
                    <X size={18} color="#666666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* End Location Suggestions */}
              {activeInput === 'end' && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView 
                    style={styles.suggestionsList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredEndLocations.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        style={styles.suggestionItem}
                        onPress={() => handleEndLocationSelect(location)}
                      >
                        <MapPin size={16} color="#EF4444" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>{location.name}</Text>
                          <Text style={styles.suggestionArea}>{location.area}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Selected Route Summary */}
            {startLocation && endLocation && (
              <LinearGradient
                colors={['rgba(140, 210, 121, 0.15)', 'rgba(140, 210, 121, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.routeSummary}
              >
                <View style={styles.routeRow}>
                  <MapPin size={16} color="#8cd279" />
                  <Text style={styles.routeText}>{startLocation.name}</Text>
                </View>
                <View style={styles.routeDivider}>
                  <View style={styles.routeLine} />
                </View>
                <View style={styles.routeRow}>
                  <MapPin size={16} color="#EF4444" />
                  <Text style={styles.routeText}>{endLocation.name}</Text>
                </View>
              </LinearGradient>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleReset}
            >
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!startLocation || !endLocation) && styles.disabledButton,
              ]}
              onPress={handlePlanTrip}
              disabled={!startLocation || !endLocation}
            >
              <LinearGradient
                colors={
                  startLocation && endLocation
                    ? ['#8cd279', '#6bb05f']
                    : ['#4A4A4A', '#3A3A3A']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Navigation size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Calculate Route</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(140, 210, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minHeight: 300,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.3)',
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionText: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  suggestionArea: {
    fontSize: 13,
    color: '#666666',
  },
  routeSummary: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.2)',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  routeDivider: {
    marginVertical: 8,
    marginLeft: 8,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#4A4A4A',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButton: {
    flex: 2,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TripPlannerModal;

