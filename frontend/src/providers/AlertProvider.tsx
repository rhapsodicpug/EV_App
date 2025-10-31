/**
 * Alert Provider - Manages Custom Alert System
 * Provides custom styled alerts throughout the app
 */

import React, { useState, useEffect, ReactNode } from 'react';
import CustomModal from '../components/ui/CustomModal';
import { registerAlertHandler, unregisterAlertHandler } from '../services/AlertService';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
}

interface AlertProviderProps {
  children: ReactNode;
}

const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: undefined,
    buttons: [],
  });

  useEffect(() => {
    // Register the alert handler
    const handler = (
      title: string,
      message?: string,
      buttons?: AlertButton[]
    ) => {
      setAlertState({
        visible: true,
        title,
        message,
        buttons: buttons || [{ text: 'OK', style: 'default' }],
      });
    };

    registerAlertHandler(handler);

    // Cleanup on unmount
    return () => {
      unregisterAlertHandler();
    };
  }, []);

  const handleClose = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  const modalOptions = alertState.buttons.map(button => ({
    text: button.text,
    onPress: () => {
      if (button.onPress) {
        button.onPress();
      }
    },
    style: button.style,
  }));

  return (
    <>
      {children}
      <CustomModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        options={modalOptions}
        onClose={handleClose}
      />
    </>
  );
};

export default AlertProvider;

