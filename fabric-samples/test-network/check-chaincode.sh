#!/bin/bash
# Check chaincode status and fix endorsement policy

set -e

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

echo "🔍 Checking Chaincode Status"
echo "============================"

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "📦 Checking committed chaincode..."
peer lifecycle chaincode querycommitted -C mychannel -n bluecarbon

echo ""
echo "🔍 Testing simple query..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetAllAssets","Args":[]}'
