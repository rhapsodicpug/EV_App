# 🚀 Razorpay Production-Ready Integration Guide

This guide walks you through making your Razorpay integration production-ready.

---

## 📋 Table of Contents

1. [Setup Overview](#setup-overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Razorpay Dashboard Configuration](#razorpay-dashboard-configuration)
5. [Testing](#testing)
6. [Going Live](#going-live)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Setup Overview

### What's Changed:

✅ **Backend:**
- Environment variables for all secrets
- Secure signature verification
- Production-ready webhook endpoint
- Atomic database updates
- Comprehensive logging

✅ **Frontend:**
- No hardcoded keys
- Better error handling
- User-friendly messages
- Loading states
- Payment verification flow

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd /home/arya-manjardekar/Desktop/ev_app
pip install pydantic-settings razorpay
```

### Step 2: Create `.env` File

```bash
# Copy the template
cp ENV_TEMPLATE.txt .env

# Edit .env with your actual values
nano .env
```

**Required Environment Variables:**

```bash
# Razorpay Keys (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Webhook Secret (Get from https://dashboard.razorpay.com/app/webhooks)
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx

# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ev_charging_app

# JWT
SECRET_KEY=your-super-secret-key-change-this
```

### Step 3: Update `main.py`

Add the payment router to your FastAPI app:

```python
from fastapi import FastAPI
from app.routers import auth, payment  # Add payment import
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(payment.router, prefix="/payment", tags=["payment"])  # Add this
```

### Step 4: Test Backend

```bash
# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test endpoints
curl -X GET http://localhost:8000/docs
```

You should see the new payment endpoints in Swagger UI.

---

## 📱 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install react-native-razorpay
```

### Step 2: Update API Config

Make sure your `frontend/src/constants/config.ts` has the correct backend URL:

```typescript
export const BASE_URL = 'http://10.80.0.142:8000'; // Your backend IP
```

### Step 3: Use PaymentService

Import and use the `PaymentService` in your components:

```typescript
import paymentService from './src/services/PaymentService';

// In your component
const handlePayment = async () => {
  await paymentService.initiatePayment(
    bookingId,
    amount,
    description,
    userDetails,
    onSuccess,
    onFailure,
    onVerifying
  );
};
```

**See `PAYMENT_IMPLEMENTATION_EXAMPLE.tsx` for a complete example.**

---

## 🔐 Razorpay Dashboard Configuration

### Step 1: Get API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. **For Testing:** Use **Test Mode** keys
4. **For Production:** Use **Live Mode** keys
5. Copy `Key ID` and `Key Secret` to your `.env` file

### Step 2: Configure Webhook (CRITICAL)

Webhooks ensure payments are captured even if the user closes the app.

1. Go to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. **URL:** `https://your-domain.com/payment/webhook`
   - Replace `your-domain.com` with your actual backend URL
   - For testing: Use ngrok or similar to expose your local backend
4. **Events to Enable:**
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
5. Click **Create Webhook**
6. **Copy the "Secret"** shown after creation
7. Add it to `.env` as `RAZORPAY_WEBHOOK_SECRET`

**Example:**
```
Webhook URL: https://api.yourapp.com/payment/webhook
Secret: whsec_xxxxxxxxxxxxxxxxxxx
```

### Step 3: Payment Methods

1. Go to **Settings** → **Payment Methods**
2. Enable desired payment methods:
   - Cards (Visa, Mastercard, etc.)
   - UPI
   - Net Banking
   - Wallets

### Step 4: Settlement & KYC

1. Complete your business KYC
2. Configure settlement schedule
3. Add bank account for settlements

---

## 🧪 Testing

### Test in Razorpay Test Mode

1. Use test keys in `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_KEY_SECRET=xxxx
   ```

2. Use test payment details:
   ```
   Card Number: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   OTP: 1234
   ```

3. Test scenarios:
   - ✅ Successful payment
   - ✅ Failed payment
   - ✅ User cancellation
   - ✅ Network error during verification
   - ✅ Webhook delivery

### Test Webhook Locally

```bash
# Install ngrok
npm install -g ngrok

# Expose your local backend
ngrok http 8000

# Copy the ngrok URL
# Example: https://abc123.ngrok.io

# Update Razorpay webhook URL to:
# https://abc123.ngrok.io/payment/webhook
```

### Test Cases

| Test Case | Expected Result |
|-----------|----------------|
| Normal payment | Payment success → Booking marked PAID |
| User cancels | Payment cancelled → Booking stays PENDING |
| Network error | Error shown → Booking stays PENDING |
| Webhook arrives late | Booking marked PAID via webhook |
| Invalid signature | Payment rejected |

---

## 🌐 Going Live

### Pre-Launch Checklist

- [ ] Switch to Live API keys in `.env`
- [ ] Update webhook URL to production domain
- [ ] Test with real ₹1 transaction
- [ ] Verify webhook is receiving events
- [ ] Complete Razorpay KYC
- [ ] Configure settlement account
- [ ] Enable required payment methods
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test refund flow
- [ ] Document payment IDs for reconciliation

### Production `.env`:

```bash
# Live keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Production domain
BACKEND_URL=https://api.yourapp.com
```

### Deploy

```bash
# Backend
git add .
git commit -m "Add production-ready Razorpay integration"
git push origin main

# Deploy to your server (AWS, Heroku, etc.)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid signature" error

**Cause:** Mismatch between order_id/payment_id/signature

**Solution:**
- Verify backend is using correct `RAZORPAY_KEY_SECRET`
- Check all three params are passed correctly
- Ensure no extra spaces or encoding issues

#### 2. Webhook not receiving events

**Cause:** Incorrect URL or secret

**Solution:**
- Check webhook URL is publicly accessible
- Verify `RAZORPAY_WEBHOOK_SECRET` is correct
- Check webhook logs in Razorpay Dashboard
- Ensure endpoint returns 200 OK

#### 3. Payment successful but booking not updated

**Cause:** Webhook not configured or failing

**Solution:**
- Configure webhook as described above
- Check backend logs for webhook errors
- Verify database connection
- Test webhook manually with Postman

#### 4. "Key not found" error

**Cause:** Environment variables not loaded

**Solution:**
- Verify `.env` file exists
- Restart backend server
- Check `settings.py` is correctly importing values

#### 5. User paid but verification failed

**Cause:** Network error or backend down during verification

**Solution:**
- This is why webhooks are critical!
- Webhook will update booking status
- Check Razorpay Dashboard for payment status
- Manually reconcile if needed

---

## 📊 Monitoring & Logging

### Check Logs

```bash
# Backend logs show all payment events
tail -f logs/payment.log

# Look for:
# ✅ Order created successfully
# 🔍 Verifying payment
# ✅ Payment verified successfully
# 📩 Webhook received
```

### Razorpay Dashboard

- Monitor transactions in real-time
- Check webhook delivery logs
- View payment success rate
- Track settlements

---

## 🆘 Support

### If Payment Issues Occur:

1. **Check Razorpay Dashboard** for payment status
2. **Check backend logs** for errors
3. **Verify webhook** is configured correctly
4. **Test with ₹1** transaction
5. **Contact Razorpay Support** if needed

### Emergency Contact:

- Razorpay Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com

---

## 📚 Additional Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Error Codes](https://razorpay.com/docs/api/errors/)

---

## ✅ Production Readiness Checklist

### Backend
- [x] Environment variables configured
- [x] Secure signature verification
- [x] Webhook endpoint implemented
- [x] Atomic database updates
- [x] Comprehensive logging
- [x] Error handling

### Frontend
- [x] No hardcoded keys
- [x] Proper error handling
- [x] Loading states
- [x] User-friendly messages
- [x] Payment verification flow

### Razorpay
- [ ] Live API keys obtained
- [ ] Webhook configured
- [ ] KYC completed
- [ ] Payment methods enabled
- [ ] Settlement account added

### Testing
- [ ] Test mode transactions working
- [ ] Webhook tested locally
- [ ] ₹1 live transaction successful
- [ ] All error scenarios tested
- [ ] Refund flow tested

---

🎉 **Congratulations!** Your Razorpay integration is now production-ready!

