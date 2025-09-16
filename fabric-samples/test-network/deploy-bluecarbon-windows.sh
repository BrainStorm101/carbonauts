#!/bin/bash
#
# Windows-compatible Blue Carbon chaincode deployment script
# This script deploys the Blue Carbon chaincode without TLS complications
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Chaincode details
CHAINCODE_NAME="bluecarbon"
CHAINCODE_PATH="../asset-transfer-events/chaincode-javascript"
CHAINCODE_LANG="node"
CHAINCODE_VERSION="1.0"
SEQUENCE="1"
PACKAGE_NAME="blue-carbon-registry.tar.gz"

echo -e "${BLUE}🌊 Deploying Blue Carbon Chaincode (Windows)${NC}"
echo "================================================"

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin
export CORE_PEER_TLS_ENABLED=false

echo -e "${YELLOW}📦 Step 1: Packaging chaincode...${NC}"
peer lifecycle chaincode package $PACKAGE_NAME \
    --path $CHAINCODE_PATH \
    --lang $CHAINCODE_LANG \
    --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

echo -e "${GREEN}✅ Chaincode packaged successfully${NC}"

# Set Org1 environment
echo -e "${YELLOW}📥 Step 2: Installing on Org1...${NC}"
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install $PACKAGE_NAME

echo -e "${GREEN}✅ Installed on Org1${NC}"

# Set Org2 environment
echo -e "${YELLOW}📥 Step 3: Installing on Org2...${NC}"
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install $PACKAGE_NAME

echo -e "${GREEN}✅ Installed on Org2${NC}"

# Get package ID
echo -e "${YELLOW}🔍 Step 4: Getting package ID...${NC}"
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | grep -o '"package_id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$PACKAGE_ID" ]; then
    echo -e "${RED}❌ Failed to get package ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Package ID: $PACKAGE_ID${NC}"

# Approve for Org1
echo -e "${YELLOW}✅ Step 5: Approving for Org1...${NC}"
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --channelID mychannel \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE

echo -e "${GREEN}✅ Approved for Org1${NC}"

# Approve for Org2
echo -e "${YELLOW}✅ Step 6: Approving for Org2...${NC}"
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --channelID mychannel \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE

echo -e "${GREEN}✅ Approved for Org2${NC}"

# Commit chaincode
echo -e "${YELLOW}🚀 Step 7: Committing chaincode...${NC}"
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --channelID mychannel \
    --name $CHAINCODE_NAME \
    --peerAddresses localhost:7051 \
    --peerAddresses localhost:9051 \
    --version $CHAINCODE_VERSION \
    --sequence $SEQUENCE

echo -e "${GREEN}✅ Chaincode committed successfully${NC}"

# Initialize chaincode
echo -e "${YELLOW}🔧 Step 8: Initializing chaincode...${NC}"
peer chaincode invoke \
    -o localhost:7050 \
    -C mychannel \
    -n $CHAINCODE_NAME \
    --peerAddresses localhost:7051 \
    --peerAddresses localhost:9051 \
    -c '{"function":"InitLedger","Args":[]}'

echo -e "${GREEN}✅ Chaincode initialized successfully${NC}"

# Clean up package file
rm -f $PACKAGE_NAME

echo ""
echo -e "${GREEN}🎉 Blue Carbon Registry Deployed Successfully on Windows!${NC}"
echo "================================================"
echo -e "${BLUE}Chaincode Name:${NC} $CHAINCODE_NAME"
echo -e "${BLUE}Version:${NC} $CHAINCODE_VERSION"
echo -e "${BLUE}Channel:${NC} mychannel"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Run demo: cd ../asset-transfer-events/application-gateway-typescript && npm run bluecarbon"
echo "2. Start React Native development"
echo ""
