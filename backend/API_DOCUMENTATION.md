# Brand Shoot AI - Backend API Documentation

**Version:** 1.0.1  
**Base URL:** `http://your-backend-url`  
**Last Updated:** March 27, 2026

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Content APIs (Public)](#content-apis-public)
4. [Image Generation APIs](#image-generation-apis)
5. [Video Generation APIs](#video-generation-apis)
6. [Purchase & Credits APIs](#purchase--credits-apis)
7. [Admin APIs](#admin-apis)
8. [Admin Content Management APIs](#admin-content-management-apis)

---

## Authentication APIs

**Base Path:** `/auth`

### 1. User Signup

**Endpoint:** `POST /auth/signup`  
**Authentication:** None  
**Summary:** Register a new user with email and password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profile_picture": null,
    "status": "active",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid email, weak password, missing fields)
- `409` - User already exists
- `500` - Internal server error

---

### 2. User Login

**Endpoint:** `POST /auth/login`  
**Authentication:** None  
**Summary:** Login with email and password to get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": null,
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid credentials
- `403` - Account not active
- `500` - Internal server error

---

### 3. Google Sign-In

**Endpoint:** `POST /auth/google-signin`  
**Authentication:** None  
**Summary:** Sign in or sign up using Google OAuth ID token.

**Request Body:**
```json
{
  "id_token": "google_id_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "status": "active",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Missing ID token
- `401` - Invalid Google token
- `500` - Internal server error

---

### 4. Verify Token

**Endpoint:** `POST /auth/verify-token`  
**Authentication:** None  
**Summary:** Verify JWT token and get user information.

**Request Body:**
```json
{
  "token": "jwt_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profile_picture": null,
    "status": "active",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Token missing
- `401` - Invalid or expired token
- `404` - User not found
- `500` - Internal server error

---

## User Management APIs

**Base Path:** `/user`

### 1. Get App Settings

**Endpoint:** `GET /user/app-settings`  
**Authentication:** None (Public)  
**Summary:** Get public app settings like per-image cost.

**Response (200):**
```json
{
  "success": true,
  "per_image_cost": 10
}
```

---

### 2. Get My Generations

**Endpoint:** `GET /user/my-generations`  
**Authentication:** Required (JWT)  
**Summary:** Get current user's generation history (last 30 days).

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "fashion", "jewelry")

**Response (200):**
```json
{
  "generations": [
    {
      "id": "gen_id",
      "category": "fashion",
      "sub_category": "shoot",
      "prompt": "Generated images for fashion",
      "total_images": 4,
      "result_urls": ["url1", "url2", "url3", "url4"],
      "status": "completed",
      "created_at": "2026-03-27T10:30:00Z"
    }
  ],
  "total": 10,
  "categories": ["fashion", "jewelry", "accessories"]
}
```

---

### 3. Get My Profile

**Endpoint:** `GET /user/my-profile`  
**Authentication:** Required (JWT)  
**Summary:** Get current user's profile information.

**Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "profile_picture": null,
  "status": "active",
  "role": "user",
  "created_at": "2026-01-15T08:00:00Z"
}
```

---

### 4. Update My Profile

**Endpoint:** `PUT /user/my-profile`  
**Authentication:** Required (JWT)  
**Summary:** Update current user's profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "profile_picture": "https://example.com/photo.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+9876543210",
    "profile_picture": "https://example.com/photo.jpg",
    "status": "active",
    "role": "user",
    "created_at": "2026-01-15T08:00:00Z"
  }
}
```

---

## Content APIs (Public)

**Base Path:** `/content`

### 1. Get Categories

**Endpoint:** `GET /content/categories`  
**Authentication:** None  
**Summary:** Get all active product categories with scenarios and showcase items.

**Query Parameters:**
- `active` (optional): Filter active categories (default: "true")

**Response (200):**
```json
[
  {
    "id": "fashion",
    "title": "Fashion",
    "icon": "👗",
    "is_active": true,
    "order": 1,
    "subcategories": ["photoshoot", "catalogue", "branding"],
    "showcase_items": {
      "photoshoot": [...],
      "catalogue": [...],
      "branding": [...]
    },
    "scenarios": [
      {
        "id": "standing",
        "label": "Standing",
        "prompt_hint": "Person standing naturally...",
        "is_active": true
      }
    ],
    "prompts": {}
  }
]
```

---

### 2. Get Single Category

**Endpoint:** `GET /content/categories/{category_id}`  
**Authentication:** None  
**Summary:** Get details of a specific category.

**Response (200):**
```json
{
  "id": "fashion",
  "title": "Fashion",
  "icon": "👗",
  "is_active": true,
  "order": 1,
  "subcategories": ["photoshoot", "catalogue", "branding"],
  "showcase_items": {},
  "scenarios": [],
  "prompts": {}
}
```

---

### 3. Get Models

**Endpoint:** `GET /content/models`  
**Authentication:** None  
**Summary:** Get models filtered by sub-type (photoshoot/catalogue/branding).

**Query Parameters:**
- `sub_type` (required): "photoshoot" | "catalogue" | "branding"
- `active` (optional): Filter active models (default: "true")

**Response (200):**
```json
[
  {
    "id": "indian-woman",
    "name": "Indian Woman",
    "sub_type": "catalogue",
    "image_url": "uploads/models/indian-woman.png",
    "is_active": true,
    "order": 1,
    "photos": [
      {
        "id": "standing",
        "label": "Standing",
        "image_url": "uploads/models/indian-woman-standing.png"
      }
    ]
  }
]
```

---

### 4. Get Single Model

**Endpoint:** `GET /content/models/{model_id}`  
**Authentication:** None  
**Summary:** Get details of a specific model.

**Response (200):**
```json
{
  "id": "indian-woman",
  "name": "Indian Woman",
  "sub_type": "catalogue",
  "image_url": "uploads/models/indian-woman.png",
  "is_active": true,
  "order": 1,
  "photos": [],
  "poses": [],
  "before_image_url": null,
  "after_image_url": null
}
```

---

### 5. Get Branding Backgrounds

**Endpoint:** `GET /content/branding-backgrounds`  
**Authentication:** None  
**Summary:** Get all active branding backgrounds (colors and textures).

**Query Parameters:**
- `active` (optional): Filter active backgrounds (default: "true")

**Response (200):**
```json
[
  {
    "id": "white",
    "type": "color",
    "label": "White",
    "color": "#FFFFFF",
    "image_url": null,
    "is_active": true,
    "order": 1
  },
  {
    "id": "texture-1",
    "type": "image",
    "label": "Wooden Texture",
    "color": null,
    "image_url": "uploads/backgrounds/wood.jpg",
    "is_active": true,
    "order": 10
  }
]
```

---

### 6. Get Prompt Templates

**Endpoint:** `GET /content/prompts`  
**Authentication:** None  
**Summary:** Get all active prompt templates.

**Response (200):**
```json
[
  {
    "id": "fashion_base",
    "name": "Fashion Base Prompt",
    "type": "photoshoot",
    "content": "A professional photoshoot of {product}..."
  }
]
```

---

### 7. Get Scenarios for Category

**Endpoint:** `GET /content/scenarios/{category_id}`  
**Authentication:** None  
**Summary:** Get active scenarios for a specific category.

**Response (200):**
```json
[
  {
    "id": "standing",
    "label": "Standing",
    "prompt_hint": "Person standing naturally with product...",
    "is_active": true
  },
  {
    "id": "sitting",
    "label": "Sitting",
    "prompt_hint": "Person sitting comfortably with product...",
    "is_active": true
  }
]
```

---

## Image Generation APIs

**Base Path:** `/generate`

### 1. Generate Photoshoot Images

**Endpoint:** `POST /generate/generate-image`  
**Authentication:** Required (JWT)  
**Summary:** Start photoshoot image generation job with multiple scenarios. Deducts credits upfront.

**Request Body:**
```json
{
  "categoryId": "fashion",
  "modelImage": "base64_encoded_model_image",
  "productImage": "base64_encoded_product_image"
}
```

**Response (200):**
```json
{
  "jobId": "a1b2c3d4",
  "totalImages": 4,
  "scenarios": [
    {"id": "standing", "label": "Standing"},
    {"id": "sitting", "label": "Sitting"},
    {"id": "walking", "label": "Walking"},
    {"id": "closeup", "label": "Close-up"}
  ]
}
```

**Error Responses:**
- `400` - Missing required images or invalid data
- `402` - Insufficient credits
- `500` - Internal server error

**Notes:**
- Credits are deducted upfront (1 credit per scenario)
- Job runs in background thread
- Use `/generate/job/{jobId}` to poll status

---

### 2. Generate Catalogue Images

**Endpoint:** `POST /generate/generate-catalogue`  
**Authentication:** Required (JWT)  
**Summary:** Generate catalogue images with multiple model poses and optional background.

**Request Body:**
```json
{
  "categoryId": "fashion",
  "modelImages": ["base64_1", "base64_2", "base64_3"],
  "productImage": "base64_encoded_product",
  "modelLabels": ["Standing", "Walking", "Close-up"],
  "backgroundColor": "#FFFFFF",
  "backgroundLabel": "White"
}
```

**Response (200):**
```json
{
  "jobId": "e5f6g7h8",
  "totalImages": 3,
  "scenarios": [
    {"id": "catalogue_0", "label": "Standing"},
    {"id": "catalogue_1", "label": "Walking"},
    {"id": "catalogue_2", "label": "Close-up"}
  ]
}
```

**Error Responses:**
- `400` - Missing product image or model images
- `402` - Insufficient credits
- `500` - Internal server error

---

### 3. Generate Branding Images

**Endpoint:** `POST /generate/generate-branding`  
**Authentication:** Required (JWT)  
**Summary:** Generate branded product images with business information overlay.

**Request Body:**
```json
{
  "categoryId": "fashion",
  "modelId": "indian-woman",
  "poseImage": "base64_pose_image",
  "productImage": "base64_product_image",
  "logoImage": "base64_logo_image",
  "businessName": "My Fashion Store",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City",
  "webUrl": "www.myfashion.com",
  "backgroundColor": "#FFFFFF",
  "backgroundLabel": "White",
  "aspectRatio": "4:5",
  "aspectRatioDescription": "Instagram Portrait"
}
```

**Response (200):**
```json
{
  "jobId": "i9j0k1l2",
  "totalImages": 2,
  "scenarios": [
    {"id": "branding_primary", "label": "My Fashion Store — Main"},
    {"id": "branding_clean", "label": "My Fashion Store — Clean"}
  ]
}
```

**Error Responses:**
- `400` - Missing required images
- `402` - Insufficient credits
- `500` - Internal server error

---

### 4. Get Job Status (Polling)

**Endpoint:** `GET /generate/job/{job_id}`  
**Authentication:** None  
**Summary:** Poll job status to get real-time progress and generated images.

**Response (200 - In Progress):**
```json
{
  "jobId": "a1b2c3d4",
  "status": "generating",
  "totalImages": 4,
  "completedImages": 2,
  "currentScenario": "Walking",
  "images": [
    {
      "scenarioId": "standing",
      "label": "Standing",
      "imageUrl": "uploads/john_doe_standing_20260327_143022_shoot.jpg"
    },
    {
      "scenarioId": "sitting",
      "label": "Sitting",
      "imageUrl": "uploads/john_doe_sitting_20260327_143045_shoot.jpg"
    }
  ],
  "errors": []
}
```

**Response (200 - Completed):**
```json
{
  "jobId": "a1b2c3d4",
  "status": "done",
  "totalImages": 4,
  "completedImages": 4,
  "currentScenario": null,
  "images": [
    {
      "scenarioId": "standing",
      "label": "Standing",
      "imageUrl": "uploads/john_doe_standing_20260327_143022_shoot.jpg"
    }
  ],
  "errors": []
}
```

**Error Responses:**
- `404` - Job not found

**Notes:**
- Poll every 4 seconds
- Job data persists in database after completion
- Images include creative filenames with user info and timestamp

---

## Video Generation APIs

**Base Path:** `/video`

### 1. Refine Prompt

**Endpoint:** `POST /video/refine-prompt`  
**Authentication:** None  
**Summary:** Refine user's video prompt using AI with category-specific templates.

**Request Body:**
```json
{
  "prompt": "A woman wearing jewelry",
  "category": "jewelry"
}
```

**Response (200):**
```json
{
  "success": true,
  "original_prompt": "A woman wearing jewelry",
  "refined_prompt": "A professional video showcasing an elegant woman wearing exquisite jewelry pieces, with smooth camera movements highlighting the intricate details and sparkle of the jewelry in a luxurious setting with perfect lighting.",
  "category": "jewelry"
}
```

---

### 2. Generate Video

**Endpoint:** `POST /video/generate`  
**Authentication:** Required (JWT)  
**Summary:** Generate video from text prompt (blocking call, takes 30-60 seconds).

**Request Body:**
```json
{
  "prompt": "A professional showcase of jewelry with elegant lighting",
  "category": "jewelry",
  "aspectRatio": "9:16",
  "resolution": "720p"
}
```

**Response (200):**
```json
{
  "success": true,
  "video_uri": "gs://bucket-name/videos/video_id.mp4",
  "prompt": "A professional showcase of jewelry...",
  "category": "jewelry",
  "message": "Video generated successfully"
}
```

**Error Responses:**
- `400` - Missing prompt
- `500` - Video generation failed

**Notes:**
- This is a **blocking call** (waits for completion)
- Takes 30-60 seconds to complete
- Uses Google Veo 3.1 model

---

## Purchase & Credits APIs

**Base Path:** `/purchase`

### 1. Verify Purchase

**Endpoint:** `POST /purchase/verify`  
**Authentication:** Required (JWT)  
**Summary:** Verify Google Play in-app purchase and add credits to user account.

**Request Body:**
```json
{
  "productId": "image_pack_100",
  "purchaseToken": "google_purchase_token_here",
  "packageName": "com.anonymous.flyrclone",
  "transactionId": "GPA.1234-5678-9012-34567"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully added 100 credits",
  "credits_added": 100,
  "total_credits": 250,
  "transaction_id": "trans_id",
  "order_id": "GPA.1234-5678-9012-34567"
}
```

**Error Responses:**
- `400` - Invalid product ID or verification failed
- `409` - Purchase already processed or in progress
- `500` - Internal server error

**Notes:**
- Prevents duplicate purchases (checks pending and success status)
- Verifies with Google Play Developer API
- Atomic transaction to prevent race conditions

---

### 2. Get Credits

**Endpoint:** `GET /purchase/credits`  
**Authentication:** Required (JWT)  
**Summary:** Get user's current credit balance.

**Response (200):**
```json
{
  "success": true,
  "credits": 150
}
```

---

### 3. Get Transactions

**Endpoint:** `GET /purchase/transactions`  
**Authentication:** Required (JWT)  
**Summary:** Get user's transaction history.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)

**Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "trans_id",
      "user_id": "user_id",
      "product_id": "image_pack_100",
      "purchase_token": "token...",
      "credits": 100,
      "amount": 1000,
      "currency": "INR",
      "platform": "android",
      "status": "success",
      "created_at": "2026-03-27T10:00:00Z"
    }
  ]
}
```

---

### 4. Get Products

**Endpoint:** `GET /purchase/products`  
**Authentication:** None  
**Summary:** Get available credit packages for purchase.

**Response (200):**
```json
{
  "success": true,
  "products": [
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
  ],
  "cost_per_image": 10
}
```

---

### 5. Google Play Webhook

**Endpoint:** `POST /purchase/webhook/google-play`  
**Authentication:** None (Pub/Sub)  
**Summary:** Handle Google Play Real-Time Developer Notifications for refunds/revokes.

**Request Body (Pub/Sub):**
```json
{
  "message": {
    "data": "base64_encoded_notification"
  }
}
```

**Notification Types:**
- `1` - PURCHASED (already handled in verify endpoint)
- `3` - REFUNDED (deducts credits from user)
- `4` - REVOKED (deducts credits from user)

**Response (200):**
```json
{
  "status": "processed"
}
```

---

## Admin APIs

**Base Path:** `/admin`  
**Authentication:** Required (JWT + Admin Role)

### 1. Dashboard

**Endpoint:** `GET /admin/dashboard`  
**Summary:** Get admin dashboard statistics.

**Response (200):**
```json
{
  "users": {
    "total": 1250,
    "active": 1200,
    "suspended": 50,
    "new_this_week": 45
  },
  "generations": {
    "total": 5600,
    "this_month": 890
  },
  "tokens": {
    "total_input_tokens": 2500000,
    "total_output_tokens": 15000000,
    "total_tokens": 17500000,
    "total_images": 5600
  }
}
```

---

### 2. List Users

**Endpoint:** `GET /admin/users`  
**Summary:** List all users with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "active",
      "role": "user",
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 1250,
  "page": 1,
  "limit": 20,
  "totalPages": 63
}
```

---

### 3. Get User Detail

**Endpoint:** `GET /admin/users/{user_id}`  
**Summary:** Get detailed user info with generation statistics.

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "active",
    "role": "user",
    "profile_picture": null,
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-03-20T10:00:00Z"
  },
  "generation_stats": {
    "total_generations": 45,
    "total_images": 180,
    "total_input_tokens": 50000,
    "total_output_tokens": 300000,
    "total_tokens": 350000
  }
}
```

---

### 4. Update User Status

**Endpoint:** `PUT /admin/users/{user_id}/status`  
**Summary:** Toggle user status (active/suspended).

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User status updated to suspended"
}
```

---

### 5. Get User Generations

**Endpoint:** `GET /admin/users/{user_id}/generations`  
**Summary:** List all generations for a specific user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "generations": [
    {
      "id": "gen_id",
      "category": "fashion",
      "prompt": "Generated images for fashion",
      "sub_category": "shoot",
      "total_images": 4,
      "input_tokens": 1200,
      "output_tokens": 7200,
      "total_tokens": 8400,
      "result_urls": ["url1", "url2"],
      "status": "completed",
      "created_at": "2026-03-27T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

### 6. Token Statistics

**Endpoint:** `GET /admin/token-stats`  
**Summary:** Get global token usage statistics with date filters.

**Query Parameters:**
- `filter`: "all" | "month" | "previous_month" | "last_3_months" | "last_6_months" | "year" | "custom"
- `from`: Start date (YYYY-MM-DD) for custom filter
- `to`: End date (YYYY-MM-DD) for custom filter

**Response (200):**
```json
{
  "filter": "month",
  "total_generations": 890,
  "total_images": 3560,
  "total_input_tokens": 1200000,
  "total_output_tokens": 7200000,
  "total_tokens": 8400000,
  "categories": [
    {
      "category": "fashion",
      "count": 450,
      "tokens": 4200000,
      "images": 1800
    },
    {
      "category": "jewelry",
      "count": 340,
      "tokens": 3200000,
      "images": 1360
    }
  ]
}
```

---

### 7. Get Cost Settings

**Endpoint:** `GET /admin/settings`  
**Summary:** Get current cost settings for token pricing.

**Response (200):**
```json
{
  "input_cost_per_million": 2,
  "output_cost_per_million": 12,
  "usd_to_inr": 83.5,
  "per_image_cost": 10
}
```

---

### 8. Update Cost Settings

**Endpoint:** `PUT /admin/settings`  
**Summary:** Update cost settings.

**Request Body:**
```json
{
  "input_cost_per_million": 2.5,
  "output_cost_per_million": 15,
  "usd_to_inr": 84.0,
  "per_image_cost": 12
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Settings updated",
  "input_cost_per_million": 2.5,
  "output_cost_per_million": 15,
  "usd_to_inr": 84.0,
  "per_image_cost": 12
}
```

---

## Admin Content Management APIs

**Base Path:** `/admin-content`  
**Authentication:** Required (JWT + Admin Role)

### 1. Upload File

**Endpoint:** `POST /admin-content/upload`  
**Summary:** Upload image/file for admin content (models, backgrounds, etc.).

**Request (multipart/form-data):**
- `file`: File to upload

**Response (200):**
```json
{
  "success": true,
  "url": "uploads/admin/a1b2c3d4_filename.png"
}
```

---

### 2. List Documents

**Endpoint:** `GET /admin-content/{collection_name}`  
**Summary:** List all documents in a collection.

**Collections:** `categories`, `models`, `backgrounds`, `prompts`

**Response (200):**
```json
[
  {
    "_id": "doc_id",
    "category_id": "fashion",
    "title": "Fashion",
    "icon": "👗",
    "is_active": true,
    "order": 1,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-15T10:00:00Z"
  }
]
```

---

### 3. Create Document

**Endpoint:** `POST /admin-content/{collection_name}`  
**Summary:** Create a new document in collection.

**Request Body (example for category):**
```json
{
  "category_id": "accessories",
  "title": "Accessories",
  "icon": "👜",
  "is_active": true,
  "order": 5,
  "subcategories": ["photoshoot", "catalogue"],
  "scenarios": []
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "new_doc_id"
}
```

---

### 4. Update Document

**Endpoint:** `PUT /admin-content/{collection_name}/{doc_id}`  
**Summary:** Update existing document.

**Request Body:**
```json
{
  "title": "Updated Title",
  "is_active": false
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### 5. Delete Document

**Endpoint:** `DELETE /admin-content/{collection_name}/{doc_id}`  
**Summary:** Delete document from collection.

**Response (200):**
```json
{
  "success": true
}
```

---

## Error Codes Reference

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid/missing token) |
| `402` | Payment Required (insufficient credits) |
| `403` | Forbidden (admin access required or account suspended) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `500` | Internal Server Error |

---

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google-signin`

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production.

---

## File Upload Format

All image uploads use **base64 encoding** in request body:

```json
{
  "productImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

---

## Credits System

- **1 credit = 1 generated image**
- Credits are deducted **upfront** when starting generation
- If generation fails, credits are **not refunded** (consider implementing refund logic)
- Purchase credits via Google Play in-app purchases

---

## Generated Image Naming Convention

Images are saved with creative filenames:

**Format:** `{name}_{email_prefix}_{scenario}_{date}_{time}_{type}.jpg`

**Example:** `john_doe_aiguru9873_standing_20260327_143022_shoot.jpg`

---

## Background Jobs

Image generation runs in **background threads**:
1. Client calls generation endpoint
2. Server returns `jobId` immediately
3. Client polls `/generate/job/{jobId}` every 4 seconds
4. Server updates job status in real-time
5. Job data persists in database after completion

---

## Database Collections

- `users` - User accounts
- `generations` - Generation history
- `transactions` - Purchase transactions
- `categories` - Product categories
- `app_models` - AI models (photoshoot/catalogue/branding)
- `branding_backgrounds` - Background options
- `prompt_templates` - AI prompt templates
- `admin_settings` - Admin configuration

---

## Notes

- All timestamps are in **UTC** and ISO 8601 format
- All prices are in **INR (Indian Rupees)**
- Token costs are per **million tokens**
- Video generation uses **Google Veo 3.1** model
- Image generation uses **Google Gemini** model

---

**End of Documentation**
