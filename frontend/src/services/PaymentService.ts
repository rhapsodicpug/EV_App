/**
 * Payment Service - Production-Ready Razorpay Integration
 * Handles payment flow with proper error handling and user feedback
 */

import RazorpayCheckout from 'react-native-razorpay';
import { Alert, Platform } from 'react-native';
import api from './api';

export interface CreateOrderRequest {
  booking_id: string;
  amount: number;
  description?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  booking_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  payment_id?: string;
  order_id?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  payment_id?: string;
  order_id?: string;
  error_code?: string;
  error_description?: string;
}

class PaymentService {
  /**
   * Create a Razorpay order
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('📝 Creating payment order for booking:', data.booking_id);
      
      const response = await api.request<CreateOrderResponse>(
        'POST',
        '/payment/create-order',
        data
      );
      
      console.log('✅ Order created successfully:', response.order_id);
      return response;
      
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Failed to create payment order. Please try again.'
      );
    }
  }

  /**
   * Verify payment with backend
   */
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      console.log('🔍 Verifying payment:', data.razorpay_payment_id);
      
      const response = await api.request<VerifyPaymentResponse>(
        'POST',
        '/payment/verify',
        data
      );
      
      console.log('✅ Payment verification response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Error verifying payment:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Failed to verify payment. Please contact support.'
      );
    }
  }

  /**
   * Open Razorpay checkout and handle the complete payment flow
   * 
   * @param bookingId - Booking ID to pay for
   * @param amount - Amount in INR (will be converted to paise)
   * @param description - Optional payment description
   * @param userDetails - User details (name, email, contact)
   * @param onSuccess - Callback on successful payment
   * @param onFailure - Callback on payment failure
   * @param onVerifying - Callback when verification starts (show loading)
   */
  async initiatePayment(
    bookingId: string,
    amount: number,
    description: string,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: (result: PaymentResult) => void,
    onFailure: (result: PaymentResult) => void,
    onVerifying?: () => void
  ): Promise<void> {
    try {
      // Step 1: Create order from backend
      console.log('🚀 Initiating payment flow...');
      
      const order = await this.createOrder({
        booking_id: bookingId,
        amount: amount,
        description: description
      });

      // Step 2: Prepare Razorpay options
      const options = {
        description: description || `Payment for booking ${bookingId}`,
        image: 'https://your-app-logo-url.com/logo.png', // Replace with your app logo
        currency: order.currency,
        key: order.key_id, // ✅ Key comes from backend (never hardcoded)
        amount: order.amount, // Amount in paise
        order_id: order.order_id,
        name: 'EV Charging App',
        prefill: {
          email: userDetails.email,
          contact: userDetails.contact,
          name: userDetails.name,
        },
        theme: {
          color: '#8cd279', // Your app's primary color
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 900, // 15 minutes
        modal: {
          backdropclose: false,
          escape: false,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            console.log('⚠️ Payment modal dismissed by user');
            onFailure({
              success: false,
              message: 'Payment cancelled by user',
              error_code: 'USER_CANCELLED',
              error_description: 'You cancelled the payment'
            });
          }
        },
        notes: {
          booking_id: bookingId,
        }
      };

      // Step 3: Open Razorpay checkout
      console.log('💳 Opening Razorpay checkout...');
      
      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // Payment successful - now verify with backend
          console.log('✅ Razorpay payment successful:', data.razorpay_payment_id);
          
          // Show verifying state
          if (onVerifying) {
            onVerifying();
          }

          try {
            // Step 4: Verify payment signature with backend
            const verificationResult = await this.verifyPayment({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              booking_id: bookingId
            });

            if (verificationResult.success) {
              // ✅ Payment verified successfully
              console.log('🎉 Payment verified and booking updated!');
              onSuccess({
                success: true,
                message: 'Payment successful!',
                payment_id: data.razorpay_payment_id,
                order_id: data.razorpay_order_id
              });
            } else {
              // ❌ Verification failed
              console.error('❌ Payment verification failed');
              onFailure({
                success: false,
                message: verificationResult.message || 'Payment verification failed',
                payment_id: data.razorpay_payment_id,
                order_id: data.razorpay_order_id,
                error_code: 'VERIFICATION_FAILED',
                error_description: 'Payment was made but verification failed. Please contact support.'
              });
            }
          } catch (verifyError: any) {
            // Network error or server error during verification
            console.error('❌ Error during verification:', verifyError);
            
            // Payment was made but we couldn't verify - critical case
            onFailure({
              success: false,
              message: 'Your payment was successful, but we had trouble confirming it. Please contact support with your payment ID.',
              payment_id: data.razorpay_payment_id,
              order_id: data.razorpay_order_id,
              error_code: 'VERIFICATION_ERROR',
              error_description: verifyError.message || 'Network error during verification'
            });
          }
        })
        .catch((error: any) => {
          // Payment failed or cancelled
          console.error('❌ Razorpay payment error:', error);
          
          const errorCode = error.code || 'PAYMENT_FAILED';
          const errorDescription = error.description || 'Payment failed. Please try again.';
          
          // Handle specific error codes
          let userMessage = 'Payment failed. Please try again.';
          
          switch (errorCode) {
            case 0: // User cancelled
              userMessage = 'Payment cancelled by you';
              break;
            case 1: // Payment failed
              userMessage = 'Payment failed. Please check your payment method and try again.';
              break;
            case 2: // Network error
              userMessage = 'Network error. Please check your connection and try again.';
              break;
            default:
              userMessage = errorDescription;
          }
          
          onFailure({
            success: false,
            message: userMessage,
            error_code: String(errorCode),
            error_description: errorDescription
          });
        });

    } catch (error: any) {
      // Error creating order
      console.error('❌ Error initiating payment:', error);
      onFailure({
        success: false,
        message: error.message || 'Failed to initiate payment',
        error_code: 'ORDER_CREATION_FAILED',
        error_description: error.message
      });
    }
  }

  /**
   * Show a user-friendly payment error alert
   */
  showPaymentErrorAlert(result: PaymentResult) {
    Alert.alert(
      'Payment Failed',
      result.message,
      result.payment_id
        ? [
            {
              text: 'Copy Payment ID',
              onPress: () => {
                // You can implement clipboard copy here
                console.log('Payment ID:', result.payment_id);
              }
            },
            { text: 'OK' }
          ]
        : [{ text: 'OK' }]
    );
  }

  /**
   * Show payment success alert
   */
  showPaymentSuccessAlert(result: PaymentResult) {
    Alert.alert(
      'Payment Successful! 🎉',
      'Your booking has been confirmed.',
      [{ text: 'OK' }]
    );
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
