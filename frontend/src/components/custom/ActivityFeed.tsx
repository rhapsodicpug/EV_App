/**
 * Enhanced Recent Activity Feed Component
 * Real-time activity feed with rich interactions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { 
  Zap, 
  MapPin, 
  Clock, 
  Star, 
  Battery,
  Calendar,
  Bookmark,
  Share,
  MessageCircle,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

const { width } = Dimensions.get('window');

interface ActivityItem {
  id: string;
  type: 'booking' | 'review' | 'favorite' | 'visit' | 'payment' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  action?: string;
  onPress?: () => void;
  isRead?: boolean;
  metadata?: {
    stationName?: string;
    amount?: number;
    rating?: number;
    status?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'full';
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
  showActions = true,
  variant = 'detailed',
  onRefresh,
  refreshing = false,
}) => {
  const { colors } = useThemeColors();
  const fadeAnims = React.useRef(activities.map(() => new Animated.Value(0))).current;
  const scaleAnims = React.useRef(activities.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Staggered animation for activity items
    const animations = activities.slice(0, maxItems).map((_, index) =>
      Animated.timing(fadeAnims[index], {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [activities]);

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return Colors.semantic.success;
      case 'active':
        return Colors.semantic.warning;
      case 'cancelled':
        return Colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'active':
        return Battery;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...Elevation.level2,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    viewAllButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    viewAllText: {
      fontSize: 14,
      color: colors.primary,
      marginRight: Spacing.xs,
    },
    activityItem: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: Spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 2,
    },
    activityMessage: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: Spacing.xs,
    },
    activityMetadata: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.xs,
    },
    metadataItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginRight: Spacing.md,
    },
    metadataText: {
      fontSize: 11,
      color: colors.text.secondary,
      marginLeft: Spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600' as const,
      marginLeft: Spacing.xs,
    },
    actionButtons: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: Spacing.sm,
    },
    actionButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      marginRight: Spacing.sm,
    },
    actionText: {
      fontSize: 11,
      marginLeft: Spacing.xs,
    },
    unreadIndicator: {
      position: 'absolute' as const,
      top: Spacing.sm,
      right: Spacing.sm,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Recent Activity</Text>
        <TouchableOpacity style={dynamicStyles.viewAllButton}>
          <Text style={dynamicStyles.viewAllText}>View All</Text>
          <TrendingUp size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {displayedActivities.map((activity, index) => {
        const StatusIcon = getStatusIcon(activity.metadata?.status);
        const statusColor = getStatusColor(activity.metadata?.status);

        return (
          <Animated.View
            key={activity.id}
            style={{
              opacity: fadeAnims[index],
              transform: [{ scale: scaleAnims[index] }],
            }}
          >
            <TouchableOpacity
              style={dynamicStyles.activityItem}
              onPress={activity.onPress}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              activeOpacity={0.8}
            >
              {!activity.isRead && (
                <View style={dynamicStyles.unreadIndicator} />
              )}

              <View style={[
                dynamicStyles.activityIcon,
                { backgroundColor: activity.color + '20' }
              ]}>
                <activity.icon size={20} color={activity.color} />
              </View>

              <View style={dynamicStyles.activityContent}>
                <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                <Text style={dynamicStyles.activityMessage}>{activity.message}</Text>

                {variant !== 'compact' && activity.metadata && (
                  <View style={dynamicStyles.activityMetadata}>
                    {activity.metadata.stationName && (
                      <View style={dynamicStyles.metadataItem}>
                        <MapPin size={10} color={colors.text.secondary} />
                        <Text style={dynamicStyles.metadataText}>
                          {activity.metadata.stationName}
                        </Text>
                      </View>
                    )}

                    {activity.metadata.amount && (
                      <View style={dynamicStyles.metadataItem}>
                        <Zap size={10} color={colors.text.secondary} />
                        <Text style={dynamicStyles.metadataText}>
                          ₹{activity.metadata.amount}
                        </Text>
                      </View>
                    )}

                    {activity.metadata.rating && (
                      <View style={dynamicStyles.metadataItem}>
                        <Star size={10} color={Colors.semantic.warning} />
                        <Text style={dynamicStyles.metadataText}>
                          {activity.metadata.rating}
                        </Text>
                      </View>
                    )}

                    {activity.metadata.status && (
                      <View style={[
                        dynamicStyles.statusBadge,
                        { backgroundColor: statusColor + '20' }
                      ]}>
                        <StatusIcon size={10} color={statusColor} />
                        <Text style={[
                          dynamicStyles.statusText,
                          { color: statusColor }
                        ]}>
                          {activity.metadata.status}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {showActions && variant === 'full' && (
                  <View style={dynamicStyles.actionButtons}>
                    <TouchableOpacity style={[
                      dynamicStyles.actionButton,
                      { backgroundColor: colors.primary + '20' }
                    ]}>
                      <MessageCircle size={12} color={colors.primary} />
                      <Text style={[
                        dynamicStyles.actionText,
                        { color: colors.primary }
                      ]}>
                        Reply
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[
                      dynamicStyles.actionButton,
                      { backgroundColor: colors.secondary + '20' }
                    ]}>
                      <Share size={12} color={colors.secondary} />
                      <Text style={[
                        dynamicStyles.actionText,
                        { color: colors.secondary }
                      ]}>
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={dynamicStyles.metadataText}>{activity.timestamp}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

// Mock activity data generator
export const generateMockActivities = (): ActivityItem[] => [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your charging session at Bandra Station has been confirmed',
    timestamp: '2 min ago',
    icon: CheckCircle,
    color: Colors.semantic.success,
    isRead: false,
    metadata: {
      stationName: 'Bandra Station',
      amount: 150,
      status: 'confirmed',
    },
  },
  {
    id: '2',
    type: 'review',
    title: 'Review Posted',
    message: 'You rated Andheri Station 5 stars',
    timestamp: '1 hour ago',
    icon: Star,
    color: Colors.semantic.warning,
    metadata: {
      stationName: 'Andheri Station',
      rating: 5,
    },
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Completed',
    message: 'Charging session payment of ₹120 completed',
    timestamp: '3 hours ago',
    icon: Zap,
    color: Colors.primary[500],
    metadata: {
      amount: 120,
      status: 'completed',
    },
  },
  {
    id: '4',
    type: 'favorite',
    title: 'Station Added to Favorites',
    message: 'Juhu Beach Station added to your favorites',
    timestamp: '1 day ago',
    icon: Bookmark,
    color: Colors.secondary[500],
    metadata: {
      stationName: 'Juhu Beach Station',
    },
  },
  {
    id: '5',
    type: 'alert',
    title: 'Low Battery Alert',
    message: 'Your vehicle battery is below 20%',
    timestamp: '2 days ago',
    icon: AlertCircle,
    color: Colors.semantic.error,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ActivityFeed;
