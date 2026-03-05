# Installation Commands for Google Play IAP

## 📦 Frontend Dependencies

Run these commands in your React Native project root:

```bash
# Install react-native-iap for Google Play Billing
npm install react-native-iap

# Install slider component
npm install @react-native-community/slider

# For iOS (if supporting iOS in future)
cd ios && pod install && cd ..
```

## 🐍 Backend Dependencies

Run these commands in your backend directory:

```bash
# Install Google API client libraries
pip install google-api-python-client
pip install google-auth
pip install google-auth-oauthlib
pip install google-auth-httplib2

# Or install all at once
pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2
```

## 📝 After Installation

1. Restart Metro bundler:
```bash
npx react-native start --reset-cache
```

2. Rebuild the app:
```bash
# For Android
npx react-native run-android

# Clean build if needed
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## ⚠️ Current Lint Errors (Expected)

The following errors will disappear after installing packages:
- ✅ `Cannot find module 'react-native-iap'` → Fixed after `npm install react-native-iap`
- ✅ `Cannot find module '@react-native-community/slider'` → Fixed after `npm install @react-native-community/slider`

## 🔧 Next Steps

After installing packages, you need to:
1. Configure Google Play Console (see GOOGLE_PLAY_IAP_SETUP.md)
2. Add service account JSON credentials
3. Update package name in iapService.ts
4. Test with test accounts
