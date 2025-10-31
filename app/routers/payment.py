"""
Payment Router - Production-Ready Razorpay Integration
Handles payment creation, verification, and webhooks
"""

from fastapi import APIRouter, HTTPException, Request, Header, Depends, status
from pydantic import BaseModel, Field
from typing import Optional
import razorpay
import hmac
import hashlib
import logging
from datetime import datetime

from app.core.config import settings
from app.core.database import get_database
from app.routers.auth import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payment", tags=["payment"])

# Initialize Razorpay client with environment variables
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
razorpay_client.set_app_details({"title": settings.APP_NAME, "version": settings.APP_VERSION})


# ==================== REQUEST/RESPONSE MODELS ====================

class CreateOrderRequest(BaseModel):
    """Request model for creating a payment order"""
    booking_id: str = Field(..., description="Booking ID to associate with payment")
    amount: float = Field(..., gt=0, description="Amount in INR")
    description: Optional[str] = Field(None, description="Payment description")


class CreateOrderResponse(BaseModel):
    """Response model for created order"""
    order_id: str
    amount: int  # Amount in paise
    currency: str
    key_id: str  # Frontend needs this to open Razorpay checkout
    booking_id: str


class VerifyPaymentRequest(BaseModel):
    """Request model for payment verification"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: str


class VerifyPaymentResponse(BaseModel):
    """Response model for payment verification"""
    success: bool
    message: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None


# ==================== HELPER FUNCTIONS ====================

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature
    
    Args:
        order_id: Razorpay order ID
        payment_id: Razorpay payment ID
        signature: Signature from Razorpay
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        # Create the message to verify
        message = f"{order_id}|{payment_id}"
        
        # Generate the expected signature
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(generated_signature, signature)
    except Exception as e:
        logger.error(f"Signature verification error: {str(e)}")
        return False


async def update_booking_payment_status(
    booking_id: str, 
    payment_id: str, 
    order_id: str, 
    status: str,
    db
) -> bool:
    """
    Update booking payment status in database (atomic operation)
    
    Args:
        booking_id: Booking ID to update
        payment_id: Razorpay payment ID
        order_id: Razorpay order ID
        status: Payment status (PAID, FAILED, etc.)
        db: Database connection
        
    Returns:
        bool: True if update was successful
    """
    try:
        bookings_collection = db["bookings"]
        
        result = await bookings_collection.update_one(
            {"_id": booking_id},
            {
                "$set": {
                    "payment_status": status,
                    "razorpay_payment_id": payment_id,
                    "razorpay_order_id": order_id,
                    "payment_completed_at": datetime.utcnow().isoformat() if status == "PAID" else None,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Updated booking {booking_id} payment status to {status}")
            return True
        else:
            logger.warning(f"⚠️ Booking {booking_id} not found or already updated")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error updating booking payment status: {str(e)}")
        return False


# ==================== ENDPOINTS ====================

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Create a Razorpay order for payment
    
    This endpoint:
    1. Validates the booking exists and belongs to the user
    2. Creates a Razorpay order
    3. Returns order details including the key_id for frontend
    """
    try:
        # Validate booking exists and belongs to user
        bookings_collection = db["bookings"]
        booking = await bookings_collection.find_one({
            "_id": request.booking_id,
            "user_id": current_user["id"]
        })
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or does not belong to you"
            )
        
        # Check if booking is already paid
        if booking.get("payment_status") == "PAID":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking is already paid"
            )
        
        # Convert amount to paise (Razorpay uses smallest currency unit)
        amount_in_paise = int(request.amount * 100)
        
        # Create Razorpay order
        order_data = {
            "amount": amount_in_paise,
            "currency": settings.CURRENCY,
            "receipt": f"booking_{request.booking_id}",
            "notes": {
                "booking_id": request.booking_id,
                "user_id": current_user["id"],
                "description": request.description or f"Payment for booking {request.booking_id}"
            }
        }
        
        logger.info(f"📝 Creating Razorpay order for booking {request.booking_id}")
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        # Update booking with order_id
        await bookings_collection.update_one(
            {"_id": request.booking_id},
            {
                "$set": {
                    "razorpay_order_id": razorpay_order["id"],
                    "payment_status": "PENDING",
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        logger.info(f"✅ Order created successfully: {razorpay_order['id']}")
        
        return CreateOrderResponse(
            order_id=razorpay_order["id"],
            amount=razorpay_order["amount"],
            currency=razorpay_order["currency"],
            key_id=settings.RAZORPAY_KEY_ID,  # Frontend needs this
            booking_id=request.booking_id
        )
        
    except razorpay.errors.BadRequestError as e:
        logger.error(f"❌ Razorpay BadRequest: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Error creating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order"
        )


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Verify payment signature and update booking status
    
    This endpoint:
    1. Verifies the Razorpay signature
    2. Updates the booking payment status atomically
    3. Returns verification result
    """
    try:
        logger.info(f"🔍 Verifying payment for booking {request.booking_id}")
        
        # Validate booking exists and belongs to user
        bookings_collection = db["bookings"]
        booking = await bookings_collection.find_one({
            "_id": request.booking_id,
            "user_id": current_user["id"]
        })
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or does not belong to you"
            )
        
        # Verify signature using Razorpay utility
        is_valid = verify_razorpay_signature(
            order_id=request.razorpay_order_id,
            payment_id=request.razorpay_payment_id,
            signature=request.razorpay_signature
        )
        
        if not is_valid:
            logger.error(f"❌ Invalid signature for payment {request.razorpay_payment_id}")
            
            # Update booking status to FAILED
            await update_booking_payment_status(
                booking_id=request.booking_id,
                payment_id=request.razorpay_payment_id,
                order_id=request.razorpay_order_id,
                status="FAILED",
                db=db
            )
            
            return VerifyPaymentResponse(
                success=False,
                message="Payment verification failed. Invalid signature.",
                payment_id=request.razorpay_payment_id,
                order_id=request.razorpay_order_id
            )
        
        # Signature is valid - update booking status to PAID (atomic operation)
        update_success = await update_booking_payment_status(
            booking_id=request.booking_id,
            payment_id=request.razorpay_payment_id,
            order_id=request.razorpay_order_id,
            status="PAID",
            db=db
        )
        
        if not update_success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Payment verified but failed to update booking status"
            )
        
        logger.info(f"✅ Payment verified successfully for booking {request.booking_id}")
        
        return VerifyPaymentResponse(
            success=True,
            message="Payment verified successfully",
            payment_id=request.razorpay_payment_id,
            order_id=request.razorpay_order_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db=Depends(get_database)
):
    """
    Handle Razorpay webhook events (CRITICAL for Production)
    
    This endpoint:
    1. Receives webhook POST requests from Razorpay
    2. Verifies the webhook signature
    3. Processes payment events (e.g., payment.captured)
    4. Updates booking status even if user closed the app
    
    Important: Configure this URL in Razorpay Dashboard -> Settings -> Webhooks
    URL: https://your-domain.com/payment/webhook
    Events to enable: payment.captured, payment.failed, order.paid
    """
    try:
        # Get raw request body (needed for signature verification)
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Verify webhook signature
        if not x_razorpay_signature:
            logger.error("❌ Webhook signature missing")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signature missing"
            )
        
        # Generate expected signature
        expected_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            body_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        if not hmac.compare_digest(expected_signature, x_razorpay_signature):
            logger.error("❌ Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
        
        # Parse webhook data
        webhook_data = await request.json()
        event = webhook_data.get("event")
        payload = webhook_data.get("payload", {})
        
        logger.info(f"📩 Webhook received: {event}")
        
        # Process different webhook events
        if event == "payment.captured":
            # Payment was successfully captured
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            
            if order_id and payment_id:
                # Find booking by order_id
                bookings_collection = db["bookings"]
                booking = await bookings_collection.find_one({"razorpay_order_id": order_id})
                
                if booking:
                    # Update booking status
                    await update_booking_payment_status(
                        booking_id=booking["_id"],
                        payment_id=payment_id,
                        order_id=order_id,
                        status="PAID",
                        db=db
                    )
                    logger.info(f"✅ Webhook: Booking {booking['_id']} marked as PAID")
                else:
                    logger.warning(f"⚠️ Webhook: Booking not found for order {order_id}")
        
        elif event == "payment.failed":
            # Payment failed
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            
            if order_id and payment_id:
                bookings_collection = db["bookings"]
                booking = await bookings_collection.find_one({"razorpay_order_id": order_id})
                
                if booking:
                    await update_booking_payment_status(
                        booking_id=booking["_id"],
                        payment_id=payment_id,
                        order_id=order_id,
                        status="FAILED",
                        db=db
                    )
                    logger.info(f"❌ Webhook: Booking {booking['_id']} marked as FAILED")
        
        elif event == "order.paid":
            # Order was paid (alternative to payment.captured)
            order_entity = payload.get("order", {}).get("entity", {})
            order_id = order_entity.get("id")
            
            if order_id:
                bookings_collection = db["bookings"]
                booking = await bookings_collection.find_one({"razorpay_order_id": order_id})
                
                if booking and booking.get("payment_status") != "PAID":
                    # Get payment ID from order
                    try:
                        payments = razorpay_client.order.payments(order_id)
                        if payments and payments["items"]:
                            payment_id = payments["items"][0]["id"]
                            await update_booking_payment_status(
                                booking_id=booking["_id"],
                                payment_id=payment_id,
                                order_id=order_id,
                                status="PAID",
                                db=db
                            )
                            logger.info(f"✅ Webhook: Booking {booking['_id']} marked as PAID via order.paid")
                    except Exception as e:
                        logger.error(f"Error fetching payments for order {order_id}: {str(e)}")
        
        # Always return 200 OK to acknowledge webhook receipt
        return {"status": "ok"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Webhook processing error: {str(e)}")
        # Still return 200 to prevent Razorpay from retrying
        return {"status": "error", "message": str(e)}


@router.get("/order/{order_id}")
async def get_order_status(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Razorpay order status (useful for debugging)
    """
    try:
        order = razorpay_client.order.fetch(order_id)
        return {"order": order}
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )


@router.get("/payment/{payment_id}")
async def get_payment_details(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Razorpay payment details (useful for debugging)
    """
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        return {"payment": payment}
    except Exception as e:
        logger.error(f"Error fetching payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

