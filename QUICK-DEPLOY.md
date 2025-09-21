# 🚀 QUICK DEPLOYMENT - Blue Carbon Registry

## 🌐 **EASIEST DEPLOYMENT OPTIONS (No CLI Required)**

### **Option 1: Railway Web Deployment (RECOMMENDED)**

1. **Go to Railway**: https://railway.app/new
2. **Connect GitHub**: Click "Deploy from GitHub repo"
3. **Select Repository**: Choose `SIH25038---Carbonauts`
4. **Deploy Services**:
   - **Service 1**: Blockchain API
     - Root Directory: `fabric-samples/test-network`
     - Start Command: `node standalone-blockchain-simulator.js`
     - Port: `7051`
   - **Service 2**: NCCR Portal
     - Root Directory: `NCCRPortal`
     - Build Command: `npm run build`
     - Start Command: `npx serve -s build -l 3000`
     - Port: `3000`

5. **Get URLs**: Railway will provide live URLs
6. **Done!** ✅ Your system is live

### **Option 2: Vercel Web Deployment**

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**: Select your GitHub repo
3. **Configure Project**:
   - Framework Preset: `Create React App`
   - Root Directory: `NCCRPortal`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Deploy**: Click Deploy button
5. **Done!** ✅ Portal is live

### **Option 3: Netlify Deployment**

1. **Go to Netlify**: https://app.netlify.com/start
2. **Connect to Git**: Choose GitHub
3. **Select Repository**: `SIH25038---Carbonauts`
4. **Build Settings**:
   - Base Directory: `NCCRPortal`
   - Build Command: `npm run build`
   - Publish Directory: `NCCRPortal/build`
5. **Deploy**: Click Deploy site
6. **Done!** ✅ Portal is live

## 📱 **MOBILE APP DEPLOYMENT**

### **APK Download (Ready to Use)**
Your mobile app APK will be automatically built and available at:
- GitHub Releases: https://github.com/yourusername/SIH25038---Carbonauts/releases
- Direct download link for users

## 🔧 **MANUAL CLI DEPLOYMENT (If Needed)**

### **Fix Railway CLI Issue**
```bash
# Use npx instead of global install
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

### **Alternative: Use Yarn**
```bash
# Install with yarn
yarn global add @railway/cli
railway login
```

### **Vercel CLI**
```bash
# Install and deploy
npm install -g vercel
cd NCCRPortal
vercel --prod
```

## 🌐 **EXPECTED LIVE URLS**

After deployment, you'll get URLs like:
- **Railway Portal**: `https://nccr-portal-production.up.railway.app`
- **Railway API**: `https://blockchain-api-production.up.railway.app`
- **Vercel Portal**: `https://sih25038-carbonauts.vercel.app`
- **Netlify Portal**: `https://blue-carbon-registry.netlify.app`

## 🔐 **DEMO CREDENTIALS**

Share these with users:
- **Portal**: admin@nccr.gov.in / admin123
- **Mobile**: demo@bluecarbon.com / password123

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Portal deployed and accessible
- [ ] API deployed and responding
- [ ] Mobile APK available for download
- [ ] Demo credentials working
- [ ] URLs shared with stakeholders

## 🆘 **TROUBLESHOOTING**

**Railway CLI not found:**
- Use `npx @railway/cli` instead of `railway`
- Or deploy via Railway web interface

**Build errors:**
- Check build logs in deployment platform
- Ensure all dependencies are in package.json

**API connection issues:**
- Update API URLs in portal configuration
- Check CORS settings

---

**🏆 Choose any option above to make your Blue Carbon Registry live for SIH 2025!**
