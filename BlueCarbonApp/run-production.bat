@echo off
echo ========================================
echo  Blue Carbon App - Production Mode
echo ========================================

REM Kill any existing processes
echo Cleaning up existing processes...
npx kill-port 8081 2>nul
taskkill /f /im node.exe 2>nul

REM Set environment to production
set NODE_ENV=production
set REACT_NATIVE_PACKAGER_HOSTNAME=localhost

REM Clear all caches
echo Clearing all caches...
npx react-native start --reset-cache --no-interactive &

REM Wait for Metro to start
echo Waiting for Metro bundler...
timeout /t 8 /nobreak >nul

REM Build release version
echo Building release version...
cd android
gradlew.bat assembleRelease
cd ..

REM Install release APK
echo Installing release APK...
adb install android\app\build\outputs\apk\release\app-release.apk

echo.
echo ========================================
echo  Production app installed successfully!
echo ========================================
echo.
echo The app is now running in production mode
echo without any debugging connections.
echo.
pause
