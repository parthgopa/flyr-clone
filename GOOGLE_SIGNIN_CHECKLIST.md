# Google Sign-In Final Checklist

## ✅ What You've Done
- ✅ google-services.json in android/app/
- ✅ SHA-1 fingerprint added to Firebase
- ✅ Web Client ID configured
- ✅ Google Services plugin applied
- ✅ App rebuilt with npx expo run:android

## 🔴 Still Getting DEVELOPER_ERROR

This means one of these is missing:

### 1. Firebase Authentication Not Enabled
**Check:**
1. Firebase Console → Authentication
2. Click "Get Started" if you haven't
3. Sign-in method tab
4. Enable "Google" provider
5. Add support email
6. Save

**This is often the missing step!**

### 2. Missing Android OAuth Client
You have a Web OAuth client, but you might also need an Android OAuth client.

**Create Android OAuth Client:**
1. Google Cloud Console: https://console.cloud.google.com/
2. Select project: "flyr-clone-487806"
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Type: **Android**
6. Name: "Flyr Android"
7. Package: `com.anonymous.flyrclone`
8. SHA-1: *Your debug keystore SHA-1*
9. Create

**After creating, re-download google-services.json from Firebase!**

### 3. Wrong SHA-1 Fingerprint
Make sure you used the **debug** keystore SHA-1:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Common mistakes:**
- Using release keystore SHA-1 instead of debug
- Typo when copying SHA-1
- SHA-1 not saved in Firebase (click "Add fingerprint" then "Save")

### 4. Google Cloud Console API Not Enabled
1. Google Cloud Console → APIs & Services → Library
2. Search for "Google Sign-In API"
3. Click and enable it
4. Also enable "Google+ API" (legacy but sometimes needed)

### 5. Package Name Mismatch
Verify package name matches everywhere:
- `app.json`: `"package": "com.anonymous.flyrclone"`
- `google-services.json`: `"package_name": "com.anonymous.flyrclone"`
- Firebase Console: Android app package name
- Google Cloud Console: OAuth client package name

### 6. Wait for Google Propagation
After making changes in Firebase/Google Cloud Console:
- Wait 5-10 minutes
- Changes need to propagate across Google servers
- Try again after waiting

---

## 🧪 Test Steps

### Test 1: Check Configuration
Run the app and check console logs:
```
✓ Configuring Google Sign-In...
Web Client ID: 783547595969-bb69vr0gpd0bb630shbeostu33kt9fr9.apps.googleusercontent.com
✓ Google Sign-In configured successfully
```

### Test 2: Try Google Sign-In
1. Tap "Continue with Google"
2. Check console for error details
3. Look for specific error message

### Test 3: Verify google-services.json
Check if `oauth_client` array has entries:
```json
"oauth_client": [
  {
    "client_id": "783547595969-bb69vr0gpd0bb630shbeostu33kt9fr9.apps.googleusercontent.com",
    "client_type": 3
  }
]
```

If empty `[]`, you need to create OAuth clients in Google Cloud Console.

---

## 🎯 Most Common Solution

**90% of DEVELOPER_ERROR cases are fixed by:**

1. **Enable Firebase Authentication** (often forgotten!)
   - Firebase Console → Authentication → Get Started
   - Enable Google provider

2. **Create Android OAuth Client** (in addition to Web client)
   - Google Cloud Console → Credentials
   - Create OAuth client ID → Android
   - Use debug keystore SHA-1

3. **Re-download google-services.json** after creating Android OAuth client
   - Firebase Console → Project Settings
   - Download updated google-services.json
   - Replace android/app/google-services.json

4. **Rebuild app**
   ```bash
   cd android && ./gradlew clean && cd ..
   npx expo run:android
   ```

---

## 🔍 Debug Commands

### Get SHA-1 (Windows):
```bash
cd android/app
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Get SHA-1 (Mac/Linux):
```bash
cd android/app
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Clean Build:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 📞 If Still Not Working

Share these details:
1. Console logs when app starts
2. Full error message when clicking Google Sign-In
3. Screenshot of Firebase Authentication page (showing Google is enabled)
4. Screenshot of Google Cloud Console Credentials page
5. Contents of oauth_client array in google-services.json
