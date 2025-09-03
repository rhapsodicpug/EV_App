import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface NetworkError {
  type: 'network' | 'server' | 'timeout' | 'unauthorized' | 'forbidden' | 'notFound' | 'validation' | 'unknown';
  message: string;
  statusCode?: number;
  originalError?: any;
}

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private isOnline = true;
  private retryQueue: Array<() => Promise<void>> = [];

  static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Came back online, retry queued requests
        this.processRetryQueue();
      }
    });
  }

  private async processRetryQueue() {
    while (this.retryQueue.length > 0) {
      const retryFunction = this.retryQueue.shift();
      if (retryFunction) {
        try {
          await retryFunction();
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
    }
  }

  public addToRetryQueue(retryFunction: () => Promise<void>) {
    this.retryQueue.push(retryFunction);
  }

  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  public async checkNetworkStatus(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  public handleError(error: any): NetworkError {
    if (!this.isOnline) {
      return {
        type: 'network',
        message: 'You are offline. Please check your internet connection.',
        originalError: error,
      };
    }

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: this.extractValidationMessage(data),
            statusCode: status,
            originalError: error,
          };
        case 401:
          return {
            type: 'unauthorized',
            message: 'Please login again to continue.',
            statusCode: status,
            originalError: error,
          };
        case 403:
          return {
            type: 'forbidden',
            message: 'You do not have permission to perform this action.',
            statusCode: status,
            originalError: error,
          };
        case 404:
          return {
            type: 'notFound',
            message: 'The requested resource was not found.',
            statusCode: status,
            originalError: error,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'server',
            message: 'Server error. Please try again later.',
            statusCode: status,
            originalError: error,
          };
        default:
          return {
            type: 'server',
            message: `Server error (${status}). Please try again.`,
            statusCode: status,
            originalError: error,
          };
      }
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timeout. Please try again.',
        originalError: error,
      };
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        type: 'network',
        message: 'Network error. Please check your connection.',
        originalError: error,
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      originalError: error,
    };
  }

  private extractValidationMessage(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((item: any) => item.msg || item.message).join(', ');
      }
      return data.detail;
    }

    if (data?.message) {
      return data.message;
    }

    return 'Please check your input and try again.';
  }

  public showErrorAlert(error: NetworkError, onRetry?: () => void) {
    const actions: Array<{ text: string; style: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [
      { text: 'OK', style: 'default' },
    ];

    if (onRetry && error.type !== 'unauthorized') {
      actions.unshift({ text: 'Retry', style: 'default', onPress: onRetry });
    }

    Alert.alert(
      'Error',
      error.message,
      actions,
      { cancelable: true }
    );
  }

  public getErrorMessage(error: NetworkError): string {
    return error.message;
  }

  public shouldRetry(error: NetworkError): boolean {
    return error.type !== 'unauthorized' && error.type !== 'forbidden' && error.type !== 'validation';
  }
}

// Retry mechanism with exponential backoff
export class RetryMechanism {
  private maxRetries: number;
  private baseDelay: number;

  constructor(maxRetries: number = 3, baseDelay: number = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  public async execute<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: any) => void
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          throw error;
        }

        const errorHandler = NetworkErrorHandler.getInstance();
        const networkError = errorHandler.handleError(error);

        if (!errorHandler.shouldRetry(networkError)) {
          throw error;
        }

        onRetry?.(attempt, error);

        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Offline queue manager
export class OfflineQueueManager {
  private static instance: OfflineQueueManager;
  private queue: Array<{
    id: string;
    operation: () => Promise<void>;
    timestamp: number;
  }> = [];

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  public addToQueue(operation: () => Promise<void>): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.queue.push({
      id,
      operation,
      timestamp: Date.now(),
    });

    return id;
  }

  public async processQueue(): Promise<void> {
    const errorHandler = NetworkErrorHandler.getInstance();
    
    if (!errorHandler.isNetworkOnline()) {
      return;
    }

    const queueCopy = [...this.queue];
    this.queue = [];

    for (const item of queueCopy) {
      try {
        await item.operation();
      } catch (error) {
        console.error(`Failed to process offline queue item ${item.id}:`, error);
        // Re-add to queue if it's a network error
        const networkError = errorHandler.handleError(error);
        if (networkError.type === 'network') {
          this.queue.push(item);
        }
      }
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public clearQueue(): void {
    this.queue = [];
  }
}

export default NetworkErrorHandler;
