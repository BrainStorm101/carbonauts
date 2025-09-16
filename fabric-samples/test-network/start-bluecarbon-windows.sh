#!/bin/bash
#
# Windows-compatible Blue Carbon blockchain startup script
# This script works around TLS certificate issues on Windows Docker
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌊 Starting Blue Carbon Blockchain on Windows${NC}"
echo "================================================"

# Clean up any existing containers
echo -e "${YELLOW}🧹 Cleaning up existing containers...${NC}"
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Set environment variables for Windows compatibility
export COMPOSE_CONVERT_WINDOWS_PATHS=1
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

# Start network with minimal configuration (no CA to avoid TLS issues)
echo -e "${YELLOW}🚀 Starting Fabric network (minimal config)...${NC}"
docker-compose -f compose/compose-test-net.yaml up -d

# Wait for containers to be ready
echo -e "${YELLOW}⏳ Waiting for network to initialize...${NC}"
sleep 10

# Create channel manually with simplified approach
echo -e "${YELLOW}📡 Creating channel...${NC}"
export CORE_PEER_TLS_ENABLED=false
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Generate channel configuration
configtxgen -profile ChannelUsingRaft -outputBlock ./channel-artifacts/mychannel.block -channelID mychannel

# Create and join channel with TLS disabled
peer channel create -o localhost:7050 -c mychannel -f ./channel-artifacts/mychannel.block --outputBlock ./channel-artifacts/mychannel.block
peer channel join -b ./channel-artifacts/mychannel.block

# Set Org2 environment and join channel
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
peer channel join -b ./channel-artifacts/mychannel.block

echo -e "${GREEN}✅ Network started successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Deploy chaincode: ./deploy-bluecarbon-windows.sh"
echo "2. Run demo: cd ../asset-transfer-events/application-gateway-typescript && npm run bluecarbon"
