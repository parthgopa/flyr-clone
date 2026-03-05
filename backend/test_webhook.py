"""
Test script to verify Google Play webhook endpoint is accessible
"""
import requests
import json
import base64

# Your ngrok URL
NGROK_URL = "https://0ad2-103-241-226-107.ngrok-free.app"
WEBHOOK_ENDPOINT = f"{NGROK_URL}/purchase/webhook/google-play"

def test_webhook_accessibility():
    """Test if webhook endpoint is accessible"""
    print("=" * 60)
    print("🧪 Testing Webhook Endpoint Accessibility")
    print("=" * 60)
    print(f"\n🌐 Webhook URL: {WEBHOOK_ENDPOINT}\n")
    
    try:
        # Test basic connectivity
        response = requests.get(NGROK_URL)
        print(f"✅ Ngrok URL is accessible")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
    except Exception as e:
        print(f"❌ Cannot reach ngrok URL: {e}")
        return False
    
    return True

def test_webhook_with_mock_data():
    """Send a mock Pub/Sub message to test webhook"""
    print("\n" + "=" * 60)
    print("🧪 Testing Webhook with Mock Purchase Notification")
    print("=" * 60)
    
    # Mock Pub/Sub message structure
    mock_notification = {
        "version": "1.0",
        "packageName": "com.anonymous.flyrclone",
        "eventTimeMillis": "1234567890123",
        "oneTimeProductNotification": {
            "version": "1.0",
            "notificationType": 1,  # PURCHASED
            "purchaseToken": "test_purchase_token_12345",
            "sku": "image_pack_10"
        }
    }
    
    # Encode as Pub/Sub message
    message_data = base64.b64encode(
        json.dumps(mock_notification).encode('utf-8')
    ).decode('utf-8')
    
    pubsub_message = {
        "message": {
            "data": message_data,
            "messageId": "test-message-id",
            "publishTime": "2024-01-01T00:00:00.000Z"
        }
    }
    
    print(f"\n📤 Sending mock notification to webhook...")
    print(f"   Notification type: PURCHASED")
    print(f"   Product: image_pack_10")
    
    try:
        response = requests.post(
            WEBHOOK_ENDPOINT,
            json=pubsub_message,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📥 Webhook Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print(f"\n✅ Webhook is working correctly!")
            return True
        else:
            print(f"\n⚠️  Webhook returned non-200 status")
            return False
            
    except Exception as e:
        print(f"\n❌ Error calling webhook: {e}")
        return False

def main():
    print("\n🚀 Google Play Webhook Test Script\n")
    
    # Test 1: Basic accessibility
    if not test_webhook_accessibility():
        print("\n❌ Ngrok URL is not accessible. Make sure ngrok is running.")
        return
    
    # Test 2: Mock webhook call
    test_webhook_with_mock_data()
    
    print("\n" + "=" * 60)
    print("📋 Next Steps:")
    print("=" * 60)
    print("\n1. If webhook is accessible:")
    print("   - Copy your webhook URL for Pub/Sub subscription")
    print("   - URL: " + WEBHOOK_ENDPOINT)
    print("\n2. In Google Cloud Console:")
    print("   - Create Pub/Sub topic: google-play-purchases")
    print("   - Create subscription with this webhook URL")
    print("\n3. In Google Play Console:")
    print("   - Link Pub/Sub topic to your app")
    print("   - Topic: projects/YOUR_PROJECT_ID/topics/google-play-purchases")
    print("\n" + "=" * 60 + "\n")

if __name__ == "__main__":
    main()
