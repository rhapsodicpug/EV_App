/**
 * Range Anxiety Assistant Screen
 * Comprehensive route planning and range anxiety assistance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  MapPin, 
  Battery, 
  Navigation, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useRangeAnxiety } from '../contexts/RangeAnxietyContext';
import RangeAnxietyCard from '../components/range/RangeAnxietyCard';

const RangeAnxietyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    vehicleSpecs, 
    currentRoute, 
    planRoute, 
    calculateCurrentRange,
    getChargingTimeEstimate,
    getOptimalChargingStrategy
  } = useRangeAnxiety();

  const [startAddress, setStartAddress] = useState('Current Location');
  const [endAddress, setEndAddress] = useState('');
  const [currentBattery, setCurrentBattery] = useState(75);
  const [isPlanning, setIsPlanning] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlanRoute = async () => {
    if (!endAddress.trim()) {
      Alert.alert('Error', 'Please enter a destination address');
      return;
    }

    setIsPlanning(true);
    try {
      const startPoint = {
        latitude: 19.0760,
        longitude: 72.8777,
        address: startAddress,
      };

      const endPoint = {
        latitude: 19.0760 + 0.1,
        longitude: 72.8777 + 0.1,
        address: endAddress,
      };

      await planRoute(startPoint, endPoint, currentBattery);
    } catch (error) {
      Alert.alert('Error', 'Failed to plan route. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#B0B0B0';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle size={20} color="#10B981" />;
      case 'medium': return <Info size={20} color="#F59E0B" />;
      case 'low': return <AlertTriangle size={20} color="#EF4444" />;
      default: return <Info size={20} color="#B0B0B0" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Range Assistant</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Range Status */}
        <RangeAnxietyCard 
          currentBattery={currentBattery}
          destination={endAddress}
          showDetails={true}
        />

        {/* Route Planning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Your Route</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Start Location</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={20} color="#8cd279" />
              <TextInput
                style={styles.input}
                value={startAddress}
                onChangeText={setStartAddress}
                placeholder="Enter start address"
                placeholderTextColor="#666666"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.inputWrapper}>
              <Navigation size={20} color="#8cd279" />
              <TextInput
                style={styles.input}
                value={endAddress}
                onChangeText={setEndAddress}
                placeholder="Enter destination address"
                placeholderTextColor="#666666"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Battery Level</Text>
            <View style={styles.batteryInputContainer}>
              <Battery size={20} color="#8cd279" />
              <TextInput
                style={styles.batteryInput}
                value={currentBattery.toString()}
                onChangeText={(text) => setCurrentBattery(parseInt(text) || 0)}
                placeholder="75"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.batteryUnit}>%</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.planButton, isPlanning && styles.planButtonDisabled]}
            onPress={handlePlanRoute}
            disabled={isPlanning}
          >
            <Text style={styles.planButtonText}>
              {isPlanning ? 'Planning Route...' : 'Plan Route'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Route Results */}
        {currentRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Plan</Text>
            
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeDistance}>{currentRoute.totalDistance.toFixed(0)} km</Text>
                  <Text style={styles.routeDuration}>{Math.round(currentRoute.estimatedDuration)} min</Text>
                </View>
                <View style={styles.confidenceContainer}>
                  {getConfidenceIcon(currentRoute.confidence)}
                  <Text style={[styles.confidenceText, { color: getConfidenceColor(currentRoute.confidence) }]}>
                    {currentRoute.confidence.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.routeStatus}>
                <View style={styles.statusItem}>
                  <Battery size={16} color="#8cd279" />
                  <Text style={styles.statusLabel}>Current</Text>
                  <Text style={styles.statusValue}>{currentRoute.currentBattery}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <Navigation size={16} color="#F59E0B" />
                  <Text style={styles.statusLabel}>Required</Text>
                  <Text style={styles.statusValue}>{currentRoute.requiredBattery.toFixed(0)}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <CheckCircle size={16} color={currentRoute.isFeasible ? "#10B981" : "#EF4444"} />
                  <Text style={styles.statusLabel}>Feasible</Text>
                  <Text style={[styles.statusValue, { color: currentRoute.isFeasible ? "#10B981" : "#EF4444" }]}>
                    {currentRoute.isFeasible ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Charging Stops */}
            {currentRoute.chargingStops.length > 0 && (
              <View style={styles.chargingStopsSection}>
                <Text style={styles.chargingStopsTitle}>Charging Stops</Text>
                {currentRoute.chargingStops.map((stop, index) => (
                  <View key={stop.id} style={styles.chargingStopCard}>
                    <View style={styles.stopHeader}>
                      <View style={styles.stopNumber}>
                        <Text style={styles.stopNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.stopInfo}>
                        <Text style={styles.stopName}>{stop.name}</Text>
                        <Text style={styles.stopAddress}>{stop.address}</Text>
                      </View>
                      <View style={styles.stopDistance}>
                        <Text style={styles.stopDistanceText}>{stop.distance.toFixed(0)} km</Text>
                      </View>
                    </View>
                    
                    <View style={styles.stopDetails}>
                      <View style={styles.stopDetailItem}>
                        <Clock size={16} color="#B0B0B0" />
                        <Text style={styles.stopDetailText}>{stop.estimatedTime} min</Text>
                      </View>
                      <View style={styles.stopDetailItem}>
                        <DollarSign size={16} color="#B0B0B0" />
                        <Text style={styles.stopDetailText}>₹{stop.cost.toFixed(2)}</Text>
                      </View>
                      <View style={styles.stopDetailItem}>
                        <Battery size={16} color="#B0B0B0" />
                        <Text style={styles.stopDetailText}>{stop.chargingSpeed}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Warnings */}
            {currentRoute.warnings.length > 0 && (
              <View style={styles.warningsSection}>
                <Text style={styles.warningsTitle}>Warnings</Text>
                {currentRoute.warnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <AlertTriangle size={16} color="#EF4444" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Suggestions */}
            {currentRoute.suggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>Suggestions</Text>
                {currentRoute.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Info size={16} color="#8cd279" />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B0B0B0',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },

  batteryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  batteryInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    textAlign: 'center',
  },

  batteryUnit: {
    fontSize: 16,
    color: '#B0B0B0',
    marginLeft: 8,
  },

  planButton: {
    backgroundColor: '#8cd279',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  planButtonDisabled: {
    backgroundColor: '#4A4A4A',
  },

  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  routeCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    marginBottom: 16,
  },

  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  routeInfo: {
    flex: 1,
  },

  routeDistance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  routeDuration: {
    fontSize: 16,
    color: '#B0B0B0',
  },

  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  routeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statusItem: {
    alignItems: 'center',
  },

  statusLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
  },

  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },

  chargingStopsSection: {
    marginTop: 16,
  },

  chargingStopsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  chargingStopCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  stopNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8cd279',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  stopNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },

  stopInfo: {
    flex: 1,
  },

  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  stopAddress: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
  },

  stopDistance: {
    alignItems: 'flex-end',
  },

  stopDistanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
  },

  stopDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  stopDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stopDetailText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 4,
  },

  warningsSection: {
    marginTop: 16,
  },

  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
  },

  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  warningText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
  },

  suggestionsSection: {
    marginTop: 16,
  },

  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8cd279',
    marginBottom: 12,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  suggestionText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
  },
});

export default RangeAnxietyScreen;
