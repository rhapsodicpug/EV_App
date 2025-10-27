/**
 * Route Planner Modal
 * Multi-stop trip planning with charging stops
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, MapPin, Plus, Trash2, CheckCircle, Zap, DollarSign, Clock } from 'lucide-react-native';

export interface RouteStop {
  name: string;
  address: string;
  distance: number;
  chargeFrom: number;
  chargeTo: number;
  estimatedCost: number;
  estimatedTime: number;
}

interface RoutePlannerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (stops: RouteStop[]) => void;
  trip: {
    origin: string;
    destination: string;
    totalDistance: number;
    currentBattery: number;
  };
}

const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  trip,
}) => {
  const [stops, setStops] = useState<RouteStop[]>([
    {
      name: 'Tata Power, Lonavala',
      address: 'Mumbai-Pune Highway',
      distance: 120,
      chargeFrom: 15,
      chargeTo: 85,
      estimatedCost: 480,
      estimatedTime: 30,
    },
  ]);

  const totalCost = stops.reduce((sum, stop) => sum + stop.estimatedCost, 0);
  const totalTime = stops.reduce((sum, stop) => sum + stop.estimatedTime, 0);

  const handleAddStop = () => {
    Alert.prompt(
      'Add Charging Stop',
      'Enter station name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (name) => {
            if (name) {
              setStops([
                ...stops,
                {
                  name: name || 'Charging Station',
                  address: 'Highway Location',
                  distance: 50,
                  chargeFrom: 45,
                  chargeTo: 90,
                  estimatedCost: 350,
                  estimatedTime: 35,
                },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleRemoveStop = (index: number) => {
    Alert.alert('Remove Stop', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setStops(stops.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleConfirm = () => {
    onConfirm(stops);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <MapPin size={24} color="#8cd279" />
              <Text style={styles.title}>Multi-Stop Trip Plan</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Trip Summary */}
            <View style={styles.tripSummary}>
              <View style={styles.originDest}>
                <View style={styles.stopDot} />
                <Text style={styles.originDestText}>{trip.origin}</Text>
              </View>
              <View style={styles.originDest}>
                <View style={[styles.stopDot, styles.destinationDot]} />
                <Text style={styles.originDestText}>{trip.destination}</Text>
              </View>
            </View>

            <View style={styles.tripStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Distance</Text>
                <Text style={styles.statValue}>{trip.totalDistance} km</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Current Battery</Text>
                <Text style={styles.statValue}>{trip.currentBattery}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Stops Needed</Text>
                <Text style={styles.statValue}>{stops.length}</Text>
              </View>
            </View>

            {/* Charging Stops */}
            <Text style={styles.sectionTitle}>Charging Stops</Text>
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopCard}>
                <View style={styles.stopHeader}>
                  <View style={styles.stopNumberBadge}>
                    <Text style={styles.stopNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopAddress}>{stop.address}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveStop(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.stopDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={14} color="#8cd279" />
                    <Text style={styles.detailText}>
                      {stop.estimatedTime} minutes
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Zap size={14} color="#8cd279" />
                    <Text style={styles.detailText}>
                      Charge: {stop.chargeFrom}% → {stop.chargeTo}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign size={14} color="#8cd279" />
                    <Text style={styles.detailText}>₹{stop.estimatedCost}</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addStopButton} onPress={handleAddStop}>
              <Plus size={20} color="#8cd279" />
              <Text style={styles.addStopText}>Add Charging Stop</Text>
            </TouchableOpacity>

            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Trip Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Stops:</Text>
                <Text style={styles.summaryValue}>{stops.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Charging Time:</Text>
                <Text style={styles.summaryValue}>{totalTime} minutes</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Cost:</Text>
                <Text style={styles.summaryValue}>₹{totalCost}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Arrival Battery:</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>90%</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <CheckCircle size={18} color="#000000" />
              <Text style={styles.confirmButtonText}>Book All Stops</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripSummary: {
    padding: 20,
    backgroundColor: '#3A3A3A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  originDest: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8cd279',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#EF4444',
  },
  originDestText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tripStats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stopCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stopNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8cd279',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stopAddress: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  removeButton: {
    padding: 4,
  },
  stopDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginLeft: 6,
  },
  addStopButton: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A4A4A',
    borderStyle: 'dashed',
  },
  addStopText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
    marginLeft: 8,
  },
  summary: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#8cd279',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 6,
  },
});

export default RoutePlannerModal;

