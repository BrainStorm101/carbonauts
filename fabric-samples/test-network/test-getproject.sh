#!/bin/bash
# Test GetProject function

set -e

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "🔍 Testing GetProject function..."

echo "1. Testing proj001..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProject","Args":["proj001"]}'

echo ""
echo "2. Testing sundarbans_proj_001..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProject","Args":["sundarbans_proj_001"]}'
