/**
 * Bento Grid Layout Component
 * Responsive grid layout for settings cards with staggered animations
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import { Spacing, Layout } from '../../design/EnhancedDesignSystem';

interface BentoGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  animated?: boolean;
  style?: ViewStyle;
}

const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = 2,
  gap = Spacing.md,
  animated = true,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    if (animated) {
      opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    } else {
      opacity.value = 1;
      translateY.value = 0;
    }
  }, [animated]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const renderGridItem = (child: React.ReactNode, index: number) => {
    const itemOpacity = useSharedValue(0);
    const itemTranslateY = useSharedValue(30);

    useEffect(() => {
      if (animated) {
        const delay = index * 100; // Stagger animation
        itemOpacity.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 300 }));
        itemTranslateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 300 }));
      } else {
        itemOpacity.value = 1;
        itemTranslateY.value = 0;
      }
    }, [animated, index]);

    const itemStyle = useAnimatedStyle(() => {
      return {
        opacity: itemOpacity.value,
        transform: [{ translateY: itemTranslateY.value }],
      };
    });

    return (
      <Animated.View key={index} style={[styles.gridItem, itemStyle]}>
        {child}
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <View style={[styles.grid, { gap }]}>
        {children.map((child, index) => renderGridItem(child, index))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // 2 columns with gap
    marginBottom: Spacing.md,
  },
});

export default BentoGrid;
