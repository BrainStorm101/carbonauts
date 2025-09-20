# 🌊 Blue Carbon Registry System

A comprehensive blockchain-based Blue Carbon Registry system for mangrove restoration and carbon credit management, developed for Smart India Hackathon 2025.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   NCCR Portal   │    │   Blockchain    │
│  (React Native) │◄──►│   (React Web)   │◄──►│ (Hyperledger    │
│   Port: 8081    │    │   Port: 3000    │    │   Fabric)       │
│                 │    │                 │    │   Port: 7051    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Android Studio & Android SDK
- Git
- Docker (optional, for full Hyperledger Fabric)

### 🔧 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/blue-carbon-registry.git
cd blue-carbon-registry
```

2. **Install dependencies:**
```bash
# Install NCCR Portal dependencies
cd NCCRPortal
npm install

# Install Mobile App dependencies
cd ../BlueCarbonApp
npm install

# Install Blockchain dependencies (if using Hyperledger Fabric)
cd ../fabric-samples/test-network
```

### 🚀 Running the System

#### Option 1: One-Click Startup (Windows)
```bash
start-all-services.bat
```

#### Option 2: Manual Startup

**Terminal 1 - Blockchain Simulator:**
```bash
cd fabric-samples/test-network
node standalone-blockchain-simulator.js
```

**Terminal 2 - NCCR Portal:**
```bash
cd NCCRPortal
npm start
```

**Terminal 3 - Mobile App:**
```bash
cd BlueCarbonApp
run-no-debug.bat
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **NCCR Portal** | http://localhost:3000 | admin@nccr.gov.in / admin123 |
| **Mobile App** | Android Emulator | demo@bluecarbon.com / password123 |
| **Blockchain API** | http://localhost:7051 | - |

## 📱 Mobile App Features

- **🔐 Secure Authentication** - Email/password login system
- **🌱 Project Management** - Create and manage mangrove restoration projects
- **📊 Data Collection** - GPS-based data collection with image capture
- **⛓️ Blockchain Integration** - Immutable data storage on blockchain
- **🔄 Offline Support** - Works offline with automatic sync
- **📈 Analytics** - Real-time project analytics and reporting

## 🌐 NCCR Portal Features

- **👥 User Management** - Approve/reject user registrations
- **📋 Project Oversight** - Review and approve projects
- **📊 Analytics Dashboard** - Comprehensive system analytics
- **💰 Carbon Credits** - Mint and manage carbon credits
- **🔍 MRV System** - Monitoring, Reporting, and Verification
- **📈 Data Visualization** - Charts and graphs for data insights

## ⛓️ Blockchain Features

- **🔒 Immutable Records** - Tamper-proof data storage
- **🏷️ Smart Contracts** - Automated carbon credit issuance
- **🔗 Hyperledger Fabric** - Enterprise-grade blockchain
- **📡 API Integration** - RESTful API for system integration
- **🔄 Real-time Sync** - Automatic data synchronization

## 🛠️ Technology Stack

### Mobile App
- **React Native 0.72.6** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation system
- **AsyncStorage** - Local data storage
- **React Native Paper** - Material Design components

### NCCR Portal
- **React 18** - Modern web framework
- **TypeScript** - Type-safe development
- **Material-UI** - Component library
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Blockchain
- **Hyperledger Fabric 2.4** - Enterprise blockchain platform
- **Node.js** - Blockchain simulator
- **Docker** - Containerization
- **CouchDB** - State database

## 📁 Project Structure

```
blue-carbon-registry/
├── BlueCarbonApp/          # React Native mobile application
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── context/        # React contexts
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── android/            # Android-specific files
├── NCCRPortal/             # React web portal
│   ├── src/
│   │   ├── pages/          # Web pages
│   │   ├── contexts/       # React contexts
│   │   └── components/     # Reusable components
├── fabric-samples/         # Blockchain implementation
│   └── test-network/       # Hyperledger Fabric network
├── start-all-services.bat  # Windows startup script
├── start-all-services.sh   # Linux/macOS startup script
└── docker-compose.yml      # Docker deployment
```

## 🔧 Development

### Mobile App Development
```bash
cd BlueCarbonApp

# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

### Web Portal Development
```bash
cd NCCRPortal

# Start development server
npm start

# Build for production
npm run build
```

### Blockchain Development
```bash
cd fabric-samples/test-network

# Start Hyperledger Fabric network
./network.sh up createChannel -ca

# Deploy chaincode
./deploy-bluecarbon.sh

# Test blockchain
node simple-bluecarbon-demo.js
```

## 🐛 Troubleshooting

### Mobile App Issues

**Debugger Connection Errors:**
1. Use `run-no-debug.bat` to start without debugging
2. Shake device → Settings → Disable JS Dev Mode
3. Disable Remote JS Debugging

**Build Errors:**
```bash
cd BlueCarbonApp
npx react-native start --reset-cache
```

### Blockchain Issues

**Docker Networking Problems:**
- Use the standalone blockchain simulator: `node standalone-blockchain-simulator.js`
- Ensure Docker Desktop is running
- Check port availability: `npx kill-port 7051`

### Portal Issues

**Port Conflicts:**
```bash
npx kill-port 3000
npm start
```

## 🚀 Deployment

### Production Deployment

1. **Mobile App:**
```bash
cd BlueCarbonApp
npx react-native run-android --variant=release
```

2. **Web Portal:**
```bash
cd NCCRPortal
npm run build
# Deploy build/ folder to web server
```

3. **Blockchain:**
```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb
```

### Docker Deployment
```bash
docker-compose up -d
```

## 📊 Monitoring

Real-time system monitoring:
```bash
node monitor-services.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead** - System Architecture & Integration
- **Mobile Developer** - React Native App Development
- **Web Developer** - NCCR Portal Development
- **Blockchain Developer** - Hyperledger Fabric Implementation

## 🏆 Smart India Hackathon 2025

This project was developed for the Smart India Hackathon 2025, addressing the challenge of creating a comprehensive Blue Carbon Registry system for mangrove restoration and carbon credit management.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@bluecarbon.registry
- Documentation: [Wiki](https://github.com/yourusername/blue-carbon-registry/wiki)

---

**🌊 Together, let's restore our mangroves and fight climate change! 🌱**
