# Release Build Setup for Google Play

## 🔐 Step 1: Generate Production Keystore

You need to generate a production keystore **ONCE** and keep it secure forever. If you lose this keystore, you cannot update your app on Google Play.

### Generate Keystore Command:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore flyr-release.keystore -alias flyr-release-key -keyalg RSA -keysize 2048 -validity 10000
```

### You will be prompted for:
- **Keystore password:** Choose a strong password (remember it!)
- **Key password:** Choose a strong password (can be same as keystore password)
- **First and Last Name:** Your name or company name
- **Organizational Unit:** Your team/department
- **Organization:** Your company name
- **City/Locality:** Your city
- **State/Province:** Your state
- **Country Code:** Two-letter country code (e.g., IN for India)

### ⚠️ CRITICAL: Backup Your Keystore
After generation, **immediately backup** these files:
- `android/app/flyr-release.keystore`
- Store the passwords in a secure password manager

**If you lose this keystore, you will NEVER be able to update your app on Google Play!**

---

## 📝 Step 2: Create Keystore Properties File

After generating the keystore, create this file with your actual passwords:

**File:** `android/keystore.properties`

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=flyr-release-key
storeFile=app/flyr-release.keystore
```

**Replace:**
- `YOUR_KEYSTORE_PASSWORD` with your actual keystore password
- `YOUR_KEY_PASSWORD` with your actual key password

---

## ✅ Step 3: Verify Configuration

After creating the keystore and properties file, I will:
1. Update `build.gradle` to use the release keystore
2. Increment `versionCode` to 2
3. Clean gradle cache
4. Build the signed AAB

---

## 🚀 Step 4: Build Commands (I will run these)

```bash
# Clean gradle cache
cd android
./gradlew clean

# Generate signed AAB
./gradlew bundleRelease
```

Output will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📤 Step 5: Upload to Google Play Console

1. Go to Google Play Console
2. Select your app
3. Navigate to **Production** → **Create new release**
4. Upload `app-release.aab`
5. Complete release notes
6. Review and roll out

---

## 🔒 Security Notes

- ✅ `keystore.properties` is already in `.gitignore`
- ✅ Never commit keystore files to git
- ✅ Store keystore backup in secure location
- ✅ Use password manager for passwords

---

## ⚠️ IMPORTANT: First Time Setup

**Please run the keytool command above NOW to generate your keystore.**

Once you've created:
1. `android/app/flyr-release.keystore`
2. `android/keystore.properties`

Let me know, and I'll proceed with the build configuration and AAB generation.
