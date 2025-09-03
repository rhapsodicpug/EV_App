/**
 * Modern Quick Actions Component
 * Inspired by Tesla Supercharger and PlugShare designs
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
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock,
  Zap,
  Navigation,
  Bookmark,
  Share,
  Phone,
  Calendar,
  Settings
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  variant?: 'grid' | 'horizontal' | 'compact';
  showLabels?: boolean;
  columns?: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  variant = 'grid',
  showLabels = true,
  columns = 2,
}) => {
  const { colors } = useThemeColors();
  const scaleAnims = React.useRef(actions.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
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

  const getContainerStyle = () => {
    switch (variant) {
      case 'horizontal':
        return {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          paddingHorizontal: Spacing.lg,
        };
      case 'compact':
        return {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
          paddingHorizontal: Spacing.md,
        };
      default:
        return {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          justifyContent: 'space-between' as const,
          paddingHorizontal: Spacing.lg,
        };
    }
  };

  const getActionStyle = (index: number) => {
    const baseStyle = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: BorderRadius.lg,
      ...Elevation.level2,
    };

    switch (variant) {
      case 'horizontal':
        return {
          ...baseStyle,
          flex: 1,
          marginHorizontal: Spacing.xs,
          padding: Spacing.lg,
          minHeight: 100,
        };
      case 'compact':
        return {
          ...baseStyle,
          padding: Spacing.md,
          minWidth: 60,
          minHeight: 60,
        };
      default:
        const itemWidth = (width - Spacing.lg * 2 - Spacing.md * (columns - 1)) / columns;
        return {
          ...baseStyle,
          width: itemWidth,
          marginBottom: Spacing.md,
          padding: Spacing.lg,
          minHeight: 120,
        };
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 24;
      case 'horizontal':
        return 28;
      default:
        return 32;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          fontSize: 10,
          fontWeight: '500' as const,
          marginTop: Spacing.xs,
        };
      case 'horizontal':
        return {
          fontSize: 14,
          fontWeight: '600' as const,
          marginTop: Spacing.sm,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: '600' as const,
          marginTop: Spacing.sm,
        };
    }
  };

  const getSubtitleStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          fontSize: 8,
          marginTop: 2,
        };
      case 'horizontal':
        return {
          fontSize: 12,
          marginTop: Spacing.xs,
        };
      default:
        return {
          fontSize: 14,
          marginTop: Spacing.xs,
        };
    }
  };

  return (
    <View style={getContainerStyle()}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.id}
          style={{ transform: [{ scale: scaleAnims[index] }] }}
        >
          <TouchableOpacity
            style={[
              getActionStyle(index),
              { backgroundColor: colors.surface },
            ]}
            onPress={action.onPress}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            activeOpacity={0.9}
          >
            <View style={{
              width: getIconSize() + 16,
              height: getIconSize() + 16,
              borderRadius: BorderRadius.full,
              backgroundColor: action.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: showLabels ? Spacing.sm : 0,
            }}>
              <action.icon 
                size={getIconSize()} 
                color={action.color} 
              />
            </View>
            
            {showLabels && (
              <View style={{ alignItems: 'center' }}>
                <Text style={[
                  getTextStyle(),
                  { color: colors.text.primary }
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  getSubtitleStyle(),
                  { color: colors.text.secondary }
                ]}>
                  {action.subtitle}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

// Predefined quick actions for common use cases
export const getDefaultQuickActions = (onPress: (action: string) => void) => [
  {
    id: 'search',
    title: 'Search',
    subtitle: 'Find stations',
    icon: Search,
    color: Colors.primary[500],
    onPress: () => onPress('search'),
  },
  {
    id: 'filter',
    title: 'Filter',
    subtitle: 'Refine results',
    icon: Filter,
    color: Colors.secondary[500],
    onPress: () => onPress('filter'),
  },
  {
    id: 'nearby',
    title: 'Nearby',
    subtitle: 'Closest stations',
    icon: MapPin,
    color: Colors.semantic.success,
    onPress: () => onPress('nearby'),
  },
  {
    id: 'favorites',
    title: 'Favorites',
    subtitle: 'Saved stations',
    icon: Star,
    color: Colors.semantic.warning,
    onPress: () => onPress('favorites'),
  },
  {
    id: 'history',
    title: 'History',
    subtitle: 'Recent visits',
    icon: Clock,
    color: Colors.primary[600],
    onPress: () => onPress('history'),
  },
  {
    id: 'fast-charging',
    title: 'Fast Charge',
    subtitle: 'High power',
    icon: Zap,
    color: Colors.semantic.success,
    onPress: () => onPress('fast-charging'),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default QuickActions;
