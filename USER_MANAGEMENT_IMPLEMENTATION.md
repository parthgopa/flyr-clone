# User Management & Generation Tracking - Implementation Guide

## 🎯 Overview

Implemented comprehensive user management system with phone number field, account status tracking, generation history, and subscription-ready architecture.

---

## ✅ What's Been Implemented

### 1. Phone Number Field in Signup

**Frontend Changes:**

**`src/screens/auth/SignupScreen.tsx`**
- Added phone number input field with validation
- Validates minimum 10 digits
- Phone icon with proper styling

**`src/context/AuthContext.tsx`**
- Updated `signup` function signature to accept phone parameter
- Added `phone` and `status` to User interface

**`src/services/authApi.ts`**
- Updated `signupUser` to send phone number to backend
- Added phone and status to AuthResponse interface

**Backend Changes:**

**`backend/routes/auth.py`**
- Updated signup route to accept `phone` parameter
- Sets `status='active'` by default on signup
- Returns phone and status in user response

**`backend/models/user.py`**
- Updated `create_user` to accept phone and status parameters
- Added subscription-ready fields structure

---

### 2. Account Status Management

**Login Status Check:**

**`backend/routes/auth.py` - Login Route**
```python
# Check if user status is active
if user.get("status") != "active":
    return jsonify({
        "success": False,
        "error": "Your account is not active. Please contact support."
    }), 403
```

**Status Values:**
- `active` - User can login and use the app
- `inactive` - User cannot login (for future admin controls)
- `suspended` - User account suspended
- `pending` - Awaiting verification (for future use)

---

### 3. Generation Tracking System

**New Model: `backend/models/generation.py`**

Tracks all user generations with:
- `user_id` - Links generation to user
- `generation_type` - 'image' or 'video'
- `category` - Category of generation
- `prompt` - User's prompt
- `result_urls` - Array of generated URLs
- `metadata` - Additional info (model, settings, etc.)
- `created_at` - Timestamp
- `status` - completed, failed, pending

**Key Methods:**
```python
Generation.create_generation(user_id, generation_type, category, prompt, result_urls, metadata)
Generation.find_by_user(user_id, limit=50)
Generation.get_user_stats(user_id)
```

---

### 4. Authentication Middleware

**New File: `backend/utils/auth_middleware.py`**

`@require_auth` decorator:
- Extracts JWT token from Authorization header
- Verifies token validity
- Checks user exists and status is 'active'
- Adds `request.current_user` and `request.user_id` to context

**Usage:**
```python
@generate_bp.route("/generate-image", methods=["POST"])
@require_auth
def generate_image_route():
    user_id = request.user_id  # Available from middleware
```

---

### 5. Image Generation with User Tracking

**`backend/routes/generate.py`**

**Changes:**
- Added `@require_auth` decorator
- Extracts `user_id` from request context
- Passes `user_id` to background thread
- Saves generation record after completion

**Generation Record Saved:**
```python
Generation.create_generation(
    user_id=user_id,
    generation_type="image",
    category=category_id,
    prompt=f"Generated {len(generated_urls)} images for {category_id}",
    result_urls=generated_urls,
    metadata={
        "job_id": job_id,
        "scenarios": [s["label"] for s in scenarios],
        "total_images": len(generated_urls)
    }
)
```

---

### 6. Video Generation with User Tracking

**`backend/routes/video.py`**

**Changes:**
- Added `@require_auth` decorator
- Extracts `user_id` from request context
- Saves generation record after video completion

**Generation Record Saved:**
```python
Generation.create_generation(
    user_id=user_id,
    generation_type="video",
    category=category,
    prompt=prompt,
    result_urls=[video_uri],
    metadata={
        "aspect_ratio": aspect_ratio,
        "resolution": resolution,
        "model": "veo-3.1-fast-generate-preview"
    }
)
```

---

### 7. Frontend API Authentication

**`src/services/api.ts`**
- Added `getAuthToken()` helper function
- Updated `startGenerationJob()` to send Authorization header

**`src/services/videoApi.ts`**
- Added `getAuthToken()` helper function
- Updated `generateVideo()` to send Authorization header

**Token Format:**
```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

---

## 🔮 Subscription-Ready Structure

### User Schema (Future-Ready)

**`backend/models/user.py`**

Each user now has a `subscription` object:
```python
"subscription": {
    "plan": "free",  # free, basic, premium
    "credits_remaining": 0,  # For pay-per-use model
    "credits_total": 0,
    "subscription_start": None,
    "subscription_end": None,
    "auto_renew": False
}
```

### Future Subscription Flow

**Plan Types:**
1. **Free Plan** - Limited generations per month
2. **Basic Plan** - More generations + priority queue
3. **Premium Plan** - Unlimited generations + advanced features

**Credit System:**
- Each generation costs credits
- Credits can be purchased or included in subscription
- Track `credits_remaining` and `credits_total`

**Implementation Ready:**
```python
# Check credits before generation
if user["subscription"]["credits_remaining"] <= 0:
    return jsonify({"error": "Insufficient credits"}), 403

# Deduct credits after generation
User.update_user(user_id, {
    "subscription.credits_remaining": user["subscription"]["credits_remaining"] - 1
})
```

---

## 📊 Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password_hash: String,
  status: String,  // 'active', 'inactive', 'suspended'
  google_id: String,
  profile_picture: String,
  subscription: {
    plan: String,
    credits_remaining: Number,
    credits_total: Number,
    subscription_start: Date,
    subscription_end: Date,
    auto_renew: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

### Generations Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,  // Links to users collection
  generation_type: String,  // 'image' or 'video'
  category: String,
  prompt: String,
  result_urls: [String],
  metadata: {
    job_id: String,
    scenarios: [String],
    total_images: Number,
    aspect_ratio: String,
    resolution: String,
    model: String
  },
  status: String,  // 'completed', 'failed', 'pending'
  created_at: Date
}
```

---

## 🧪 Testing

### Test Signup with Phone Number

1. Open app → Navigate to Signup
2. Fill in:
   - Name: "John Doe"
   - Email: "john@example.com"
   - **Phone: "1234567890"**
   - Password: "SecurePass123!"
3. Tap "Sign Up"
4. Check backend logs for phone number

**Expected Backend Log:**
```
--- Signup Request ---
Name: John Doe
Email: john@example.com
Phone: 1234567890
✓ User created: john@example.com (Status: active)
```

### Test Login Status Check

1. Manually set user status to 'inactive' in MongoDB
2. Try to login
3. Should see error: "Your account is not active"

### Test Generation Tracking

**Image Generation:**
1. Login to app
2. Upload model and product images
3. Generate images
4. Check MongoDB `generations` collection
5. Should see new document with your `user_id`

**Video Generation:**
1. Login to app
2. Navigate to Ads creation
3. Generate video
4. Check MongoDB `generations` collection
5. Should see new document with `generation_type: 'video'`

### Query User Generations

```javascript
// In MongoDB
db.generations.find({ user_id: ObjectId("your_user_id") })

// Get user stats
db.generations.aggregate([
  { $match: { user_id: ObjectId("your_user_id") } },
  { $group: {
      _id: "$generation_type",
      count: { $sum: 1 }
  }}
])
```

---

## 🔐 Security Features

1. **JWT Authentication** - All generation endpoints require valid token
2. **Status Check** - Only 'active' users can login
3. **User Validation** - Middleware verifies user exists and is active
4. **Token Expiry** - JWT tokens expire after configured time
5. **Password Hashing** - Werkzeug secure password hashing

---

## 📝 API Changes

### Signup Endpoint

**Request:**
```json
POST /auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "status": "active"
  }
}
```

### Login Endpoint

**Response Now Includes:**
```json
{
  "user": {
    "phone": "1234567890",
    "status": "active"
  }
}
```

### Generation Endpoints

**Now Require Authentication:**
```
POST /generate/generate-image
Headers: Authorization: Bearer <token>

POST /video/generate
Headers: Authorization: Bearer <token>
```

---

## 🚀 Future Enhancements

### Subscription Management Routes (To Be Added)

```python
# Get user subscription info
GET /subscription/info

# Purchase credits
POST /subscription/purchase-credits
{
  "credits": 100,
  "payment_method": "stripe_token"
}

# Upgrade subscription
POST /subscription/upgrade
{
  "plan": "premium"
}

# View generation history
GET /generations/history?limit=50

# Get generation statistics
GET /generations/stats
```

### Admin Routes (To Be Added)

```python
# Update user status
POST /admin/users/<user_id>/status
{
  "status": "active" | "inactive" | "suspended"
}

# Grant credits
POST /admin/users/<user_id>/credits
{
  "credits": 50
}

# View all users
GET /admin/users?page=1&limit=50
```

---

## ✅ Summary

**Completed:**
- ✅ Phone number field in signup (frontend + backend)
- ✅ Account status management with login check
- ✅ Generation tracking model and database structure
- ✅ JWT authentication middleware
- ✅ Image generation with userId tracking
- ✅ Video generation with userId tracking
- ✅ Frontend API authentication headers
- ✅ Subscription-ready user schema

**Ready for Future:**
- 🔮 Subscription plans (free, basic, premium)
- 🔮 Credit system for pay-per-use
- 🔮 Admin panel for user management
- 🔮 Generation history viewing
- 🔮 Usage statistics and analytics
- 🔮 Payment integration (Stripe/Razorpay)

**Database:**
- Users collection with phone, status, subscription fields
- Generations collection tracking all user activity
- Ready for scaling with proper indexing on user_id

The system is now production-ready with user management and fully prepared for subscription features! 🎉
