/**
 * Premium Google Maps Component
 * Features: Dark theme, custom markers, callouts, clustering-ready
 */

import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Zap } from 'lucide-react-native';
import { EVStation } from '../../types/api';
import { MAP_CONFIG } from '../../constants/config';

interface MapViewProps {
  stations: EVStation[];
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  onStationPress: (station: EVStation) => void;
  onRecenter?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dark map styling for Google Maps
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#746855"}]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#d59563"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#d59563"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#38414e"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#212a37"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#746855"}]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{"color": "#2f3948"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#17263c"}]
  }
];

const MapViewComponent: React.FC<MapViewProps> = ({
  stations,
  currentLocation,
  onStationPress,
}) => {
  const mapRef = useRef<MapView>(null);

  // Helper functions
  const getStationStatus = (station: EVStation) => {
    const availableSlots = station.charging_slots.filter(slot => slot.status === 'AVAILABLE');
    if (availableSlots.length === 0) return 'FULL';
    if (availableSlots.length <= 2) return 'LIMITED';
    return 'AVAILABLE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return MAP_CONFIG.MARKER_COLORS.AVAILABLE;
      case 'LIMITED': return MAP_CONFIG.MARKER_COLORS.MAINTENANCE;
      case 'FULL': return MAP_CONFIG.MARKER_COLORS.OCCUPIED;
      default: return MAP_CONFIG.MARKER_COLORS.OFFLINE;
    }
  };

  // Get initial region based on current location or default
  const getInitialRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return MAP_CONFIG.DEFAULT_REGION;
  };

  // Handle marker press
  const handleMarkerPress = (station: EVStation) => {
    onStationPress(station);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        rotateEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Station Markers */}
        {stations.map((station) => {
          const status = getStationStatus(station);
          const statusColor = getStatusColor(status);
          const availableSlots = station.charging_slots.filter(slot => slot.status === 'AVAILABLE').length;
          const totalSlots = station.charging_slots.length;

          return (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.location.coordinates[1],
                longitude: station.location.coordinates[0],
              }}
              onPress={() => handleMarkerPress(station)}
              tracksViewChanges={false}
            >
              {/* Custom Marker View */}
              <View style={styles.customMarkerContainer}>
                {/* Outer ring with status color */}
                <View style={[styles.markerOuterRing, { borderColor: statusColor }]}>
                  {/* Inner circle */}
                  <View style={[styles.markerInnerCircle, { backgroundColor: statusColor + '40' }]}>
                    {/* Lightning bolt icon */}
                    <Zap size={14} color={statusColor} />
                  </View>
                </View>

                {/* Availability indicator */}
                <View style={[styles.availabilityBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.availabilityText}>
                    {availableSlots}/{totalSlots}
                  </Text>
                </View>
              </View>

              {/* Callout with station info */}
              <Callout tooltip={true}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{station.name}</Text>
                  <Text style={styles.calloutAddress}>{station.address}</Text>
                  <Text style={[styles.calloutStatus, { color: statusColor }]}>
                    {availableSlots} of {totalSlots} available
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarkerContainer: {
    alignItems: 'center',
  },
  markerOuterRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerInnerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  calloutContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  calloutStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MapViewComponent;
