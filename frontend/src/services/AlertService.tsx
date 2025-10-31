/**
 * Alert Service - Custom Alert System
 * Replaces React Native's default Alert.alert with custom styled modals
 */

import React from 'react';
import { Alert as RNAlert } from 'react-native';

// Global state for the alert
let alertHandler: AlertHandlerType | null = null;

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

type AlertHandlerType = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => void;

/**
 * Register the alert handler (called by AlertProvider)
 */
export const registerAlertHandler = (handler: AlertHandlerType) => {
  alertHandler = handler;
};

/**
 * Unregister the alert handler
 */
export const unregisterAlertHandler = () => {
  alertHandler = null;
};

/**
 * Show a custom alert
 * API compatible with React Native's Alert.alert
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => {
  if (alertHandler) {
    alertHandler(title, message, buttons, options);
  } else {
    // Fallback to native alert if handler not registered
    console.warn('AlertService: Handler not registered, falling back to native Alert');
    RNAlert.alert(
      title,
      message,
      buttons as any,
      options as any
    );
  }
};

/**
 * Show a confirmation dialog
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
) => {
  showAlert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: 'default',
      onPress: onConfirm,
    },
  ]);
};

/**
 * Show a destructive confirmation dialog
 */
export const showDestructiveConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Delete',
  cancelText: string = 'Cancel'
) => {
  showAlert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

/**
 * Show a success message
 */
export const showSuccess = (
  title: string,
  message?: string,
  onDismiss?: () => void
) => {
  showAlert(title, message, [
    {
      text: 'OK',
      style: 'default',
      onPress: onDismiss,
    },
  ]);
};

/**
 * Show an error message
 */
export const showError = (
  title: string,
  message?: string,
  onDismiss?: () => void
) => {
  showAlert(title, message, [
    {
      text: 'OK',
      style: 'default',
      onPress: onDismiss,
    },
  ]);
};

/**
 * Show a simple info message
 */
export const showInfo = (
  title: string,
  message?: string,
  onDismiss?: () => void
) => {
  showAlert(title, message, [
    {
      text: 'OK',
      style: 'default',
      onPress: onDismiss,
    },
  ]);
};

// Export as default for easier imports
export default {
  show: showAlert,
  confirm: showConfirm,
  destructiveConfirm: showDestructiveConfirm,
  success: showSuccess,
  error: showError,
  info: showInfo,
};

