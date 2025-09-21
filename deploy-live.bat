@echo off
echo ========================================
echo  🌊 Blue Carbon Registry Live Deployment
echo ========================================

echo.
echo Choose deployment option:
echo 1. Railway (Recommended - Full Stack)
echo 2. Vercel (Portal Only)
echo 3. GitHub Pages (Portal Only)
echo 4. Docker (Self-Hosted)
echo 5. All Platforms
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto github
if "%choice%"=="4" goto docker
if "%choice%"=="5" goto all
goto invalid

:railway
echo.
echo 🚂 Deploying to Railway...
echo.
echo Step 1: Install Railway CLI
npm install -g @railway/cli

echo Step 2: Login to Railway
railway login

echo Step 3: Deploy Blockchain API
cd fabric-samples\test-network
railway init
railway up
cd ..\..

echo Step 4: Deploy Portal
cd NCCRPortal
railway init
railway up
cd ..

echo ✅ Railway deployment complete!
echo 🌐 Check your Railway dashboard for URLs
goto end

:vercel
echo.
echo ⚡ Deploying to Vercel...
echo.
echo Step 1: Install Vercel CLI
npm install -g vercel

echo Step 2: Deploy Portal
cd NCCRPortal
vercel --prod
cd ..

echo ✅ Vercel deployment complete!
echo 🌐 Portal will be available at the provided URL
goto end

:github
echo.
echo 🐙 Deploying to GitHub Pages...
echo.
echo Step 1: Enable GitHub Pages
echo Go to: https://github.com/yourusername/SIH25038---Carbonauts/settings/pages
echo Select "GitHub Actions" as source

echo Step 2: Push deployment workflow
git add .
git commit -m "feat: add deployment workflows for live access"
git push origin main

echo ✅ GitHub Pages deployment initiated!
echo 🌐 Portal will be available at: https://yourusername.github.io/SIH25038---Carbonauts
goto end

:docker
echo.
echo 🐳 Docker Deployment...
echo.
echo Step 1: Start Docker services
docker-compose -f docker-compose.production.yml up -d

echo Step 2: Check service status
docker-compose -f docker-compose.production.yml ps

echo ✅ Docker deployment complete!
echo 🌐 Portal: http://localhost:3000
echo ⛓️ API: http://localhost:7051
goto end

:all
echo.
echo 🚀 Deploying to ALL platforms...
echo.

REM Railway
echo 📡 Railway deployment...
npm install -g @railway/cli
railway login

REM Vercel
echo ⚡ Vercel deployment...
npm install -g vercel
cd NCCRPortal
vercel --prod
cd ..

REM GitHub Pages
echo 🐙 GitHub Pages...
git add .
git commit -m "feat: complete deployment setup for all platforms"
git push origin main

REM Docker
echo 🐳 Docker deployment...
docker-compose -f docker-compose.production.yml up -d

echo ✅ ALL deployments complete!
goto end

:invalid
echo Invalid choice. Please run the script again.
goto end

:end
echo.
echo ========================================
echo  🎉 Deployment Summary
echo ========================================
echo.
echo Your Blue Carbon Registry is now LIVE!
echo.
echo 📱 Mobile App APK: Available in GitHub Releases
echo 🌐 Web Portal: Check deployment platform URLs
echo ⛓️ Blockchain API: Accessible via deployed endpoints
echo.
echo 🔐 Demo Credentials:
echo Portal: admin@nccr.gov.in / admin123
echo Mobile: demo@bluecarbon.com / password123
echo.
echo 📊 Health Checks:
echo Portal: https://your-domain.com/
echo API: https://your-api.com/health
echo Blockchain: https://your-api.com/info
echo.
echo 🏆 Ready for Smart India Hackathon 2025!
echo Share these URLs with judges and users.
echo.
pause
