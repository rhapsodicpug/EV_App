/**
 * Interactive Map Screen
 * Displays real EV charging stations from OpenChargeMap with navigation functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Dimensions,
  StatusBar,
  BackHandler,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';

import { EVStation, ChargerStatus } from '../../types/api';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Color scheme matching the app design
const MAP_COLORS = {
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
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  available: '#10B981',
  occupied: '#EF4444',
  maintenance: '#F59E0B',
  offline: '#6B7280',
};

// Default location (Mumbai, India)
const DEFAULT_LOCATION = {
  latitude: 19.0760,
  longitude: 72.8777,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface InteractiveMapScreenProps {
  navigation: NavigationProp<any>;
}

const InteractiveMapScreen: React.FC<InteractiveMapScreenProps> = ({ navigation }) => {
  const [stations, setStations] = useState<EVStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<EVStation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Region>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [heatMapMode, setHeatMapMode] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      if (showBottomSheet) {
        setShowBottomSheet(false);
        setSelectedStation(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showBottomSheet]);

  // Initialize map and load stations
  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setLocationError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Using default location.');
        setCurrentLocation(DEFAULT_LOCATION);
        await loadStations(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (location) {
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setCurrentLocation(region);
        await loadStations(location.coords.latitude, location.coords.longitude);
        console.log('✅ Location obtained:', location.coords);
      } else {
        setLocationError('Unable to get current location. Using default location.');
        setCurrentLocation(DEFAULT_LOCATION);
        await loadStations(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setLocationError('Error getting location. Using default location.');
      setCurrentLocation(DEFAULT_LOCATION);
      await loadStations(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStations = async (latitude: number, longitude: number) => {
    try {
      console.log('🔄 Loading stations for location:', { latitude, longitude });
      const response = await apiService.getStationsByLocation(latitude, longitude, 50);
      setStations(response.stations);
      console.log('✅ Loaded stations:', response.stations.length);
    } catch (error) {
      console.error('❌ Error loading stations:', error);
      Alert.alert('Error', 'Failed to load charging stations. Please try again.');
    }
  };

  const handleMarkerPress = (station: EVStation) => {
    setSelectedStation(station);
    setShowBottomSheet(true);
    
    // Animate to station
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleRegionChangeComplete = async (region: Region) => {
    // Load stations for new region
    await loadStations(region.latitude, region.longitude);
  };

  const openNavigation = (latitude: number, longitude: number, stationName: string) => {
    // Create a platform-specific URL scheme
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    // Create the full URL with coordinates and a label for the pin
    const latLng = `${latitude},${longitude}`;
    const label = stationName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    // Try to open the URL
    Linking.openURL(url!).catch(err => {
      console.error('An error occurred opening the map app', err);
      Alert.alert('Error', 'Could not open the map application.');
    });
  };

  const getStationAvailability = (station: EVStation): { available: number; total: number; status: string } => {
    const availableSlots = station.charging_slots.filter(slot => slot.status === 'AVAILABLE');
    const totalSlots = station.charging_slots.length;
    
    let status = 'offline';
    if (totalSlots === 0) {
      status = 'offline';
    } else if (availableSlots.length === 0) {
      status = 'occupied';
    } else if (availableSlots.length <= 2) {
      status = 'warning';
    } else {
      status = 'available';
    }

    return {
      available: availableSlots.length,
      total: totalSlots,
      status,
    };
  };

  const getMarkerColor = (station: EVStation): string => {
    // If heat map mode is active, use density-based colors
    if (heatMapMode) {
      return getDensityColor(station);
    }
    
    // Otherwise use availability-based colors
    const { status } = getStationAvailability(station);
    switch (status) {
      case 'available':
        return MAP_COLORS.available;
      case 'occupied':
        return MAP_COLORS.occupied;
      case 'warning':
        return MAP_COLORS.warning;
      case 'offline':
        return MAP_COLORS.offline;
      default:
        return MAP_COLORS.offline;
    }
  };

  const getDensityColor = (station: EVStation): string => {
    // Calculate how many stations are within 5km of this station
    const stationLat = station.location.coordinates[1];
    const stationLon = station.location.coordinates[0];
    
    const nearbyCount = stations.filter((s) => {
      const lat = s.location.coordinates[1];
      const lon = s.location.coordinates[0];
      const distance = calculateDistance(stationLat, stationLon, lat, lon);
      return distance <= 5; // Within 5km
    }).length;

    // Color coding based on density
    if (nearbyCount >= 8) {
      return '#10B981'; // Green - High density
    } else if (nearbyCount >= 4) {
      return '#F59E0B'; // Orange - Medium density
    } else {
      return '#EF4444'; // Red - Low density
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const renderCustomMarker = (station: EVStation) => {
    const color = getMarkerColor(station);
    const { available, total } = getStationAvailability(station);

    // In heat map mode, show density instead of availability
    if (heatMapMode) {
      const stationLat = station.location.coordinates[1];
      const stationLon = station.location.coordinates[0];
      const nearbyCount = stations.filter((s) => {
        const lat = s.location.coordinates[1];
        const lon = s.location.coordinates[0];
        const distance = calculateDistance(stationLat, stationLon, lat, lon);
        return distance <= 5;
      }).length;

      return (
        <View style={[styles.markerContainer, { backgroundColor: color }]}>
          <Ionicons name="pulse" size={20} color="#FFFFFF" />
          <Text style={styles.markerText}>{nearbyCount}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.markerContainer, { backgroundColor: color }]}>
        <Ionicons name="flash" size={20} color="#FFFFFF" />
        <Text style={styles.markerText}>{available}/{total}</Text>
      </View>
    );
  };

  const renderBottomSheet = () => {
    if (!selectedStation || !showBottomSheet) return null;

    const { available, total, status } = getStationAvailability(selectedStation);
    const statusColor = getMarkerColor(selectedStation);

    return (
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        
        <View style={styles.bottomSheetContent}>
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{selectedStation.name}</Text>
              <Text style={styles.stationAddress}>{selectedStation.address}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowBottomSheet(false);
                setSelectedStation(null);
              }}
            >
              <Ionicons name="close" size={24} color={MAP_COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.stationDetails}>
            <View style={styles.availabilityContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
              <Text style={styles.availabilityText}>
                {available} of {total} slots available
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Ionicons name="time" size={16} color={MAP_COLORS.text.secondary} />
              <Text style={styles.detailText}>
                {selectedStation.is_24_7 ? '24/7 Available' : 'Limited Hours'}
              </Text>
            </View>

            {selectedStation.rating && (
              <View style={styles.detailsRow}>
                <Ionicons name="star" size={16} color={MAP_COLORS.warning} />
                <Text style={styles.detailText}>
                  {selectedStation.rating.toFixed(1)} ({selectedStation.total_reviews} reviews)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => {
                openNavigation(
                  selectedStation.location.coordinates[1],
                  selectedStation.location.coordinates[0],
                  selectedStation.name
                );
              }}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => {
                setShowBottomSheet(false);
                setSelectedStation(null);
                // Navigate to the main app's BookSlot screen via parent navigator
                navigation.getParent()?.navigate('Search', {
                  screen: 'BookSlot',
                  params: { station: selectedStation }
                });
              }}
            >
              <Ionicons name="calendar" size={20} color={MAP_COLORS.accent} />
              <Text style={styles.bookButtonText}>Book Slot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={MAP_COLORS.background} />
        <LinearGradient
          colors={[MAP_COLORS.background, MAP_COLORS.surface]}
          style={styles.loadingGradient}
        >
          <Ionicons name="map" size={60} color={MAP_COLORS.accent} />
          <Text style={styles.loadingText}>Loading Map...</Text>
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={MAP_COLORS.background} />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentLocation}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        customMapStyle={[
          {
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9b76' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }],
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }],
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }],
          },
        ]}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.location.coordinates[1],
              longitude: station.location.coordinates[0],
            }}
            onPress={() => handleMarkerPress(station)}
          >
            {renderCustomMarker(station)}
          </Marker>
        ))}
      </MapView>

      {/* Custom Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={initializeMap}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={24} color={MAP_COLORS.text.primary} />
      </TouchableOpacity>

      {/* Heat Map Toggle Button */}
      <TouchableOpacity
        style={[styles.heatMapButton, heatMapMode && styles.heatMapButtonActive]}
        onPress={() => setHeatMapMode(!heatMapMode)}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={heatMapMode ? "layers" : "layers-outline"} 
          size={24} 
          color={heatMapMode ? '#000' : MAP_COLORS.text.primary} 
        />
      </TouchableOpacity>

      {/* Heat Map Legend */}
      {heatMapMode && (
        <View style={styles.heatMapLegend}>
          <View style={styles.legendHeader}>
            <Ionicons name="layers" size={18} color={MAP_COLORS.accent} />
            <Text style={styles.legendTitle}>Station Density</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>High (8+ nearby)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Medium (4-7 nearby)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Low (&lt;4 nearby)</Text>
          </View>
        </View>
      )}

      {renderBottomSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MAP_COLORS.background,
  },

  map: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: MAP_COLORS.background,
  },

  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: MAP_COLORS.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: MAP_COLORS.text.secondary,
    marginTop: 10,
    textAlign: 'center',
  },

  // Marker Styles
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },

  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: MAP_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: MAP_COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Buffer space to prevent buttons from being hidden by navigation bar
  },

  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  stationInfo: {
    flex: 1,
  },

  stationName: {
    fontSize: 20,
    fontWeight: '700',
    color: MAP_COLORS.text.primary,
    marginBottom: 4,
  },

  stationAddress: {
    fontSize: 14,
    color: MAP_COLORS.text.secondary,
    lineHeight: 20,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MAP_COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stationDetails: {
    marginBottom: 20,
  },

  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  availabilityText: {
    fontSize: 16,
    fontWeight: '600',
    color: MAP_COLORS.text.primary,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailText: {
    fontSize: 14,
    color: MAP_COLORS.text.secondary,
    marginLeft: 8,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAP_COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },

  navigateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MAP_COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },

  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MAP_COLORS.accent,
  },

  // Location Button Styles
  locationButton: {
    position: 'absolute',
    bottom: 120, // Above the bottom navigation bar
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: MAP_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: MAP_COLORS.border,
  },

  heatMapButton: {
    position: 'absolute',
    bottom: 180, // Above the location button
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: MAP_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: MAP_COLORS.border,
  },

  heatMapButtonActive: {
    backgroundColor: MAP_COLORS.accent,
    borderColor: MAP_COLORS.accent,
  },

  heatMapLegend: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: MAP_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: MAP_COLORS.border,
  },

  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MAP_COLORS.text.primary,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },

  legendText: {
    fontSize: 12,
    color: MAP_COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default InteractiveMapScreen;
