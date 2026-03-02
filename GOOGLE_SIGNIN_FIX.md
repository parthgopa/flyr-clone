# Fix Google Sign-In DEVELOPER_ERROR

## Problem
You're getting `DEVELOPER_ERROR` because Google Sign-In requires proper Android configuration with Firebase/Google Cloud Console.

---

## Solution: Two Options

### **Option A: Use Firebase (Recommended - Easier)**

#### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: "Flyr Clone"
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Add Android App to Firebase
1. In Firebase Console, click "Add app" → Android icon
2. **Android package name**: `com.anonymous.flyrclone` (from your app.json)
3. **App nickname**: "Flyr Clone Android"
4. **Debug signing certificate SHA-1**: Get it by running:
   ```bash
   cd android/app
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   Copy the SHA-1 fingerprint (looks like: `AA:BB:CC:DD:EE:FF...`)
5. Click "Register app"

#### Step 3: Download google-services.json
1. Click "Download google-services.json"
2. Save it to: `d:\oneWeb\Jewellery_mobile\flyr-clone\android\app\google-services.json`

#### Step 4: Enable Google Sign-In in Firebase
1. In Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Add support email
4. Save

#### Step 5: Get Web Client ID
1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Find "Web client ID" under "Web API Key"
4. Copy it (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

#### Step 6: Update Frontend .env
Create/update `d:\oneWeb\Jewellery_mobile\flyr-clone\.env`:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.10:5000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
```

#### Step 7: Update Backend .env
Already done! You have:
```env
GOOGLE_CLIENT_ID=685666908473-hv64jrps35fgb8g7rh0n2os7mrchumf1.apps.googleusercontent.com
```

#### Step 8: Add Google Services Plugin to Android
Edit `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'  // Add this line
    }
}
```

Edit `android/app/build.gradle` (add at the bottom):
```gradle
apply plugin: 'com.google.gms.google-services'  // Add this line at the very bottom
```

#### Step 9: Rebuild App
```bash
npx expo run:android
```

---

### **Option B: Manual Google Cloud Console Setup**

If you don't want to use Firebase, you can configure directly in Google Cloud Console:

#### Step 1: Get SHA-1 Fingerprint
```bash
cd android/app
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Copy the SHA-1 fingerprint.

#### Step 2: Create OAuth Client ID
1. Go to https://console.cloud.google.com/
2. Select your project (or create new one)
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Application type: **Android**
6. Name: "Flyr Android"
7. Package name: `com.anonymous.flyrclone`
8. SHA-1 certificate fingerprint: Paste your SHA-1
9. Click "Create"

#### Step 3: Create Web Client ID (for backend)
1. Create Credentials → OAuth client ID
2. Application type: **Web application**
3. Name: "Flyr Backend"
4. Click "Create"
5. Copy the Client ID

#### Step 4: Update .env Files
Frontend `.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Backend `.env` (already done):
```env
GOOGLE_CLIENT_ID=685666908473-hv64jrps35fgb8g7rh0n2os7mrchumf1.apps.googleusercontent.com
```

#### Step 5: Rebuild
```bash
npx expo run:android
```

---

## Quick Checklist

- [ ] SHA-1 fingerprint added to Firebase/Google Cloud
- [ ] Package name is `com.anonymous.flyrclone`
- [ ] `google-services.json` downloaded and placed in `android/app/`
- [ ] Web Client ID added to frontend `.env`
- [ ] Web Client ID added to backend `.env`
- [ ] Google Services plugin added to `android/build.gradle`
- [ ] `apply plugin: 'com.google.gms.google-services'` added to `android/app/build.gradle`
- [ ] App rebuilt with `npx expo run:android`

---

## Common Issues

### "DEVELOPER_ERROR" persists
- Double-check SHA-1 fingerprint matches exactly
- Verify package name is `com.anonymous.flyrclone`
- Make sure you're using the **debug** keystore SHA-1
- Wait 5-10 minutes after adding SHA-1 (Google needs to propagate changes)
- Clear app data and rebuild

### "google-services.json not found"
- Make sure file is in `android/app/google-services.json`
- Check file permissions
- Rebuild the app

### "Sign in failed"
- Check internet connection
- Verify Web Client ID is correct in `.env`
- Check backend is receiving the correct GOOGLE_CLIENT_ID

---

## Testing After Fix

1. Rebuild app: `npx expo run:android`
2. Open app → Should show Login screen
3. Tap "Continue with Google"
4. Select Google account
5. Should sign in successfully and navigate to HomeScreen

Console should show:
```
Initiating Google Sign-In...
Google user info: { ... }
✓ Google sign-in successful
```

---

## Current Status

✅ Backend configured with Google Client ID
✅ Frontend code ready for Google Sign-In
❌ Missing `google-services.json` file
❌ Missing Google Services plugin in Android build files
❌ Missing Web Client ID in frontend .env

**Next Step**: Follow Option A (Firebase) - it's the easiest and most reliable method.
