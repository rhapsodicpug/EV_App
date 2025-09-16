/**
 * Enhanced Station Card Component
 * Inspired by Tesla Supercharger and ChargePoint designs
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { 
  MapPin, 
  Zap, 
  Clock, 
  Star, 
  ChevronRight,
  Wifi,
  Coffee,
  Car,
  Battery,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation, Badge } from '../../design';
import { EVStation } from '../../types/api';

const { width } = Dimensions.get('window');

interface StationCardProps {
  station: EVStation;
  onPress: (station: EVStation) => void;
  showDistance?: boolean;
  distance?: number;
  showRating?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  onPress,
  showDistance = true,
  distance,
  showRating = true,
  variant = 'default',
}) => {
  const { colors } = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const getChargerTypeIcon = (type: string) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return { icon: Battery, color: Colors.semantic.success, label: 'Ultra Fast' };
      case 'DC_FAST':
        return { icon: Zap, color: Colors.semantic.warning, label: 'Fast' };
      case 'AC_FAST':
        return { icon: Battery, color: colors.primary, label: 'AC Fast' };
      default:
        return { icon: Battery, color: colors.text.secondary, label: 'Standard' };
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return Wifi;
      case 'coffee':
      case 'café':
        return Coffee;
      case 'parking':
        return Car;
      default:
        return MapPin;
    }
  };

  const statusInfo = getStationStatus();
  const fastestCharger = station.charging_slots.reduce((fastest, slot) => 
    slot.power_kw > fastest.power_kw ? slot : fastest
  );
  const chargerInfo = getChargerTypeIcon(fastestCharger.charger_type);

  const dynamicStyles = {
    container: {
      backgroundColor: '#1a1a1a',
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      ...Elevation.level2,
      ...(variant === 'featured' && {
        borderWidth: 2,
        borderColor: '#00A8FF',
        ...Elevation.level3,
      }),
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      padding: Spacing.lg,
      paddingBottom: Spacing.sm,
    },
    titleSection: {
      flex: 1,
    },
    stationName: {
      fontSize: variant === 'compact' ? 16 : 18,
      fontWeight: '600' as const,
      color: '#ffffff',
      marginBottom: 4,
    },
    stationAddress: {
      fontSize: 14,
      color: '#666666',
      marginBottom: 4,
    },
    statusBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: statusInfo.color + '20',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: statusInfo.color,
      marginLeft: 4,
    },
    detailsSection: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    detailsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.sm,
    },
    detailItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
    },
    detailText: {
      fontSize: 14,
      color: '#666666',
      marginLeft: Spacing.xs,
    },
    chargerInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: chargerInfo.color + '20',
    },
    chargerText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: chargerInfo.color,
      marginLeft: 4,
    },
    amenitiesSection: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: '#333333',
    },
    amenityIcon: {
      marginRight: Spacing.sm,
      padding: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: '#00A8FF20',
    },
    priceSection: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.sm,
    },
    priceText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#ffffff',
    },
    distanceText: {
      fontSize: 14,
      color: '#666666',
    },
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress(station)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchableContainer}
      >
        <BlurView
          style={dynamicStyles.container}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(26, 26, 26, 0.8)"
        >
        {/* Header Section */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.titleSection}>
            <Text style={dynamicStyles.stationName} numberOfLines={1}>
              {station.name}
            </Text>
            <Text style={dynamicStyles.stationAddress} numberOfLines={1}>
              {station.address}
            </Text>
            {showDistance && distance && (
              <Text style={dynamicStyles.distanceText}>
                {distance.toFixed(1)} km away
              </Text>
            )}
          </View>
          
          <View style={dynamicStyles.statusBadge}>
            <statusInfo.icon size={14} color={statusInfo.color} />
            <Text style={dynamicStyles.statusText}>
              {statusInfo.status}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={dynamicStyles.detailsSection}>
          {/* Charging Info Row */}
          <View style={dynamicStyles.detailsRow}>
            <View style={dynamicStyles.detailItem}>
              <Clock size={16} color={colors.text.secondary} />
              <Text style={dynamicStyles.detailText}>
                {station.is_24_7 ? '24/7' : 'Limited Hours'}
              </Text>
            </View>
            
            <View style={dynamicStyles.chargerInfo}>
              <chargerInfo.icon size={14} color={chargerInfo.color} />
              <Text style={dynamicStyles.chargerText}>
                {chargerInfo.label} • {fastestCharger.power_kw}kW
              </Text>
            </View>
          </View>

          {/* Slots Info Row */}
          <View style={dynamicStyles.detailsRow}>
            <View style={dynamicStyles.detailItem}>
              <Zap size={16} color={colors.text.secondary} />
              <Text style={dynamicStyles.detailText}>
                {station.charging_slots.length} charging slots
              </Text>
            </View>
            
            <View style={dynamicStyles.detailItem}>
              <Text style={dynamicStyles.priceText}>
                ₹{fastestCharger.price_per_kwh}/kWh
              </Text>
            </View>
          </View>

          {/* Amenities Section */}
          {station.amenities && station.amenities.length > 0 && (
            <View style={dynamicStyles.amenitiesSection}>
              {station.amenities.slice(0, 3).map((amenity, index) => {
                const AmenityIcon = getAmenityIcon(amenity);
                return (
                  <View key={index} style={dynamicStyles.amenityIcon}>
                    <AmenityIcon size={16} color={colors.primary} />
                  </View>
                );
              })}
              {station.amenities.length > 3 && (
                <Text style={dynamicStyles.detailText}>
                  +{station.amenities.length - 3} more
                </Text>
              )}
            </View>
          )}

          {/* Rating Section */}
          {showRating && station.rating && (
            <View style={dynamicStyles.detailsRow}>
              <View style={dynamicStyles.detailItem}>
                <Star size={16} color={Colors.semantic.warning} />
                <Text style={dynamicStyles.detailText}>
                  {station.rating} ({station.total_reviews} reviews)
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Indicator */}
        <View style={{
          position: 'absolute',
          right: Spacing.md,
          top: '50%',
          transform: [{ translateY: -10 }],
        }}>
          <ChevronRight size={20} color={colors.text.secondary} />
        </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
});

export default StationCard;
