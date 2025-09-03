/**
 * Breadcrumb Navigation Component
 * Phase 2: Breadcrumb navigation for complex flows
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronRight, Home } from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Typography } from '../../design';
import { Responsive } from '../../design';

interface BreadcrumbItem {
  id: string;
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  maxItems?: number;
  onHomePress?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  showHome = true,
  maxItems = 5,
  onHomePress,
  variant = 'default',
}) => {
  const { colors } = useThemeColors();

  const getContainerStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
        };
      case 'minimal':
        return {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
        };
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
        };
    }
  };

  const getItemStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: BorderRadius.sm,
        };
      case 'minimal':
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: BorderRadius.xs,
        };
      default:
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: BorderRadius.md,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          fontSize: 12,
          fontWeight: '500' as const,
        };
      case 'minimal':
        return {
          fontSize: 11,
          fontWeight: '400' as const,
        };
      default:
        return {
          fontSize: 14,
          fontWeight: '500' as const,
        };
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 14;
      case 'minimal':
        return 12;
      default:
        return 16;
    }
  };

  const containerStyle = getContainerStyle();
  const itemStyle = getItemStyle();
  const textStyle = getTextStyle();
  const iconSize = getIconSize();

  // Add home item if enabled
  const allItems = showHome 
    ? [{ id: 'home', title: 'Home', icon: <Home size={iconSize} />, onPress: onHomePress }, ...items]
    : items;

  // Limit items based on maxItems
  const displayItems = allItems.slice(-maxItems);

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: colors.surface }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayItems.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={[
                styles.item,
                itemStyle,
                {
                  backgroundColor: index === displayItems.length - 1 
                    ? colors.primary + '20' 
                    : colors.surface,
                  borderWidth: index === displayItems.length - 1 ? 1 : 0,
                  borderColor: colors.primary + '30',
                }
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={!item.onPress}
            >
              {item.icon && (
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
              )}
              <Text
                style={[
                  styles.text,
                  textStyle,
                  {
                    color: index === displayItems.length - 1 
                      ? colors.primary 
                      : colors.text.secondary,
                  }
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
            
            {index < displayItems.length - 1 && (
              <View style={styles.separator}>
                <ChevronRight 
                  size={iconSize - 2} 
                  color={colors.text.tertiary} 
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  scrollContent: {
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    textAlign: 'center',
  },
  separator: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BreadcrumbNavigation;
