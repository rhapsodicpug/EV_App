/**
 * Gesture Navigation Component
 * Phase 2: Swipe-to-go-back and gesture-based navigation
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useThemeColors, Animation } from '../../design';

const { width: screenWidth } = Dimensions.get('window');

interface GestureNavigationProps {
  children: React.ReactNode;
  enabled?: boolean;
  threshold?: number;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
}

const GestureNavigation: React.FC<GestureNavigationProps> = ({
  children,
  enabled = true,
  threshold = screenWidth * 0.3,
  onGestureStart,
  onGestureEnd,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { colors } = useThemeColors();
  
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      onGestureStart?.();
    }

    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      if (translationX > threshold || velocityX > 500) {
        // Trigger back navigation
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: Animation.duration.fast,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: Animation.duration.fast,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: Animation.duration.fast,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.goBack();
        });
      } else {
        // Reset to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      }
      
      onGestureEnd?.();
    }
  };

  if (!enabled) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={10}
      failOffsetY={[-20, 20]}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [
            { translateX },
            { scale },
          ],
          opacity,
        }}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default GestureNavigation;
