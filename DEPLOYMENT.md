# 🚀 Blue Carbon Registry - Deployment Guide

Deploy your complete Blue Carbon Registry system for public access using multiple platforms.

## 🌐 **LIVE DEPLOYMENT OPTIONS**

### **Option 1: One-Click Railway Deployment (RECOMMENDED)**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/blue-carbon-registry)

**What gets deployed:**
- ✅ NCCR Portal (Web Interface)
- ✅ Blockchain API (Backend)
- ✅ Database (MongoDB)
- ✅ Custom Domain Support

**Access URLs:**
- Portal: `https://your-app.railway.app`
- API: `https://your-app.railway.app/api`

### **Option 2: Vercel + Railway (Hybrid)**

**Step 1: Deploy Blockchain API to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Step 2: Deploy Portal to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **Option 3: Docker Deployment (Self-Hosted)**

```bash
# Clone repository
git clone https://github.com/yourusername/SIH25038---Carbonauts.git
cd SIH25038---Carbonauts

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

**Access URLs:**
- Portal: `http://localhost:3000`
- API: `http://localhost:7051`

### **Option 4: GitHub Pages (Portal Only)**

1. Go to repository Settings
2. Navigate to Pages section
3. Select "GitHub Actions" as source
4. Push code to trigger deployment

**Access URL:** `https://yourusername.github.io/SIH25038---Carbonauts`

## 📱 **MOBILE APP DISTRIBUTION**

### **APK Download**
- Automatic builds create APK files
- Download from GitHub Releases
- Install on Android devices

### **Play Store Publishing**
```bash
cd BlueCarbonApp
npx react-native run-android --variant=release
```

## 🔧 **CONFIGURATION FOR DEPLOYMENT**

### **Environment Variables**

**For Railway/Vercel:**
```env
NODE_ENV=production
REACT_APP_BLOCKCHAIN_URL=https://your-blockchain-api.railway.app
MONGODB_URI=mongodb://admin:bluecarbon123@mongodb:27017
PORT=7051
```

**For Docker:**
```env
COMPOSE_PROJECT_NAME=bluecarbon
DOMAIN=bluecarbon-registry.com
SSL_EMAIL=admin@bluecarbon-registry.com
```

## 🌍 **CUSTOM DOMAIN SETUP**

### **Railway Custom Domain**
1. Go to Railway dashboard
2. Select your service
3. Add custom domain
4. Update DNS records

### **Vercel Custom Domain**
1. Go to Vercel dashboard
2. Select project
3. Add domain in Settings
4. Configure DNS

## 📊 **MONITORING & ANALYTICS**

### **Health Checks**
- Portal: `https://your-domain.com/health`
- API: `https://your-api.com/health`
- Blockchain: `https://your-api.com/info`

### **Performance Monitoring**
- Vercel Analytics (automatic)
- Railway Metrics (built-in)
- Custom monitoring with Uptime Robot

## 🔒 **SECURITY CONFIGURATION**

### **SSL/HTTPS**
- Railway: Automatic SSL
- Vercel: Automatic SSL
- Docker: Let's Encrypt with Certbot

### **Environment Security**
```bash
# Generate secure passwords
openssl rand -base64 32

# Set environment variables
export MONGODB_PASSWORD=your-secure-password
export JWT_SECRET=your-jwt-secret
```

## 🚀 **DEPLOYMENT COMMANDS**

### **Quick Deploy Script**
```bash
#!/bin/bash
echo "🚀 Deploying Blue Carbon Registry..."

# Deploy blockchain API
cd fabric-samples/test-network
railway up

# Deploy portal
cd ../../NCCRPortal
vercel --prod

# Build mobile app
cd ../BlueCarbonApp
npx react-native run-android --variant=release

echo "✅ Deployment complete!"
echo "🌐 Portal: https://your-portal.vercel.app"
echo "⛓️ API: https://your-api.railway.app"
echo "📱 APK: ./android/app/build/outputs/apk/release/"
```

## 📋 **POST-DEPLOYMENT CHECKLIST**

- [ ] ✅ Portal loads correctly
- [ ] ✅ API responds to health checks
- [ ] ✅ Database connections working
- [ ] ✅ Mobile app can connect to API
- [ ] ✅ Authentication system functional
- [ ] ✅ Blockchain operations working
- [ ] ✅ SSL certificates active
- [ ] ✅ Custom domains configured
- [ ] ✅ Monitoring setup complete

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

**Portal not loading:**
```bash
# Check build logs
vercel logs
railway logs
```

**API connection errors:**
```bash
# Test API directly
curl https://your-api.railway.app/health
```

**Mobile app connection issues:**
```bash
# Update API URL in mobile app
# File: BlueCarbonApp/src/services/api.ts
const API_BASE_URL = 'https://your-api.railway.app';
```

## 🎯 **DEMO CREDENTIALS**

**NCCR Portal:**
- URL: `https://your-portal.vercel.app`
- Login: `admin@nccr.gov.in`
- Password: `admin123`

**Mobile App:**
- Login: `demo@bluecarbon.com`
- Password: `password123`

**API Access:**
- Health: `https://your-api.railway.app/health`
- Projects: `https://your-api.railway.app/projects`
- Blockchain Info: `https://your-api.railway.app/info`

---

**🌊 Your Blue Carbon Registry is now live and accessible to everyone! 🌱**

Share these URLs with judges, users, and stakeholders for Smart India Hackathon 2025!
