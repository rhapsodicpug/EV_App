import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Car,
  ChevronLeft,
  Edit3,
  Battery,
  Zap,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

// Clean Color Palette
const COLORS = {
  background: '#101010',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#00A8FF',
  accentLight: '#4DC3FF',
  success: '#10B981',
};

const PLUG_TYPES = [
  { id: 'ccs', name: 'CCS', description: 'Combined Charging System' },
  { id: 'type2', name: 'Type 2', description: 'European Standard' },
  { id: 'chademo', name: 'CHAdeMO', description: 'Japanese Standard' },
  { id: 'tesla', name: 'Tesla', description: 'Tesla Supercharger' },
];

const MyVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State for vehicle information
  const [vehicleName, setVehicleName] = useState('Tesla Model 3');
  const [batteryCapacity, setBatteryCapacity] = useState('75 kWh');
  const [selectedPlugType, setSelectedPlugType] = useState('ccs');

  const handleEditVehicleName = () => {
    Alert.prompt(
      'Edit Vehicle Name',
      'Enter your vehicle name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (text) => {
            if (text && text.trim()) {
              setVehicleName(text.trim());
            }
          }
        },
      ],
      'plain-text',
      vehicleName
    );
  };

  const handleEditBatteryCapacity = () => {
    Alert.prompt(
      'Edit Battery Capacity',
      'Enter battery capacity (e.g., 75 kWh):',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (text) => {
            if (text && text.trim()) {
              setBatteryCapacity(text.trim());
            }
          }
        },
      ],
      'plain-text',
      batteryCapacity
    );
  };

  const handlePlugTypeSelect = (plugTypeId: string) => {
    setSelectedPlugType(plugTypeId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Vehicle Display Section */}
        <View style={styles.vehicleSection}>
          <View style={styles.vehicleIconContainer}>
            <Car size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.vehicleName}>{vehicleName}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditVehicleName}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color={COLORS.accent} />
            <Text style={styles.editButtonText}>Edit Name</Text>
          </TouchableOpacity>
        </View>

        {/* Battery Capacity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battery Capacity</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleEditBatteryCapacity}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Battery size={20} color={COLORS.text.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Capacity</Text>
              <Text style={styles.settingValue}>{batteryCapacity}</Text>
            </View>
            <ChevronLeft size={16} color={COLORS.text.tertiary} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Default Plug Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Plug Type</Text>
          <Text style={styles.sectionSubtitle}>Select your vehicle's primary charging connector</Text>
          
          <View style={styles.plugTypeContainer}>
            {PLUG_TYPES.map((plugType) => (
              <TouchableOpacity
                key={plugType.id}
                style={[
                  styles.plugTypeOption,
                  selectedPlugType === plugType.id && styles.plugTypeSelected,
                ]}
                onPress={() => handlePlugTypeSelect(plugType.id)}
                activeOpacity={0.7}
              >
                <View style={styles.plugTypeIcon}>
                  <Zap size={20} color={selectedPlugType === plugType.id ? COLORS.accent : COLORS.text.secondary} />
                </View>
                <View style={styles.plugTypeContent}>
                  <Text style={[
                    styles.plugTypeName,
                    selectedPlugType === plugType.id && styles.plugTypeNameSelected,
                  ]}>
                    {plugType.name}
                  </Text>
                  <Text style={[
                    styles.plugTypeDescription,
                    selectedPlugType === plugType.id && styles.plugTypeDescriptionSelected,
                  ]}>
                    {plugType.description}
                  </Text>
                </View>
                {selectedPlugType === plugType.id && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Vehicle Information</Text>
          <Text style={styles.infoText}>
            This information helps us find compatible charging stations and optimize your charging experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Premium Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Vehicle Section
  vehicleSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  vehicleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.accent + '20',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginLeft: 8,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  chevron: {
    transform: [{ rotate: '180deg' }],
  },

  // Plug Type Options
  plugTypeContainer: {
    gap: 12,
  },
  plugTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border.subtle,
  },
  plugTypeSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  plugTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  plugTypeContent: {
    flex: 1,
  },
  plugTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  plugTypeNameSelected: {
    color: COLORS.accent,
  },
  plugTypeDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  plugTypeDescriptionSelected: {
    color: COLORS.text.secondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },

  // Info Section
  infoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceLight + '50',
    borderRadius: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default MyVehicleScreen;