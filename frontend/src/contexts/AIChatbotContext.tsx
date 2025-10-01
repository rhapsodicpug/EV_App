/**
 * AI Chatbot Context
 * Provides chatbot functionality across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AIChatbotService, { 
  ChatMessage, 
  ChatResponse, 
  ChatContext,
  QuickReply,
  ChatCard,
  ChatSuggestion
} from '../services/AIChatbotService';

interface AIChatbotContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<ChatResponse>;
  sendQuickReply: (quickReply: QuickReply) => Promise<ChatResponse>;
  clearConversation: () => void;
  getQuickReplies: () => QuickReply[];
  getConversationStats: () => any;
  isTyping: boolean;
}

const AIChatbotContext = createContext<AIChatbotContextType | undefined>(undefined);

interface AIChatbotProviderProps {
  children: ReactNode;
  userId: string;
  vehicleId?: string;
}

export const AIChatbotProvider: React.FC<AIChatbotProviderProps> = ({ 
  children, 
  userId,
  vehicleId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatbotService = AIChatbotService.getInstance();

  const initializeChatbot = async () => {
    try {
      const context: ChatContext = {
        userId,
        sessionId: `session_${Date.now()}`,
        vehicleId,
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'dark',
        },
      };

      // Initialize with basic context first
      await chatbotService.initialize(context);

      // Update with additional context from other services
      setTimeout(() => {
        updateContextWithAppState();
      }, 1000); // Delay to ensure other contexts are loaded

      const history = chatbotService.getConversationHistory();
      setMessages(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize chatbot');
    }
  };

  const updateContextWithAppState = () => {
    // Update chatbot context with data from other services
    chatbotService.updateContext({
      currentBattery: 75, // This would come from battery context
      vehicleHealth: {
        overallHealth: 87,
        batteryHealth: 91,
        tireHealth: 85,
        brakeHealth: 78,
        coolingHealth: 92,
        softwareHealth: 95,
      },
      vehicleModel: 'Tesla Model 3', // This would come from vehicle context
      unreadNotifications: 3, // This would come from notification context
      recentBookings: [
        { id: '1', stationName: 'Downtown Station', date: '2024-01-15', status: 'completed' }
      ], // This would come from booking context
    });
  };

  const sendMessage = async (message: string): Promise<ChatResponse> => {
    try {
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      const response = await chatbotService.sendMessage(message);
      const updatedHistory = chatbotService.getConversationHistory();
      setMessages(updatedHistory);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const sendQuickReply = async (quickReply: QuickReply): Promise<ChatResponse> => {
    try {
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      // Generate unique message ID using chatbot service counter
      const messageId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add quick reply as user message
      const userMessage: ChatMessage = {
        id: messageId,
        text: quickReply.text,
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'quick_reply',
        data: { action: quickReply.action, payload: quickReply.payload },
      };

      setMessages(prev => [...prev, userMessage]);

      // Send to chatbot
      const response = await chatbotService.sendMessage(quickReply.text);
      const updatedHistory = chatbotService.getConversationHistory();
      setMessages(updatedHistory);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quick reply');
      throw err;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    chatbotService.clearConversation();
    setMessages([]);
  };

  const getQuickReplies = (): QuickReply[] => {
    return chatbotService.getQuickReplies();
  };

  const getConversationStats = () => {
    return chatbotService.getConversationStats();
  };

  useEffect(() => {
    initializeChatbot();
  }, [userId, vehicleId]);

  const value: AIChatbotContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    sendQuickReply,
    clearConversation,
    getQuickReplies,
    getConversationStats,
    isTyping,
  };

  return (
    <AIChatbotContext.Provider value={value}>
      {children}
    </AIChatbotContext.Provider>
  );
};

export const useAIChatbot = (): AIChatbotContextType => {
  const context = useContext(AIChatbotContext);
  if (context === undefined) {
    throw new Error('useAIChatbot must be used within an AIChatbotProvider');
  }
  return context;
};
