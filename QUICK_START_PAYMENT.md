# 🚀 Quick Start: Payment Integration

This is a quick reference for implementing the production-ready payment flow.

---

## ⚡ 5-Minute Setup

### 1. Backend Setup (2 minutes)

```bash
# Install dependencies
pip install pydantic-settings

# Create .env file
cp ENV_TEMPLATE.txt .env

# Edit .env with your Razorpay keys
nano .env
```

**Add to `.env`:**
```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Add to `main.py`:**
```python
from app.routers import payment

app.include_router(payment.router, prefix="/payment", tags=["payment"])
```

### 2. Frontend Setup (1 minute)

```bash
cd frontend
npm install react-native-razorpay
```

### 3. Use in Your Component (2 minutes)

```typescript
import paymentService from './src/services/PaymentService';
import { useAuth } from './src/contexts/AuthContext';

const MyPaymentScreen = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayNow = async () => {
    setIsProcessing(true);
    
    await paymentService.initiatePayment(
      'booking_123',           // Booking ID
      250.00,                  // Amount in INR
      'Charging session',      // Description
      {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      // Success
      (result) => {
        Alert.alert('Success!', 'Payment completed');
        navigation.navigate('BookingConfirmed');
        setIsProcessing(false);
      },
      // Failure
      (result) => {
        Alert.alert('Failed', result.message);
        setIsProcessing(false);
      },
      // Verifying (optional)
      () => {
        console.log('Verifying...');
      }
    );
  };
  
  return (
    <TouchableOpacity onPress={handlePayNow} disabled={isProcessing}>
      <Text>Pay Now</Text>
    </TouchableOpacity>
  );
};
```

---

## 🔑 Get Your Keys

### Test Mode (Development):

1. Go to: https://dashboard.razorpay.com/app/keys
2. Switch to **Test Mode**
3. Copy `Key ID` (starts with `rzp_test_`)
4. Copy `Key Secret`
5. Add to `.env`

### Live Mode (Production):

1. Complete KYC on Razorpay
2. Switch to **Live Mode**
3. Copy `Key ID` (starts with `rzp_live_`)
4. Copy `Key Secret`
5. Add to production `.env`

---

## 🪝 Setup Webhook (Required for Production)

### Why Webhooks?

If a user pays and immediately closes the app, your backend won't receive the verification call. Webhooks ensure you still get notified about the payment.

### Setup Steps:

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click **Create New Webhook**
3. **URL:** `https://your-api-domain.com/payment/webhook`
4. **Events:** Select `payment.captured`, `payment.failed`, `order.paid`
5. Click **Create**
6. Copy the **Secret** shown
7. Add to `.env` as `RAZORPAY_WEBHOOK_SECRET`

**For local testing:**
```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 8000

# Use the ngrok URL for webhook
# Example: https://abc123.ngrok.io/payment/webhook
```

---

## 🧪 Test Payment

### Test Card Details:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
OTP: 1234
Name: Any name
```

### Test Flow:

1. Start your backend: `uvicorn main:app --reload`
2. Start your app: `npm start`
3. Navigate to payment screen
4. Click "Pay Now"
5. Razorpay modal opens
6. Enter test card details
7. Enter OTP: 1234
8. Payment should succeed
9. Booking should be marked as PAID

---

## 📝 API Endpoints

### Create Order
```
POST /payment/create-order

Body:
{
  "booking_id": "booking_123",
  "amount": 250.00,
  "description": "Charging session"
}

Response:
{
  "order_id": "order_xxx",
  "amount": 25000,
  "currency": "INR",
  "key_id": "rzp_test_xxx",
  "booking_id": "booking_123"
}
```

### Verify Payment
```
POST /payment/verify

Body:
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "booking_id": "booking_123"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_xxx",
  "order_id": "order_xxx"
}
```

### Webhook (Called by Razorpay)
```
POST /payment/webhook

Headers:
  x-razorpay-signature: xxx

Body: (Razorpay event payload)
```

---

## ✅ Production Checklist

Before going live:

- [ ] Switch to Live API keys
- [ ] Configure webhook with production URL
- [ ] Test with ₹1 real transaction
- [ ] Verify webhook is working
- [ ] Complete Razorpay KYC
- [ ] Enable desired payment methods
- [ ] Set up settlements

---

## 🐛 Common Issues

### "Key not found"
- Restart backend after adding keys to `.env`
- Verify `.env` file is in the root directory

### "Invalid signature"
- Check `RAZORPAY_KEY_SECRET` is correct
- Verify you're using test keys for test mode

### "Webhook not working"
- Check webhook URL is publicly accessible
- Verify `RAZORPAY_WEBHOOK_SECRET` is correct
- Check webhook logs in Razorpay Dashboard

### "Payment succeeded but booking not updated"
- This is why webhooks are critical!
- Check webhook is configured correctly
- Check backend logs for webhook events

---

## 📚 Full Documentation

See `RAZORPAY_PRODUCTION_GUIDE.md` for complete documentation.

---

## 🆘 Need Help?

1. Check `RAZORPAY_PRODUCTION_GUIDE.md`
2. Review `PAYMENT_IMPLEMENTATION_EXAMPLE.tsx`
3. Check Razorpay Dashboard logs
4. Contact Razorpay Support: support@razorpay.com

---

🎉 **You're all set!** Happy coding!

