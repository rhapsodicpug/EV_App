/**
 * Confetti Animation Component
 * Creates animated confetti falling from bottom of screen
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  color: string;
  delay: number;
  duration: number;
  x: number;
}

const COLORS = ['#8cd279', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#8cd279', '#4ADE80', '#6366F1'];

interface ConfettiAnimationProps {
  onComplete?: () => void;
  onWaveTrigger?: () => void;
}

// Wave effect component
const WaveEffect: React.FC<{ delay: number; intensity: number }> = ({ delay, intensity }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSequence(
        withTiming(5, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
      opacity.value = withSequence(
        withTiming(0.6, { duration: 300 }),
        withTiming(0.4, { duration: 400 }),
        withTiming(0, { duration: 300 })
      );
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wave,
        { borderColor: `rgba(140, 210, 121, ${intensity})` },
        animatedStyle,
      ]}
    />
  );
};

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ onComplete }) => {
  const confettiPieces: ConfettiPiece[] = [];
  
  // Create confetti pieces from both lower corners
  for (let i = 0; i < 30; i++) {
    const leftSide = i < 15;
    confettiPieces.push({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 500,
      duration: 2000 + Math.random() * 1000,
      x: leftSide 
        ? -50 + Math.random() * 100 // Left side spread
        : width - 50 + Math.random() * 100, // Right side spread
    });
  }

  // Trigger haptic feedback
  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const ConfettiComponent: React.FC<{ piece: ConfettiPiece }> = ({ piece }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
      // Start animation after delay using setTimeout
      const timer = setTimeout(() => {
        // Animate from bottom going upward and outward
        translateY.value = withSequence(
          withTiming(piece.x < width / 2 ? -height * 0.6 : -height * 0.6, {
            duration: piece.duration,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, { duration: 0 })
        );

        // Horizontal movement
        translateX.value = withTiming(piece.x < width / 2 ? width * 0.3 : -width * 0.3, {
          duration: piece.duration,
          easing: Easing.inOut(Easing.sin),
        });

        // Rotation
        rotation.value = withRepeat(
          withTiming(360, { duration: 1000 + Math.random() * 500, easing: Easing.linear }),
          -1,
          false
        );

        // Fade out
        opacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: piece.duration - 400 }),
          withTiming(0, { duration: 200 })
        );
      }, piece.delay);

      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.confetti,
          { backgroundColor: piece.color, left: piece.x },
          animatedStyle,
        ]}
      />
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Wave effects from corners - More layers for smoother ripple */}
      <View style={[styles.waveContainer, { left: 0 }]}>
        <WaveEffect delay={50} intensity={0.5} />
        <WaveEffect delay={150} intensity={0.4} />
        <WaveEffect delay={250} intensity={0.35} />
        <WaveEffect delay={350} intensity={0.3} />
        <WaveEffect delay={450} intensity={0.25} />
        <WaveEffect delay={550} intensity={0.2} />
      </View>
      <View style={[styles.waveContainer, { right: 0 }]}>
        <WaveEffect delay={50} intensity={0.5} />
        <WaveEffect delay={150} intensity={0.4} />
        <WaveEffect delay={250} intensity={0.35} />
        <WaveEffect delay={350} intensity={0.3} />
        <WaveEffect delay={450} intensity={0.25} />
        <WaveEffect delay={550} intensity={0.2} />
      </View>

      {confettiPieces.map((piece) => (
        <ConfettiComponent key={piece.id} piece={piece} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});

export default ConfettiAnimation;

