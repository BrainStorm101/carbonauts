@echo off
echo "=== BlueCarbonApp Build Fix Script ==="
echo.

echo "Step 1: Cleaning previous builds..."
cd android
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
if exist .gradle rmdir /s /q .gradle
cd ..

echo "Step 2: Checking React Native Doctor..."
npx react-native doctor

echo "Step 3: Installing/updating dependencies..."
npm install

echo "Step 4: Cleaning React Native cache..."
npx react-native start --reset-cache &
timeout /t 3
taskkill /f /im node.exe 2>nul

echo "Step 5: Building Android app..."
cd android
gradlew.bat clean
gradlew.bat assembleDebug

echo "Build script completed!"
pause
