# Build React Native app with Java 17
Write-Host "Setting up Java 17 environment for build..." -ForegroundColor Green

# Set Java 17 path
$env:JAVA_HOME = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Java version being used:" -ForegroundColor Yellow
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "`nStopping existing Gradle daemons..." -ForegroundColor Yellow
Set-Location "android"
./gradlew --stop

Write-Host "`nCleaning Gradle cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\daemon" -ErrorAction SilentlyContinue

Write-Host "`nCleaning project..." -ForegroundColor Yellow
./gradlew clean

Write-Host "`nBuilding project with Java 17 compatibility..." -ForegroundColor Yellow
./gradlew assembleDebug --info

Write-Host "`nBuild completed!" -ForegroundColor Green
