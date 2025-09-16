/**
 * Utility function to reset welcome screen for testing
 * This can be called from anywhere in the app to show the welcome screen again
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetWelcomeScreen = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('hasSeenWelcome');
    console.log('✅ Welcome screen reset - will show on next app launch');
  } catch (error) {
    console.error('❌ Error resetting welcome screen:', error);
  }
};

export const hasSeenWelcome = async (): Promise<boolean> => {
  try {
    const hasSeen = await AsyncStorage.getItem('hasSeenWelcome');
    return hasSeen !== null;
  } catch (error) {
    console.error('❌ Error checking welcome status:', error);
    return false;
  }
};
