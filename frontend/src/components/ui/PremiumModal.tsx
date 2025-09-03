/**
 * Premium Modal Component
 * Reusable frosted glass modal for feature notifications
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  buttonText?: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  icon = 'rocket-outline',
  title = 'Feature Coming Soon',
  message = 'Our team is hard at work building this. It will be available in a future update!',
  buttonText = 'Got It',
}) => {
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  // Animation styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  // Animation functions
  const animateIn = () => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    modalOpacity.value = withTiming(1, { duration: 200 });
  };

  const animateOut = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.8, { duration: 200 });
    modalOpacity.value = withTiming(0, { duration: 150 });
  };

  // Handle modal visibility changes
  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [visible]);

  const handleClose = () => {
    animateOut();
    // Delay the actual close to allow animation to complete
    setTimeout(() => {
      runOnJS(onClose)();
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Background Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modal, modalStyle]}>
          <LinearGradient
            colors={['rgba(42, 42, 42, 0.95)', 'rgba(32, 32, 32, 0.9)']}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon}
                size={48}
                color="#00A8FF"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>

          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Premium Styles
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 24,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    // Elevation for Android
    elevation: 20,
  },
  modalGradient: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 168, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 168, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#00A8FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default PremiumModal;
