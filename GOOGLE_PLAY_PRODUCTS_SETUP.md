# Google Play In-App Products Setup Guide

## 🎯 Complete Setup for Consumable In-App Products

This guide will help you create consumable in-app products in Google Play Console so users can purchase credits unlimited times.

---

## 📋 Prerequisites

- ✅ AAB uploaded to Google Play Console
- ✅ App in Internal Testing or higher track
- ✅ Google Service Account created and linked (from previous setup)

---

## 🛍️ Step 1: Create In-App Products

### **A. Navigate to Products Section**

1. Go to **Google Play Console**: https://play.google.com/console
2. Select your app: **flyr-clone**
3. In left sidebar, go to: **Monetize** → **In-app products**
4. Click **Create product**

---

### **B. Create Product 1: 10 Images Pack**

**Product details:**
- **Product ID:** `image_pack_10` (MUST match exactly)
- **Name:** `10 Image Credits`
- **Description:** `Generate 10 AI-powered jewelry images with your products`

**Pricing:**
- Click **Set price**
- Select **India (INR)** as base country
- Enter price: `₹100.00` (or `100`)
- Google will auto-convert to other currencies
- Click **Apply prices**

**Product type:**
- ⚠️ **IMPORTANT:** This is the key setting!
- The product should be **Consumable** (can be purchased multiple times)
- In newer Play Console: Look for "Product type" or "Consumption" setting
- Make sure it's NOT set as "Non-consumable" or "One-time"

**Status:**
- Set to **Active**

Click **Save** and **Activate**

---

### **C. Create Product 2: 25 Images Pack**

Repeat the same process:

- **Product ID:** `image_pack_25`
- **Name:** `25 Image Credits`
- **Description:** `Generate 25 AI-powered jewelry images with your products`
- **Price:** `₹250.00`
- **Type:** Consumable
- **Status:** Active

---

### **D. Create Product 3: 50 Images Pack**

- **Product ID:** `image_pack_50`
- **Name:** `50 Image Credits`
- **Description:** `Generate 50 AI-powered jewelry images with your products`
- **Price:** `₹500.00`
- **Type:** Consumable
- **Status:** Active

---

### **E. Create Product 4: 100 Images Pack**

- **Product ID:** `image_pack_100`
- **Name:** `100 Image Credits`
- **Description:** `Generate 100 AI-powered jewelry images with your products`
- **Price:** `₹1000.00`
- **Type:** Consumable
- **Status:** Active

---

## ✅ Verify Products Are Created

After creating all 4 products, you should see:

| Product ID | Name | Price | Status |
|------------|------|-------|--------|
| `image_pack_10` | 10 Image Credits | ₹100 | Active |
| `image_pack_25` | 25 Image Credits | ₹250 | Active |
| `image_pack_50` | 50 Image Credits | ₹500 | Active |
| `image_pack_100` | 100 Image Credits | ₹1000 | Active |

---

## 🔔 Step 2: Set Up Real-Time Developer Notifications (RTDN)

RTDN allows Google Play to notify your backend about refunds and other events.

### **A. Get Your Ngrok URL**

Your current ngrok URL: `https://0ad2-103-241-226-107.ngrok-free.app`

**Webhook endpoint:** `https://0ad2-103-241-226-107.ngrok-free.app/purchase/webhook/google-play`

⚠️ **Important:** Ngrok URLs change when you restart ngrok. For production, use a permanent domain.

---

### **B. Create Google Cloud Pub/Sub Topic**

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select your project: `flyr-iap-backend`
3. Navigate to: **Pub/Sub** → **Topics**
4. Click **CREATE TOPIC**
5. **Topic ID:** `google-play-purchases`
6. Leave other settings as default
7. Click **CREATE**

---

### **C. Create Pub/Sub Subscription**

1. In the topic you just created, click **CREATE SUBSCRIPTION**
2. **Subscription ID:** `google-play-purchases-sub`
3. **Delivery type:** Push
4. **Endpoint URL:** `https://0ad2-103-241-226-107.ngrok-free.app/purchase/webhook/google-play`
5. **Acknowledgement deadline:** 10 seconds
6. Click **CREATE**

---

### **D. Grant Pub/Sub Permissions**

1. In Google Cloud Console, go to **IAM & Admin** → **IAM**
2. Click **GRANT ACCESS**
3. **New principals:** `google-play-developer-notifications@system.gserviceaccount.com`
4. **Role:** `Pub/Sub Publisher`
5. Click **SAVE**

---

### **E. Link Pub/Sub to Google Play Console**

1. Go back to **Google Play Console**
2. Navigate to: **Monetize** → **Monetization setup**
3. Scroll to **Real-time developer notifications**
4. Click **Edit**
5. **Topic name:** Copy the full topic name from Cloud Console
   - Format: `projects/flyr-iap-backend/topics/google-play-purchases`
6. Click **Save changes**

---

## 🧪 Step 3: Test the Setup

### **A. Test Product Availability**

Run this in your app's React Native debugger or check logs:

```javascript
import { getProducts } from '../services/iapService';

const products = await getProducts();
console.log('Available products:', products);
```

**Expected output:**
```javascript
[
  { productId: 'image_pack_10', price: '₹100.00', ... },
  { productId: 'image_pack_25', price: '₹250.00', ... },
  { productId: 'image_pack_50', price: '₹500.00', ... },
  { productId: 'image_pack_100', price: '₹1000.00', ... }
]
```

---

### **B. Test Purchase Flow**

1. **Make a test purchase** in your app
2. **Watch backend logs** - you should now see:

```
============================================================
🔍 PURCHASE VERIFICATION REQUEST RECEIVED
============================================================
👤 User ID: ...
📦 Request data: {...}
🏷️  Product ID: image_pack_10
🎫 Purchase Token: ...
📱 Package Name: com.anonymous.flyrclone

🔐 Verifying with Google Play API...
✅ Purchase verified with Google Play
🎉 PURCHASE SUCCESSFUL!
   Credits added: 10
   New balance: 10
============================================================
```

3. **Check your app** - credits should be added

---

### **C. Test Webhook (Optional)**

To test the webhook, you can trigger a refund:

1. Go to **Google Play Console** → **Order management**
2. Find a test order
3. Issue a refund
4. Your backend should receive a webhook notification
5. Credits should be automatically deducted

---

## 🔍 Troubleshooting

### **"Product not found" error**

**Causes:**
- Product ID mismatch (check spelling exactly)
- Product not activated in Play Console
- App not published to at least Internal Testing track
- Using wrong Google account for testing

**Solution:**
- Verify all 4 product IDs match exactly
- Ensure products are set to "Active"
- Publish app to Internal Testing
- Add your test account to internal testers list

---

### **"Purchase verification failed"**

**Causes:**
- Google Service Account not set up
- Service Account JSON file missing
- API not enabled
- Wrong package name

**Solution:**
- Follow `GOOGLE_SERVICE_ACCOUNT_SETUP.md`
- Ensure `flyr-service-account.json` exists in `backend/`
- Enable Google Play Developer API
- Verify package name: `com.anonymous.flyrclone`

---

### **Webhook not receiving notifications**

**Causes:**
- Pub/Sub topic not created
- Subscription endpoint URL wrong
- Permissions not granted
- Ngrok URL changed

**Solution:**
- Verify Pub/Sub topic exists
- Check subscription endpoint matches your ngrok URL
- Grant `Pub/Sub Publisher` role to Google service account
- Update subscription if ngrok URL changed

---

### **"Payment cancelled" after successful payment**

**Causes:**
- Backend not receiving verification request
- Network timeout
- Google API verification failing

**Solution:**
- Check backend logs for verification request
- Ensure ngrok is running
- Test Google API connection with `test_google_api.py`
- Check service account permissions

---

## 📊 Product Configuration Summary

Your backend expects these exact product IDs:

```python
PRODUCT_CREDITS = {
    "image_pack_10": {"credits": 10, "price": 100},
    "image_pack_25": {"credits": 25, "price": 250},
    "image_pack_50": {"credits": 50, "price": 500},
    "image_pack_100": {"credits": 100, "price": 1000}
}
```

**Make sure Google Play Console products match these IDs exactly!**

---

## 🚀 Production Deployment

For production (after testing):

1. **Replace ngrok with permanent domain:**
   - Use your own domain or cloud function
   - Update Pub/Sub subscription endpoint
   - Update backend URL in app

2. **Publish app to Production:**
   - Move from Internal Testing to Production
   - Products will be available to all users

3. **Monitor transactions:**
   - Check backend logs regularly
   - Monitor Google Play Console order management
   - Track refunds and disputes

---

## ✅ Setup Complete Checklist

- [ ] 4 products created in Google Play Console
- [ ] All products set to "Consumable" type
- [ ] All products set to "Active" status
- [ ] Product IDs match backend exactly
- [ ] Prices set correctly (₹100, ₹250, ₹500, ₹1000)
- [ ] Pub/Sub topic created
- [ ] Pub/Sub subscription created with webhook URL
- [ ] Permissions granted to Google service account
- [ ] RTDN configured in Play Console
- [ ] Test purchase successful
- [ ] Credits added to user account
- [ ] Backend logs show verification

---

## 🎉 You're Ready!

Once all checkboxes are complete:
- Users can purchase credits unlimited times
- Backend verifies all purchases with Google Play
- Refunds are handled automatically via webhook
- Credits are tracked securely in your database

**Your in-app purchase system is fully operational!** 🚀
