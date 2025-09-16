import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  BackHandler,
} from 'react-native';
import CustomModal from '../components/ui/CustomModal';
import {
  ArrowLeft,
  Trash2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicles } from '../contexts/VehicleContext';

// Color Palette matching the design
const COLORS = {
  background: '#1A1A1A',
  surface: '#1A1A1A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#8cd279', // Lime green theme
};

const MyVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { vehicles, isLoading, error, deleteVehicle } = useVehicles();
  
  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddVehicle = () => {
    // @ts-ignore
    navigation.navigate('AddVehicle');
  };

  const handleVehiclePress = (vehicle: any) => {
    Alert.alert(
      'Vehicle Details',
      `${vehicle.model}\nLicense Plate: ${vehicle.licensePlate}\nYear: ${vehicle.year}\nBattery: ${vehicle.batteryCapacity} kWh`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    
    try {
      await deleteVehicle(selectedVehicle.id);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to delete vehicle. Please try again.');
      setShowErrorModal(true);
    }
  };

  const renderVehicleItem = (vehicle: any) => (
    <View key={vehicle.id} style={styles.vehicleItem}>
      <TouchableOpacity
        style={styles.vehicleContent}
        onPress={() => handleVehiclePress(vehicle)}
        activeOpacity={0.7}
      >
        <View style={styles.vehicleImageContainer}>
          <Image
            source={{ uri: vehicle.image }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.licensePlate}>License Plate: {vehicle.licensePlate}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteVehicle(vehicle)}
      >
        <Trash2 size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* My Vehicles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vehicles</Text>
          
          {vehicles.length > 0 ? (
            <View style={styles.vehiclesList}>
              {vehicles.map(renderVehicleItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No vehicles added yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first vehicle to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Vehicle Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddVehicle}
        >
          <Text style={styles.addButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Modals */}
      <CustomModal
        visible={showDeleteModal}
        title="Delete Vehicle"
        message={selectedVehicle ? `Are you sure you want to delete ${selectedVehicle.model} (${selectedVehicle.licensePlate})? This action cannot be undone.` : ''}
        options={[
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: confirmDeleteVehicle,
            style: 'destructive',
          },
        ]}
        onClose={() => setShowDeleteModal(false)}
      />

      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Vehicle deleted successfully!"
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowSuccessModal(false)}
      />

      <CustomModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  vehiclesList: {
    gap: 16,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    marginLeft: 12,
  },
  vehicleImageContainer: {
    marginRight: 16,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  vehicleInfo: {
    flex: 1,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100, // Extra padding to avoid bottom navigation overlap
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
});

export default MyVehicleScreen;