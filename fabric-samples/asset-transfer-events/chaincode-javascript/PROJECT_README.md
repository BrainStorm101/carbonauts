<!-- ############################################################################################################### -->
<!-- ############################################################################################################### -->
<!-- ############################################################################################################### -->
<!-- ############################################################################################################### -->
<!-- ############################################################################################################### -->

# 🌊 Blue Carbon Registry & MRV System - Complete Project Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Network Configuration](#network-configuration)
5. [Chaincode Deployment](#chaincode-deployment)
6. [Chaincode Functions](#chaincode-functions)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)
9. [Development Workflow](#development-workflow)
10. [Next Steps](#next-steps)

## 🎯 Project Overview

**Blue Carbon Registry & MRV System** is a blockchain-based platform for transparent, scalable, and fraud-resistant blue carbon restoration projects. It enables:

- **Data Capture**: Farmers/communities upload restoration data (photos, GPS, timestamps)
- **Verification**: NGOs and government authorities review and approve submissions
- **Tokenization**: Verified data is converted to carbon credits on blockchain
- **Marketplace**: Industries can purchase verified carbon credits
- **Audit Trail**: Complete immutable record of all transactions

### Key Stakeholders
- **Farmers/Communities** 🌱: Ground-level data capture
- **NGOs** 🏢: Manage projects, upload drone evidence
- **NCCR/Government** 🏛️: Review submissions, verify data, approve credits
- **Auditors** 👓: Independent validation, random audits
- **Industries** 🏭: Purchase verified carbon credits

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Portal    │    │   Blockchain    │
│   (Farmers)     │◄──►│ (NGO/NCCR/Ind.) │◄──►│  (Fabric Net)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │ (Node.js/NestJS)│
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │   Database      │
                    │ (PostgreSQL +   │
                    │   PostGIS)      │
                    └─────────────────┘
```

### Tech Stack
- **Blockchain**: Hyperledger Fabric 2.5+
- **Chaincode**: JavaScript (Node.js)
- **Backend**: Node.js/Express/NestJS
- **Database**: PostgreSQL + PostGIS
- **File Storage**: IPFS + S3/Cloud
- **Mobile**: React Native
- **Web**: React + Next.js

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / macOS / Windows (WSL2)
- **Node.js**: >= 20.0.0
- **Docker**: Latest version
- **Docker Compose**: Latest version
- **Git**: Latest version

### Hyperledger Fabric Setup
```bash
# Install Fabric binaries and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7
```

### Environment Setup
```bash
# Add Fabric binaries to PATH
export PATH=$PATH:$HOME/fabric-samples/bin

# Set Fabric configuration path
export FABRIC_CFG_PATH=$HOME/fabric-samples/config
```

## 🌐 Network Configuration

### Fabric Network Details
- **Network Name**: `fabric_test`
- **Channel**: `mychannel`
- **Organizations**: Org1, Org2
- **Chaincode Name**: `bluecarbon`

### Port Configuration
| Service | Port | Description |
|---------|------|-------------|
| **Orderer** | 7050 | Main orderer service |
| **Orderer Admin** | 7053 | Admin operations |
| **Orderer Operations** | 19443 | Metrics/operations (mapped from 9443) |
| **Peer0.Org1** | 7051 | Org1 peer service |
| **Peer0.Org1 Operations** | 19451 | Org1 peer metrics (mapped from 9444) |
| **Peer0.Org2** | 9051 | Org2 peer service |
| **Peer0.Org2 Operations** | 19450 | Org2 peer metrics (mapped from 9445) |

### Network Topology
```
┌─────────────────────────────────────────────────────────┐
│                    Orderer Network                      │
│  orderer.example.com:7050 (Admin: 7053, Ops: 19443)   │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────────────┐      │      ┌─────────────────┐
    │      Org1       │      │      │      Org2       │
    │ peer0:7051      │      │      │ peer0:9051      │
    │ ops:19451       │      │      │ ops:19450       │
    └─────────────────┘      │      └─────────────────┘
                              │
                    ┌─────────────────┐
                    │   mychannel     │
                    │  (bluecarbon)   │
                    └─────────────────┘
```

## 🚀 Chaincode Deployment

### Project Structure
```
fabric-samples/asset-transfer-events/chaincode-javascript/
├── lib/
│   └── assetTransferEvents.js     # Blue Carbon Registry chaincode
├── package.json                   # Dependencies and metadata
├── index.js                       # Entry point
├── .eslintrc.js                  # Linting configuration
├── .eslintignore                 # Lint ignore patterns
└── PROJECT_README.md             # This file
```

### Deployment Commands

#### 1. Start Fabric Network
```bash
cd ~/fabric-project/fabric-samples/test-network
./network.sh up createChannel -ca
```

#### 2. Set Environment Variables
```bash
# Set Fabric configuration path
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin
```

#### 3. Package Chaincode
```bash
peer lifecycle chaincode package blue-carbon-registry.tar.gz \
  --path ../asset-transfer-events/chaincode-javascript \
  --lang node \
  --label blue-carbon-registry_1.1
```

#### 4. Install on Peers
```bash
cd ~/fabric-project/fabric-samples/test-network

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Install on Org1
peer lifecycle chaincode install blue-carbon-registry.tar.gz

# Switch to Org2
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

# Install on Org2
peer lifecycle chaincode install blue-carbon-registry.tar.gz
```

#### 5. Get Package ID
```bash
peer lifecycle chaincode queryinstalled
# Note the Package ID (e.g., blue-carbon-registry_1.1:555a8b008d1e8febcdac344c433bebe44bdb2fdc2eb7127f09f60fb20a2de1ec)
```

#### 6. Approve for Organizations
```bash
# Set PACKAGE_ID from step 4
export PACKAGE_ID="blue-carbon-registry_1.1:555a8b008d1e8febcdac344c433bebe44bdb2fdc2eb7127f09f60fb20a2de1ec"

# Approve for Org1
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID mychannel \
  --name bluecarbon \
  --version 1.1 \
  --package-id $PACKAGE_ID \
  --sequence 1

# Approve for Org2
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID mychannel \
  --name bluecarbon \
  --version 1.1 \
  --package-id $PACKAGE_ID \
  --sequence 1
```

#### 7. Commit Chaincode
```bash
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID mychannel \
  --name bluecarbon \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  --version 1.1 \
  --sequence 1
```

#### 8. Initialize Chaincode
```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C mychannel \
  -n bluecarbon \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"InitLedger","Args":[]}'
```

## 🔧 Chaincode Functions

### User Management
| Function | Parameters | Description |
|----------|------------|-------------|
| `RegisterUser` | userId, name, role, organization, contactInfo | Register new user with role |
| `GetUser` | userId | Retrieve user information |

### Project Management
| Function | Parameters | Description |
|----------|------------|-------------|
| `CreateProject` | projectId, name, location, coordinates, projectType, targetTrees, ngoId | Create restoration project |
| `GetProject` | projectId | Get project details |
| `GetProjectStats` | projectId | Get project statistics and progress |

### Submission Workflow
| Function | Parameters | Description |
|----------|------------|-------------|
| `CreateSubmission` | submissionId, farmerId, projectId, plantType, numberOfSamples, imageHashes, gpsCoordinates, deviceSignature | Submit field data |
| `ReviewSubmission` | submissionId, reviewerId, action, comments | Review and approve/reject submission |

### Carbon Credit System
| Function | Parameters | Description |
|----------|------------|-------------|
| `MintCarbonCredits` | submissionId, nccr_id | Convert approved submission to credits |
| `ListCreditsForSale` | creditBatchId, pricePerCredit, sellerId | List credits on marketplace |
| `PurchaseCredits` | creditBatchId, buyerId, paymentAmount | Purchase credits with escrow |
| `FinalizeCredits` | creditBatchId, certificateHash | Finalize after escrow period |

### Query Functions
| Function | Parameters | Description |
|----------|------------|-------------|
| `QueryPendingSubmissions` | - | Get all pending submissions |
| `QueryAvailableCredits` | - | Get marketplace listings |
| `QuerySubmissionsByFarmer` | farmerId | Get farmer's submissions |
| `QuerySubmissionsByProject` | projectId | Get project submissions |
| `QueryCreditsByIndustry` | industryId | Get industry purchases |
| `GetAuditTrail` | entityId | Get complete audit history |

## 💡 Usage Examples

### 1. Register Users
```bash
# Register Farmer
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"RegisterUser","Args":["farmer001","John Doe","FARMER","Local Community","john@example.com"]}'

# Register NGO
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"RegisterUser","Args":["ngo001","Green Earth NGO","NGO","Environmental Org","contact@greenearth.org"]}'

# Register NCCR Official
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"RegisterUser","Args":["nccr001","NCCR Official","NCCR","Government Authority","nccr@gov.in"]}'

# Register Industry
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"RegisterUser","Args":["industry001","Tech Corp","INDUSTRY","Technology Company","procurement@techcorp.com"]}'
```

### 2. Create Project
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"CreateProject","Args":["proj001","Mangrove Restoration Sundarbans","Sundarbans, West Bengal","{\"lat\":22.5,\"lng\":89.0,\"boundary\":[]}","MANGROVE","1000","ngo001"]}'
```

### 3. Submit Field Data
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"CreateSubmission","Args":["sub001","farmer001","proj001","MANGROVE","50","[\"QmHash1\",\"QmHash2\",\"QmHash3\"]","{\"lat\":22.5001,\"lng\":89.0001,\"accuracy\":5}","device_signature_abc123"]}'
```

### 4. Review Submission
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bluecarbon --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"ReviewSubmission","Args":["sub001","nccr001","APPROVE","Excellent mangrove plantation work. GPS coordinates verified."]}'
```

### 5. Query Functions
```bash
# Get pending submissions
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryPendingSubmissions","Args":[]}'

# Get project stats
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProjectStats","Args":["proj001"]}'

# Get user info
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetUser","Args":["farmer001"]}'

# Get available credits
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryAvailableCredits","Args":[]}'
```

## 🐛 Version History & Bug Fixes

### Version 1.1 (September 5, 2025)
- **Fixed**: Undefined `stringify` function causing endorsement failures
- **Fixed**: Inconsistent JSON serialization in chaincode
- **Fixed**: User registration/retrieval functionality
- **Improved**: Error handling and data persistence

### Version 1.0 (Initial Release)
- Basic chaincode implementation
- Core Blue Carbon Registry functions

## 🛠️ Troubleshooting

### Docker Desktop WSL Integration Issues
```bash
# Error: docker-compose not found in WSL2
# Solution: Enable Docker Desktop WSL integration
# 1. Open Docker Desktop → Settings → Resources → WSL Integration
# 2. Enable integration with Ubuntu distro
# 3. Install docker-compose: sudo apt install docker-compose-plugin
```

### Common Issues

#### 1. Chaincode Installation Errors
```bash
# Error: chaincode definition for 'bluecarbon' exists, but chaincode is not installed
# Solution: Install chaincode on both peers
peer lifecycle chaincode install blue-carbon-registry.tar.gz
```

#### 2. Sequence Number Issues
```bash
# Error: requested sequence is X, but new definition must be sequence Y
# Solution: Use the correct sequence number
peer lifecycle chaincode commit --sequence Y
```

#### 3. Package ID Issues
```bash
# Error: package not found
# Solution: Get correct package ID
peer lifecycle chaincode queryinstalled
```

#### 4. TLS Certificate Issues
```bash
# Error: TLS handshake failed
# Solution: Use correct orderer port (7050, not 19443)
-o localhost:7050
```

### Network Management
```bash
# Start network
cd ~/fabric-project/fabric-samples/test-network
./network.sh up createChannel -ca

# Stop network
./network.sh down

# Clean everything
./network.sh down
docker system prune -a
docker volume prune
```

### Environment Variables
```bash
# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Set Org2 environment
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

## 🔄 Development Workflow

### Making Changes to Chaincode
1. **Modify** the chaincode in `lib/assetTransferEvents.js`
2. **Package** with new version: `blue-carbon-registry_X.Y`
3. **Install** on both peers
4. **Approve** with incremented sequence number
5. **Commit** with new sequence
6. **Test** the changes

### Version Management
- **Package Label**: `blue-carbon-registry_X.Y`
- **Version**: `X.Y` (increment for each deployment)
- **Sequence**: Increment for each commit

### Testing Strategy
1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test complete workflows
3. **End-to-End Tests**: Test full user journeys
4. **Performance Tests**: Test under load

## 🚀 Next Steps

### Phase 1 (Hackathon - Completed)
- ✅ Basic chaincode with all core functions
- ✅ User management and role-based access
- ✅ Submission workflow with approvals
- ✅ Carbon credit tokenization
- ✅ Marketplace functionality
- ✅ Comprehensive audit trail

### Phase 2 (Post-Hackathon)
- [ ] **Mobile App Development**
  - React Native app for farmers
  - Offline-first architecture
  - Camera integration with GPS
  - Submission tracking
- [ ] **Web Portal Development**
  - React/Next.js dashboard
  - Role-based views (NGO, NCCR, Industry)
  - Analytics and reporting
  - Credit marketplace UI
- [ ] **Backend API Development**
  - Node.js/NestJS REST API
  - Fabric SDK integration
  - Authentication & authorization
  - File upload handling
- [ ] **Advanced Features**
  - IPFS integration for images
  - ML-based fraud detection
  - Satellite data validation
  - Escrow smart contracts
  - Multi-signature approvals

### Integration Points
- **IPFS**: For decentralized image storage
- **Satellite APIs**: Sentinel, Planet for validation
- **Payment Gateways**: For credit purchases
- **Identity Systems**: Aadhaar, eKYC integration
- **Notification Services**: SMS, email, push notifications

## 📞 Support & Contact

For technical support or questions:
- **GitHub Issues**: Create issues for bugs/features
- **Documentation**: Refer to Hyperledger Fabric docs
- **Community**: Hyperledger Discord/Slack

---

**Built with ❤️ for transparent and verifiable blue carbon restoration! 🌊🌱**

*Last Updated: September 5, 2025*
