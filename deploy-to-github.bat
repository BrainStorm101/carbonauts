@echo off
echo ========================================
echo  Blue Carbon Registry - GitHub Deploy
echo ========================================

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
)

REM Add all files
echo Adding files to Git...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if %errorlevel% neq 0 (
    echo Committing changes...
    git commit -m "feat: complete Blue Carbon Registry system with mobile app, NCCR portal, and blockchain

- ✅ React Native mobile app with offline support
- ✅ NCCR web portal with admin dashboard  
- ✅ Hyperledger Fabric blockchain integration
- ✅ Standalone blockchain simulator
- ✅ Complete debugging fixes for React Native
- ✅ TypeScript support throughout
- ✅ Comprehensive documentation
- ✅ CI/CD workflows
- ✅ Docker deployment support
- ✅ Production-ready startup scripts

Features:
🌱 Mangrove restoration project management
📊 Real-time analytics and reporting
⛓️ Immutable blockchain data storage
💰 Carbon credit minting and trading
🔐 Secure authentication system
📱 Cross-platform mobile application
🌐 Government portal integration
🔄 Offline-first architecture

Ready for Smart India Hackathon 2025!"
) else (
    echo No changes to commit.
)

REM Prompt for GitHub repository URL
echo.
echo ========================================
echo  GitHub Repository Setup
echo ========================================
echo.
echo Please create a new repository on GitHub first:
echo 1. Go to https://github.com/new
echo 2. Repository name: blue-carbon-registry
echo 3. Description: Blockchain-based Blue Carbon Registry for SIH 2025
echo 4. Make it Public
echo 5. Don't initialize with README (we have one)
echo 6. Click "Create repository"
echo.
set /p repo_url="Enter your GitHub repository URL (e.g., https://github.com/username/blue-carbon-registry.git): "

if "%repo_url%"=="" (
    echo Error: Repository URL is required!
    pause
    exit /b 1
)

REM Add remote origin
echo Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin %repo_url%

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  🎉 SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo Your Blue Carbon Registry is now on GitHub:
    echo %repo_url%
    echo.
    echo Next steps:
    echo 1. Enable GitHub Pages in repository settings
    echo 2. Set up GitHub Actions for CI/CD
    echo 3. Add collaborators to the repository
    echo 4. Create issues for future enhancements
    echo.
    echo Repository features:
    echo ✅ Complete source code
    echo ✅ Comprehensive README
    echo ✅ CI/CD workflows  
    echo ✅ Contributing guidelines
    echo ✅ MIT License
    echo ✅ Issue templates
    echo.
) else (
    echo.
    echo ========================================
    echo  ❌ Error pushing to GitHub
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify the repository URL is correct
    echo 3. Make sure you have push access to the repository
    echo 4. Try: git push --set-upstream origin main
    echo.
)

pause
