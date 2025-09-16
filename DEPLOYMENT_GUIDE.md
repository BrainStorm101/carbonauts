# Blue Carbon Registry - Complete Deployment Guide

This guide provides comprehensive instructions for deploying the complete Blue Carbon Registry system including the blockchain network, mobile app, and NCCR web portal.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   NCCR Portal   │    │   Blockchain    │
│  (React Native) │◄──►│   (React Web)   │◄──►│ (Hyperledger    │
│                 │    │                 │    │   Fabric)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / macOS 10.15+ / Windows 10+ with WSL2
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 50GB free space
- **Network**: Stable internet connection

### Software Dependencies
- **Node.js**: 16.x or 18.x
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **Python**: 3.8+ (for some build tools)

### For Mobile Development
- **Android Studio**: Latest version
- **Xcode**: 14+ (macOS only)
- **React Native CLI**: `npm install -g @react-native-community/cli`

## Part 1: Blockchain Network Setup

### 1.1 Install Hyperledger Fabric

```bash
# Navigate to project directory
cd fabric-samples

# Install Fabric binaries and Docker images
./install-fabric.sh

# Verify installation
docker images | grep hyperledger
```

### 1.2 Start the Network

#### Option A: Linux/macOS
```bash
cd test-network
./network.sh up createChannel -ca
./deploy-bluecarbon.sh
```

#### Option B: Windows (with WSL2)
```bash
cd test-network
bash start-bluecarbon-windows.sh
bash deploy-bluecarbon-windows.sh
```

### 1.3 Verify Blockchain Network

```bash
# Test the demo
cd ../asset-transfer-events/application-gateway-typescript
npm install
npm run build
npm start

# Or run the simplified demo
node ../../../test-network/simple-bluecarbon-demo.js
```

Expected output:
```
✅ Blue Carbon Demo completed successfully!
✅ All blockchain functions working correctly
```

## Part 2: NCCR Web Portal Deployment

### 2.1 Install Dependencies

```bash
cd NCCRPortal
npm install
```

### 2.2 Environment Configuration

Create `.env` file:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_BLOCKCHAIN_GATEWAY_URL=localhost:7051
REACT_APP_BLOCKCHAIN_CHANNEL_NAME=mychannel
REACT_APP_BLOCKCHAIN_CHAINCODE_NAME=bluecarbon
GENERATE_SOURCEMAP=false
```

### 2.3 Development Server

```bash
# Start development server
npm start

# Portal will be available at http://localhost:3000
```

### 2.4 Production Build

```bash
# Create production build
npm run build

# Serve with static server
npm install -g serve
serve -s build -l 3000
```

### 2.5 Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t nccr-portal .
docker run -p 80:80 nccr-portal
```

## Part 3: Mobile App Deployment

### 3.1 Install Dependencies

```bash
cd BlueCarbonApp
npm install
```

### 3.2 iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3.3 Android Setup

1. Install Android Studio
2. Configure Android SDK
3. Create virtual device or connect physical device

### 3.4 Environment Configuration

Create `.env` file:
```env
BLOCKCHAIN_GATEWAY_URL=localhost:7051
BLOCKCHAIN_CHANNEL_NAME=mychannel
BLOCKCHAIN_CHAINCODE_NAME=bluecarbon
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
```

### 3.5 Development Testing

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### 3.6 Production Builds

#### Android APK
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/
```

#### iOS Archive (macOS only)
```bash
cd ios
xcodebuild -workspace BlueCarbonApp.xcworkspace -scheme BlueCarbonApp -configuration Release archive
```

## Part 4: Complete System Testing

### 4.1 Test Blockchain Network

```bash
cd fabric-samples/test-network
node simple-bluecarbon-demo.js
```

### 4.2 Test NCCR Portal

1. Navigate to http://localhost:3000
2. Login with demo credentials:
   - Admin: admin@nccr.gov.in / admin123
   - Verifier: verifier@nccr.gov.in / verify123
3. Test all major functions:
   - Dashboard overview
   - Project management
   - MRV panel operations
   - Carbon credit management
   - User management
   - Analytics and reporting

### 4.3 Test Mobile App

1. Install app on device/emulator
2. Test user flows:
   - Registration with phone + OTP (use 123456)
   - Role selection and profile setup
   - Project creation with GPS
   - Photo and data upload
   - Submission tracking
   - Wallet management

## Part 5: Production Deployment

### 5.1 Server Setup

#### Minimum Server Specifications
- **CPU**: 4 cores
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **Network**: 100 Mbps

#### Recommended Architecture
```
┌─────────────────┐
│   Load Balancer │
│    (Nginx)      │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼───┐
│ Web   │   │ API   │
│Server │   │Server │
└───────┘   └───────┘
    │           │
    └─────┬─────┘
          │
┌─────────▼─────────┐
│   Blockchain      │
│   Network         │
└───────────────────┘
```

### 5.2 Blockchain Network Production

```bash
# Production network with multiple organizations
cd fabric-samples/test-network

# Generate certificates for production
./network.sh up createChannel -ca -c mychannel -s couchdb

# Deploy chaincode
./deploy-bluecarbon.sh

# Configure for external access
export CORE_PEER_ADDRESS=your-domain.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE=/path/to/tls/ca.crt
```

### 5.3 Web Portal Production

```bash
# Build optimized version
npm run build

# Deploy with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 5.4 Mobile App Distribution

#### Android Play Store
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure app metadata
4. Submit for review

#### iOS App Store
1. Archive in Xcode
2. Upload to App Store Connect
3. Configure app information
4. Submit for review

## Part 6: Monitoring & Maintenance

### 6.1 System Monitoring

```bash
# Install monitoring tools
npm install -g pm2
docker run -d --name prometheus prom/prometheus
docker run -d --name grafana grafana/grafana
```

### 6.2 Log Management

```bash
# Centralized logging with ELK stack
docker run -d --name elasticsearch elasticsearch:7.14.0
docker run -d --name logstash logstash:7.14.0
docker run -d --name kibana kibana:7.14.0
```

### 6.3 Backup Strategy

```bash
# Blockchain data backup
docker exec peer0.org1.example.com tar -czf /tmp/ledger-backup.tar.gz /var/hyperledger/production

# Database backup
pg_dump bluecarbon_db > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/application
```

## Part 7: Security Configuration

### 7.1 SSL/TLS Setup

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7.2 Firewall Configuration

```bash
# UFW firewall rules
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 7051/tcp  # Fabric peer
sudo ufw enable
```

### 7.3 Security Hardening

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Part 8: Troubleshooting

### 8.1 Common Issues

#### Blockchain Network Won't Start
```bash
# Clean up and restart
./network.sh down
docker system prune -a
./network.sh up createChannel -ca
```

#### Mobile App Build Errors
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset iOS build
cd ios && rm -rf build && cd ..
```

#### Web Portal Connection Issues
```bash
# Check service status
pm2 status
pm2 logs

# Restart services
pm2 restart all
```

### 8.2 Performance Optimization

#### Database Optimization
```sql
-- Index optimization
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_submissions_project_id ON submissions(project_id);
CREATE INDEX idx_carbon_credits_owner ON carbon_credits(owner_id);
```

#### Caching Strategy
```bash
# Redis for session storage
docker run -d --name redis redis:alpine
```

## Part 9: Scaling Considerations

### 9.1 Horizontal Scaling

```yaml
# Docker Compose for scaling
version: '3.8'
services:
  web:
    image: nccr-portal
    deploy:
      replicas: 3
  api:
    image: nccr-api
    deploy:
      replicas: 5
  blockchain:
    image: hyperledger/fabric-peer
    deploy:
      replicas: 3
```

### 9.2 Load Balancing

```nginx
# Nginx load balancer config
upstream backend {
    server web1:3000;
    server web2:3000;
    server web3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

## Part 10: Support & Resources

### 10.1 Documentation
- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Material-UI Docs](https://mui.com/getting-started/installation/)

### 10.2 Community Support
- Hyperledger Discord: https://discord.gg/hyperledger
- React Native Community: https://github.com/react-native-community
- Stack Overflow: Use tags `hyperledger-fabric`, `react-native`, `material-ui`

### 10.3 Professional Support
For enterprise deployment and support:
- Email: support@bluecarbon.org
- Documentation: https://docs.bluecarbon.org
- Professional Services: https://bluecarbon.org/services

---

## Quick Start Commands

```bash
# Complete system startup
cd fabric-samples/test-network && bash start-bluecarbon-windows.sh
cd ../../NCCRPortal && npm start
cd ../BlueCarbonApp && npm run android

# Access points
# NCCR Portal: http://localhost:3000
# Mobile App: On connected device/emulator
# Blockchain: localhost:7051
```

This completes the comprehensive deployment guide for the Blue Carbon Registry system.
