# Production AAB Build - Pre-Flight Checklist ✅

## 📋 Configuration Verification Complete

### ✅ 1. react-native-iap Installation
- **Status:** INSTALLED ✓
- **Version:** 14.7.12
- **Location:** `package.json`

### ✅ 2. Google Play BILLING Permission
- **Status:** ADDED ✓
- **Location:** `android/app/src/main/AndroidManifest.xml:3`
```xml
<uses-permission android:name="com.android.vending.BILLING"/>
```

### ✅ 3. minSdkVersion
- **Status:** VERIFIED ✓
- **Value:** 21 (meets requirement >= 21)
- **Source:** React Native defaults

### ✅ 4. Package Name
- **Status:** VERIFIED ✓
- **Package:** `com.anonymous.flyrclone`
- **Matches:** IAP service configuration ✓

### ✅ 5. Version Information
- **Status:** INCREMENTED ✓
- **versionCode:** 2 (was 1)
- **versionName:** "1.0.1"

### ✅ 6. Release Signing Configuration
- **Status:** CONFIGURED ✓
- **Method:** keystore.properties file
- **Keystore:** `android/app/flyr-release.keystore`
- **Fallback:** Debug keystore (for development)

### ✅ 7. Security
- **Status:** PROTECTED ✓
- **Gitignore:** Keystore files excluded
- **Files protected:**
  - `*.keystore`
  - `*.jks`
  - `keystore.properties`

---

## 🔐 REQUIRED: Generate Production Keystore

**You must complete this step before building the AAB.**

### Command to Generate Keystore:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore flyr-release.keystore -alias flyr-release-key -keyalg RSA -keysize 2048 -validity 10000
```

### Prompts You'll See:
1. **Enter keystore password:** [Choose strong password - SAVE IT!]
2. **Re-enter new password:** [Confirm password]
3. **What is your first and last name?** [Your name or company]
4. **What is the name of your organizational unit?** [Your team/dept]
5. **What is the name of your organization?** [Your company]
6. **What is the name of your City or Locality?** [Your city]
7. **What is the name of your State or Province?** [Your state]
8. **What is the two-letter country code?** [IN for India]
9. **Is CN=... correct?** [yes]
10. **Enter key password:** [Same as keystore password or different]

### Create keystore.properties File:

**File:** `android/keystore.properties`

```properties
storePassword=YOUR_KEYSTORE_PASSWORD_HERE
keyPassword=YOUR_KEY_PASSWORD_HERE
keyAlias=flyr-release-key
storeFile=app/flyr-release.keystore
```

**Replace the placeholder passwords with your actual passwords!**

---

## 🚀 Build Commands (Run After Keystore Setup)

### Step 1: Clean Gradle Cache
```bash
cd android
./gradlew clean
```

### Step 2: Generate Signed AAB
```bash
./gradlew bundleRelease
```

### Expected Output:
```
BUILD SUCCESSFUL in Xs
```

### AAB Location:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📤 Upload to Google Play Console

1. **Login:** https://play.google.com/console
2. **Select App:** flyr-clone
3. **Navigate:** Production → Create new release
4. **Upload:** `app-release.aab`
5. **Version:** Will show as versionCode 2 (1.0.1)
6. **Review:** Check all details
7. **Release:** Roll out to production

---

## ⚠️ CRITICAL WARNINGS

### 🔴 Keystore Security
- **NEVER** commit keystore files to git
- **BACKUP** keystore immediately after creation
- **STORE** passwords in secure password manager
- **LOSE THIS = CANNOT UPDATE APP EVER**

### 🔴 First Upload Requirements
Before creating in-app products in Play Console:
1. ✅ Upload signed AAB with BILLING permission
2. ✅ AAB must be in Internal Testing or higher
3. ✅ Wait for Google Play to process the AAB
4. ✅ Then create in-app products

---

## 📊 Build Configuration Summary

| Item | Value | Status |
|------|-------|--------|
| Package Name | com.anonymous.flyrclone | ✅ |
| versionCode | 2 | ✅ |
| versionName | 1.0.1 | ✅ |
| minSdkVersion | 21 | ✅ |
| targetSdkVersion | 34 | ✅ |
| BILLING Permission | Added | ✅ |
| react-native-iap | 14.7.12 | ✅ |
| Release Signing | Configured | ⚠️ Need keystore |

---

## 🎯 Next Steps

1. **Generate keystore** using the keytool command above
2. **Create** `android/keystore.properties` with your passwords
3. **Backup** keystore file to secure location
4. **Run** clean and build commands
5. **Upload** AAB to Google Play Console
6. **Wait** for processing (can take hours)
7. **Create** in-app products in Play Console
8. **Test** with test accounts

---

## 🐛 Troubleshooting

### Error: "Keystore file not found"
- Ensure `flyr-release.keystore` is in `android/app/` directory
- Check `keystore.properties` has correct path: `app/flyr-release.keystore`

### Error: "Incorrect keystore password"
- Verify passwords in `keystore.properties` match what you entered during generation
- No quotes needed around passwords in properties file

### Error: "BILLING permission not found"
- Already fixed! Permission added to AndroidManifest.xml

### Build fails with ProGuard errors
- Check `android/app/proguard-rules.pro` for any custom rules
- May need to add keep rules for react-native-iap

---

## ✅ Configuration Complete

All build prerequisites are configured and ready. 

**Action Required:** Generate the production keystore, then run the build commands.

See `RELEASE_BUILD_SETUP.md` for detailed keystore generation instructions.
