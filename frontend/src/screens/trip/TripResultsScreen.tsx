import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Zap,
  Navigation,
  Battery,
  TrendingUp,
  TrendingDown,
  Minus,
  Map,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MumbaiLocation } from '../../constants/mumbaiLocations';
import { TripPlan, StationWithDistance, tripPlannerService } from '../../services/TripPlannerService';
import { tripStorageService, SavedTrip } from '../../services/TripStorageService';
import { EVStation } from '../../types/api';
import api from '../../services/api';
import * as Haptics from 'expo-haptics';

type TripResultsScreenRouteProp = RouteProp<
  { TripResults: { tripPlan: TripPlan } },
  'TripResults'
>;

const TripResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TripResultsScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const { tripPlan } = route.params;

  const [stationsAlongRoute, setStationsAlongRoute] = useState<StationWithDistance[]>([]);
  const [allStations, setAllStations] = useState<EVStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedTrip, setSavedTrip] = useState<SavedTrip | null>(null);

  useEffect(() => {
    loadStations();
    saveCurrentTrip();
  }, []);

  const saveCurrentTrip = async () => {
    try {
      const saved = await tripStorageService.saveTrip(tripPlan);
      setSavedTrip(saved);
      console.log('✅ Trip automatically saved:', saved.id);
    } catch (error) {
      console.error('Failed to save trip:', error);
    }
  };

  const loadStations = async () => {
    try {
      setIsLoading(true);
      // Fetch stations from API
      const response = await api.getNearbyStations({
        latitude: (tripPlan.startLocation.lat + tripPlan.endLocation.lat) / 2,
        longitude: (tripPlan.startLocation.lng + tripPlan.endLocation.lng) / 2,
        max_distance_km: 50, // Large radius to get all stations
      });

      const stations = response.stations.map((station: any) => ({
        ...station,
        latitude: station.location?.coordinates?.[1] || 0,
        longitude: station.location?.coordinates?.[0] || 0,
      }));

      setAllStations(stations);

      // Find stations along the route
      const routeStations = tripPlannerService.findStationsAlongRoute(
        tripPlan.startLocation,
        tripPlan.endLocation,
        stations,
        5 // 5 km from route
      );

      setStationsAlongRoute(routeStations);
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleBookStation = (station: EVStation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // @ts-ignore - Navigation types might not be fully defined
    navigation.navigate('BookSlot', { station });
  };

  const handleViewOnMap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (savedTrip) {
      // Navigate to Map screen with the saved trip
      (navigation as any).navigate('Map', { 
        screen: 'InteractiveMap',
        params: { tripId: savedTrip.id }
      });
    }
  };

  const renderBatteryCard = () => {
    const { lowTraffic, mediumTraffic, highTraffic } = tripPlan.batteryConsumption;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Battery Consumption</Text>
        <Text style={styles.sectionSubtitle}>Estimates based on traffic conditions</Text>

        {/* Low Traffic */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.batteryCard}
        >
          <View style={styles.batteryHeader}>
            <View style={styles.batteryIconContainer}>
              <TrendingDown size={18} color="#22C55E" />
            </View>
            <View style={styles.batteryInfo}>
              <Text style={styles.trafficLabel}>Low Traffic</Text>
              <Text style={styles.trafficDesc}>{lowTraffic.description}</Text>
            </View>
          </View>
          <View style={styles.batteryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-{lowTraffic.percentage}%</Text>
              <Text style={styles.statLabel}>Battery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lowTraffic.kWh} kWh</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Medium Traffic */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.batteryCard}
        >
          <View style={styles.batteryHeader}>
            <View style={[styles.batteryIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Minus size={18} color="#F59E0B" />
            </View>
            <View style={styles.batteryInfo}>
              <Text style={styles.trafficLabel}>Medium Traffic</Text>
              <Text style={styles.trafficDesc}>{mediumTraffic.description}</Text>
            </View>
          </View>
          <View style={styles.batteryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-{mediumTraffic.percentage}%</Text>
              <Text style={styles.statLabel}>Battery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mediumTraffic.kWh} kWh</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>
        </LinearGradient>

        {/* High Traffic */}
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.batteryCard}
        >
          <View style={styles.batteryHeader}>
            <View style={[styles.batteryIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <TrendingUp size={18} color="#EF4444" />
            </View>
            <View style={styles.batteryInfo}>
              <Text style={styles.trafficLabel}>High Traffic</Text>
              <Text style={styles.trafficDesc}>{highTraffic.description}</Text>
            </View>
          </View>
          <View style={styles.batteryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-{highTraffic.percentage}%</Text>
              <Text style={styles.statLabel}>Battery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{highTraffic.kWh} kWh</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderStationCard = (item: StationWithDistance) => {
    const { station, distanceFromRoute, distanceFromStart } = item;
    const availableSlots = station.charging_slots?.filter((slot: any) => slot.status === 'AVAILABLE').length || 0;

    return (
      <LinearGradient
        key={station.id}
        colors={['rgba(42, 42, 42, 0.6)', 'rgba(32, 32, 32, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stationCard}
      >
        <View style={styles.stationHeader}>
          <View style={styles.stationIconContainer}>
            <Zap size={20} color="#8cd279" />
          </View>
          <View style={styles.stationInfo}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationAddress} numberOfLines={1}>
              {station.address}
            </Text>
          </View>
        </View>

        <View style={styles.stationDetails}>
          <View style={styles.detailRow}>
            <Navigation size={14} color="#B0B0B0" />
            <Text style={styles.detailText}>{distanceFromStart} km from start</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#B0B0B0" />
            <Text style={styles.detailText}>{distanceFromRoute} km from route</Text>
          </View>
          <View style={styles.detailRow}>
            <Battery size={14} color="#8cd279" />
            <Text style={styles.detailText}>{availableSlots} slots available</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => handleBookStation(station)}>
          <LinearGradient
            colors={['#8cd279', '#6bb05f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Plan</Text>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={handleViewOnMap}
          disabled={!savedTrip}
        >
          <Map size={22} color={savedTrip ? "#8cd279" : "#666666"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8cd279" />}
      >
        {/* Route Summary */}
        <LinearGradient
          colors={['rgba(140, 210, 121, 0.2)', 'rgba(140, 210, 121, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.routeCard}
        >
          <View style={styles.routeRow}>
            <MapPin size={20} color="#8cd279" />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeText}>{tripPlan.startLocation.name}</Text>
              <Text style={styles.routeArea}>{tripPlan.startLocation.area}</Text>
            </View>
          </View>

          <View style={styles.routeDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerIcon}>
              <Navigation size={16} color="#8cd279" />
            </View>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.routeRow}>
            <MapPin size={20} color="#EF4444" />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeText}>{tripPlan.endLocation.name}</Text>
              <Text style={styles.routeArea}>{tripPlan.endLocation.area}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Navigation size={18} color="#8cd279" />
              <Text style={styles.statBoxValue}>{tripPlan.distance} km</Text>
              <Text style={styles.statBoxLabel}>Distance</Text>
            </View>
            <View style={styles.statBoxDivider} />
            <View style={styles.statBox}>
              <Clock size={18} color="#8cd279" />
              <Text style={styles.statBoxValue}>{tripPlan.estimatedTime} min</Text>
              <Text style={styles.statBoxLabel}>Est. Time</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Battery Consumption */}
        {renderBatteryCard()}

        {/* Charging Stations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Charging Stations En Route</Text>
          <Text style={styles.sectionSubtitle}>
            {stationsAlongRoute.length} stations within 5 km of your route
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading stations...</Text>
            </View>
          ) : stationsAlongRoute.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Zap size={48} color="#666666" />
              <Text style={styles.emptyTitle}>No Stations Found</Text>
              <Text style={styles.emptySubtitle}>
                No charging stations available along this route. Consider planning an alternative route.
              </Text>
            </View>
          ) : (
            stationsAlongRoute.map(renderStationCard)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  routeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(140, 210, 121, 0.2)',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  routeArea: {
    fontSize: 13,
    color: '#666666',
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginLeft: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(140, 210, 121, 0.3)',
  },
  dividerIcon: {
    marginHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  statBoxDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 16,
  },
  batteryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  batteryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  batteryInfo: {
    flex: 1,
  },
  trafficLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trafficDesc: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  batteryStats: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  stationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(140, 210, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  stationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#B0B0B0',
    marginLeft: 8,
  },
  bookButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default TripResultsScreen;

