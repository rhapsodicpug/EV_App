/**
 * Enhanced Floating Navigation - Project Elevate
 * Premium floating navigation with fluid pill indicator and Lucide icons
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  Home,
  Zap,
  Map,
  Calendar,
  User,
} from 'lucide-react-native';

import { EnhancedColors, Gradients, BorderRadius, Shadows, Spacing } from '../design/EnhancedDesignSystem';

const { width } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  screen: string;
}

interface EnhancedFloatingNavigationProps {
  items: NavigationItem[];
  activeIndex: number;
  onItemPress: (index: number, item: NavigationItem) => void;
}

const EnhancedFloatingNavigation: React.FC<EnhancedFloatingNavigationProps> = ({
  items = [],
  activeIndex = 0,
  onItemPress,
}) => {
  // Ensure we have valid items
  if (!items || items.length === 0) {
    return null;
  }

  // Navigation dimensions
  const NAV_WIDTH = width * 0.9;
  const ITEM_WIDTH = NAV_WIDTH / items.length;
  const PILL_WIDTH = ITEM_WIDTH * 0.8;
  const PILL_HEIGHT = 40;

  // Animated pill position
  const pillPosition = useSharedValue(activeIndex * ITEM_WIDTH + (ITEM_WIDTH - PILL_WIDTH) / 2);
  const pillOpacity = useSharedValue(1);

  // Individual icon animations
  const iconScales = items.map(() => useSharedValue(1));
  const iconOpacities = items.map(() => useSharedValue(0.6));

  // Update pill position when activeIndex changes
  React.useEffect(() => {
    const newPosition = activeIndex * ITEM_WIDTH + (ITEM_WIDTH - PILL_WIDTH) / 2;
    
    pillPosition.value = withSpring(newPosition, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });

    // Update icon opacities
    iconOpacities.forEach((opacity, index) => {
      opacity.value = withTiming(index === activeIndex ? 1 : 0.6, {
        duration: 200,
      });
    });
  }, [activeIndex]);

  // Animated styles
  const pillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pillPosition.value }],
      opacity: pillOpacity.value,
    };
  });

  const getIconAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        transform: [{ scale: iconScales[index].value }],
        opacity: iconOpacities[index].value,
      };
    });
  };

  const handleIconPress = React.useCallback((index: number, item: NavigationItem) => {
    // Bouncy animation
    iconScales[index].value = withSpring(0.8, {
      damping: 10,
      stiffness: 400,
      mass: 0.3,
    }, () => {
      iconScales[index].value = withSpring(1, {
        damping: 12,
        stiffness: 500,
        mass: 0.3,
      });
    });

    // Call the original press handler
    if (onItemPress) {
      onItemPress(index, item);
    }
  }, [onItemPress, iconScales]);

  return (
    <View style={styles.container}>
      <View style={styles.floatingPill}>
        {/* Enhanced Glassmorphism Background */}
        <LinearGradient
          colors={Gradients.glass.card}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Glassmorphism Overlay */}
        <View style={styles.glassmorphismOverlay} />

        {/* Navigation Content */}
        <View style={styles.contentContainer}>
          {/* Navigation Items */}
          <View style={styles.navItemsContainer}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => handleIconPress(index, item)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Animated.View style={[styles.iconContainer, getIconAnimatedStyle(index)]}>
                  <item.icon
                    size={24}
                    color={index === activeIndex ? EnhancedColors.text.primary : EnhancedColors.text.secondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Animated Pill Indicator */}
          <View style={styles.pillContainer}>
            <Animated.View style={[styles.pill, pillStyle]}>
              <LinearGradient
                colors={Gradients.primary}
                style={styles.pillGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },

  floatingPill: {
    width: width * 0.9,
    height: 60,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.glass.large,
  },

  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  glassmorphismOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: EnhancedColors.glass.surface,
    borderWidth: 1,
    borderColor: EnhancedColors.glass.border,
  },

  contentContainer: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },

  navItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },

  pillContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.sm,
    right: Spacing.sm,
    height: 40,
    zIndex: 1,
  },

  pill: {
    width: (width * 0.9 - Spacing.sm * 2) / 5 * 0.8,
    height: 40,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    top: 0,
  },

  pillGradient: {
    flex: 1,
    borderRadius: BorderRadius.full,
    ...Shadows.glow.primary,
  },
});

export default EnhancedFloatingNavigation;
