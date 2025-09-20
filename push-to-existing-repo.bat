@echo off
echo ========================================
echo  Push to Existing GitHub Repository
echo ========================================

REM Get the existing repository URL
set /p repo_url="Enter your existing GitHub repository URL (e.g., https://github.com/username/repo-name.git): "

if "%repo_url%"=="" (
    echo Error: Repository URL is required!
    pause
    exit /b 1
)

echo.
echo Initializing Git repository...
REM Initialize git if not already done
if not exist ".git" (
    git init
    git branch -M main
)

echo.
echo Adding all files...
git add .

echo.
echo Committing changes...
git commit -m "feat: complete Blue Carbon Registry system for SIH 2025

🌊 Complete blockchain-based Blue Carbon Registry system:

COMPONENTS:
✅ React Native Mobile App (BlueCarbonApp/)
✅ NCCR Web Portal (NCCRPortal/) 
✅ Hyperledger Fabric Blockchain (fabric-samples/)
✅ Standalone Blockchain Simulator

FEATURES:
🌱 Mangrove restoration project management
📊 Real-time analytics and carbon credit tracking
⛓️ Immutable blockchain data storage
💰 Carbon credit minting and trading
🔐 Secure authentication system
📱 Cross-platform mobile application
🌐 Government portal integration
🔄 Offline-first architecture

TECHNICAL STACK:
- React Native 0.72.6 with TypeScript
- React 18 with Material-UI
- Hyperledger Fabric 2.4
- Node.js blockchain simulator
- Docker deployment support

FIXES INCLUDED:
✅ All React Native debugging issues resolved
✅ TypeScript errors fixed
✅ Docker networking issues bypassed
✅ Production-ready startup scripts
✅ Comprehensive error handling
✅ CI/CD workflows configured

Ready for Smart India Hackathon 2025 deployment!"

echo.
echo Setting up remote repository...
REM Remove existing origin if any
git remote remove origin 2>nul

REM Add the new remote
git remote add origin %repo_url%

echo.
echo Fetching existing repository...
git fetch origin

echo.
echo Checking if main branch exists on remote...
git ls-remote --heads origin main >nul 2>&1
if %errorlevel% equ 0 (
    echo Main branch exists on remote. Merging...
    git pull origin main --allow-unrelated-histories
    if %errorlevel% neq 0 (
        echo.
        echo Merge conflicts detected. Resolving by keeping our version...
        git checkout --ours .
        git add .
        git commit -m "resolve: merge conflicts - keeping local Blue Carbon Registry version"
    )
) else (
    echo Main branch doesn't exist on remote. Creating new branch...
)

echo.
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
    echo Repository now contains:
    echo ✅ Complete Blue Carbon Registry system
    echo ✅ Mobile App (React Native)
    echo ✅ NCCR Portal (React Web)
    echo ✅ Blockchain Implementation
    echo ✅ Documentation and CI/CD
    echo ✅ Production deployment scripts
    echo.
    echo Next steps:
    echo 1. Check the repository on GitHub
    echo 2. Enable GitHub Actions if needed
    echo 3. Set up GitHub Pages for the portal
    echo 4. Review and merge any conflicts
    echo.
) else (
    echo.
    echo ========================================
    echo  ❌ Error pushing to GitHub
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify you have push access to the repository
    echo 3. Check if the repository URL is correct
    echo 4. Try authenticating with GitHub CLI: gh auth login
    echo.
    echo Manual commands you can try:
    echo git remote -v
    echo git status
    echo git push --force-with-lease origin main
    echo.
)

pause
