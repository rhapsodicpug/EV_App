/**
 * Chatbot Screen
 * AI-powered customer support and assistance
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
  User, 
  MessageCircle,
  Trash2,
  Settings,
  MoreVertical
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAIChatbot } from '../contexts/AIChatbotContext';
import ChatMessage from '../components/chat/ChatMessage';
import { QuickReply, ChatSuggestion } from '../services/AIChatbotService';

const ChatbotScreen: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    sendQuickReply,
    clearConversation,
    getQuickReplies,
    getConversationStats,
    isTyping
  } = useAIChatbot();

  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBackPress = () => {
    // When Chatbot is accessed from Profile navigator, back should go to Profile
    // When accessed from home shortcut, back should go to Profile first
    const parentNavigator = navigation.getParent();

    if (parentNavigator) {
      // Check if we're in a Profile navigator context
      const state = parentNavigator.getState();
      if (state && state.routeNames && state.routeNames.includes('ProfileMain')) {
        // We're in Profile navigator, go back to Profile screen
        navigation.goBack();
      } else {
        // We're accessed directly, navigate to Profile first
        (navigation as any).navigate('Profile', {
          screen: 'ProfileMain'
        });
      }
    } else {
      // Fallback to standard back navigation
      navigation.goBack();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');

    try {
      await sendMessage(message);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleQuickReply = async (quickReply: QuickReply) => {
    try {
      // Handle specific actions that require navigation or special handling
      switch (quickReply.action) {
        case 'view_notifications':
          (navigation as any).navigate('Notifications');
          return;
        case 'find_nearby':
          // Navigate to stations search
          (navigation as any).navigate('Search');
          return;
        case 'book_now':
          // Navigate to booking flow
          (navigation as any).navigate('Bookings');
          return;
        case 'check_health':
          // Navigate to battery health screen
          (navigation as any).navigate('BatteryHealth');
          return;
        case 'maintenance':
          // Navigate to maintenance screen
          (navigation as any).navigate('Maintenance');
          return;
        case 'plan_route':
          // Navigate to range anxiety screen
          (navigation as any).navigate('RangeAnxiety');
          return;
        case 'find_stations':
          // This should trigger a more specific response about finding stations
          await sendMessage('Find charging stations near me');
          return;
        case 'book_slot':
          await sendMessage('I want to book a charging slot');
          return;
        case 'battery_health':
          await sendMessage('Tell me about my battery health');
          return;
        case 'help':
          await sendMessage('I need help');
          return;
        default:
          // For other actions, send the text and let the chatbot handle it
          await sendQuickReply(quickReply);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send quick reply. Please try again.');
    }
  };

  const handleSuggestion = async (suggestion: ChatSuggestion) => {
    try {
      await sendMessage(suggestion.text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send suggestion. Please try again.');
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearConversation },
      ]
    );
  };

  const handleShowStats = () => {
    const stats = getConversationStats();
    Alert.alert(
      'Conversation Stats',
      `Total Messages: ${stats.totalMessages}\nUser Messages: ${stats.userMessages}\nBot Messages: ${stats.botMessages}\nSession Duration: ${Math.round(stats.sessionDuration / 1000 / 60)} minutes`,
      [{ text: 'OK' }]
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60} // Account for bottom navigation (reduced)
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Bot size={24} color="#8cd279" />
          <Text style={styles.headerTitle}>EV Assistant</Text>
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
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask me anything about EV charging, battery health, or maintenance
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onQuickReply={handleQuickReply}
              onSuggestion={handleSuggestion}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
            <Text style={styles.typingText}>EV Assistant is typing...</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingBottom: 80, // Account for bottom navigation bar (reduced)
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
    fontSize: 20,
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
    paddingBottom: 16, // Reduced padding at bottom
    marginBottom: 8, // Reduced margin for closer positioning
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

export default ChatbotScreen;
