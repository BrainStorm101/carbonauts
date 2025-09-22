# Java Version Fix Guide

## 🚨 Problem
React Native Firebase requires JVM version 17 or higher, but you're currently using JVM version 11.

**Error Message:**
```
ERROR: React Native Firebase builds with a minimum JVM version 17. We test with JVM 17 and 21.
Incompatible major version detected: '11'
```

## ✅ Solution

### **Option 1: Use the Provided Scripts (Recommended)**

I've created two scripts to automatically set up Java 17 and run your app:

#### **Windows Batch File:**
```bash
# Run this in your terminal
.\run-with-java17.bat
```

#### **PowerShell Script:**
```powershell
# Run this in PowerShell
.\run-with-java17.ps1
```

### **Option 2: Manual Setup**

#### **Step 1: Set Environment Variables**
```powershell
# Set JAVA_HOME to Java 17
$env:JAVA_HOME = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1"

# Add Java 17 to PATH
$env:PATH = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1\bin;" + $env:PATH
```

#### **Step 2: Verify Java Version**
```powershell
java -version
# Should show: openjdk version "17.0.3"
```

#### **Step 3: Run the App**
```bash
npx react-native run-android
```

### **Option 3: Permanent System Setup**

#### **Set JAVA_HOME Permanently:**
1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Add new system variable:
   - **Variable name:** `JAVA_HOME`
   - **Variable value:** `C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1`
3. Edit **PATH** variable and add:
   - `C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1\bin`
4. **Restart** your terminal/command prompt

## 🔧 Alternative Solutions

### **Option A: Use Android Studio's Java**
If you have Android Studio installed:
```powershell
# Find Android Studio's Java
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "C:\Program Files\Android\Android Studio\jbr\bin;" + $env:PATH
```

### **Option B: Install Different Java Version**
```bash
# Install OpenJDK 17 via Chocolatey
choco install openjdk17

# Or via Scoop
scoop install openjdk17
```

## 🧪 Testing

### **Verify the Fix:**
1. Run: `java -version`
2. Should show: `openjdk version "17.0.3"` or higher
3. Run: `npx react-native run-android`
4. Should build successfully without Java version errors

### **Expected Output:**
```
✅ Java 17 detected
✅ Firebase dependencies loading
✅ Android build starting
✅ App launching on emulator/device
```

## 🚀 Quick Start

**Just run this command:**
```bash
.\run-with-java17.bat
```

This will:
1. ✅ Set Java 17 environment
2. ✅ Verify Java version
3. ✅ Build and run your React Native app
4. ✅ Launch Firebase authentication

## 📋 Troubleshooting

### **If scripts don't work:**
1. **Check Java 17 installation:**
   ```powershell
   Test-Path "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1\bin\java.exe"
   ```

2. **Manual environment setup:**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1"
   $env:PATH = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1\bin;" + $env:PATH
   java -version
   npx react-native run-android
   ```

3. **Clean and rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

### **If you still get Java 11:**
- Restart your terminal/command prompt
- Check if JAVA_HOME is set correctly
- Verify PATH includes Java 17 bin directory

## 🎯 Next Steps

Once the Java version issue is resolved:

1. **Test Firebase Authentication:**
   - Enter phone number: `+1 650-555-3434`
   - Use test OTP: `123456`

2. **Configure Real Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/u/1/project/carbonauts-4f92b/overview)
   - Enable Phone Authentication
   - Add your SHA-1 fingerprint

3. **Production Setup:**
   - Replace test `google-services.json`
   - Add real phone numbers for testing

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ No Java version errors
- ✅ Firebase dependencies loading
- ✅ Android build completing
- ✅ App launching successfully
- ✅ Login screen with Firebase authentication

The Java 17 setup is now complete and your Firebase authentication should work perfectly! 🎉

