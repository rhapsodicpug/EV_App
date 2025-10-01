/**
 * Notification Card Component
 * Displays individual notifications with actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Bell, 
  Battery, 
  Navigation, 
  Wrench, 
  Cloud, 
  DollarSign,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react-native';
import { SmartNotification } from '../../services/SmartNotificationService';

interface NotificationCardProps {
  notification: SmartNotification;
  onPress?: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onPress,
  onMarkAsRead,
  onDelete,
  showActions = true 
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'charging': return <Battery size={20} color="#8cd279" />;
      case 'trip': return <Navigation size={20} color="#F59E0B" />;
      case 'maintenance': return <Wrench size={20} color="#EF4444" />;
      case 'weather': return <Cloud size={20} color="#3B82F6" />;
      case 'pricing': return <DollarSign size={20} color="#10B981" />;
      default: return <Bell size={20} color="#B0B0B0" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#B0B0B0';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle size={16} color="#EF4444" />;
      case 'high': return <AlertTriangle size={16} color="#F59E0B" />;
      case 'medium': return <Info size={16} color="#3B82F6" />;
      case 'low': return <CheckCircle size={16} color="#10B981" />;
      default: return <Info size={16} color="#B0B0B0" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const CardContent = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {getNotificationIcon(notification.type)}
          <Text style={styles.title}>{notification.title}</Text>
        </View>
        <View style={styles.headerRight}>
          {getPriorityIcon(notification.priority)}
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>{notification.message}</Text>

      {/* Time */}
      <Text style={styles.time}>{formatTime(notification.scheduledFor)}</Text>

      {/* Action Button */}
      {notification.actionRequired && notification.actionText && (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionButtonText}>{notification.actionText}</Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          {!notification.isRead && (
            <TouchableOpacity style={styles.actionIcon} onPress={onMarkAsRead}>
              <CheckCircle size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionIcon} onPress={onDelete}>
            <X size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (onPress && !notification.actionRequired) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8cd279',
    marginLeft: 8,
  },

  message: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 8,
  },

  time: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: '#8cd279',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationCard;
