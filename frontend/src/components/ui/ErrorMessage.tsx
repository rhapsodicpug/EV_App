import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';
import { NetworkError } from '../../services/NetworkErrorHandler';

interface ErrorMessageProps {
  error: NetworkError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  showIcon = true,
  style,
}) => {
  const { colors } = useThemeColors();
  
  // Simple fallback translation function
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'common.retry': 'Retry',
      'common.close': 'Close',
      'common.error': 'Error',
    };
    return translations[key] || key;
  };

  const errorMessage = typeof error === 'string' ? error : (error?.message || 'An unknown error occurred');
  const errorType = typeof error === 'string' ? 'unknown' : (error?.type || 'unknown');

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return 'wifi-outline';
      case 'server':
        return 'server-outline';
      case 'timeout':
        return 'time-outline';
      case 'unauthorized':
        return 'lock-closed-outline';
      case 'forbidden':
        return 'shield-checkmark-outline';
      case 'notFound':
        return 'search-outline';
      case 'validation':
        return 'alert-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'network':
        return Colors.semantic.error;
      case 'server':
        return Colors.semantic.error;
      case 'timeout':
        return Colors.semantic.warning;
      case 'unauthorized':
        return Colors.semantic.warning;
      case 'forbidden':
        return Colors.semantic.error;
      case 'notFound':
        return colors.text.secondary;
      case 'validation':
        return Colors.semantic.warning;
      default:
        return Colors.semantic.error;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.semantic.error }, style]}>
      {showIcon && (
        <Ionicons 
          name={getErrorIcon() as any} 
          size={24} 
          color={getErrorColor()} 
          style={styles.icon}
        />
      )}
      
      <View style={styles.content}>
        <Text style={[styles.message, { color: Colors.neutral.white }]}>
          {errorMessage}
        </Text>
        
        <View style={styles.actions}>
          {onRetry && errorType !== 'unauthorized' && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={onRetry}
            >
              <Ionicons name="refresh" size={16} color={Colors.neutral.white} />
              <Text style={[styles.retryText, { color: Colors.neutral.white }]}>
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          )}
          
          {onDismiss && (
            <TouchableOpacity
              style={[styles.dismissButton, { backgroundColor: colors.surface }]}
              onPress={onDismiss}
            >
              <Ionicons name="close" size={16} color={colors.text.secondary} />
              <Text style={[styles.dismissText, { color: colors.text.secondary }]}>
                {t ? t('common.close') : 'Close'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

interface ErrorModalProps {
  visible: boolean;
  error: NetworkError | string;
  onRetry?: () => void;
  onDismiss: () => void;
  title?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  error,
  onRetry,
  onDismiss,
  title,
}) => {
  const { colors } = useThemeColors();
  
  // Simple fallback translation function
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'common.retry': 'Retry',
      'common.close': 'Close',
      'common.error': 'Error',
    };
    return translations[key] || key;
  };

  const errorMessage = typeof error === 'string' ? error : (error?.message || 'An unknown error occurred');
  const errorType = typeof error === 'string' ? 'unknown' : (error?.type || 'unknown');

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return 'wifi-off';
      case 'server':
        return 'server';
      case 'timeout':
        return 'time';
      case 'unauthorized':
        return 'lock-closed';
      case 'forbidden':
        return 'shield-checkmark';
      case 'notFound':
        return 'search';
      case 'validation':
        return 'alert-circle';
      default:
        return 'alert-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Ionicons 
              name={getErrorIcon() as any} 
              size={48} 
              color={Colors.semantic.error} 
            />
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {title || t('common.error')}
            </Text>
          </View>
          
          <Text style={[styles.modalMessage, { color: colors.text.secondary }]}>
            {errorMessage}
          </Text>
          
          <View style={styles.modalActions}>
            {onRetry && errorType !== 'unauthorized' && (
              <TouchableOpacity
                style={[styles.modalRetryButton, { backgroundColor: colors.primary }]}
                onPress={onRetry}
              >
                <Ionicons name="refresh" size={20} color={Colors.neutral.white} />
                <Text style={[styles.modalRetryText, { color: Colors.neutral.white }]}>
                  {t('common.retry')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.modalDismissButton, { backgroundColor: colors.surface }]}
              onPress={onDismiss}
            >
              <Ionicons name="close" size={20} color={colors.text.secondary} />
              <Text style={[styles.modalDismissText, { color: colors.text.secondary }]}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Toast-style error message
interface ErrorToastProps {
  error: NetworkError | string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  visible,
  onDismiss,
  duration = 4000,
}) => {
  const { colors } = useThemeColors();
  
  // Simple fallback translation function
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'common.retry': 'Retry',
      'common.close': 'Close',
      'common.error': 'Error',
    };
    return translations[key] || key;
  };

  React.useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const errorMessage = typeof error === 'string' ? error : (error?.message || 'An unknown error occurred');

  return (
    <View style={[styles.toastContainer, { backgroundColor: Colors.semantic.error }]}>
      <Ionicons name="alert-circle" size={20} color={Colors.neutral.white} />
      <Text style={[styles.toastMessage, { color: Colors.neutral.white }]}>
        {errorMessage}
      </Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={20} color={Colors.neutral.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    ...Elevation.level1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Elevation.level3,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalRetryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  modalRetryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDismissButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  modalDismissText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Elevation.level2,
    gap: Spacing.sm,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
