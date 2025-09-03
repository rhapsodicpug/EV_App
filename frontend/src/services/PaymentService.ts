import { Platform } from 'react-native';
import { storageService } from './StorageService';

// ==================== TYPES ====================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  name: string;
  last4?: string;
  brand?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  timestamp: Date;
  bookingId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  paymentMethodId: string;
  bookingId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentReceipt {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bookingDetails: {
    stationName: string;
    duration: number;
    startTime: Date;
    endTime: Date;
  };
  timestamp: Date;
  invoiceNumber: string;
}

// ==================== PAYMENT SERVICE ====================

class PaymentService {
  private isWeb = Platform.OS === 'web';
  private mockWallet: Wallet = {
    id: 'wallet_001',
    balance: 500.00,
    currency: 'INR',
    lastUpdated: new Date(),
    transactions: [
      {
        id: 'tx_001',
        type: 'credit',
        amount: 1000.00,
        description: 'Initial wallet top-up',
        timestamp: new Date('2024-01-01'),
        status: 'completed',
      },
      {
        id: 'tx_002',
        type: 'debit',
        amount: 150.00,
        description: 'Charging session at Mumbai Central',
        timestamp: new Date('2024-01-15'),
        bookingId: 'booking_001',
        status: 'completed',
      },
    ],
  };

  // ==================== PAYMENT METHODS ====================

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const stored = await storageService.getItem('payment_methods');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default payment methods
      const defaultMethods: PaymentMethod[] = [
        {
          id: 'card_001',
          type: 'card',
          name: 'HDFC Credit Card',
          last4: '1234',
          brand: 'Visa',
          isDefault: true,
          isActive: true,
        },
        {
          id: 'upi_001',
          type: 'upi',
          name: 'UPI ID: user@hdfc',
          isDefault: false,
          isActive: true,
        },
        {
          id: 'wallet_001',
          type: 'wallet',
          name: 'App Wallet',
          isDefault: false,
          isActive: true,
        },
      ];

      await storageService.setItem('payment_methods', JSON.stringify(defaultMethods));
      return defaultMethods;
    } catch (error) {
      console.error('❌ Error getting payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    try {
      const methods = await this.getPaymentMethods();
      const newMethod: PaymentMethod = {
        ...method,
        id: `method_${Date.now()}`,
      };

      methods.push(newMethod);
      await storageService.setItem('payment_methods', JSON.stringify(methods));
      
      console.log('✅ Payment method added:', newMethod.name);
      return newMethod;
    } catch (error) {
      console.error('❌ Error adding payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const filtered = methods.filter(m => m.id !== methodId);
      await storageService.setItem('payment_methods', JSON.stringify(filtered));
      
      console.log('✅ Payment method removed:', methodId);
    } catch (error) {
      console.error('❌ Error removing payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const updated = methods.map(m => ({
        ...m,
        isDefault: m.id === methodId,
      }));
      
      await storageService.setItem('payment_methods', JSON.stringify(updated));
      console.log('✅ Default payment method updated:', methodId);
    } catch (error) {
      console.error('❌ Error setting default payment method:', error);
      throw error;
    }
  }

  // ==================== WALLET MANAGEMENT ====================

  async getWallet(): Promise<Wallet> {
    try {
      const stored = await storageService.getItem('wallet');
      if (stored) {
        const wallet = JSON.parse(stored);
        return {
          ...wallet,
          lastUpdated: new Date(wallet.lastUpdated),
          transactions: wallet.transactions.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          })),
        };
      }

      // Return mock wallet
      return this.mockWallet;
    } catch (error) {
      console.error('❌ Error getting wallet:', error);
      return this.mockWallet;
    }
  }

  async addWalletBalance(amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await this.getWallet();
      const transaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: 'credit',
        amount,
        description,
        timestamp: new Date(),
        status: 'completed',
      };

      wallet.balance += amount;
      wallet.transactions.unshift(transaction);
      wallet.lastUpdated = new Date();

      await storageService.setItem('wallet', JSON.stringify(wallet));
      console.log('✅ Wallet balance added:', amount);
      
      return wallet;
    } catch (error) {
      console.error('❌ Error adding wallet balance:', error);
      throw error;
    }
  }

  async deductWalletBalance(amount: number, description: string, bookingId?: string): Promise<Wallet> {
    try {
      const wallet = await this.getWallet();
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const transaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: 'debit',
        amount,
        description,
        timestamp: new Date(),
        bookingId,
        status: 'completed',
      };

      wallet.balance -= amount;
      wallet.transactions.unshift(transaction);
      wallet.lastUpdated = new Date();

      await storageService.setItem('wallet', JSON.stringify(wallet));
      console.log('✅ Wallet balance deducted:', amount);
      
      return wallet;
    } catch (error) {
      console.error('❌ Error deducting wallet balance:', error);
      throw error;
    }
  }

  // ==================== PAYMENT PROCESSING ====================

  async createPaymentIntent(amount: number, bookingId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency: 'INR',
        status: 'pending',
        paymentMethodId,
        bookingId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store payment intent
      await storageService.setItem(`payment_intent_${paymentIntent.id}`, JSON.stringify(paymentIntent));
      
      console.log('✅ Payment intent created:', paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw error;
    }
  }

  async processPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const stored = await storageService.getItem(`payment_intent_${paymentIntentId}`);
      if (!stored) {
        throw new Error('Payment intent not found');
      }

      const paymentIntent: PaymentIntent = JSON.parse(stored);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update status
      paymentIntent.status = 'succeeded';
      paymentIntent.updatedAt = new Date();
      
      await storageService.setItem(`payment_intent_${paymentIntentId}`, JSON.stringify(paymentIntent));
      
      console.log('✅ Payment processed successfully:', paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string, amount: number, reason: string): Promise<void> {
    try {
      const stored = await storageService.getItem(`payment_intent_${paymentIntentId}`);
      if (!stored) {
        throw new Error('Payment intent not found');
      }

      const paymentIntent: PaymentIntent = JSON.parse(stored);
      
      // Add refund transaction to wallet
      await this.addWalletBalance(amount, `Refund: ${reason}`);
      
      console.log('✅ Payment refunded:', paymentIntentId);
    } catch (error) {
      console.error('❌ Error refunding payment:', error);
      throw error;
    }
  }

  // ==================== RECEIPTS & INVOICES ====================

  async generateReceipt(paymentIntentId: string): Promise<PaymentReceipt> {
    try {
      const stored = await storageService.getItem(`payment_intent_${paymentIntentId}`);
      if (!stored) {
        throw new Error('Payment intent not found');
      }

      const paymentIntent: PaymentIntent = JSON.parse(stored);
      
      // Mock booking details (in real app, fetch from booking service)
      const receipt: PaymentReceipt = {
        id: `receipt_${Date.now()}`,
        paymentIntentId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: 'Credit Card', // Fetch from payment method
        bookingDetails: {
          stationName: 'Mumbai Central Station',
          duration: 2,
          startTime: new Date(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
        timestamp: new Date(),
        invoiceNumber: `INV-${Date.now()}`,
      };

      // Store receipt
      await storageService.setItem(`receipt_${receipt.id}`, JSON.stringify(receipt));
      
      console.log('✅ Receipt generated:', receipt.id);
      return receipt;
    } catch (error) {
      console.error('❌ Error generating receipt:', error);
      throw error;
    }
  }

  async getPaymentHistory(limit: number = 50): Promise<PaymentIntent[]> {
    try {
      // In a real app, this would query a database
      // For now, return mock data
      const mockHistory: PaymentIntent[] = [
        {
          id: 'pi_001',
          amount: 150.00,
          currency: 'INR',
          status: 'succeeded',
          paymentMethodId: 'card_001',
          bookingId: 'booking_001',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'pi_002',
          amount: 200.00,
          currency: 'INR',
          status: 'succeeded',
          paymentMethodId: 'wallet_001',
          bookingId: 'booking_002',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        },
      ];

      return mockHistory.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return [];
    }
  }

  // ==================== PAYMENT GATEWAY INTEGRATION ====================

  async initializePaymentGateway(): Promise<void> {
    if (this.isWeb) {
      // Initialize web payment gateway (e.g., Stripe, Razorpay)
      console.log('🌐 Initializing web payment gateway');
      
      // Example: Load Stripe.js
      // const script = document.createElement('script');
      // script.src = 'https://js.stripe.com/v3/';
      // document.head.appendChild(script);
    } else {
      // Initialize mobile payment gateway
      console.log('📱 Initializing mobile payment gateway');
    }
  }

  async validatePaymentMethod(paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      // In a real app, validate with payment gateway
      // For now, return true for valid methods
      return paymentMethod.isActive;
    } catch (error) {
      console.error('❌ Error validating payment method:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
