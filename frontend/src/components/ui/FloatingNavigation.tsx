/**
 * Floating Navigation Component
 * Premium icons-only floating pill-shaped navigation with magic dot indicator
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

interface FloatingNavigationProps {
  items: NavigationItem[];
  activeIndex: number;
  onItemPress: (index: number, item: NavigationItem) => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  items = [],
  activeIndex = 0,
  onItemPress,
}) => {
  // Ensure we have valid items
  if (!items || items.length === 0) {
    return null;
  }

  // Magic dot positioning - simple percentage-based centering
  const NAV_WIDTH = width * 0.85;
  const ITEM_WIDTH = NAV_WIDTH / items.length; // Each item gets equal space
  const DOT_OFFSET = ITEM_WIDTH / 2 - 3; // Center the 6px dot (3px = half dot width)

  // Position dot at center of each item's space
  const getDotPosition = (index: number) => {
    return (index * ITEM_WIDTH) + DOT_OFFSET;
  };

  // Animated magic dot position
  const dotPosition = useSharedValue(getDotPosition(activeIndex));

  // Update dot position when activeIndex changes
  React.useEffect(() => {
    const newPosition = getDotPosition(activeIndex);
    dotPosition.value = withSpring(newPosition, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
  }, [activeIndex, dotPosition]);

  // Animated style for the magic dot
  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      left: dotPosition.value,
    };
  });

  // Bouncy icon animation - individual scales for each icon
  const iconScale0 = useSharedValue(1);
  const iconScale1 = useSharedValue(1);
  const iconScale2 = useSharedValue(1);
  const iconScale3 = useSharedValue(1);
  const iconScale4 = useSharedValue(1);

  // Create animated styles for each icon
  const iconAnimatedStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale0.value }],
  }));

  const iconAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale1.value }],
  }));

  const iconAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale2.value }],
  }));

  const iconAnimatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale3.value }],
  }));

  const iconAnimatedStyle4 = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale4.value }],
  }));

  // Array of animated styles for easy access
  const iconAnimatedStyles = [
    iconAnimatedStyle0,
    iconAnimatedStyle1,
    iconAnimatedStyle2,
    iconAnimatedStyle3,
    iconAnimatedStyle4,
  ];

  // Array of scale values for easy access
  const iconScales = [
    iconScale0,
    iconScale1,
    iconScale2,
    iconScale3,
    iconScale4,
  ];

  const handleIconPress = React.useCallback((index: number, item: NavigationItem) => {
    // Trigger bouncy animation
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
        {/* Background gradient */}
        <LinearGradient
          colors={['rgba(42, 42, 42, 0.95)', 'rgba(32, 32, 32, 0.9)', 'rgba(42, 42, 42, 0.95)']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Navigation content */}
        <View style={styles.contentContainer}>
          {/* Navigation items */}
          <View style={styles.navItemsContainer}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => handleIconPress(index, item)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Animated.View style={[styles.iconContainer, iconAnimatedStyles[index]]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={activeIndex === index ? '#00A8FF' : '#B3B3B3'}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* The Magic Dot - sliding indicator */}
          <View style={styles.magicDot}>
            <Animated.View style={[styles.dotInner, animatedDotStyle]} />
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
    zIndex: 1000, // High z-index to ensure it's on top
    elevation: 10, // Good elevation for Android
  },

  floatingPill: {
    borderRadius: 32,
    overflow: 'hidden',
    marginHorizontal: 24,
    minHeight: 60, // Ensure minimum height for touch area

    // Frosted glass effect
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',

    // Shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
  },
  contentContainer: {
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 60, // Ensure minimum height
    zIndex: 2, // Above the background
  },
  navItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: width * 0.85, // Optimal width for icons-only layout
    height: 44, // Fixed height for consistent layout
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    minWidth: 44,
    // Ensure proper touch area
    backgroundColor: 'transparent',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  magicDot: {
    position: 'absolute',
    bottom: 4, // Slightly lower position
    left: 8, // Account for contentContainer padding
    width: width * 0.85, // Match navItemsContainer width
    height: 16, // Small height to contain the dot
    alignItems: 'center',
    justifyContent: 'center', // Center the dot vertically
    zIndex: 3, // Above navigation items
  },
  dotInner: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A8FF',
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },


});

export default FloatingNavigation;
