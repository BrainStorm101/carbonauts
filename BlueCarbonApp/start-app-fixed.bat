@echo off
echo ========================================
echo  Blue Carbon App - Fixed Startup
echo ========================================

REM Kill any existing Metro processes
echo Cleaning up existing processes...
npx kill-port 8081 2>nul
taskkill /f /im node.exe 2>nul

REM Clear React Native cache
echo Clearing caches...
npx react-native start --reset-cache --no-interactive &

REM Wait for Metro to start
echo Waiting for Metro bundler to start...
timeout /t 10 /nobreak >nul

REM Build and run the app without debugging
echo Building and running app...
npx react-native run-android --no-packager

echo.
echo ========================================
echo  App should be running on emulator!
echo ========================================
echo.
echo If you see errors:
echo 1. Shake the device/emulator
echo 2. Tap "Settings"
echo 3. Turn OFF "JS Dev Mode"
echo 4. Turn OFF "Remote JS Debugging"
echo 5. Reload the app
echo.
pause
