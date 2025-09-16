# Blue Carbon Registry Mobile App

A React Native mobile application for the Blue Carbon Registry & MRV System, enabling field officers, community heads, and coastal panchayats to create projects, submit monitoring data, and manage carbon credits.

## Features

### 🔐 Authentication & Onboarding
- Phone number + OTP login
- Role selection (NGO Officer, Community Head, Coastal Panchayat)
- Profile setup with KYC document upload
- Multi-language support (English, Hindi, Tamil, Telugu, Malayalam, Kannada)

### 🌿 Project Management
- GPS-based project creation
- Drone data and photo upload
- Vegetation type selection (Mangrove, Seagrass, Salt Marshes)
- Real-time location accuracy verification
- Offline project storage and sync

### 📊 Monitoring & Reporting
- Field data submission with device signatures
- Growth rate and health score tracking
- Biomass and carbon sequestration data
- Photo evidence with geo-tagging
- Submission status tracking

### 💰 Carbon Credits & Wallet
- Digital wallet integration
- Carbon credit balance tracking
- Transaction history
- Credit transfer and retirement
- Market value display

### 🔄 Offline Support
- Local data storage with AsyncStorage
- Automatic sync when online
- Device keypair generation for authenticity
- Offline-first architecture

## Tech Stack

- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper, React Native Elements
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Blockchain**: Hyperledger Fabric Gateway SDK
- **Cryptography**: react-native-crypto-js
- **Camera**: react-native-vision-camera
- **Location**: @react-native-community/geolocation
- **Maps**: react-native-maps

## Installation

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Setup
```bash
# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── BlockchainContext.tsx
├── navigation/         # Navigation configuration
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── screens/           # App screens
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── services/          # API and blockchain services
├── utils/             # Utility functions
└── types/             # TypeScript type definitions
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
BLOCKCHAIN_GATEWAY_URL=localhost:7051
BLOCKCHAIN_CHANNEL_NAME=mychannel
BLOCKCHAIN_CHAINCODE_NAME=bluecarbon
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
```

### Blockchain Integration
The app connects to a Hyperledger Fabric network for:
- User registration and KYC
- Project creation and approval
- Data submission and verification
- Carbon credit minting and trading

## Demo Credentials

For testing purposes, use these demo credentials:

**OTP Login**: Any phone number with OTP `123456`

## Key Features Implementation

### Device Security
- Unique device keypair generation
- Cryptographic signing of all submissions
- Secure storage of sensitive data

### GPS & Location
- High-accuracy GPS capture
- Location validation and accuracy warnings
- Offline location caching

### Camera & Media
- High-quality photo capture
- Geo-tagging of images
- Drone data upload support

### Blockchain Integration
- Real-time sync with Fabric network
- Offline transaction queuing
- Smart contract interactions

## API Documentation

### Authentication
```typescript
// Login with phone and OTP
const success = await login(phoneNumber, otp);

// Get current user
const user = await getCurrentUser();
```

### Projects
```typescript
// Create new project
const projectId = await createProject(projectData);

// Get user projects
const projects = await getProjectsByUser(userId);
```

### Submissions
```typescript
// Submit monitoring data
const submissionId = await submitData(submissionData);

// Get submission status
const status = await getSubmissionStatus(submissionId);
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Deployment

### Android
```bash
# Generate signed APK
cd android
./gradlew assembleRelease
```

### iOS
```bash
# Archive for App Store
xcodebuild -workspace ios/BlueCarbonApp.xcworkspace -scheme BlueCarbonApp archive
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@bluecarbon.org
- Documentation: https://docs.bluecarbon.org
- Issues: https://github.com/bluecarbon/mobile-app/issues
