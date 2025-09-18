# React Native Environment Setup Script for Windows
# Run this script before building the app

Write-Host "Setting up React Native environment..." -ForegroundColor Green

# Set Android SDK path
$env:ANDROID_HOME = "D:\Android"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Yellow

# Check if Java is installed and set JAVA_HOME
$javaLocations = @(
    "C:\Program Files\Eclipse Adoptium\jdk-11*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk*",
    "C:\Program Files\OpenJDK\*"
)

$javaFound = $false
foreach ($location in $javaLocations) {
    $javaPath = Get-ChildItem $location -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($javaPath) {
        $env:JAVA_HOME = $javaPath.FullName
        Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow
        $javaFound = $true
        break
    }
}

if (-not $javaFound) {
    Write-Host "❌ Java JDK not found! Please install Java JDK 11 or higher." -ForegroundColor Red
    Write-Host "Download from: https://adoptium.net/temurin/releases/" -ForegroundColor Cyan
    exit 1
}

# Update PATH
$env:PATH = $env:PATH + ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"

# Verify setup
Write-Host "`nVerifying setup..." -ForegroundColor Green

# Check Java
try {
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
    Write-Host "✅ Java: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not working" -ForegroundColor Red
}

# Check Android SDK
if (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe") {
    Write-Host "✅ Android SDK found" -ForegroundColor Green
    $devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices
    Write-Host "Connected devices:" -ForegroundColor Cyan
    $devices | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
}

Write-Host "`n🚀 Environment setup complete! You can now run:" -ForegroundColor Green
Write-Host "   npx react-native run-android" -ForegroundColor Cyan
