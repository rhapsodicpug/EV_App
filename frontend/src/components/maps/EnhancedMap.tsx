/**
 * Enhanced Map Component with Custom Markers and Clustering
 * Interactive map with station status and route planning
 * Fallback version without react-native-maps to avoid Turbo module issues
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { 
  MapPin, 
  Zap, 
  Battery, 
  Navigation,
  Star,
  Clock,
  Wifi,
  Coffee,
  Car,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Share,
  Bookmark,
  Phone,
  Calendar
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';
import { EVStation } from '../../types/api';

const { width, height } = Dimensions.get('window');

interface MapMarkerProps {
  station: EVStation;
  onPress: (station: EVStation) => void;
  isSelected?: boolean;
  showStatus?: boolean;
}

interface EnhancedMapProps {
  stations: EVStation[];
  userLocation?: { latitude: number; longitude: number };
  onStationPress: (station: EVStation) => void;
  onMapPress?: () => void;
  showClusters?: boolean;
  showRoute?: boolean;
  selectedStation?: EVStation;
  variant?: 'default' | 'compact' | 'full';
}

const MapMarker: React.FC<MapMarkerProps> = ({
  station,
  onPress,
  isSelected = false,
  showStatus = true,
}) => {
  const { colors } = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      // Pulse animation for selected marker
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getStationStatus = () => {
    const availableSlots = station.charging_slots.filter(slot => slot.status === 'AVAILABLE');
    if (availableSlots.length === 0) return { status: 'FULL', color: Colors.semantic.error, icon: XCircle };
    if (availableSlots.length <= 2) return { status: 'LIMITED', color: Colors.semantic.warning, icon: AlertCircle };
    return { status: 'AVAILABLE', color: Colors.semantic.success, icon: CheckCircle };
  };

  const getChargerTypeColor = (type: string) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return Colors.semantic.success;
      case 'DC_FAST':
        return Colors.semantic.warning;
      case 'AC_FAST':
        return colors.primary;
      default:
        return colors.text.secondary;
    }
  };

  const statusInfo = getStationStatus();
  const fastestCharger = station.charging_slots.reduce((fastest, slot) => 
    slot.power_kw > fastest.power_kw ? slot : fastest
  );
  const chargerColor = getChargerTypeColor(fastestCharger.charger_type);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={{
          width: isSelected ? 50 : 40,
          height: isSelected ? 50 : 40,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.surface,
          borderWidth: 3,
          borderColor: isSelected ? colors.primary : chargerColor,
          alignItems: 'center',
          justifyContent: 'center',
          ...Elevation.level3,
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(station)}
        activeOpacity={0.8}
      >
        <Battery size={isSelected ? 24 : 20} color={chargerColor} />
      </TouchableOpacity>

      {showStatus && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: statusInfo.color,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.surface,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <statusInfo.icon size={8} color={Colors.neutral.white} />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const EnhancedMap: React.FC<EnhancedMapProps> = ({
  stations,
  userLocation,
  onStationPress,
  onMapPress,
  showClusters = true,
  showRoute = false,
  selectedStation,
  variant = 'default',
}) => {
  const { colors } = useThemeColors();

  const handleStationPress = (station: EVStation) => {
    onStationPress(station);
  };

  const handleNavigate = (station: EVStation) => {
    Alert.alert(
      'Navigate to Station',
      `Open navigation to ${station.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Navigate', 
          onPress: () => {
            // Implement navigation logic
            console.log('Navigating to:', station.name);
          }
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fallback Map View - Station List */}
      <View style={{
        position: 'absolute',
        top: Spacing.lg,
        right: Spacing.lg,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: BorderRadius.full,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.sm,
            ...Elevation.level3,
          }}
          onPress={() => {
            // Center on user location
            console.log('Center on user location');
          }}
        >
          <MapPin size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: BorderRadius.full,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            ...Elevation.level3,
          }}
          onPress={() => {
            // Toggle cluster view
            console.log('Toggle clusters');
          }}
        >
          <Battery size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Station List View */}
      <ScrollView 
        style={{ flex: 1, paddingTop: 100, paddingHorizontal: Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: Spacing.lg,
          textAlign: 'center',
        }}>
          Nearby Charging Stations
        </Text>

        {stations.map((station, index) => (
          <TouchableOpacity
            key={station.id || index}
            style={{
              backgroundColor: colors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.md,
              ...Elevation.level2,
            }}
            onPress={() => handleStationPress(station)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MapMarker
                station={station}
                onPress={handleStationPress}
                isSelected={selectedStation?.id === station.id}
                showStatus={true}
              />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}>
                  {station.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                  {station.address}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Zap size={16} color={colors.primary} />
                <Text style={{ fontSize: 14, color: colors.text.secondary, marginLeft: Spacing.xs }}>
                  {station.charging_slots.length} slots
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Star size={16} color={Colors.semantic.warning} />
                <Text style={{ fontSize: 14, color: colors.text.secondary, marginLeft: Spacing.xs }}>
                  {station.rating || 4.5}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.xs,
                  borderRadius: BorderRadius.sm,
                  backgroundColor: colors.primary + '20',
                }}
                onPress={() => handleNavigate(station)}
              >
                <Navigation size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.primary, marginLeft: Spacing.xs }}>
                  Navigate
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={{
        position: 'absolute',
        bottom: Spacing.lg,
        left: Spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        ...Elevation.level3,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: Spacing.sm }}>
          Station Status
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.semantic.success, marginRight: Spacing.xs }} />
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Available</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.semantic.warning, marginRight: Spacing.xs }} />
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Limited</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.semantic.error, marginRight: Spacing.xs }} />
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Full</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EnhancedMap;
