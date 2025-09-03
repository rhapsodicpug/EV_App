import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: string;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: string;
    color: string;
    label: string;
  };
  style?: any;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  style,
}) => {
  const { colors } = useThemeColors();
  const translateX = useSharedValue(0);
  const cardWidth = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -cardWidth.value * 0.3;
      const shouldSwipeRight = event.translationX > cardWidth.value * 0.3;

      if (shouldSwipeLeft && onSwipeLeft) {
        translateX.value = withSpring(-cardWidth.value, {}, () => {
          runOnJS(onSwipeLeft)();
        });
      } else if (shouldSwipeRight && onSwipeRight) {
        translateX.value = withSpring(cardWidth.value, {}, () => {
          runOnJS(onSwipeRight)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value < 0 ? withTiming(1) : withTiming(0);
    return { opacity };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value > 0 ? withTiming(1) : withTiming(0);
    return { opacity };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Left Action */}
        {leftAction && (
          <Animated.View style={[styles.action, styles.leftAction, leftActionStyle]}>
            <Ionicons name={leftAction.icon as any} size={24} color={leftAction.color} />
            <Text style={[styles.actionText, { color: leftAction.color }]}>
              {leftAction.label}
            </Text>
          </Animated.View>
        )}

        {/* Right Action */}
        {rightAction && (
          <Animated.View style={[styles.action, styles.rightAction, rightActionStyle]}>
            <Ionicons name={rightAction.icon as any} size={24} color={rightAction.color} />
            <Text style={[styles.actionText, { color: rightAction.color }]}>
              {rightAction.label}
            </Text>
          </Animated.View>
        )}

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.surface },
              animatedStyle,
              style,
            ]}
            onLayout={(event) => {
              cardWidth.value = event.nativeEvent.layout.width;
            }}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  style?: any;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing,
  style,
}) => {
  const { colors } = useThemeColors();
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY * 0.5;
        scale.value = 1 + (event.translationY / 200) * 0.1;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 && !refreshing) {
        runOnJS(onRefresh)();
      }
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.pullContainer, animatedStyle, style]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// Pinch to Zoom Component
interface PinchToZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  style?: any;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({
  children,
  minScale = 0.5,
  maxScale = 3,
  style,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < minScale) {
        scale.value = withSpring(minScale);
        savedScale.value = minScale;
      } else if (scale.value > maxScale) {
        scale.value = withSpring(maxScale);
        savedScale.value = maxScale;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.zoomContainer, animatedStyle, style]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    position: 'relative',
  },
  card: {
    borderRadius: BorderRadius.md,
    ...Elevation.level1,
    overflow: 'hidden',
  },
  action: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    zIndex: -1,
  },
  leftAction: {
    left: 0,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  rightAction: {
    right: 0,
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  pullContainer: {
    flex: 1,
  },
  zoomContainer: {
    flex: 1,
  },
});
