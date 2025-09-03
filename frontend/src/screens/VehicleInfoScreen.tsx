import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumModal from '../components/ui/PremiumModal';

const { width } = Dimensions.get('window');

// Premium colors for Vehicle Information screen
const VEHICLE_COLORS = {
  primary: '#00A8FF',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  glass: 'rgba(42, 42, 42, 0.8)',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#666666',
  },
};

interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: string;
  batteryCapacity: string;
  maxChargingRate: string;
  preferredChargingType: string;
}

const VehicleInfoScreen: React.FC = () => {
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'Electric Car',
      brand: 'Tesla',
      model: 'Model 3',
      year: '2023',
      batteryCapacity: '75 kWh',
      maxChargingRate: '250 kW',
      preferredChargingType: 'DC Fast Charging',
    },
  ]);

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    type: '',
    brand: '',
    model: '',
    year: '',
    batteryCapacity: '',
    maxChargingRate: '',
    preferredChargingType: '',
  });

  // Premium Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: VEHICLE_COLORS.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 100,
    },

    // Header
    header: {
      paddingVertical: 24,
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: VEHICLE_COLORS.text.primary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: VEHICLE_COLORS.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },

    // Vehicle Cards
    vehicleCard: {
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
    },
    vehicleGradient: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    vehicleContent: {
      padding: 20,
    },
    vehicleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    vehicleIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: VEHICLE_COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    vehicleInfo: {
      flex: 1,
    },
    vehicleName: {
      fontSize: 20,
      fontWeight: '600',
      color: VEHICLE_COLORS.text.primary,
      marginBottom: 4,
    },
    vehicleType: {
      fontSize: 14,
      color: VEHICLE_COLORS.text.secondary,
    },
    deleteButton: {
      padding: 8,
    },

    // Vehicle Details
    vehicleDetails: {
      gap: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: VEHICLE_COLORS.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    detailText: {
      fontSize: 14,
      color: VEHICLE_COLORS.text.secondary,
      flex: 1,
    },

    // Add Vehicle Button
    addVehicleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: VEHICLE_COLORS.surface,
      borderWidth: 2,
      borderColor: VEHICLE_COLORS.primary,
      borderStyle: 'dashed',
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
      marginTop: 24,
    },
    addVehicleButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: VEHICLE_COLORS.primary,
      marginLeft: 12,
    },

    // Add Vehicle Form
    addVehicleForm: {
      backgroundColor: VEHICLE_COLORS.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: VEHICLE_COLORS.text.primary,
      marginBottom: 24,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: VEHICLE_COLORS.text.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: VEHICLE_COLORS.card,
      borderWidth: 1,
      borderColor: VEHICLE_COLORS.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: VEHICLE_COLORS.text.primary,
    },
    formButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    cancelButton: {
      backgroundColor: VEHICLE_COLORS.card,
      borderWidth: 1,
      borderColor: VEHICLE_COLORS.surface,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: VEHICLE_COLORS.text.primary,
    },
    addButton: {
      backgroundColor: VEHICLE_COLORS.primary,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: VEHICLE_COLORS.text.primary,
      marginLeft: 8,
    },
  });

  // Modal handlers
  const showFeatureModal = () => {
    setModalVisible(true);
  };

  const hideFeatureModal = () => {
    setModalVisible(false);
  };

  const handleAddVehicle = () => {
    if (!newVehicle.type || !newVehicle.brand || !newVehicle.model) {
      showFeatureModal();
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      type: newVehicle.type!,
      brand: newVehicle.brand!,
      model: newVehicle.model!,
      year: newVehicle.year || '',
      batteryCapacity: newVehicle.batteryCapacity || '',
      maxChargingRate: newVehicle.maxChargingRate || '',
      preferredChargingType: newVehicle.preferredChargingType || '',
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      type: '',
      brand: '',
      model: '',
      year: '',
      batteryCapacity: '',
      maxChargingRate: '',
      preferredChargingType: '',
    });
    setIsAddingVehicle(false);

    Alert.alert('Success', 'Vehicle added successfully!');
  };

  const handleDeleteVehicle = (id: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVehicles(vehicles.filter(v => v.id !== id));
          },
        },
      ]
    );
  };

  const renderVehicleCard = (vehicle: Vehicle) => (
    <View key={vehicle.id} style={styles.vehicleCard}>
      <LinearGradient
        colors={[VEHICLE_COLORS.glass, 'rgba(32, 32, 32, 0.9)']}
        style={styles.vehicleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.vehicleContent}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="car" size={24} color={VEHICLE_COLORS.text.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
              <Text style={styles.vehicleType}>{vehicle.type} • {vehicle.year}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteVehicle(vehicle.id)}
            >
              <Ionicons name="trash-outline" size={20} color={VEHICLE_COLORS.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="battery-charging" size={16} color={VEHICLE_COLORS.primary} />
              </View>
              <Text style={styles.detailText}>Battery: {vehicle.batteryCapacity}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="flash" size={16} color={VEHICLE_COLORS.primary} />
              </View>
              <Text style={styles.detailText}>Max Rate: {vehicle.maxChargingRate}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="settings" size={16} color={VEHICLE_COLORS.primary} />
              </View>
              <Text style={styles.detailText}>Preferred: {vehicle.preferredChargingType}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderAddVehicleForm = () => (
    <View style={styles.addVehicleForm}>
      <Text style={styles.formTitle}>Add New Vehicle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <TextInput
          style={styles.input}
          value={newVehicle.type}
          onChangeText={(text) => setNewVehicle({ ...newVehicle, type: text })}
          placeholder="e.g., Electric Car, Electric SUV"
          placeholderTextColor={VEHICLE_COLORS.text.secondary}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Brand *</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.brand}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, brand: text })}
            placeholder="e.g., Tesla"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.model}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, model: text })}
            placeholder="e.g., Model 3"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.year}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, year: text })}
            placeholder="e.g., 2023"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Battery Capacity</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.batteryCapacity}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, batteryCapacity: text })}
            placeholder="e.g., 75 kWh"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Max Charging Rate</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.maxChargingRate}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, maxChargingRate: text })}
            placeholder="e.g., 250 kW"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Preferred Charging</Text>
          <TextInput
            style={styles.input}
            value={newVehicle.preferredChargingType}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, preferredChargingType: text })}
            placeholder="e.g., DC Fast"
            placeholderTextColor={VEHICLE_COLORS.text.secondary}
          />
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setIsAddingVehicle(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddVehicle}
        >
          <Ionicons name="add" size={20} color={VEHICLE_COLORS.text.primary} />
          <Text style={styles.addButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vehicle Information</Text>
          <Text style={styles.subtitle}>Manage your electric vehicles</Text>
        </View>

        {/* Vehicle Cards */}
        {vehicles.map(renderVehicleCard)}

        {/* Add Vehicle Section */}
        {!isAddingVehicle ? (
          <TouchableOpacity
            style={styles.addVehicleButton}
            onPress={() => setIsAddingVehicle(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={VEHICLE_COLORS.primary} />
            <Text style={styles.addVehicleButtonText}>Add New Vehicle</Text>
          </TouchableOpacity>
        ) : (
          renderAddVehicleForm()
        )}

        {/* Premium Modal */}
        <PremiumModal
          visible={modalVisible}
          onClose={hideFeatureModal}
          icon="car-outline"
          title="Required Fields Missing"
          message="Please fill in all required fields (Vehicle Type, Brand, and Model) to add your vehicle."
          buttonText="Got It"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VehicleInfoScreen;
