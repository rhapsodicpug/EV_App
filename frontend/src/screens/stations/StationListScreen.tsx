/**
 * Station List Screen
 * Displays list of charging stations with dynamic header
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Zap,
  Star,
  ChevronRight,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation, Badge } from '../../design';
import StationCard from '../../components/custom/StationCard';
import { EVStation } from '../../types/api';
import apiService from '../../services/api';

const StationListScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const navigation = useNavigation();
  const [stations, setStations] = useState<EVStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animated values
  const scrollY = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadStations();
    // Animate on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStations();

      // Handle both { stations: [...], count: n } and direct array formats
      const stationData = response.stations || (Array.isArray(response) ? response : []);

      setStations(stationData);
    } catch (err: any) {
      console.error('Error loading stations:', err);
      setError(err.message || 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleStationPress = (station: EVStation) => {
    console.log('Station pressed:', station.name, station.id);
    try {
      (navigation as any).navigate('StationDetail', { stationId: station.id });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Search pressed');
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log('Filter pressed');
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

  const dynamicStyles = {
    container: {
      backgroundColor: '#121212',
      flex: 1,
    },
    content: {
      padding: Spacing.lg,
      paddingTop: 120, // Space for dynamic header
    },
    stationCard: {
      marginBottom: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#1a1a1a',
      ...Elevation.level2,
    },
    stationHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: Spacing.sm,
    },
    stationName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#ffffff',
      flex: 1,
    },
    stationAddress: {
      fontSize: 14,
      color: '#666666',
      marginTop: 2,
    },
    stationDetails: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.sm,
    },
    stationDetail: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginRight: Spacing.md,
    },
    stationDetailText: {
      fontSize: 12,
      color: '#666666',
      marginLeft: Spacing.xs,
    },
    emptyState: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: Spacing.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center' as const,
      marginTop: Spacing.md,
    },
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ffffff', fontSize: 18 }}>Loading stations...</Text>
      </View>
    );
  }



  return (
    <View style={dynamicStyles.container}>
      {/* Header matching login screen theme */}
      <View style={{
        backgroundColor: '#121212',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 4,
        }}>
          Charging Stations
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#666666',
        }}>
          {stations.length} stations found
        </Text>
      </View>



      {/* Stations List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >


        <View style={{ padding: 16 }}>

          {error ? (
            <View style={dynamicStyles.emptyState}>
              <AlertCircle size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.emptyStateText}>{error}</Text>
            </View>
          ) : stations.length > 0 ? (
            <>
              {stations.map((station, index) => (
                <StationCard
                  key={station.id || index}
                  station={station}
                  onPress={handleStationPress}
                  showDistance={true}
                  distance={Math.random() * 10 + 1} // Mock distance for now
                  showRating={true}
                  variant="default"
                />
              ))}
            </>
          ) : (
            <View style={dynamicStyles.emptyState}>
              <MapPin size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.emptyStateText}>
                No stations found nearby
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  export default StationListScreen;
