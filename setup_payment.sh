#!/bin/bash

# ====================================
# Payment Integration Setup Script
# ====================================

echo "🚀 Setting up Production-Ready Razorpay Integration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install Python dependencies
echo -e "${YELLOW}📦 Step 1: Installing Python dependencies...${NC}"
pip install pydantic-settings razorpay
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi
echo ""

# Step 2: Install React Native dependencies
echo -e "${YELLOW}📦 Step 2: Installing React Native dependencies...${NC}"
cd frontend
npm install react-native-razorpay
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React Native dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install React Native dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Step 3: Create .env file if it doesn't exist
echo -e "${YELLOW}🔐 Step 3: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp ENV_TEMPLATE.txt .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env with your Razorpay keys${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi
echo ""

# Step 4: Check if payment router is added to main.py
echo -e "${YELLOW}📝 Step 4: Checking main.py configuration...${NC}"
if grep -q "from app.routers import.*payment" main.py 2>/dev/null; then
    echo -e "${GREEN}✅ Payment router already imported in main.py${NC}"
else
    echo -e "${RED}⚠️  Payment router NOT found in main.py${NC}"
    echo -e "${YELLOW}📝 You need to manually add this to main.py:${NC}"
    echo ""
    echo "from app.routers import payment"
    echo "app.include_router(payment.router, prefix=\"/payment\", tags=[\"payment\"])"
    echo ""
fi
echo ""

# Step 5: Show next steps
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Edit .env file with your Razorpay keys:"
echo "   nano .env"
echo ""
echo "2. Get your Razorpay keys from:"
echo "   https://dashboard.razorpay.com/app/keys"
echo ""
echo "3. Configure webhook at:"
echo "   https://dashboard.razorpay.com/app/webhooks"
echo "   URL: https://your-domain.com/payment/webhook"
echo "   Events: payment.captured, payment.failed, order.paid"
echo ""
echo "4. Update main.py to include payment router (if not already added)"
echo ""
echo "5. Start your backend:"
echo "   uvicorn main:app --reload"
echo ""
echo "6. Read the documentation:"
echo "   - Quick Start: QUICK_START_PAYMENT.md"
echo "   - Full Guide: RAZORPAY_PRODUCTION_GUIDE.md"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"

