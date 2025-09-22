# Install Java 17 for React Native with Firebase
Write-Host "Installing Java 17 (OpenJDK) for React Native development..." -ForegroundColor Green

# Download Java 17 from Microsoft
$jdk17Url = "https://aka.ms/download-jdk/microsoft-jdk-17.0.8-windows-x64.msi"
$downloadPath = "$env:TEMP\microsoft-jdk-17.msi"

Write-Host "Downloading Java 17..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $jdk17Url -OutFile $downloadPath -UseBasicParsing
    Write-Host "Download completed!" -ForegroundColor Green
    
    Write-Host "Installing Java 17... (This may take a few minutes)" -ForegroundColor Yellow
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $downloadPath, "/quiet", "/norestart" -Wait
    
    Write-Host "Java 17 installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal/IDE to use the new Java version." -ForegroundColor Cyan
    
    # Clean up
    Remove-Item $downloadPath -Force
    
} catch {
    Write-Host "Error downloading or installing Java 17: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please download and install Java 17 manually from: https://docs.microsoft.com/en-us/java/openjdk/download" -ForegroundColor Yellow
}

Write-Host "`nAfter installation, you may need to:" -ForegroundColor Cyan
Write-Host "1. Set JAVA_HOME environment variable to the Java 17 path" -ForegroundColor White
Write-Host "2. Update your PATH to include Java 17 bin directory" -ForegroundColor White
Write-Host "3. Restart your terminal and IDE" -ForegroundColor White
