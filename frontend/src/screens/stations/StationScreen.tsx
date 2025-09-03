/**
 * Station Screen
 * Displays detailed information about a charging station
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { 
  MapPin, 
  Clock, 
  Zap, 
  Star, 
  Phone, 
  Navigation,
  Calendar,
  Wifi,
  Coffee,
  Car,
  ChevronLeft,
  Bookmark,
  Share,
  AlertCircle
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation, Badge } from '../../design';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { EVStation } from '../../types/api';
import apiService from '../../services/api';

const { width, height } = Dimensions.get('window');

interface StationScreenProps {
  stationId?: string;
  station?: EVStation;
  onBack?: () => void;
  onBook?: (station: EVStation) => void;
}

const StationScreen: React.FC<StationScreenProps> = ({ 
  stationId, 
  station: propStation, 
  onBack,
  onBook 
}) => {
  const { colors } = useThemeColors();
  const [station, setStation] = useState<EVStation | null>(propStation || null);
  const [loading, setLoading] = useState(!propStation);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Animated values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    if (stationId && !propStation) {
      loadStationDetails();
    }
  }, [stationId]);

  const loadStationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stationData = await apiService.getStation(stationId!);
      setStation(stationData);
    } catch (err: any) {
      console.error('Error loading station details:', err);
      setError(err.message || 'Failed to load station details');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!station) return;
    
    Alert.alert(
      'Book Charging Slot',
      `Book a slot at ${station.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            onBook?.(station);
            Alert.alert('Success', 'Booking request sent!');
          }
        }
      ]
    );
  };

  const handleNavigate = () => {
    if (!station) return;
    
    Alert.alert(
      'Navigate to Station',
      `Open navigation to ${station.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Navigate', 
          onPress: () => {
            // In a real app, this would open maps
            Alert.alert('Navigation', 'Opening maps app...');
          }
        }
      ]
    );
  };

  const handleShare = () => {
    if (!station) return;
    
    Alert.alert(
      'Share Station',
      `Share ${station.name} with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            Alert.alert('Share', 'Sharing station details...');
          }
        }
      ]
    );
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Removed from Bookmarks' : 'Added to Bookmarks',
      isBookmarked ? 'Station removed from your bookmarks' : 'Station added to your bookmarks'
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getChargerTypeColor = (type: string) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return Colors.semantic.error;
      case 'DC_FAST':
        return Colors.semantic.warning;
      case 'AC_FAST':
        return Colors.semantic.info;
      case 'AC_SLOW':
        return Colors.semantic.success;
      default:
        return colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading />
      </View>
    );
  }

  if (error || !station) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.text.secondary} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            {error || 'Station not found'}
          </Text>
          <Button 
            title="Retry" 
            onPress={loadStationDetails}
            variant="outline"
            size="small"
          />
        </View>
      </View>
    );
  }

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: 60,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: Spacing.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...Elevation.level1,
    },
    actionButtons: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...Elevation.level1,
    },
    stationName: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text.primary,
      marginBottom: Spacing.xs,
    },
    stationAddress: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: Spacing.sm,
    },
    content: {
      flex: 1,
      padding: Spacing.lg,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: Spacing.md,
    },
    infoRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.sm,
    },
    infoIcon: {
      width: 24,
      height: 24,
      marginRight: Spacing.sm,
      opacity: 0.7,
    },
    infoText: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    slotsContainer: {
      gap: Spacing.sm,
    },
    slotCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Elevation.level1,
    },
    slotHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.sm,
    },
    slotNumber: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    slotDetails: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    slotInfo: {
      flex: 1,
    },
    slotType: {
      fontSize: 14,
      fontWeight: '500' as const,
      marginBottom: 2,
    },
    slotPower: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    slotPrice: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.primary,
    },
    amenitiesContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: Spacing.sm,
    },
    amenityChip: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
    },
    amenityText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500' as const,
    },
    actionButtonsContainer: {
      flexDirection: 'row' as const,
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerTop}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={onBack}
          >
            <ChevronLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={dynamicStyles.actionButtons}>
            <TouchableOpacity 
              style={dynamicStyles.actionButton}
              onPress={toggleBookmark}
            >
              <Bookmark 
                size={20} 
                color={isBookmarked ? colors.primary : colors.text.secondary} 
                fill={isBookmarked ? colors.primary : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.actionButton}
              onPress={handleShare}
            >
              <Share size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={dynamicStyles.stationName}>{station.name}</Text>
        <Text style={dynamicStyles.stationAddress}>{station.address}</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Basic Info */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Station Information</Text>
            
            <View style={dynamicStyles.infoRow}>
              <MapPin size={20} color={colors.text.secondary} style={dynamicStyles.infoIcon} />
              <Text style={dynamicStyles.infoText}>
                {station.city}, {station.state} - {station.pincode}
              </Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Phone size={20} color={colors.text.secondary} style={dynamicStyles.infoIcon} />
              <Text style={dynamicStyles.infoText}>{station.contact_number}</Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Clock size={20} color={colors.text.secondary} style={dynamicStyles.infoIcon} />
              <Text style={dynamicStyles.infoText}>
                {station.is_24_7 ? '24/7 Available' : 'Limited Hours'}
              </Text>
            </View>
          </View>

          {/* Charging Slots */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Available Slots</Text>
            <View style={dynamicStyles.slotsContainer}>
              {station.charging_slots.map((slot, index) => (
                <View key={index} style={dynamicStyles.slotCard}>
                  <View style={dynamicStyles.slotHeader}>
                    <Text style={dynamicStyles.slotNumber}>Slot {slot.slot_number}</Text>
                    <Badge variant={getStatusVariant(slot.status)}>
                      {slot.status}
                    </Badge>
                  </View>
                  <View style={dynamicStyles.slotDetails}>
                    <View style={dynamicStyles.slotInfo}>
                      <Text style={[
                        dynamicStyles.slotType,
                        { color: getChargerTypeColor(slot.charger_type) }
                      ]}>
                        {slot.charger_type.replace('_', ' ')}
                      </Text>
                      <Text style={dynamicStyles.slotPower}>
                        {slot.power_kw} kW • {slot.connector_type}
                      </Text>
                    </View>
                    <Text style={dynamicStyles.slotPrice}>
                      ₹{slot.price_per_kwh}/kWh
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Amenities</Text>
              <View style={dynamicStyles.amenitiesContainer}>
                {station.amenities.map((amenity, index) => (
                  <View key={index} style={dynamicStyles.amenityChip}>
                    <Text style={dynamicStyles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={dynamicStyles.actionButtonsContainer}>
            <Button
              title="Book Slot"
              onPress={handleBook}
              variant="primary"
              style={{ flex: 1 }}
            />
            <Button
              title="Navigate"
              onPress={handleNavigate}
              variant="outline"
              style={{ flex: 1 }}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
});

export default StationScreen;
