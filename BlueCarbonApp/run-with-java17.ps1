# PowerShell script to run React Native with Java 17
Write-Host "Setting up Java 17 environment..." -ForegroundColor Green

# Set Java 17 path
$env:JAVA_HOME = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Java version:" -ForegroundColor Yellow
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "`nSetting up ADB port forwarding..." -ForegroundColor Yellow
adb reverse tcp:8081 tcp:8081

Write-Host "`nStarting React Native with Java 17..." -ForegroundColor Green
npx react-native run-android
