# Google Play In-App Purchase Setup Guide

## 📦 Package Installation

### 1. Install Required Dependencies

```bash
# Install react-native-iap for Google Play Billing
npm install react-native-iap

# Install slider component
npm install @react-native-community/slider

# Install Google API client for backend
pip install google-api-python-client google-auth
```

### 2. Link Native Modules (if using older React Native)

```bash
npx react-native link react-native-iap
npx react-native link @react-native-community/slider
```

---

## 🔧 Backend Configuration

### 1. Google Play Service Account Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Setup → API Access**
3. Click **Create new service account**
4. In Google Cloud Console:
   - Create a service account
   - Grant it **Monetization permissions**
   - Create and download JSON key
5. Save the JSON key file securely

### 2. Environment Variables

Add to your `.env` file:

```env
# Google Play IAP Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
ANDROID_PACKAGE_NAME=com.flyr.app
```

### 3. Google Cloud Pub/Sub Setup (for Webhooks)

1. Enable **Google Cloud Pub/Sub API**
2. Create a topic: `google-play-notifications`
3. Create a subscription to this topic
4. Configure endpoint: `https://your-backend-url.com/purchase/webhook/google-play`
5. In Google Play Console:
   - Navigate to **Monetization setup → Real-time developer notifications**
   - Enter your topic name: `projects/YOUR_PROJECT/topics/google-play-notifications`

---

## 🎮 Google Play Console Setup

### 1. Create In-App Products

Navigate to **Monetization setup → Products → In-app products**

Create the following products:

| Product ID | Type | Price | Title |
|------------|------|-------|-------|
| `image_pack_10` | One-time | ₹100 | 10 Image Credits |
| `image_pack_25` | One-time | ₹250 | 25 Image Credits |
| `image_pack_50` | One-time | ₹500 | 50 Image Credits |
| `image_pack_100` | One-time | ₹1000 | 100 Image Credits |

For each product:
1. Click **Create product**
2. Set **Product ID** (must match exactly)
3. Set **Product type**: One-time
4. Add pricing: ₹100, ₹250, ₹500, ₹1000
5. Add title and description
6. Click **Save** and **Activate**

### 2. Product Details Template

**10 Image Credits:**
- Title: "10 Image Credits"
- Description: "Generate 10 high-quality AI images with our advanced image generation technology"

**25 Image Credits:**
- Title: "25 Image Credits" 
- Description: "Generate 25 high-quality AI images. Best value for regular users"

**50 Image Credits:**
- Title: "50 Image Credits"
- Description: "Generate 50 high-quality AI images. Perfect for power users"

**100 Image Credits:**
- Title: "100 Image Credits"
- Description: "Generate 100 high-quality AI images. Maximum savings for professionals"

---

## 📱 Frontend Configuration

### 1. Update Package Name

In `src/services/iapService.ts`:
```typescript
const PACKAGE_NAME = 'com.your.actual.package'; // Update this
```

### 2. Initialize IAP in App.tsx

Add to your main App component:

```typescript
import { initializeIAP, endIAP } from './src/services/iapService';

useEffect(() => {
  // Initialize IAP on app start
  initializeIAP();
  
  // Cleanup on unmount
  return () => {
    endIAP();
  };
}, []);
```

---

## 🔐 Security Best Practices

### 1. Backend Verification (CRITICAL)

✅ **ALWAYS verify purchases server-side**
- Never grant credits without backend verification
- Use Google Play Developer API to validate purchase tokens
- Check purchase state (0 = purchased, 1 = canceled)

❌ **NEVER do this:**
```typescript
// DON'T grant credits in frontend directly
if (purchase) {
  addCredits(10); // ❌ INSECURE!
}
```

✅ **DO this:**
```typescript
// Send to backend for verification first
const result = await verifyPurchaseAPI({
  productId,
  purchaseToken,
  packageName
});

if (result.success) {
  // Backend already added credits
  showSuccessMessage();
}
```

### 2. Prevent Replay Attacks

- Store processed purchase tokens
- Check if token was already processed before verification
- Backend validates purchase hasn't been consumed

### 3. Handle Refunds/Revocations

- Webhook automatically handles refunds
- Credits are deducted when refund occurs
- Transaction status updated to "refunded" or "revoked"

---

## 🧪 Testing

### 1. Test Accounts

1. Add test accounts in Play Console:
   - Navigate to **Setup → License testing**
   - Add Gmail accounts for testing
2. These accounts can make test purchases without charges

### 2. Test Purchase Flow

1. Build and install app on device
2. Sign in with test account
3. Navigate to "Buy More Images"
4. Select credit package
5. Complete test purchase
6. Verify credits are added
7. Check backend logs for verification

### 3. Test Webhook

Use Google Cloud Console to publish test message:

```json
{
  "version": "1.0",
  "packageName": "com.flyr.app",
  "eventTimeMillis": "1234567890123",
  "oneTimeProductNotification": {
    "version": "1.0",
    "notificationType": 1,
    "purchaseToken": "test_token",
    "sku": "image_pack_10"
  }
}
```

---

## 🚀 Production Deployment

### 1. Checklist Before Launch

- [ ] All products created and activated in Play Console
- [ ] Service account JSON key configured
- [ ] Webhook endpoint configured and tested
- [ ] Backend verification working
- [ ] Package name matches in all places
- [ ] Test purchases working with test accounts
- [ ] Refund handling tested

### 2. Monitor Transactions

Backend logs will show:
```
✓ Transaction created: image_pack_10 for user 123 (Status: pending)
✓ Google Play verification successful for image_pack_10
✓ Added 10 credits to user 123 (Reason: purchase_image_pack_10)
✓ Transaction with token abc... marked as verified
✓ Purchase acknowledged for image_pack_10
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "credits": 22,  // Current credit balance
  "plan": "free",
  ...
}
```

### Transactions Collection
```javascript
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "product_id": "image_pack_10",
  "purchase_token": "google_purchase_token_here",
  "credits": 10,
  "amount": 100,
  "currency": "INR",
  "platform": "android",
  "status": "success", // pending/success/failed/refunded/revoked
  "created_at": ISODate("..."),
  "verified_at": ISODate("..."),
  "metadata": {
    "verification": {...},
    "order_id": "GPA.1234.5678.9012"
  }
}
```

---

## 🔄 Purchase Flow Diagram

```
User Selects Package
        ↓
Google Play Purchase Dialog
        ↓
Purchase Successful
        ↓
Get Purchase Token
        ↓
Send to Backend (/purchase/verify)
        ↓
Backend Verifies with Google API
        ↓
If Valid: Add Credits + Save Transaction
        ↓
Send Success to Frontend
        ↓
Acknowledge Purchase
        ↓
Show Success Message
```

---

## ⚠️ Common Issues

### Issue: "Product not available"
**Solution:** Ensure products are activated in Play Console and app is signed with correct keystore

### Issue: "Purchase already owned"
**Solution:** Consume the purchase properly or wait 24 hours for Google to process

### Issue: "Verification failed"
**Solution:** Check service account has correct permissions and credentials path is correct

### Issue: "Webhook not receiving notifications"
**Solution:** Verify Pub/Sub topic name matches exactly in Play Console

---

## 📞 Support

For issues:
1. Check backend logs for detailed error messages
2. Verify Google Play Console configuration
3. Test with different test accounts
4. Check service account permissions

---

## 🎉 Success Indicators

✅ User can see current credit balance
✅ User can select credit packages via slider
✅ Purchase dialog appears correctly
✅ Backend receives and verifies purchase
✅ Credits added to user account
✅ Transaction saved to database
✅ Purchase acknowledged to Google
✅ Webhooks handle refunds automatically
