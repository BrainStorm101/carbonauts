@echo off
echo ========================================
echo  Blue Carbon App - No Debug Mode
echo ========================================

REM Kill any existing processes
echo Cleaning up...
npx kill-port 8081 2>nul
taskkill /f /im node.exe 2>nul

REM Start Metro without debugging
echo Starting Metro bundler (no debug)...
start "Metro" cmd /k "npx react-native start --reset-cache --no-interactive"

REM Wait for Metro
timeout /t 10 /nobreak >nul

REM Run app with specific flags to disable debugging
echo Running app without debugging...
npx react-native run-android --no-packager --variant=debug

echo.
echo ========================================
echo  App started without debugging!
echo ========================================
echo.
echo If you still see errors:
echo 1. Open the app on emulator
echo 2. Shake the device (Ctrl+M)
echo 3. Tap "Settings"
echo 4. Disable "JS Dev Mode"
echo 5. Disable "Remote JS Debugging"
echo 6. Tap "Reload"
echo.
pause
