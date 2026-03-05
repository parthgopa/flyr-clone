from flask import Blueprint, request, jsonify
from models.user import User
from models.transaction import Transaction
from utils.auth_middleware import require_auth
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
import hmac
import hashlib
import base64
import json

purchase_bp = Blueprint("purchase", __name__)

# Google Play Developer API configuration
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
PACKAGE_NAME = os.getenv("ANDROID_PACKAGE_NAME", "com.anonymous.flyrclone")

# Product ID to credits mapping
PRODUCT_CREDITS = {
    "image_pack_10": {"credits": 10, "price": 100},
    "image_pack_25": {"credits": 25, "price": 250},
    "image_pack_50": {"credits": 50, "price": 500},
    "image_pack_100": {"credits": 100, "price": 1000}
}


def verify_purchase_with_google(package_name: str, product_id: str, purchase_token: str):
    """
    Verify purchase with Google Play Developer API
    
    Args:
        package_name: Android package name
        product_id: Product ID (SKU)
        purchase_token: Purchase token from Google Play
        
    Returns:
        dict: Verification result with purchase details
    """
    try:
        # Load service account credentials
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_APPLICATION_CREDENTIALS,
            scopes=['https://www.googleapis.com/auth/androidpublisher']
        )
        
        # Build the API client
        service = build('androidpublisher', 'v3', credentials=credentials)
        
        # Verify the purchase
        result = service.purchases().products().get(
            packageName=package_name,
            productId=product_id,
            token=purchase_token
        ).execute()
        
        print(f"✓ Google Play verification successful for {product_id}")
        print(f"Purchase state: {result.get('purchaseState')}")
        print(f"Consumption state: {result.get('consumptionState')}")
        
        return {
            "valid": result.get('purchaseState') == 0,  # 0 = purchased, 1 = canceled
            "purchase_time": result.get('purchaseTimeMillis'),
            "purchase_state": result.get('purchaseState'),
            "consumption_state": result.get('consumptionState'),
            "developer_payload": result.get('developerPayload'),
            "order_id": result.get('orderId'),
            "raw_response": result
        }
    except Exception as e:
        print(f"✗ Google Play verification failed: {e}")
        return {
            "valid": False,
            "error": str(e)
        }


def acknowledge_purchase(package_name: str, product_id: str, purchase_token: str):
    """Acknowledge purchase to Google Play"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_APPLICATION_CREDENTIALS,
            scopes=['https://www.googleapis.com/auth/androidpublisher']
        )
        
        service = build('androidpublisher', 'v3', credentials=credentials)
        
        service.purchases().products().acknowledge(
            packageName=package_name,
            productId=product_id,
            token=purchase_token,
            body={}
        ).execute()
        
        print(f"✓ Purchase acknowledged for {product_id}")
        return True
    except Exception as e:
        print(f"✗ Purchase acknowledgment failed: {e}")
        return False


@purchase_bp.route("/verify", methods=["POST"])
@require_auth
def verify_purchase():
    """
    Verify and process purchase from Google Play
    
    Expected payload:
    {
        "productId": "image_pack_10",
        "purchaseToken": "google_purchase_token",
        "packageName": "com.flyr.app"
    }
    """
    try:
        print("\n" + "="*60)
        print("🔍 PURCHASE VERIFICATION REQUEST RECEIVED")
        print("="*60)
        
        user_id = request.user_id
        data = request.json
        
        print(f"👤 User ID: {user_id}")
        print(f"📦 Request data: {data}")
        
        product_id = data.get("productId")
        purchase_token = data.get("purchaseToken")
        package_name = data.get("packageName", PACKAGE_NAME)
        
        print(f"🏷️  Product ID: {product_id}")
        print(f"🎫 Purchase Token: {purchase_token[:50] if purchase_token else 'None'}...")
        print(f"📱 Package Name: {package_name}")
        
        if not product_id or not purchase_token:
            return jsonify({
                "success": False,
                "message": "Missing productId or purchaseToken"
            }), 400
        
        # Check if product ID is valid
        if product_id not in PRODUCT_CREDITS:
            print(f"❌ Invalid product ID: {product_id}")
            print(f"   Valid products: {list(PRODUCT_CREDITS.keys())}")
            return jsonify({
                "success": False,
                "message": f"Invalid product ID: {product_id}"
            }), 400
        
        print(f"✅ Product ID is valid")
        
        # Check if purchase token was already processed (prevent replay attacks)
        print(f"🔍 Checking for duplicate purchase token...")
        existing_transaction = Transaction.find_by_purchase_token(purchase_token)
        if existing_transaction:
            if existing_transaction.get("status") == "success":
                print(f"⚠️  Purchase already processed: {existing_transaction['_id']}")
                return jsonify({
                    "success": False,
                    "message": "Purchase already processed",
                    "transaction_id": str(existing_transaction["_id"])
                }), 409
        
        print(f"✅ No duplicate found")
        
        # Get product details
        product = PRODUCT_CREDITS[product_id]
        credits = product["credits"]
        amount = product["price"]
        
        print(f"💰 Credits: {credits}, Amount: ₹{amount}")
        
        # Create pending transaction
        print(f"📝 Creating pending transaction...")
        transaction = Transaction.create_transaction(
            user_id=user_id,
            product_id=product_id,
            purchase_token=purchase_token,
            credits=credits,
            amount=amount,
            currency="INR",
            platform="android",
            status="pending"
        )
        print(f"✅ Transaction created: {transaction['_id']}")
        
        # Verify with Google Play API
        print(f"\n🔐 Verifying with Google Play API...")
        print(f"   Package: {package_name}")
        print(f"   Product: {product_id}")
        print(f"   Token: {purchase_token[:30]}...")
        
        verification = verify_purchase_with_google(package_name, product_id, purchase_token)
        
        print(f"\n📊 Verification result:")
        print(f"   Valid: {verification.get('valid')}")
        print(f"   Error: {verification.get('error', 'None')}")
        
        if not verification.get("valid"):
            # Mark transaction as failed
            Transaction.update_status(
                str(transaction["_id"]),
                "failed",
                {"error": verification.get("error"), "verification": verification}
            )
            
            return jsonify({
                "success": False,
                "message": "Purchase verification failed",
                "error": verification.get("error")
            }), 400
        
        # Purchase is valid - add credits to user
        User.add_credits(user_id, credits, reason=f"purchase_{product_id}")
        
        # Mark transaction as success
        Transaction.mark_as_verified(purchase_token, verification)
        
        # Acknowledge purchase with Google Play
        acknowledge_purchase(package_name, product_id, purchase_token)
        
        # Get updated user credits
        new_credits = User.get_credits(user_id)
        
        print(f"\n🎉 PURCHASE SUCCESSFUL!")
        print(f"   Credits added: {credits}")
        print(f"   New balance: {new_credits}")
        print(f"   Transaction ID: {transaction['_id']}")
        print(f"   Order ID: {verification.get('order_id')}")
        print("="*60 + "\n")
        
        return jsonify({
            "success": True,
            "message": f"Successfully added {credits} credits",
            "credits_added": credits,
            "total_credits": new_credits,
            "transaction_id": str(transaction["_id"]),
            "order_id": verification.get("order_id")
        }), 200
        
    except Exception as e:
        print(f"\n❌ PURCHASE VERIFICATION ERROR!")
        print(f"   Error: {e}")
        print(f"   Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        
        return jsonify({
            "success": False,
            "message": "Internal server error",
            "error": str(e)
        }), 500


@purchase_bp.route("/credits", methods=["GET"])
@require_auth
def get_credits():
    """Get user's current credit balance"""
    try:
        user_id = request.user_id
        credits = User.get_credits(user_id)
        
        return jsonify({
            "success": True,
            "credits": credits
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@purchase_bp.route("/transactions", methods=["GET"])
@require_auth
def get_transactions():
    """Get user's transaction history"""
    try:
        user_id = request.user_id
        limit = request.args.get("limit", 50, type=int)
        
        transactions = Transaction.find_by_user(user_id, limit)
        
        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            transaction["_id"] = str(transaction["_id"])
            transaction["user_id"] = str(transaction["user_id"])
        
        return jsonify({
            "success": True,
            "transactions": transactions
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@purchase_bp.route("/webhook/google-play", methods=["POST"])
def google_play_webhook():
    """
    Google Play Real-Time Developer Notifications (RTDN) webhook
    
    Handles:
    - PURCHASED (1): New purchase
    - CANCELED (2): Purchase canceled
    - REFUNDED (3): Purchase refunded
    - REVOKED (4): Subscription revoked
    """
    try:
        # Get Pub/Sub message
        envelope = request.get_json()
        
        if not envelope:
            return jsonify({"error": "No Pub/Sub message received"}), 400
        
        # Decode the Pub/Sub message
        pubsub_message = envelope.get('message', {})
        
        if not pubsub_message:
            return jsonify({"error": "Invalid Pub/Sub message"}), 400
        
        # Decode base64 data
        data = base64.b64decode(pubsub_message.get('data', '')).decode('utf-8')
        notification = json.loads(data)
        
        print(f"Received Google Play notification: {notification}")
        
        # Extract notification details
        notification_type = notification.get('notificationType')
        one_time_product = notification.get('oneTimeProductNotification', {})
        
        if not one_time_product:
            print("Not a one-time product notification, ignoring")
            return jsonify({"status": "ignored"}), 200
        
        purchase_token = one_time_product.get('purchaseToken')
        sku = one_time_product.get('sku')
        
        # Find transaction by purchase token
        transaction = Transaction.find_by_purchase_token(purchase_token)
        
        if not transaction:
            print(f"Transaction not found for purchase token: {purchase_token[:20]}...")
            return jsonify({"status": "transaction_not_found"}), 404
        
        # Handle different notification types
        if notification_type == 1:  # PURCHASED
            print(f"Purchase notification received for {sku}")
            # Already handled in verify endpoint
            
        elif notification_type == 3:  # REFUNDED
            print(f"Refund notification received for {sku}")
            
            # Deduct credits from user (if not already used)
            user_id = str(transaction["user_id"])
            credits_to_deduct = transaction["credits"]
            current_credits = User.get_credits(user_id)
            
            if current_credits >= credits_to_deduct:
                User.add_credits(user_id, -credits_to_deduct, reason="refund")
                print(f"Deducted {credits_to_deduct} credits from user {user_id} due to refund")
            else:
                print(f"User {user_id} has insufficient credits for refund deduction")
            
            # Update transaction status
            Transaction.update_status(
                str(transaction["_id"]),
                "refunded",
                {"notification_type": notification_type, "notification": notification}
            )
            
        elif notification_type == 4:  # REVOKED
            print(f"Revoke notification received for {sku}")
            
            # Similar to refund
            user_id = str(transaction["user_id"])
            credits_to_deduct = transaction["credits"]
            current_credits = User.get_credits(user_id)
            
            if current_credits >= credits_to_deduct:
                User.add_credits(user_id, -credits_to_deduct, reason="revoked")
                print(f"Deducted {credits_to_deduct} credits from user {user_id} due to revoke")
            
            # Update transaction status
            Transaction.update_status(
                str(transaction["_id"]),
                "revoked",
                {"notification_type": notification_type, "notification": notification}
            )
        
        return jsonify({"status": "processed"}), 200
        
    except Exception as e:
        print(f"✗ Webhook processing error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@purchase_bp.route("/products", methods=["GET"])
def get_products():
    """Get available product packages"""
    products = [
        {
            "id": "image_pack_10",
            "credits": 10,
            "price": 100,
            "currency": "INR",
            "price_display": "₹100"
        },
        {
            "id": "image_pack_25",
            "credits": 25,
            "price": 250,
            "currency": "INR",
            "price_display": "₹250"
        },
        {
            "id": "image_pack_50",
            "credits": 50,
            "price": 500,
            "currency": "INR",
            "price_display": "₹500"
        },
        {
            "id": "image_pack_100",
            "credits": 100,
            "price": 1000,
            "currency": "INR",
            "price_display": "₹1000"
        }
    ]
    
    return jsonify({
        "success": True,
        "products": products,
        "cost_per_image": 10
    }), 200
