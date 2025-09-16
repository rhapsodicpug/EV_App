import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';

// Color Palette matching the design
const COLORS = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    light: '#404040',
  },
  accent: '#8cd279', // Lime green theme
  error: '#FF6B6B',
};

interface ModalOption {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message?: string;
  options: ModalOption[];
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  message,
  options,
  onClose,
}) => {
  const handleOptionPress = (option: ModalOption) => {
    option.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          style={styles.blurContainer}
          intensity={20}
          tint="dark"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              {message && (
                <Text style={styles.modalMessage}>{message}</Text>
              )}
              
              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      option.style === 'destructive' && styles.destructiveButton,
                      option.style === 'cancel' && styles.cancelButton,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      option.style === 'destructive' && styles.destructiveText,
                      option.style === 'cancel' && styles.cancelText,
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    color: COLORS.text.primary,
  },
  destructiveText: {
    color: '#FFFFFF',
  },
});

export default CustomModal;
