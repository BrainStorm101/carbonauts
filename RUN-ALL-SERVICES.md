# 🚀 Blue Carbon Registry - Complete System Startup Guide

## 📋 Quick Start (Recommended)

### For Windows Users:
```bash
# Double-click or run in Command Prompt
start-all-services.bat
```

### For Linux/macOS Users:
```bash
# Make executable and run
chmod +x start-all-services.sh
./start-all-services.sh
```

### Using Docker (All Platforms):
```bash
# Start all services with Docker Compose
docker-compose up -d

# Monitor services
node monitor-services.js
```

---

## 🎯 What Gets Started

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **NCCR Portal** | http://localhost:3000 | 3000 | Government web portal |
| **Mobile App** | Device/Emulator | - | React Native mobile app |
| **Blockchain** | localhost:7051 | 7051 | Hyperledger Fabric network |
| **API Gateway** | http://localhost:8080 | 8080 | REST API for mobile app |
| **CouchDB** | http://localhost:5984 | 5984 | Blockchain state database |

---

## 🔐 Demo Credentials

### NCCR Portal Login:
- **Admin**: admin@nccr.gov.in / admin123
- **Verifier**: verifier@nccr.gov.in / verify123

### Mobile App Login:
- **Email**: demo@bluecarbon.com
- **Password**: password123

---

## 📱 Step-by-Step Manual Setup

### 1. Prerequisites Check
```bash
# Check Node.js (required: 16.x or 18.x)
node --version

# Check Docker (required for blockchain)
docker --version

# Check Android SDK (for mobile app)
adb devices
```

### 2. Start Blockchain Network
```bash
cd fabric-samples/test-network

# Clean any existing network
./network.sh down

# Start new network with CA
./network.sh up createChannel -ca

# Deploy Blue Carbon chaincode
./deploy-bluecarbon.sh
```

### 3. Start NCCR Portal
```bash
cd NCCRPortal

# Install dependencies (first time only)
npm install

# Start development server
npm start
```
Portal will be available at: http://localhost:3000

### 4. Start Mobile App
```bash
cd BlueCarbonApp

# Install dependencies (first time only)
npm install

# Start Metro bundler
npx react-native start --reset-cache

# In another terminal, run Android app
npx react-native run-android
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ "Port already in use" Error
```bash
# Kill processes on specific ports
npx kill-port 3000 8081 7051 8080

# Or kill all Node processes
taskkill /f /im node.exe  # Windows
killall node              # Linux/macOS
```

#### ❌ Blockchain Network Won't Start
```bash
cd fabric-samples/test-network

# Complete cleanup
./network.sh down
docker system prune -a -f

# Restart fresh
./network.sh up createChannel -ca
```

#### ❌ Mobile App Build Errors
```bash
cd BlueCarbonApp

# Clear all caches
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..

# Restart Metro bundler
npx react-native start
```

#### ❌ NCCR Portal Won't Load
```bash
cd NCCRPortal

# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Service Monitoring

### Real-time Monitor
```bash
# Start the monitoring dashboard
node monitor-services.js
```

### Manual Health Checks
```bash
# Check NCCR Portal
curl http://localhost:3000

# Check API Gateway
curl http://localhost:8080/health

# Check blockchain containers
docker ps | grep hyperledger

# Check CouchDB
curl http://localhost:5984
```

---

## 🔄 Service Management

### Start Individual Services

#### Blockchain Only:
```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca
./deploy-bluecarbon.sh
```

#### NCCR Portal Only:
```bash
cd NCCRPortal
npm start
```

#### Mobile App Only:
```bash
cd BlueCarbonApp
npx react-native start --reset-cache &
npx react-native run-android
```

### Stop All Services

#### Manual Stop:
```bash
# Stop blockchain
cd fabric-samples/test-network
./network.sh down

# Stop Node processes
npx kill-port 3000 8081 8080
```

#### Docker Stop:
```bash
docker-compose down
```

---

## 🧪 Testing the Complete System

### 1. Test Blockchain
```bash
cd fabric-samples/test-network
node simple-bluecarbon-demo.js
```
Expected: ✅ All blockchain functions working

### 2. Test NCCR Portal
1. Open http://localhost:3000
2. Login with admin@nccr.gov.in / admin123
3. Navigate through all sections
4. Create a test project

### 3. Test Mobile App
1. Open app on device/emulator
2. Login with demo@bluecarbon.com / password123
3. Create a new project
4. Submit field data
5. Check wallet balance

### 4. Test Integration
1. Create project in mobile app
2. Check if it appears in NCCR portal
3. Verify blockchain transaction
4. Confirm data sync across all platforms

---

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
export NODE_ENV=production
export BLOCKCHAIN_NETWORK=production
export API_BASE_URL=https://your-domain.com/api
```

### Build Production Versions
```bash
# Build NCCR Portal
cd NCCRPortal
npm run build

# Build Mobile App APK
cd BlueCarbonApp/android
./gradlew assembleRelease
```

### Deploy with Docker
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support & Resources

### Documentation
- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [React Native Docs](https://reactnative.dev/)
- [Material-UI Docs](https://mui.com/)

### Community Support
- GitHub Issues: Create issues in the repository
- Stack Overflow: Use tags `hyperledger-fabric`, `react-native`

### Professional Support
- Email: support@bluecarbon.org
- Documentation: https://docs.bluecarbon.org

---

## ✅ Success Checklist

- [ ] Blockchain network is running (docker ps shows hyperledger containers)
- [ ] NCCR Portal loads at http://localhost:3000
- [ ] Mobile app installs and runs on device/emulator
- [ ] Can login to both portal and mobile app
- [ ] Can create projects in mobile app
- [ ] Projects sync to NCCR portal
- [ ] Blockchain transactions are recorded
- [ ] All services show "running" in monitor

---

**🎉 Congratulations! Your complete Blue Carbon Registry system is now running!**

Access your services:
- **NCCR Portal**: http://localhost:3000
- **Mobile App**: On your connected device
- **Service Monitor**: `node monitor-services.js`
