import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService, NotificationPreferences } from '../../services/NotificationService';
import { Card, Button } from '../../components';

const NotificationSettingsScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic styles that depend on theme colors
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    sectionTitle: { color: colors.text.primary },
    settingItem: { backgroundColor: colors.surface, borderBottomColor: colors.border },
    settingText: { color: colors.text.primary },
    settingSubtext: { color: colors.text.secondary },
    timeText: { color: colors.text.primary },
    timePickerButton: { backgroundColor: colors.primary },
    timePickerButtonText: { color: Colors.neutral.white },
    testButton: { backgroundColor: colors.primary },
    testButtonText: { color: Colors.neutral.white },
    resetButton: { backgroundColor: Colors.semantic.error },
    resetButtonText: { color: Colors.neutral.white },
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    try {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      await notificationService.updatePreferences(updated);
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const updateQuietHours = async (key: 'start' | 'end', value: string) => {
    if (!preferences) return;

    try {
      const updated = {
        ...preferences,
        quietHours: {
          ...preferences.quietHours,
          [key]: value,
        },
      };
      setPreferences(updated);
      await notificationService.updatePreferences(updated);
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      Alert.alert('Error', 'Failed to update quiet hours');
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendLocalNotification({
        id: 'test_notification',
        title: '🔔 Test Notification',
        body: 'This is a test notification to verify your settings are working correctly!',
        type: 'system',
        priority: 'high',
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const resetPreferences = async () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all notification preferences to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.resetPreferences();
              await loadPreferences();
              Alert.alert('Success', 'Preferences reset to default');
            } catch (error) {
              console.error('Error resetting preferences:', error);
              Alert.alert('Error', 'Failed to reset preferences');
            }
          },
        },
      ]
    );
  };

  const requestPermissions = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        Alert.alert('Success', 'Notification permissions granted!');
        await loadPreferences();
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <Text style={[styles.loadingText, { color: colors.text.primary }]}>Loading preferences...</Text>
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <Text style={[styles.errorText, { color: Colors.semantic.error }]}>Failed to load preferences</Text>
        <Button title="Retry" onPress={loadPreferences} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Notification Settings</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Customize how and when you receive notifications
        </Text>
      </View>

      {/* Permission Status */}
      <Card variant="elevated" elevation="level1" padding="medium" margin="medium">
        <View style={styles.permissionSection}>
          <View style={styles.permissionHeader}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>Permission Status</Text>
          </View>
          <Text style={[styles.permissionText, { color: colors.text.secondary }]}>
            {Platform.OS === 'web' ? 'Browser notifications' : 'Device notifications'} are currently{' '}
            {preferences.pushEnabled ? 'enabled' : 'disabled'}
          </Text>
          <Button
            title={preferences.pushEnabled ? 'Manage Permissions' : 'Enable Notifications'}
            onPress={requestPermissions}
            variant="outline"
            style={styles.permissionButton}
          />
        </View>
      </Card>

      {/* General Settings */}
      <Card variant="elevated" elevation="level1" padding="medium" margin="medium">
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>General Settings</Text>
        
        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Push Notifications</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Receive notifications from the app
            </Text>
          </View>
          <Switch
            value={preferences.pushEnabled}
            onValueChange={(value) => updatePreference('pushEnabled', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.pushEnabled ? Colors.neutral.white : colors.border}
          />
        </View>

        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Local Notifications</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Show notifications even when app is closed
            </Text>
          </View>
          <Switch
            value={preferences.localEnabled}
            onValueChange={(value) => updatePreference('localEnabled', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.localEnabled ? Colors.neutral.white : colors.border}
          />
        </View>
      </Card>

      {/* Notification Types */}
      <Card variant="elevated" elevation="level1" padding="medium" margin="medium">
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Notification Types</Text>
        
        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Booking Reminders</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Get reminded before your charging sessions
            </Text>
          </View>
          <Switch
            value={preferences.bookingReminders}
            onValueChange={(value) => updatePreference('bookingReminders', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.bookingReminders ? Colors.neutral.white : colors.border}
          />
        </View>

        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Status Updates</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Updates about your charging sessions
            </Text>
          </View>
          <Switch
            value={preferences.statusUpdates}
            onValueChange={(value) => updatePreference('statusUpdates', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.statusUpdates ? Colors.neutral.white : colors.border}
          />
        </View>

        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Promotions</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Special offers and discounts
            </Text>
          </View>
          <Switch
            value={preferences.promotions}
            onValueChange={(value) => updatePreference('promotions', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.promotions ? Colors.neutral.white : colors.border}
          />
        </View>

        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>System Notifications</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Important app updates and maintenance
            </Text>
          </View>
          <Switch
            value={preferences.systemNotifications}
            onValueChange={(value) => updatePreference('systemNotifications', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor={preferences.systemNotifications ? Colors.neutral.white : colors.border}
          />
        </View>
      </Card>

      {/* Quiet Hours */}
      <Card variant="elevated" elevation="level1" padding="medium" margin="medium">
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quiet Hours</Text>
        
        <View style={[styles.settingItem, dynamicStyles.settingItem]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingText, dynamicStyles.settingText]}>Enable Quiet Hours</Text>
            <Text style={[styles.settingSubtext, dynamicStyles.settingSubtext]}>
              Mute notifications during specified hours
            </Text>
          </View>
          <Switch
            value={preferences.quietHours.enabled}
            onValueChange={(value) => updatePreference('quietHours', { ...preferences.quietHours, enabled: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.quietHours.enabled ? Colors.neutral.white : colors.border}
          />
        </View>

        {preferences.quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            <View style={styles.timePickerRow}>
              <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>Start Time:</Text>
              <TouchableOpacity
                style={[styles.timePickerButton, dynamicStyles.timePickerButton]}
                onPress={() => {
                  // In a real app, show time picker
                  Alert.alert('Time Picker', 'Select start time', [
                    { text: '22:00', onPress: () => updateQuietHours('start', '22:00') },
                    { text: '23:00', onPress: () => updateQuietHours('start', '23:00') },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Text style={[styles.timePickerButtonText, dynamicStyles.timePickerButtonText]}>
                  {preferences.quietHours.start}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerRow}>
              <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>End Time:</Text>
              <TouchableOpacity
                style={[styles.timePickerButton, dynamicStyles.timePickerButton]}
                onPress={() => {
                  // In a real app, show time picker
                  Alert.alert('Time Picker', 'Select end time', [
                    { text: '06:00', onPress: () => updateQuietHours('end', '06:00') },
                    { text: '07:00', onPress: () => updateQuietHours('end', '07:00') },
                    { text: '08:00', onPress: () => updateQuietHours('end', '08:00') },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Text style={[styles.timePickerButtonText, dynamicStyles.timePickerButtonText]}>
                  {preferences.quietHours.end}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>

      {/* Test & Reset */}
      <Card variant="elevated" elevation="level1" padding="medium" margin="medium">
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Testing & Maintenance</Text>
        
        <Button
          title="🔔 Test Notification"
          onPress={testNotification}
          style={styles.testButton}
          textStyle={styles.testButtonText}
        />
        
        <Button
          title="🔄 Reset to Default"
          onPress={resetPreferences}
          variant="outline"
          style={styles.resetButton}
          textStyle={styles.resetButtonText}
        />
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          Changes are saved automatically
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionSection: {
    gap: Spacing.md,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  settingSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  quietHoursContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timePickerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  timePickerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testButton: {
    marginBottom: Spacing.md,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    borderColor: Colors.semantic.error,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});

export default NotificationSettingsScreen;
