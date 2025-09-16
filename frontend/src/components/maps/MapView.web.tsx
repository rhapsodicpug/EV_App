/**
 * Web-compatible Map Component
 * Fallback for react-native-maps on web platform
 */

import React from 'react';
import EnhancedMap from './EnhancedMap';
import { EVStation } from '../../types/api';

interface MapViewProps {
  stations: EVStation[];
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  onStationPress: (station: EVStation) => void;
  onRecenter?: () => void;
}

const MapViewComponent: React.FC<MapViewProps> = ({
  stations,
  currentLocation,
  onStationPress,
}) => {
  return (
    <EnhancedMap
      stations={stations}
      userLocation={currentLocation}
      onStationPress={onStationPress}
      variant="full"
    />
  );
};

export default MapViewComponent;
