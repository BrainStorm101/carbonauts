#!/bin/bash
# Test Blue Carbon chaincode functions

set -e

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

echo "🧪 Testing Blue Carbon Chaincode Functions"
echo "=========================================="

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "1️⃣ Testing GetUser function..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetUser","Args":["farmer001"]}'

echo ""
echo "2️⃣ Testing GetProject function..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProject","Args":["proj001"]}'

echo ""
echo "3️⃣ Testing GetProjectStats function..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProjectStats","Args":["proj001"]}'

echo ""
echo "4️⃣ Testing QueryPendingSubmissions function..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryPendingSubmissions","Args":[]}'

echo ""
echo "5️⃣ Testing QueryAvailableCredits function..."
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryAvailableCredits","Args":[]}'

echo ""
echo "✅ All query functions working correctly!"
