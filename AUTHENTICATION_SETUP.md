# Authentication System Setup Guide

## Overview

A comprehensive authentication system has been implemented with:
- **Email/Password Authentication** (with werkzeug password hashing)
- **Google OAuth Sign-In**
- **JWT Token-based Sessions**
- **Professional Validation** (email format, password strength, name validation)
- **Protected Routes** (HomeScreen requires authentication)

---

## Backend Structure

### Files Created:
```
backend/
├── models/
│   └── user.py                    # User model with CRUD operations
├── routes/
│   └── auth.py                    # Authentication routes
├── utils/
│   ├── validators.py              # Input validation utilities
│   └── jwt_utils.py               # JWT token generation/verification
├── config.py                      # Updated with JWT_SECRET, GOOGLE_CLIENT_ID
├── database.py                    # Added users_col collection
└── .env                           # Added JWT_SECRET, GOOGLE_CLIENT_ID
```

### API Endpoints:
- `POST /auth/signup` - Create new user with email/password
- `POST /auth/login` - Login with email/password
- `POST /auth/google-signin` - Sign in with Google OAuth
- `POST /auth/verify-token` - Verify JWT token
- `GET /auth/test` - Test endpoint

---

## Frontend Structure

### Files Created:
```
src/
├── context/
│   └── AuthContext.tsx            # Authentication state management
├── services/
│   └── authApi.ts                 # API calls for authentication
└── screens/
    └── auth/
        ├── LoginScreen.tsx        # Login UI
        └── SignupScreen.tsx       # Signup UI
```

---

## Google OAuth Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google Sign-In API**

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **Flyr Clone**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`

### Step 3: Create OAuth Client IDs

#### For Android:
1. Application type: **Android**
2. Package name: `com.anonymous.flyrclone` (from your app.json)
3. Get SHA-1 certificate fingerprint:
   ```bash
   # Debug keystore (for development)
   cd android/app
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Copy the SHA-1 fingerprint
   ```
4. Paste SHA-1 in the form
5. Click **Create**
6. Copy the **Client ID** (Android)

#### For Web (Backend verification):
1. Create another OAuth client ID
2. Application type: **Web application**
3. Authorized redirect URIs: (leave empty for now)
4. Click **Create**
5. Copy the **Client ID** (Web)

### Step 4: Configure Backend

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
```

### Step 5: Configure Frontend

1. Install Google Sign-In (already done):
   ```bash
   npm install @react-native-google-signin/google-signin
   ```

2. Configure in `app.json` or create `google-services.json`:
   
   **Option A: Add to app.json**
   ```json
   {
     "expo": {
       "android": {
         "googleServicesFile": "./google-services.json",
         "config": {
           "googleSignIn": {
             "apiKey": "YOUR_ANDROID_API_KEY",
             "certificateHash": "YOUR_SHA1_FINGERPRINT"
           }
         }
       }
     }
   }
   ```

   **Option B: Download google-services.json**
   - Go to Firebase Console
   - Add Android app with package name: `com.anonymous.flyrclone`
   - Download `google-services.json`
   - Place in `android/app/` directory

3. Initialize Google Sign-In in your app:
   
   Create `src/config/googleSignIn.ts`:
   ```typescript
   import { GoogleSignin } from '@react-native-google-signin/google-signin';

   export const configureGoogleSignIn = () => {
     GoogleSignin.configure({
       webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
       offlineAccess: true,
     });
   };
   ```

### Step 6: Update App.tsx

You need to integrate the authentication flow into your main App.tsx:

```typescript
import { AuthProvider } from './src/context/AuthContext';
import { configureGoogleSignIn } from './src/config/googleSignIn';

// Configure Google Sign-In on app start
configureGoogleSignIn();

export default function App() {
  return (
    <AuthProvider>
      {/* Your navigation setup */}
    </AuthProvider>
  );
}
```

---

## Password Requirements

The system enforces strong password validation:
- ✓ Minimum 8 characters
- ✓ At least one uppercase letter
- ✓ At least one lowercase letter
- ✓ At least one digit
- ✓ At least one special character (!@#$%^&*(),.?":{}|<>)
- ✓ Maximum 128 characters

---

## Testing the Authentication

### Test Backend:
```bash
# Start Flask server
cd backend
python app.py

# Test endpoints
curl http://localhost:5000/auth/test
```

### Test Signup:
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

## Console Logging

The system includes comprehensive logging for debugging:

### Backend Logs:
- ✓ User creation/lookup
- ✓ Password verification
- ✓ Token generation/verification
- ✓ Validation results
- ✓ Google OAuth flow

### Frontend Logs:
- ✓ API requests/responses
- ✓ Authentication state changes
- ✓ Token storage/retrieval
- ✓ Google Sign-In flow

---

## Security Features

1. **Password Hashing**: Uses werkzeug's `generate_password_hash` with salt
2. **JWT Tokens**: 7-day expiration, HS256 algorithm
3. **Input Validation**: Comprehensive email, password, and name validation
4. **Google OAuth**: Secure token verification with Google's API
5. **Token Storage**: Secure storage with AsyncStorage

---

## Next Steps

1. **Get Google OAuth credentials** (follow Step 1-5 above)
2. **Update .env files** with your Google Client IDs
3. **Configure navigation** to show Login screen first
4. **Rebuild the app** to include Google Sign-In native modules:
   ```bash
   npx expo run:android
   ```
5. **Test authentication flow**

---

## Troubleshooting

### Google Sign-In not working:
- Verify SHA-1 fingerprint matches your debug keystore
- Check package name matches exactly
- Ensure Google+ API is enabled
- Rebuild the app after configuration changes

### Token verification failing:
- Check JWT_SECRET matches in backend .env
- Verify token hasn't expired (7 days)
- Check backend logs for specific errors

### Password validation failing:
- Review password requirements above
- Check for special characters
- Ensure no leading/trailing spaces

---

## Database Schema

### Users Collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (lowercase, unique),
  password_hash: String (optional, for email/password users),
  google_id: String (optional, for Google OAuth users),
  profile_picture: String (optional),
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## Environment Variables Summary

### Backend (.env):
```env
JWT_SECRET=flyr_jwt_secret_key_change_in_production_2024
GOOGLE_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
```

### Frontend (will need to add):
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
```
