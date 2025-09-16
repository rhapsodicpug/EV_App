import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
  FlatList,
} from 'react-native';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicles } from '../contexts/VehicleContext';
import CustomModal from '../components/ui/CustomModal';

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
  inputBackground: '#2A2A2A',
};

// Vehicle models for selection - Comprehensive list
const VEHICLE_MODELS = [
  // Tesla
  'Tesla Model 3',
  'Tesla Model S',
  'Tesla Model X',
  'Tesla Model Y',
  'Tesla Cybertruck',
  
  // Nissan
  'Nissan Leaf',
  'Nissan Ariya',
  
  // BMW
  'BMW i3',
  'BMW i4',
  'BMW iX',
  'BMW iX3',
  
  // Chevrolet
  'Chevrolet Bolt EV',
  'Chevrolet Bolt EUV',
  
  // Hyundai
  'Hyundai Kona Electric',
  'Hyundai Ioniq 5',
  'Hyundai Ioniq 6',
  
  // Kia
  'Kia Niro EV',
  'Kia EV6',
  'Kia EV9',
  
  // Audi
  'Audi e-tron',
  'Audi e-tron GT',
  'Audi Q4 e-tron',
  
  // Jaguar
  'Jaguar I-PACE',
  
  // Porsche
  'Porsche Taycan',
  'Porsche Taycan Cross Turismo',
  
  // Ford
  'Ford Mustang Mach-E',
  'Ford F-150 Lightning',
  
  // Volkswagen
  'Volkswagen ID.4',
  'Volkswagen ID.3',
  
  // Mercedes-Benz
  'Mercedes-Benz EQS',
  'Mercedes-Benz EQC',
  'Mercedes-Benz EQA',
  
  // Volvo
  'Volvo XC40 Recharge',
  'Volvo C40 Recharge',
  
  // Polestar
  'Polestar 2',
  'Polestar 3',
  
  // Rivian
  'Rivian R1T',
  'Rivian R1S',
  
  // Lucid
  'Lucid Air',
  
  // Genesis
  'Genesis GV60',
  'Genesis Electrified G80',
  
  // Indian EVs
  'Tata Nexon EV',
  'Tata Tigor EV',
  'Tata Tiago EV',
  'Tata Punch EV',
  'Tata Harrier EV',
  'Tata Sierra EV',
  'Mahindra eXUV300',
  'Mahindra eKUV100',
  'Mahindra eVerito',
  'Mahindra XUV400',
  'Mahindra Born Electric',
  'MG ZS EV',
  'MG Comet EV',
  'Hyundai Kona Electric (India)',
  'Hyundai Ioniq 5 (India)',
  'Kia EV6 (India)',
  'BYD e6',
  'BYD Atto 3',
  'Ola S1',
  'Ola S1 Pro',
  'Ather 450X',
  'Ather 450S',
  'Bajaj Chetak',
  'TVS iQube',
  'Hero Electric Optima',
  'Hero Electric Flash',
  'Revolt RV400',
  'Revolt RV300',
  'Ultraviolette F77',
  'Tork Kratos',
  'Ampere Zeal',
  'Ampere Reo',
  'Okinawa Praise Pro',
  'Okinawa Ridge+',
  'Pure EV EPluto 7G',
  'Pure EV ETrance Neo',
  'Jitendra EV',
  'Lohia Oma Star',
  'Gemopai Ryder',
  'Gemopai Astrid',
  'Benling Aura',
  'Benling Falcon',
  'Komaki XGT KM',
  'Komaki Ranger',
  'Kabira Mobility KM3000',
  'Kabira Mobility KM4000',
  'Evolet Hawk',
  'Evolet Pony',
  'Detel Easy Plus',
  'Detel Easy',
  'Joy e-bike Monster',
  'Joy e-bike Gen Next',
  'Hero Electric NYX',
  'Hero Electric Photon',
  'BattRE Electric Storie',
  'BattRE Electric Gpsey',
  'Avon E Scooter',
  'Avon E Bike',
  'Yulu Wynn',
  'Yulu Miracle',
  'Bounce Infinity E1',
  'Bounce Infinity E1+',
  'Simple One',
  'Simple Dot One',
  'River Indie',
  'River Indie S',
  'Orxa Mantis',
  'Orxa Energica',
  'Tork Kratos R',
  'Tork Kratos X',
  'Ampere Magnus Pro',
  'Ampere Reo Plus',
  'Okinawa Dual',
  'Okinawa Lite',
  'Pure EV EPluto 7G Pro',
  'Pure EV ETrance Neo Plus',
  'Jitendra EV JMT 1000',
  'Jitendra EV JMT 2000',
  'Lohia Oma Star Plus',
  'Lohia Oma Star Pro',
  'Gemopai Ryder Pro',
  'Gemopai Astrid Pro',
  'Benling Aura Pro',
  'Benling Falcon Pro',
  'Komaki XGT KM Pro',
  'Komaki Ranger Pro',
  'Kabira Mobility KM3000 Pro',
  'Kabira Mobility KM4000 Pro',
  'Evolet Hawk Pro',
  'Evolet Pony Pro',
  'Detel Easy Plus Pro',
  'Detel Easy Pro',
  'Joy e-bike Monster Pro',
  'Joy e-bike Gen Next Pro',
  'Hero Electric NYX Pro',
  'Hero Electric Photon Pro',
  'BattRE Electric Storie Pro',
  'BattRE Electric Gpsey Pro',
  'Avon E Scooter Pro',
  'Avon E Bike Pro',
  'Yulu Wynn Pro',
  'Yulu Miracle Pro',
  'Bounce Infinity E1 Pro',
  'Bounce Infinity E1+ Pro',
  'Simple One Pro',
  'Simple Dot One Pro',
  'River Indie Pro',
  'River Indie S Pro',
  'Orxa Mantis Pro',
  'Orxa Energica Pro',
  
  // Other
  'Other',
];

// Years for selection
const YEARS = Array.from({ length: 10 }, (_, i) => (2024 - i).toString());

const AddVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addVehicle } = useVehicles();
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    model: '',
    year: '',
    licensePlate: '',
    batteryCapacity: '',
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for modals
  const [showModelModal, setShowModelModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModelSelect = () => {
    setShowModelModal(true);
  };

  const handleYearSelect = () => {
    setShowYearModal(true);
  };

  const handleModelSelectConfirm = (model: string) => {
    handleInputChange('model', model);
    setShowModelModal(false);
  };

  const handleYearSelectConfirm = (year: string) => {
    handleInputChange('year', year);
    setShowYearModal(false);
  };

  const handleSaveVehicle = async () => {
    if (!formData.model || !formData.year || !formData.licensePlate || !formData.batteryCapacity) {
      setErrorMessage('Please fill in all fields');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    
    try {
      await addVehicle({
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        batteryCapacity: formData.batteryCapacity,
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to add vehicle. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Vehicle</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content with Keyboard Handling */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Model Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Model</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={handleModelSelect}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.selectInputText,
                  !formData.model && styles.placeholderText
                ]}>
                  {formData.model || 'Select Model'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Year Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={handleYearSelect}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.selectInputText,
                  !formData.year && styles.placeholderText
                ]}>
                  {formData.year || 'Select Year'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* License Plate Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Plate</Text>
              <TextInput
                style={styles.textInput}
                value={formData.licensePlate}
                onChangeText={(value) => handleInputChange('licensePlate', value)}
                placeholder="Enter License Plate"
                placeholderTextColor={COLORS.text.tertiary}
                autoCapitalize="characters"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            {/* Battery Capacity Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Battery Capacity (kWh)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.batteryCapacity}
                onChangeText={(value) => handleInputChange('batteryCapacity', value)}
                placeholder="Enter Battery Capacity"
                placeholderTextColor={COLORS.text.tertiary}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSaveVehicle}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Vehicle'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Model Selection Modal */}
      <Modal
        visible={showModelModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle Model</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModelModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={VEHICLE_MODELS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleModelSelectConfirm(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Year Selection Modal */}
      <Modal
        visible={showYearModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowYearModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={YEARS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleYearSelectConfirm(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Custom Modals */}
      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Vehicle added successfully!"
        options={[{
          text: 'OK',
          onPress: () => {
            setShowSuccessModal(false);
            navigation.goBack();
          },
        }]}
        onClose={() => setShowSuccessModal(false)}
      />

      <CustomModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        options={[{
          text: 'OK',
          onPress: () => setShowErrorModal(false),
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
  keyboardAvoidingView: {
    flex: 1,
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
    paddingBottom: 40, // Extra padding for better keyboard handling
  },
  
  // Form Section
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  selectInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    justifyContent: 'center',
  },
  selectInputText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  placeholderText: {
    color: COLORS.text.tertiary,
  },
  
  // Button Section
  buttonContainer: {
    paddingBottom: 100, // Extra padding to avoid bottom navigation overlap
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
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
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
});

export default AddVehicleScreen;
