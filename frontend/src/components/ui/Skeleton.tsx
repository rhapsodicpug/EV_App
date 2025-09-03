import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const { colors } = useThemeColors();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Station Card Skeleton
export const StationCardSkeleton: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={200} height={20} style={styles.titleSkeleton} />
        <Skeleton width={80} height={16} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={16} style={styles.addressSkeleton} />
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Skeleton width={16} height={16} borderRadius={8} />
          <Skeleton width={120} height={14} style={styles.detailText} />
        </View>
        <View style={styles.detailRow}>
          <Skeleton width={16} height={16} borderRadius={8} />
          <Skeleton width={100} height={14} style={styles.detailText} />
        </View>
      </View>
      <View style={styles.cardActions}>
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <StationCardSkeleton key={index} />
      ))}
    </View>
  );
};

// Map Skeleton
export const MapSkeleton: React.FC = () => {
  const { colors } = useThemeColors();
  
  return (
    <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
      <Skeleton width="100%" height={300} borderRadius={12} />
      <View style={styles.mapOverlay}>
        <Skeleton width={120} height={40} borderRadius={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Elevation.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleSkeleton: {
    marginBottom: Spacing.xs,
  },
  addressSkeleton: {
    marginBottom: Spacing.md,
  },
  cardDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    marginLeft: Spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  listContainer: {
    padding: Spacing.md,
  },
  mapContainer: {
    height: 300,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
});

export default Skeleton;
