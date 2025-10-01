/**
 * Chat Message Component
 * Displays individual chat messages with different types
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { 
  User, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  Navigation,
  Battery,
  Wrench,
  DollarSign,
  Cloud,
  MapPin
} from 'lucide-react-native';
import { ChatMessage as ChatMessageType, QuickReply, ChatCard, ChatSuggestion } from '../../services/AIChatbotService';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (quickReply: QuickReply) => void;
  onCardAction?: (action: QuickReply) => void;
  onSuggestion?: (suggestion: ChatSuggestion) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onQuickReply, 
  onCardAction, 
  onSuggestion 
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'charging_stations': return <MapPin size={16} color="#8cd279" />;
      case 'booking': return <Navigation size={16} color="#F59E0B" />;
      case 'battery_health': return <Battery size={16} color="#10B981" />;
      case 'maintenance': return <Wrench size={16} color="#EF4444" />;
      case 'pricing': return <DollarSign size={16} color="#3B82F6" />;
      case 'weather': return <Cloud size={16} color="#8B5CF6" />;
      default: return <MessageCircle size={16} color="#B0B0B0" />;
    }
  };

  const renderQuickReplies = (quickReplies: QuickReply[]) => {
    return (
      <View style={styles.quickRepliesContainer}>
        {quickReplies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            style={styles.quickReplyButton}
            onPress={() => onQuickReply?.(reply)}
          >
            <Text style={styles.quickReplyText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCards = (cards: ChatCard[]) => {
    return (
      <View style={styles.cardsContainer}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{card.description}</Text>
            {card.image && (
              <Image source={{ uri: card.image }} style={styles.cardImage} />
            )}
            <View style={styles.cardActions}>
              {card.actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.cardActionButton}
                  onPress={() => onCardAction?.(action)}
                >
                  <Text style={styles.cardActionText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSuggestions = (suggestions: ChatSuggestion[]) => {
    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>You might want to ask:</Text>
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionButton}
            onPress={() => onSuggestion?.(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      message.isUser ? styles.userContainer : styles.botContainer
    ]}>
      {/* Message Header */}
      <View style={styles.messageHeader}>
        <View style={styles.messageIcon}>
          {message.isUser ? (
            <User size={20} color="#FFFFFF" />
          ) : (
            <Bot size={20} color="#8cd279" />
          )}
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.messageSender}>
            {message.isUser ? 'You' : 'EV Assistant'}
          </Text>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>

      {/* Message Content */}
      <View style={[
        styles.messageContent,
        message.isUser ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          {message.text}
        </Text>

        {/* Message Data */}
        {message.data && (
          <View style={styles.messageData}>
            {message.data.quickReplies && renderQuickReplies(message.data.quickReplies)}
            {message.data.cards && renderCards(message.data.cards)}
            {message.data.suggestions && renderSuggestions(message.data.suggestions)}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },

  userContainer: {
    alignItems: 'flex-end',
  },

  botContainer: {
    alignItems: 'flex-start',
  },

  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  messageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  messageInfo: {
    flex: 1,
  },

  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  messageTime: {
    fontSize: 12,
    color: '#B0B0B0',
  },

  messageContent: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },

  userMessage: {
    backgroundColor: '#8cd279',
    borderBottomRightRadius: 4,
  },

  botMessage: {
    backgroundColor: '#2A2A2A',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  userMessageText: {
    color: '#000000',
  },

  botMessageText: {
    color: '#FFFFFF',
  },

  messageData: {
    marginTop: 12,
  },

  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickReplyButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  quickReplyText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  cardsContainer: {
    gap: 12,
  },

  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  cardHeader: {
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  cardDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
  },

  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },

  cardActionButton: {
    backgroundColor: '#8cd279',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  cardActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },

  suggestionsContainer: {
    marginTop: 8,
  },

  suggestionsTitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },

  suggestionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },

  suggestionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ChatMessage;
