@echo off
echo ========================================
echo  Blue Carbon Registry - Complete Setup
echo ========================================
echo.

REM Set colors for better visibility
color 0A

echo [1/4] Starting Blockchain Network...
echo ========================================
cd fabric-samples\test-network
call network.sh up createChannel -ca
if %errorlevel% neq 0 (
    echo ERROR: Failed to start blockchain network
    pause
    exit /b 1
)

echo.
echo [2/4] Deploying Blue Carbon Chaincode...
echo ========================================
call deploy-bluecarbon.sh
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy chaincode
    pause
    exit /b 1
)

echo.
echo [3/4] Starting NCCR Portal...
echo ========================================
cd ..\..\NCCRPortal
start "NCCR Portal" cmd /k "npm install && npm start"

echo.
echo [4/4] Starting Mobile App...
echo ========================================
cd ..\BlueCarbonApp
start "Metro Bundler" cmd /k "npm install && npx react-native start --reset-cache"

timeout /t 5 /nobreak >nul

start "Android App" cmd /k "npx react-native run-android"

echo.
echo ========================================
echo  All Services Started Successfully!
echo ========================================
echo.
echo Access Points:
echo - NCCR Portal: http://localhost:3000
echo - Mobile App: On connected device/emulator
echo - Blockchain: localhost:7051
echo.
echo Demo Credentials:
echo - Portal Admin: admin@nccr.gov.in / admin123
echo - Mobile App: demo@bluecarbon.com / password123
echo.
echo Press any key to open service monitoring...
pause >nul

REM Open monitoring windows
start "Service Monitor" cmd /k "echo Service Status Monitor && docker ps && echo. && echo Blockchain Network Status: && docker logs peer0.org1.example.com --tail 10"

echo.
echo All services are running!
echo Check the opened windows for service status.
echo.
pause
