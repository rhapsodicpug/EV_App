/**
 * Enhanced Chatbot Screen
 * Smart assistant with context-aware recommendations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  MessageCircle,
  Trash2,
  MoreVertical,
  Zap,
  Battery,
  MapPin,
  Navigation
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAIChatbot } from '../contexts/AIChatbotContext';
import { useVehicles } from '../contexts/VehicleContext';
import ChatMessage from '../components/chat/ChatMessage';
import ContextCollectionModal, { UserContext } from '../components/ui/ContextCollectionModal';
import EmergencyModeCard from '../components/chat/EmergencyModeCard';
import PersonalizedStationCard from '../components/chat/PersonalizedStationCard';
import RecommendationEngine, { PersonalizedRecommendation } from '../services/RecommendationEngine';
import RangeCalculator from '../services/RangeCalculator';
import * as Location from 'expo-location';

const ChatbotScreenEnhanced: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    sendQuickReply,
    clearConversation,
    getConversationStats,
    isTyping
  } = useAIChatbot();
  
  const { vehicles } = useVehicles();

  // Enhanced state
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  const recommendationEngine = RecommendationEngine.getInstance();
  const rangeCalculator = RangeCalculator.getInstance();

  // Get user location on mount
  useEffect(() => {
    getLocation();
    if (vehicles && vehicles.length > 0) {
      setCurrentVehicle(vehicles[0]);
    }
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync();
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleBackPress = () => {
    const parentNavigator = navigation.getParent();
    if (parentNavigator) {
      const state = parentNavigator.getState();
      if (state && state.routeNames && state.routeNames.includes('ProfileMain')) {
        navigation.goBack();
      } else {
        (navigation as any).navigate('Profile', { screen: 'ProfileMain' });
      }
    } else {
      navigation.goBack();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim().toLowerCase();
    setInputText('');

    // Check for context-triggering keywords
    if (message.includes('find') && (message.includes('station') || message.includes('charging'))) {
      setShowContextModal(true);
      return;
    }

    if (message.includes('need charging') || message.includes('battery low') || message.includes('low battery')) {
      setShowContextModal(true);
      return;
    }

    if (message.includes('emergency') || message.includes('critical')) {
      handleEmergencyMode();
      return;
    }

    // Check for range queries
    if (message.includes('range') || message.includes('how far can i go')) {
      showRangeInfo();
      return;
    }

    // Send to chatbot
    try {
      await sendMessage(message);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleContextSubmit = async (context: UserContext) => {
    setUserContext(context);
    setShowContextModal(false);

    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location permissions.');
      return;
    }

    try {
      // Get personalized recommendations
      const recs = await recommendationEngine.getPersonalizedRecommendations({
        batteryLevel: context.batteryLevel!,
        urgency: context.urgency!,
        preferences: context.preferences,
        userLocation,
      });

      setRecommendations(recs);
      setShowRecommendations(true);

      // Send bot message
      await sendMessage(`I found ${recs.length} perfect stations for you!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    }
  };

  const handleEmergencyMode = async () => {
    if (!userLocation || !currentVehicle) {
      Alert.alert('Missing Info', 'Need location and vehicle data for emergency mode.');
      return;
    }

    const batteryLevel = currentVehicle.battery_percentage || 15;
    
    try {
      const recs = await recommendationEngine.getEmergencyRecommendations(userLocation);
      setRecommendations(recs);
      setShowRecommendations(true);
      setUserContext({
        batteryLevel,
        urgency: 'urgent',
        preferences: { distance: true, speed: false, price: false, amenities: false },
      });
      
      await sendMessage('🚨 Emergency mode activated! Finding nearest stations...');
    } catch (error) {
      Alert.alert('Error', 'Failed to get emergency recommendations.');
    }
  };

  const showRangeInfo = () => {
    if (!currentVehicle) {
      Alert.alert('No Vehicle', 'Please add a vehicle first.');
      return;
    }

    const batteryLevel = currentVehicle.battery_percentage || 50;
    const range = rangeCalculator.calculateRange(batteryLevel);
    const safety = rangeCalculator.getSafetyMargin(batteryLevel);

    Alert.alert(
      'Range Estimate',
      `Battery: ${batteryLevel}%\n\n` +
      `Conservative: ${range.conservative} km\n` +
      `Normal: ${range.normal} km\n` +
      `Maximum: ${range.maximum} km\n\n` +
      `Status: ${safety.recommendation}`,
      [{ text: 'OK' }]
    );
  };

  const handleBookStation = async (station: PersonalizedRecommendation) => {
    // Navigate directly to booking flow
    // Convert PersonalizedRecommendation to EVStation format
    const stationData: any = {
      id: station.id,
      name: station.name,
      address: station.address || '',
      location: station.location,
      connectors: station.connectors || [],
      amenities: station.amenities || [],
      availableSlots: station.availableSlots || 0,
      distance_km: station.distance_km,
      // Add estimated cost and time for display
      estimatedCost: station.estimatedCost,
      estimatedTime: station.estimatedTime,
    };
    
    (navigation as any).navigate('Search', {
      screen: 'BookSlot',
      params: { 
        station: stationData
      }
    });
  };

  const handleViewStationDetails = (station: PersonalizedRecommendation) => {
    (navigation as any).navigate('Search', {
      screen: 'StationDetails',
      params: { stationId: station.id }
    });
  };

  const handleQuickReply = async (quickReply: any) => {
    switch (quickReply.action) {
      case 'find_stations':
      case 'find_charging':
        setShowContextModal(true);
        break;
      case 'emergency':
        handleEmergencyMode();
        break;
      case 'check_range':
        showRangeInfo();
        break;
      case 'book_now':
        (navigation as any).navigate('Bookings');
        break;
      default:
        await sendQuickReply(quickReply);
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          clearConversation();
          setShowRecommendations(false);
          setRecommendations([]);
        }},
      ]
    );
  };

  const handleShowStats = () => {
    const stats = getConversationStats();
    Alert.alert(
      'Conversation Stats',
      `Total: ${stats.totalMessages}\nUser: ${stats.userMessages}\nBot: ${stats.botMessages}\nDuration: ${Math.round(stats.sessionDuration / 60000)} min`,
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, showRecommendations]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Bot size={24} color="#8cd279" />
          <Text style={styles.headerTitle}>Smart EV Assistant</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Menu */}
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleShowStats}>
            <MessageCircle size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleClearConversation}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Clear Chat</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions for empty state */}
      {messages.length === 0 && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setShowContextModal(true)}>
              <Zap size={24} color="#8cd279" />
              <Text style={styles.quickActionText}>Find Charging</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={showRangeInfo}>
              <Battery size={24} color="#8cd279" />
              <Text style={styles.quickActionText}>Check Range</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleEmergencyMode}>
              <Navigation size={24} color="#8cd279" />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bot size={48} color="#666666" />
            <Text style={styles.emptyTitle}>Welcome to Smart EV Assistant</Text>
            <Text style={styles.emptySubtitle}>
              Ask me about charging, find stations, check range, or get emergency help
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onQuickReply={handleQuickReply}
              onSuggestion={() => {}}
            />
          ))
        )}

        {/* Show Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            {userContext && userContext.batteryLevel! < 20 && recommendations[0] ? (
              <EmergencyModeCard
                batteryLevel={userContext.batteryLevel!}
                recommendations={recommendations}
                onBookStation={handleBookStation}
                onShowAll={() => {/* TODO: Show all modal */}}
              />
            ) : (
              recommendations.slice(0, 3).map((rec, index) => (
                <PersonalizedStationCard
                  key={rec.id}
                  recommendation={rec}
                  rank={index + 1}
                  onBook={handleBookStation}
                  onViewDetails={handleViewStationDetails}
                />
              ))
            )}
          </View>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
            <Text style={styles.typingText}>Smart Assistant is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#666666"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={inputText.trim() ? "#000000" : "#666666"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Context Collection Modal */}
      <ContextCollectionModal
        visible={showContextModal}
        onClose={() => setShowContextModal(false)}
        onContextSubmit={handleContextSubmit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8cd279',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
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
  recommendationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8cd279',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8cd279',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#4A4A4A',
  },
  errorContainer: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ChatbotScreenEnhanced;

