/**
 * WebSocket Service for Real-time Booking Updates
 * Connects to backend WebSocket endpoint to receive real-time station availability updates
 */

import { API_CONFIG } from '../constants/config';

interface StationUpdate {
  type: 'booking_created' | 'booking_cancelled';
  station_id: string;
  station: {
    id: string;
    name: string;
    available_slots_count: number;
    total_slots_count: number;
    charging_slots: any[];
  };
  booking_id?: string;
  timestamp: string;
}

type UpdateCallback = (update: StationUpdate) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced to 3 attempts
  private reconnectDelay = 5000; // 5 seconds (increased)
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Set<UpdateCallback> = new Set();
  private isConnecting = false;
  private connectionDisabled = false; // Flag to disable after max attempts

  /**
   * Get WebSocket URL from API base URL
   */
  private getWebSocketUrl(): string {
    const baseUrl = API_CONFIG.BASE_URL;
    // Convert http:// to ws:// or https:// to wss://
    if (baseUrl.startsWith('http://')) {
      return baseUrl.replace('http://', 'ws://') + '/ws';
    } else if (baseUrl.startsWith('https://')) {
      return baseUrl.replace('https://', 'wss://') + '/ws';
    }
    return `ws://${baseUrl}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Don't attempt if connection is disabled
    if (this.connectionDisabled) {
      console.log('🚫 WebSocket connection disabled (max attempts reached)');
      return;
    }

    // Check if already connected or connecting
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket already connected');
        return;
      }
      if (this.ws.readyState === WebSocket.CONNECTING) {
        console.log('⏳ WebSocket already connecting');
        return;
      }
    }

    if (this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;
      const wsUrl = this.getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      // Close existing connection if any
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
        try {
          this.ws.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionDisabled = false; // Reset disabled flag on success
        
        // Send initial ping to verify connection
        try {
          this.ws?.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.error('❌ Error sending ping:', e);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          if (!event.data) {
            return;
          }
          
          const data = JSON.parse(event.data);
          
          // Handle pong messages (connection keepalive)
          if (data.type === 'pong') {
            console.log('📡 Received pong - connection alive');
            return;
          }

          // Handle station updates
          if (data.type === 'booking_created' || data.type === 'booking_cancelled') {
            console.log('📡 Received station update:', data.type, data.station_id);
            this.notifyListeners(data as StationUpdate);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        // Suppress error logging - connection failures are expected
        // The onclose handler will log disconnections and handle reconnection
        this.isConnecting = false;
        // Don't attempt reconnect on error - let onclose handle it
      };

      this.ws.onclose = (event) => {
        // Only log if it's not a normal closure or initial connection failure
        if (event.code !== 1000 && event.code !== 1006) {
          console.log('❌ WebSocket disconnected', event.code, event.reason || 'Connection closed unexpectedly');
        } else if (event.code === 1006) {
          // Silent connection failure (backend not accessible) - will attempt reconnection
        }
        this.isConnecting = false;
        this.ws = null;
        
        // Only reconnect if it wasn't an intentional close
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };
    } catch (error: any) {
      // Suppress initial connection errors - reconnection will be attempted
      // Only log unexpected errors
      if (error?.message && !error.message.includes('WebSocket')) {
        console.warn('⚠️ WebSocket setup error:', error.message);
      }
      this.isConnecting = false;
      this.ws = null;
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached. WebSocket disabled.');
      console.log('💡 Make sure backend is running and accessible at:', this.getWebSocketUrl());
      console.log('💡 App will continue to work, but without real-time updates.');
      this.connectionDisabled = true; // Disable further attempts
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000); // Max 30 seconds
    
    console.log(`🔄 Reconnecting in ${delay / 1000} seconds (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      // Only reconnect if we still have listeners and not disabled
      if (this.listeners.size > 0 && !this.connectionDisabled) {
        this.connect();
      } else {
        if (!this.listeners.size) {
          console.log('📡 No listeners, stopping reconnection attempts');
        }
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectionDisabled = false; // Reset on manual disconnect
    this.listeners.clear();
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Reset connection state (enable reconnection)
   */
  resetConnection(): void {
    this.connectionDisabled = false;
    this.reconnectAttempts = 0;
    console.log('🔄 WebSocket connection reset - reconnection enabled');
  }

  /**
   * Subscribe to station updates
   */
  subscribe(callback: UpdateCallback): () => void {
    this.listeners.add(callback);
    
    // Auto-connect if not connected and not disabled
    if (!this.connectionDisabled && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
      this.connect();
    } else if (this.connectionDisabled) {
      console.log('⚠️ WebSocket connection disabled. Real-time updates unavailable.');
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      // Disconnect if no listeners left
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  /**
   * Notify all listeners of an update
   */
  private notifyListeners(update: StationUpdate): void {
    this.listeners.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('❌ Error in update callback:', error);
      }
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;

