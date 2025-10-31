/**
 * AI Chatbot Service
 * Provides intelligent customer support and assistance
 */

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  type: 'text' | 'quick_reply' | 'card' | 'suggestion';
  data?: any;
}

export interface QuickReply {
  id: string;
  text: string;
  action: string;
  payload?: any;
}

export interface ChatCard {
  id: string;
  title: string;
  description: string;
  image?: string;
  actions: QuickReply[];
}

export interface ChatSuggestion {
  id: string;
  text: string;
  category: string;
}

export interface ChatContext {
  userId: string;
  sessionId: string;
  vehicleId?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastBooking?: any;
  currentBattery?: number;
  vehicleHealth?: any;
  recentBookings?: any[];
  unreadNotifications?: number;
  vehicleModel?: string;
  preferences: {
    language: string;
    notifications: boolean;
    theme: string;
  };
}

export interface ChatResponse {
  message: string;
  type: 'text' | 'quick_reply' | 'card' | 'suggestion';
  quickReplies?: QuickReply[];
  cards?: ChatCard[];
  suggestions?: ChatSuggestion[];
  actions?: string[];
  confidence: number;
}

class AIChatbotService {
  private static instance: AIChatbotService;
  private context: ChatContext | null = null;
  private conversationHistory: ChatMessage[] = [];
  private conversationMemory: Map<string, any> = new Map(); // For maintaining conversation context
  private userPreferences: Map<string, any> = new Map(); // For user preferences and history
  private messageCounter: number = 0; // For generating unique message IDs
  private conversationState: Map<string, string> = new Map(); // For tracking conversation flow

  static getInstance(): AIChatbotService {
    if (!AIChatbotService.instance) {
      AIChatbotService.instance = new AIChatbotService();
    }
    return AIChatbotService.instance;
  }

  /**
   * Initialize chatbot with user context
   */
  async initialize(context: ChatContext): Promise<void> {
    try {
      this.context = context;
      this.conversationHistory = [];
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: 'Hello! I\'m your EV charging assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      
      this.conversationHistory.push(welcomeMessage);
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      throw error;
    }
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    if (!this.context) {
      throw new Error('Chatbot not initialized');
    }

    // Add user message to history
    this.messageCounter++;
    const userMessage: ChatMessage = {
      id: `user_${this.messageCounter}_${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    this.conversationHistory.push(userMessage);

    // Process message and generate response
    const response = await this.processMessage(message);

    // Add bot response to history
    this.messageCounter++;
    const botMessage: ChatMessage = {
      id: `bot_${this.messageCounter}_${Date.now()}`,
      text: response.message,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: response.type,
      data: {
        quickReplies: response.quickReplies,
        cards: response.cards,
        suggestions: response.suggestions,
        actions: response.actions,
      },
    };

    this.conversationHistory.push(botMessage);

    return response;
  }

  /**
   * Process user message and generate response
   */
  private async processMessage(message: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();

    // Intent recognition
    const intent = this.recognizeIntent(lowerMessage);

    switch (intent) {
      case 'greeting':
        return this.handleGreeting();
      case 'help':
        return this.handleHelp();
      case 'charging_stations':
        return this.handleChargingStations();
      case 'trip_planning':
        return this.handleTripPlanning();
      case 'booking':
        return this.handleBooking();
      case 'pricing':
        return this.handlePricing();
      case 'support':
        return this.handleSupport();
      case 'weather':
        return this.handleWeather();
      case 'amenities':
        return this.handleAmenities();
      case 'notifications':
        return this.handleNotifications();
      case 'vehicle_info':
        return this.handleVehicleInfo();
      case 'charging_history':
        return this.handleChargingHistory();
      case 'current_status':
        return this.handleCurrentStatus();
      default:
        return this.handleUnknown();
    }
  }

  /**
   * Recognize user intent with enhanced pattern matching
   */
  private recognizeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Enhanced intent patterns with multiple keywords and context
    const intents = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy'],
        confidence: 0.9
      },
      help: {
        patterns: ['help', 'assist', 'support', 'what can you do', 'how do i', 'i need help', 'can you help'],
        confidence: 0.8
      },
      charging_stations: {
        patterns: ['station', 'charger', 'charging', 'find', 'nearby', 'location', 'where can i charge', 'charging point', 'ev station'],
        confidence: 0.85
      },
      trip_planning: {
        patterns: ['trip', 'route', 'plan', 'travel', 'journey', 'plan a trip', 'route planning', 'battery estimate', 'trip planner', 'road trip'],
        confidence: 0.9
      },
      booking: {
        patterns: ['book', 'reserve', 'schedule', 'appointment', 'slot', 'make reservation', 'book charging', 'reserve slot'],
        confidence: 0.9
      },
      pricing: {
        patterns: ['price', 'cost', 'rate', 'expensive', 'cheap', 'discount', 'pricing', 'how much', 'cost of charging'],
        confidence: 0.8
      },
      support: {
        patterns: ['problem', 'issue', 'error', 'bug', 'complaint', 'contact', 'trouble', 'not working', 'broken'],
        confidence: 0.9
      },
      weather: {
        patterns: ['weather', 'rain', 'snow', 'temperature', 'hot', 'cold', 'forecast', 'weather conditions'],
        confidence: 0.75
      },
      amenities: {
        patterns: ['amenities', 'restaurant', 'food', 'shopping', 'entertainment', 'facilities', 'nearby places'],
        confidence: 0.8
      },
      notifications: {
        patterns: ['notification', 'alert', 'reminder', 'notification settings', 'alerts', 'notifications'],
        confidence: 0.8
      },
      vehicle_info: {
        patterns: ['vehicle', 'car', 'my vehicle', 'vehicle details', 'car information'],
        confidence: 0.8
      },
      charging_history: {
        patterns: ['history', 'charging history', 'past charges', 'previous sessions', 'charge history'],
        confidence: 0.8
      },
      current_status: {
        patterns: ['status', 'current status', 'what\'s happening', 'current situation', 'right now'],
        confidence: 0.7
      },
    };

    let bestMatch = 'unknown';
    let bestConfidence = 0;

    for (const [intent, data] of Object.entries(intents)) {
      for (const pattern of data.patterns) {
        if (lowerMessage.includes(pattern)) {
          const confidence = data.confidence;
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestMatch = intent;
          }
        }
      }
    }

    // Special handling for contextual queries
    if (lowerMessage.includes('battery') && lowerMessage.includes('percentage') ||
        lowerMessage.includes('how much battery') || lowerMessage.includes('battery level')) {
      return 'battery_health';
    }

    if (lowerMessage.includes('find') && lowerMessage.includes('station')) {
      return 'charging_stations';
    }

    if (lowerMessage.includes('book') && lowerMessage.includes('station')) {
      return 'booking';
    }

    return bestMatch;
  }

  /**
   * Handle greeting intent
   */
  private handleGreeting(): ChatResponse {
    const context = this.getConversationContext();
    const batteryLevel = this.context?.currentBattery || 'unknown';
    const unreadNotifications = this.context?.unreadNotifications || 0;

    // Provide contextual greeting based on user's current state
    let greetingMessage = 'Hello! I\'m your EV charging assistant. ';

    if (batteryLevel !== 'unknown' && parseInt(batteryLevel.toString()) < 20) {
      greetingMessage += 'I notice your battery is getting low. ';
    }

    if (unreadNotifications > 0) {
      greetingMessage += `You have ${unreadNotifications} unread notifications. `;
    }

    if (context.conversationLength > 5) {
      greetingMessage += 'Great to see you back! ';
    }

    greetingMessage += 'How can I help you with your EV charging today?';

    return {
      message: greetingMessage,
      type: 'quick_reply',
      quickReplies: [
        { id: 'find_stations', text: 'Find Charging Stations', action: 'find_stations' },
        { id: 'plan_trip', text: 'Plan a Trip', action: 'plan_trip' },
        { id: 'book_slot', text: 'Book a Slot', action: 'book_slot' },
        { id: 'view_bookings', text: 'View My Bookings', action: 'view_bookings' },
        { id: 'help', text: 'Get Help', action: 'help' },
      ],
      confidence: 0.95,
    };
  }

  /**
   * Handle help intent
   */
  private handleHelp(): ChatResponse {
    const context = this.getConversationContext();
    const engagement = context.userEngagement;

    // Provide more targeted help based on engagement level
    if (engagement === 'high') {
      return {
        message: 'I see you\'re actively using the app! Here are some advanced features I can help with:',
        type: 'card',
        cards: [
          {
            id: 'help_card_1',
            title: 'Smart Charging',
            description: 'Optimize your charging schedule and find the best rates',
            actions: [
              { id: 'smart_charging', text: 'Smart Charging', action: 'smart_charging' },
              { id: 'price_optimization', text: 'Price Optimization', action: 'price_optimization' },
            ],
          },
          {
            id: 'help_card_2',
            title: 'Trip Planning',
            description: 'Plan routes with charging stops and range calculations',
            actions: [
              { id: 'plan_route', text: 'Plan Route', action: 'plan_route' },
              { id: 'range_calculator', text: 'Range Calculator', action: 'range_calculator' },
            ],
          },
          {
            id: 'help_card_3',
            title: 'Support & Help',
            description: 'Get assistance and help with any issues',
            actions: [
              { id: 'get_support', text: 'Get Support', action: 'support' },
              { id: 'report_issue', text: 'Report Issue', action: 'support' },
            ],
          },
        ],
        confidence: 0.95,
      };
    }

    return {
      message: 'I can help you with various EV charging tasks. Here\'s what I can do:',
      type: 'card',
      cards: [
        {
          id: 'help_card_1',
          title: 'Find Charging Stations',
          description: 'Locate nearby charging stations',
          actions: [
            { id: 'find_nearby', text: 'Find Nearby', action: 'find_nearby' },
            { id: 'search_location', text: 'Search Location', action: 'search_location' },
          ],
        },
        {
          id: 'help_card_2',
          title: 'Book Charging Slots',
          description: 'Reserve charging slots at your preferred stations',
          actions: [
            { id: 'book_now', text: 'Book Now', action: 'book_now' },
            { id: 'view_bookings', text: 'View Bookings', action: 'view_bookings' },
          ],
        },
        {
          id: 'help_card_3',
          title: 'Pricing & Weather',
          description: 'Check charging prices and weather conditions',
          actions: [
            { id: 'check_pricing', text: 'Check Pricing', action: 'pricing' },
            { id: 'check_weather', text: 'Check Weather', action: 'weather' },
          ],
        },
      ],
      confidence: 0.90,
    };
  }

  /**
   * Handle charging stations intent
   */
  private handleChargingStations(): ChatResponse {
    const context = this.getConversationContext();
    const contextualPrefix = this.getContextualResponse('charging_stations');

    // Provide more specific responses based on context
    if (context.lastIntent === 'charging_stations') {
      return {
        message: `${contextualPrefix}I can help you find the perfect charging station. Here are your options:`,
        type: 'quick_reply',
        quickReplies: [
          { id: 'find_nearby', text: 'Find Nearby Stations', action: 'find_nearby' },
          { id: 'fast_charging', text: 'Fast Charging Only', action: 'fast_charging' },
          { id: 'price_comparison', text: 'Compare Prices', action: 'price_comparison' },
          { id: 'filter_stations', text: 'Filter by Type', action: 'filter_stations' },
        ],
        confidence: 0.9,
      };
    }

    return {
      message: 'I can help you find charging stations near you. What type of station are you looking for?',
      type: 'quick_reply',
      quickReplies: [
        { id: 'find_nearby', text: 'Find Nearby Stations', action: 'find_nearby' },
        { id: 'search_location', text: 'Search by Location', action: 'search_location' },
        { id: 'filter_stations', text: 'Filter by Type', action: 'filter_stations' },
        { id: 'amenities', text: 'Stations with Amenities', action: 'amenities' },
      ],
      confidence: 0.85,
    };
  }

  /**
   * Handle booking intent
   */
  private handleBooking(): ChatResponse {
    return {
      message: 'I can help you book charging slots. Here are your options:',
      type: 'quick_reply',
      quickReplies: [
        { id: 'book_now', text: 'Book Now', action: 'book_now' },
        { id: 'view_bookings', text: 'View My Bookings', action: 'view_bookings' },
        { id: 'modify_booking', text: 'Modify Booking', action: 'modify_booking' },
        { id: 'cancel_booking', text: 'Cancel Booking', action: 'cancel_booking' },
      ],
      confidence: 0.88,
    };
  }

  /**
   * Handle trip planning intent
   */
  private handleTripPlanning(): ChatResponse {
    return {
      message: 'I can help you plan your trip with battery estimates and charging stops. Let me assist you with route planning! 🗺️🚗',
      type: 'quick_reply',
      quickReplies: [
        { id: 'plan_trip', text: 'Plan a Trip', action: 'plan_trip' },
        { id: 'find_stations', text: 'Find Stations', action: 'find_stations' },
        { id: 'view_map', text: 'View Map', action: 'show_map' },
        { id: 'book_now', text: 'Book Now', action: 'book_now' },
      ],
      confidence: 0.90,
    };
  }

  /**
   * Handle pricing intent
   */
  private handlePricing(): ChatResponse {
    return {
      message: 'I can help you with pricing information. What would you like to know?',
      type: 'quick_reply',
      quickReplies: [
        { id: 'current_rates', text: 'Current Rates', action: 'current_rates' },
        { id: 'price_comparison', text: 'Price Comparison', action: 'price_comparison' },
        { id: 'discounts', text: 'Discounts & Offers', action: 'discounts' },
        { id: 'membership', text: 'Membership Benefits', action: 'membership' },
      ],
      confidence: 0.85,
    };
  }

  /**
   * Handle support intent
   */
  private handleSupport(): ChatResponse {
    return {
      message: 'I\'m here to help! What issue are you experiencing?',
      type: 'quick_reply',
      quickReplies: [
        { id: 'technical_issue', text: 'Technical Issue', action: 'technical_issue' },
        { id: 'billing_issue', text: 'Billing Issue', action: 'billing_issue' },
        { id: 'app_issue', text: 'App Issue', action: 'app_issue' },
        { id: 'contact_support', text: 'Contact Support', action: 'contact_support' },
      ],
      confidence: 0.88,
    };
  }

  /**
   * Handle weather intent
   */
  private handleWeather(): ChatResponse {
    return {
      message: 'Weather can affect your EV\'s performance. Here\'s what I can help with:',
      type: 'quick_reply',
      quickReplies: [
        { id: 'weather_impact', text: 'Weather Impact', action: 'weather_impact' },
        { id: 'charging_tips', text: 'Charging Tips', action: 'charging_tips' },
        { id: 'range_adjustment', text: 'Range Adjustment', action: 'range_adjustment' },
        { id: 'weather_alerts', text: 'Weather Alerts', action: 'weather_alerts' },
      ],
      confidence: 0.83,
    };
  }

  /**
   * Handle amenities intent
   */
  private handleAmenities(): ChatResponse {
    return {
      message: 'I can help you find amenities near charging stations. What are you looking for?',
      type: 'quick_reply',
      quickReplies: [
        { id: 'restaurants', text: 'Restaurants', action: 'restaurants' },
        { id: 'shopping', text: 'Shopping', action: 'shopping' },
        { id: 'entertainment', text: 'Entertainment', action: 'entertainment' },
        { id: 'services', text: 'Services', action: 'services' },
      ],
      confidence: 0.86,
    };
  }

  /**
   * Handle notifications intent
   */
  private handleNotifications(): ChatResponse {
    const unreadCount = this.context?.unreadNotifications || 0;

    return {
      message: `I can help you manage your notifications. You currently have ${unreadCount} unread notifications. What would you like to do?`,
      type: 'quick_reply',
      quickReplies: [
        { id: 'view_notifications', text: 'View Notifications', action: 'view_notifications' },
        { id: 'notification_settings', text: 'Notification Settings', action: 'notification_settings' },
        { id: 'mark_all_read', text: 'Mark All as Read', action: 'mark_all_read' },
        { id: 'manage_reminders', text: 'Manage Reminders', action: 'manage_reminders' },
      ],
      confidence: 0.9,
    };
  }

  /**
   * Handle vehicle info intent
   */
  private handleVehicleInfo(): ChatResponse {
    const vehicleModel = this.context?.vehicleModel || 'your vehicle';

    return {
      message: `I can provide information about ${vehicleModel}. What would you like to know?`,
      type: 'quick_reply',
      quickReplies: [
        { id: 'vehicle_specs', text: 'Vehicle Specs', action: 'vehicle_specs' },
        { id: 'charging_history', text: 'Charging History', action: 'charging_history' },
        { id: 'find_stations', text: 'Find Stations', action: 'find_stations' },
        { id: 'book_slot', text: 'Book Slot', action: 'book_slot' },
      ],
      confidence: 0.9,
    };
  }

  /**
   * Handle charging history intent
   */
  private handleChargingHistory(): ChatResponse {
    return {
      message: 'I can show you your charging history and patterns. What would you like to see?',
      type: 'quick_reply',
      quickReplies: [
        { id: 'recent_sessions', text: 'Recent Sessions', action: 'recent_sessions' },
        { id: 'monthly_summary', text: 'Monthly Summary', action: 'monthly_summary' },
        { id: 'cost_analysis', text: 'Cost Analysis', action: 'cost_analysis' },
        { id: 'usage_patterns', text: 'Usage Patterns', action: 'usage_patterns' },
      ],
      confidence: 0.85,
    };
  }

  /**
   * Handle current status intent
   */
  private handleCurrentStatus(): ChatResponse {
    return {
      message: `Here's what I can help you with right now:`,
      type: 'quick_reply',
      quickReplies: [
        { id: 'find_stations', text: 'Find Stations', action: 'find_stations' },
        { id: 'view_bookings', text: 'View Bookings', action: 'view_bookings' },
        { id: 'book_slot', text: 'Book Slot', action: 'book_slot' },
        { id: 'check_pricing', text: 'Check Pricing', action: 'pricing' },
      ],
      confidence: 0.85,
    };
  }

  /**
   * Handle unknown intent
   */
  private handleUnknown(): ChatResponse {
    const context = this.getConversationContext();

    // Provide more contextual suggestions based on conversation history
    let suggestions = [
      { id: 'suggest_1', text: 'Find charging stations', category: 'stations' },
      { id: 'suggest_2', text: 'Book a charging slot', category: 'booking' },
      { id: 'suggest_3', text: 'View my bookings', category: 'bookings' },
      { id: 'suggest_4', text: 'Check pricing', category: 'pricing' },
      { id: 'suggest_5', text: 'Get help', category: 'support' },
    ];

    // Customize suggestions based on recent conversation topics
    if (context.recentTopics.includes('charging_stations')) {
      suggestions = [
        { id: 'suggest_1', text: 'Find fast charging stations', category: 'stations' },
        { id: 'suggest_2', text: 'Compare station prices', category: 'pricing' },
        { id: 'suggest_3', text: 'Filter stations by type', category: 'stations' },
        { id: 'suggest_4', text: 'Find stations with amenities', category: 'amenities' },
      ];
    }

    return {
      message: 'I\'m not quite sure what you mean. Could you try rephrasing, or let me suggest some options based on what we\'ve been discussing:',
      type: 'suggestion',
      suggestions,
      confidence: 0.60,
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    this.conversationHistory = [];
  }

  /**
   * Get quick replies for common actions
   */
  getQuickReplies(): QuickReply[] {
    return [
      { id: 'find_stations', text: 'Find Stations', action: 'find_stations' },
      { id: 'plan_trip', text: 'Plan a Trip', action: 'plan_trip' },
      { id: 'book_slot', text: 'Book Slot', action: 'book_slot' },
      { id: 'view_bookings', text: 'View Bookings', action: 'view_bookings' },
      { id: 'check_pricing', text: 'Check Pricing', action: 'pricing' },
      { id: 'support', text: 'Support', action: 'support' },
      { id: 'help', text: 'Help', action: 'help' },
    ];
  }

  /**
   * Get context information
   */
  getContext(): ChatContext | null {
    return this.context;
  }

  /**
   * Update context
   */
  updateContext(updates: Partial<ChatContext>): void {
    if (this.context) {
      this.context = { ...this.context, ...updates };
    }
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(): {
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    sessionDuration: number;
  } {
    const userMessages = this.conversationHistory.filter(msg => msg.isUser).length;
    const botMessages = this.conversationHistory.filter(msg => !msg.isUser).length;

    let sessionDuration = 0;
    if (this.conversationHistory.length > 0) {
      const firstMessage = this.conversationHistory[0];
      const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
      sessionDuration = new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime();
    }

    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      botMessages,
      sessionDuration,
    };
  }

  /**
   * Set conversation memory
   */
  setMemory(key: string, value: any): void {
    this.conversationMemory.set(key, value);
  }

  /**
   * Get conversation memory
   */
  getMemory(key: string): any {
    return this.conversationMemory.get(key);
  }

  /**
   * Clear conversation memory
   */
  clearMemory(): void {
    this.conversationMemory.clear();
  }

  /**
   * Get contextual response based on conversation history
   */
  private getContextualResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Check if user is asking about something they previously discussed
    const lastUserMessage = this.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.isUser);

    if (lastUserMessage) {
      // If they asked about charging before, reference it
      if (lastUserMessage.text.toLowerCase().includes('charging') && lowerMessage.includes('station')) {
        return "Following up on your charging inquiry, ";
      }

      // If they asked about booking before, reference it
      if (lastUserMessage.text.toLowerCase().includes('book') && lowerMessage.includes('station')) {
        return "Based on your booking inquiry, ";
      }
    }

    return "";
  }

  /**
   * Set conversation state for better flow control
   */
  setConversationState(key: string, value: string): void {
    this.conversationState.set(key, value);
  }

  /**
   * Get conversation state
   */
  getConversationState(key: string): string | undefined {
    return this.conversationState.get(key);
  }

  /**
   * Clear conversation state
   */
  clearConversationState(): void {
    this.conversationState.clear();
  }

  /**
   * Get conversation context for better responses
   */
  private getConversationContext(): {
    lastIntent?: string;
    conversationLength: number;
    recentTopics: string[];
    userEngagement: 'low' | 'medium' | 'high';
  } {
    const recentMessages = this.conversationHistory.slice(-5);
    const intents = recentMessages.map(msg => this.extractIntentFromMessage(msg.text)).filter((intent): intent is string => Boolean(intent));

    return {
      lastIntent: intents[intents.length - 1],
      conversationLength: this.conversationHistory.length,
      recentTopics: intents.slice(-3),
      userEngagement: this.calculateEngagementLevel(),
    };
  }

  /**
   * Extract intent from a message (simplified)
   */
  private extractIntentFromMessage(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('trip') || lowerMessage.includes('route') || lowerMessage.includes('plan') || lowerMessage.includes('travel')) return 'trip_planning';
    if (lowerMessage.includes('station') || lowerMessage.includes('charger')) return 'charging_stations';
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) return 'booking';
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) return 'pricing';
    if (lowerMessage.includes('support') || lowerMessage.includes('help')) return 'support';
    return undefined;
  }

  /**
   * Calculate user engagement level
   */
  private calculateEngagementLevel(): 'low' | 'medium' | 'high' {
    const recentMessages = this.conversationHistory.slice(-10);
    const userMessages = recentMessages.filter(msg => msg.isUser).length;

    if (userMessages >= 5) return 'high';
    if (userMessages >= 2) return 'medium';
    return 'low';
  }

}

export default AIChatbotService;
