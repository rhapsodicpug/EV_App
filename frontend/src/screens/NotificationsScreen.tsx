/**
 * Notifications Screen
 * Smart notification management and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Bell, 
  Settings, 
  Trash2, 
  CheckCircle,
  Battery,
  Navigation,
  Wrench,
  Cloud,
  DollarSign
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSmartNotifications } from '../contexts/SmartNotificationContext';
import NotificationCard from '../components/notifications/NotificationCard';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
    getNotificationStats
  } = useSmartNotifications();

  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'settings'>('all');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All', onPress: markAllAsRead },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllNotifications },
      ]
    );
  };

  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'all':
      default:
        return notifications;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'charging': return <Battery size={20} color="#8cd279" />;
      case 'trip': return <Navigation size={20} color="#F59E0B" />;
      case 'maintenance': return <Wrench size={20} color="#EF4444" />;
      case 'weather': return <Cloud size={20} color="#3B82F6" />;
      case 'pricing': return <DollarSign size={20} color="#10B981" />;
      default: return <Bell size={20} color="#B0B0B0" />;
    }
  };

  const stats = getNotificationStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settings' && styles.activeTab]}
          onPress={() => setSelectedTab('settings')}
        >
          <Text style={[styles.tabText, selectedTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'settings' ? (
          /* Settings Tab */
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Notification Settings</Text>
            
            {/* Statistics */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.unread}</Text>
                  <Text style={styles.statLabel}>Unread</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Object.keys(stats.byType).length}</Text>
                  <Text style={styles.statLabel}>Types</Text>
                </View>
              </View>
            </View>

            {/* Notification Types */}
            <View style={styles.typesCard}>
              <Text style={styles.typesTitle}>Notification Types</Text>
              {Object.entries(stats.byType).map(([type, count]) => (
                <View key={type} style={styles.typeItem}>
                  {getNotificationTypeIcon(type)}
                  <Text style={styles.typeName}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <Text style={styles.typeCount}>{count}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>Actions</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.actionButtonText}>Mark All as Read</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
                <Trash2 size={20} color="#EF4444" />
                <Text style={styles.actionButtonText}>Clear All Notifications</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Notifications Tab */
          <View style={styles.notificationsContainer}>
            {getFilteredNotifications().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bell size={48} color="#666666" />
                <Text style={styles.emptyTitle}>
                  {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {selectedTab === 'unread' 
                    ? 'You\'re all caught up!' 
                    : 'Notifications will appear here when you have updates'
                  }
                </Text>
              </View>
            ) : (
              getFilteredNotifications().map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  showActions={true}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },

  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#8cd279',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B0B0B0',
  },

  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  settingsContainer: {
    paddingBottom: 20,
  },

  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },

  statsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8cd279',
  },

  statLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
  },

  typesCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  typesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  typeName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },

  typeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8cd279',
  },

  actionsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    marginBottom: 12,
  },

  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },

  notificationsContainer: {
    paddingBottom: 20,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
