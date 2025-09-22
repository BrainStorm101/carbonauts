# Firebase Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Authentication with phone number verification for the Blue Carbon Registry React Native app, as referenced in the [Firebase Phone Auth documentation](https://firebase.google.com/docs/auth/android/phone-auth).

## 🔥 Firebase Project Configuration

### 1. **Firebase Console Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/u/1/project/carbonauts-4f92b/overview)
2. Select your project: `carbonauts-4f92b`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Phone** authentication
5. Add your app's SHA-1 fingerprint for Android

### 2. **Get SHA-1 Fingerprint**
```bash
# For debug keystore
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore (when ready for production)
keytool -list -v -keystore android/app/release.keystore -alias your-key-alias
```

### 3. **Download Configuration Files**
1. In Firebase Console, go to **Project Settings** → **General**
2. Under "Your apps", click **Add app** → **Android**
3. Enter package name: `com.bluecarbon.app`
4. Download `google-services.json`
5. Replace the placeholder file in `android/app/google-services.json`

## 📱 Android Configuration

### 1. **Build.gradle Updates**
✅ **Already configured:**
- Added Google Services plugin to `android/build.gradle`
- Applied plugin to `android/app/build.gradle`
- Added Firebase dependencies

### 2. **Permissions**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

### 3. **ProGuard Rules**
Add to `android/app/proguard-rules.pro`:
```proguard
# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
```

## 🚀 React Native Configuration

### 1. **Dependencies Installed**
```json
{
  "@react-native-firebase/app": "^18.x.x",
  "@react-native-firebase/auth": "^18.x.x"
}
```

### 2. **Auto-linking**
Firebase React Native uses auto-linking, so no manual configuration needed.

### 3. **iOS Configuration** (if needed)
For iOS, add to `ios/Podfile`:
```ruby
pod 'Firebase/Auth'
```

## 🔧 Code Implementation

### 1. **Firebase Auth Context** (`src/context/FirebaseAuthContext.tsx`)
- Handles Firebase authentication state
- Manages phone number verification
- Provides user profile management
- Includes proper error handling

### 2. **Firebase Login Screen** (`src/screens/auth/FirebaseLoginScreen.tsx`)
- Phone number input with validation
- OTP verification interface
- Resend functionality with countdown
- Real-time error feedback

### 3. **App Integration** (`App.tsx`)
- Uses `FirebaseAuthProvider` instead of custom auth
- Handles authentication state changes
- Shows loading states during initialization

## 🧪 Testing

### 1. **Test Phone Numbers**
For testing, use these Firebase test phone numbers:
- `+1 650-555-3434` (US)
- `+44 7700 900000` (UK)
- `+91 9876543210` (India)

### 2. **Test OTP Codes**
Firebase provides test OTP codes for development:
- `123456` (for any test phone number)
- `000000` (for invalid OTP testing)

### 3. **Enable Test Mode**
In Firebase Console:
1. Go to **Authentication** → **Settings**
2. Under "Phone numbers for testing", add test numbers
3. Set verification codes for each number

## 🔒 Security Features

### 1. **Phone Number Validation**
- International format support
- Length validation (10-15 digits)
- Format checking

### 2. **OTP Security**
- 6-digit numeric codes
- 5-minute expiry
- Rate limiting (handled by Firebase)
- Automatic cleanup

### 3. **User Session Management**
- Automatic session persistence
- Secure token storage
- Logout functionality

## 📋 Usage Instructions

### 1. **Login Flow**
1. Enter valid phone number (e.g., `+1234567890`)
2. Tap "Send OTP"
3. Wait for SMS (or use test OTP: `123456`)
4. Enter 6-digit OTP
5. Tap "Verify & Login"

### 2. **Error Handling**
- Invalid phone number format
- Network connectivity issues
- Invalid OTP codes
- Expired OTP codes
- Rate limiting

### 3. **User Profile**
- Automatic profile creation on first login
- Persistent storage in AsyncStorage
- Role-based access control

## 🚨 Important Notes

### 1. **Production Setup**
- Replace test `google-services.json` with real one
- Add proper SHA-1 fingerprints
- Configure production phone numbers
- Remove test OTP codes

### 2. **Rate Limiting**
Firebase has built-in rate limiting:
- 5 OTP requests per phone number per hour
- 10 OTP requests per IP per hour
- 50 OTP requests per project per day

### 3. **Costs**
- Firebase Auth is free for most use cases
- SMS costs apply for production (varies by country)
- Consider implementing rate limiting for cost control

## 🔧 Troubleshooting

### Common Issues:

1. **"No verification ID found"**
   - Ensure OTP was sent before verification
   - Check network connectivity

2. **"Invalid phone number"**
   - Use international format (+country code)
   - Ensure phone number is valid

3. **"OTP verification failed"**
   - Check OTP format (6 digits)
   - Ensure OTP hasn't expired
   - Verify correct phone number

4. **Build errors**
   - Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
   - Check Firebase configuration files

### Debug Mode:
Enable debug logging by checking console output:
- OTP sending: `📱 Sending OTP to {phone}`
- Verification: `🔐 Verifying OTP: {otp}`
- Success: `✅ OTP verification successful`

## 📚 References

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/android/phone-auth)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/u/1/project/carbonauts-4f92b/overview)

## ✅ Next Steps

1. **Configure Firebase Console** with real project settings
2. **Add SHA-1 fingerprints** for your signing keys
3. **Test with real phone numbers** in development
4. **Deploy to production** with proper configuration
5. **Monitor usage** and costs in Firebase Console

The Firebase authentication system is now fully integrated and ready for use! 🎉
