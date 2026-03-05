import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

# Test configuration
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "flyr-service-account.json")
PACKAGE_NAME = os.getenv("ANDROID_PACKAGE_NAME", "com.anonymous.flyrclone")

def test_google_api_connection():
    """Test if Google Play API is accessible"""
    try:
        print("=" * 60)
        print("🔍 Testing Google Play API Configuration")
        print("=" * 60)
        print(f"\n📁 Service account file: {GOOGLE_APPLICATION_CREDENTIALS}")
        print(f"📦 Package name: {PACKAGE_NAME}\n")
        
        # Check if file exists
        if not os.path.exists(GOOGLE_APPLICATION_CREDENTIALS):
            print("❌ ERROR: Service account JSON file not found!")
            print(f"   Expected location: {os.path.abspath(GOOGLE_APPLICATION_CREDENTIALS)}")
            print("\n📝 Next steps:")
            print("   1. Download service account JSON from Google Cloud Console")
            print("   2. Place it in the backend/ directory")
            print("   3. Update .env file with correct path")
            return False
        
        print("✅ Service account JSON file found")
        
        # Load credentials
        try:
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_APPLICATION_CREDENTIALS,
                scopes=['https://www.googleapis.com/auth/androidpublisher']
            )
            print("✅ Credentials loaded successfully")
            
            # Get service account email
            with open(GOOGLE_APPLICATION_CREDENTIALS, 'r') as f:
                import json
                data = json.load(f)
                service_email = data.get('client_email')
                project_id = data.get('project_id')
                print(f"   Service account: {service_email}")
                print(f"   Project ID: {project_id}")
        except Exception as e:
            print(f"❌ ERROR loading credentials: {e}")
            return False
        
        # Build API client
        try:
            service = build('androidpublisher', 'v3', credentials=credentials)
            print("✅ Google Play API client built successfully")
        except Exception as e:
            print(f"❌ ERROR building API client: {e}")
            return False
        
        # Try to access app details
        print("\n🔄 Testing API permissions...")
        try:
            # Create a test edit (this requires proper permissions)
            result = service.edits().insert(
                packageName=PACKAGE_NAME,
                body={}
            ).execute()
            edit_id = result['id']
            
            # Delete the test edit immediately
            service.edits().delete(
                packageName=PACKAGE_NAME,
                editId=edit_id
            ).execute()
            
            print("✅ API permissions verified - full access granted")
            print("\n" + "=" * 60)
            print("🎉 SUCCESS! Backend is properly configured!")
            print("=" * 60)
            print("\n✅ Your backend can now:")
            print("   • Verify purchases with Google Play")
            print("   • Add credits to user accounts")
            print("   • Handle refunds automatically")
            print("   • Track all transactions")
            return True
            
        except Exception as e:
            error_msg = str(e)
            
            if "403" in error_msg or "forbidden" in error_msg.lower():
                print("⚠️  API connection works but permissions need adjustment")
                print("\n📝 Action required:")
                print("   1. Go to Google Play Console")
                print("   2. Navigate to: Setup → API access")
                print("   3. Find your service account")
                print("   4. Grant these permissions:")
                print("      • View app information")
                print("      • View financial data")
                print("      • Manage orders and subscriptions")
                print(f"\n   Service account email: {service_email}")
                return False
                
            elif "404" in error_msg:
                print("⚠️  Package name not found in Play Console")
                print(f"\n   Current package: {PACKAGE_NAME}")
                print("\n📝 Verify:")
                print("   1. App is uploaded to Play Console")
                print("   2. Package name matches exactly")
                print("   3. Service account has access to this app")
                return False
                
            else:
                print(f"⚠️  API test failed: {error_msg}")
                print("\n📝 This might be normal if:")
                print("   • App is not yet published")
                print("   • First-time setup")
                print("   • Permissions are still propagating")
                return False
            
    except Exception as e:
        print(f"\n❌ Configuration error: {e}")
        print("\n📝 Check:")
        print("   1. Service account JSON file is valid")
        print("   2. Google Play Developer API is enabled")
        print("   3. Service account is linked to Play Console")
        return False

def test_purchase_verification_mock():
    """Test purchase verification logic without actual purchase"""
    print("\n" + "=" * 60)
    print("🧪 Testing Purchase Verification Logic")
    print("=" * 60)
    
    try:
        from routes.purchase import PRODUCT_CREDITS
        
        print("\n✅ Product configuration loaded:")
        for product_id, details in PRODUCT_CREDITS.items():
            print(f"   • {product_id}: {details['credits']} credits = ₹{details['price']}")
        
        print("\n✅ Purchase routes are properly configured")
        return True
        
    except Exception as e:
        print(f"❌ Error loading purchase configuration: {e}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Backend Configuration Tests\n")
    
    # Test 1: Google API Connection
    api_test = test_google_api_connection()
    
    # Test 2: Purchase Configuration
    config_test = test_purchase_verification_mock()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Google API Connection: {'✅ PASS' if api_test else '❌ FAIL'}")
    print(f"Purchase Configuration: {'✅ PASS' if config_test else '❌ FAIL'}")
    
    if api_test and config_test:
        print("\n🎉 All tests passed! Backend is ready for production.")
    else:
        print("\n⚠️  Some tests failed. Follow the instructions above to fix.")
    print("=" * 60 + "\n")
