#!/bin/bash

# Set up environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

# Source the environment variable script
. ./scripts/envVar.sh

# Set organization context (1 for Org1, 2 for Org2)
setGlobals 1

# Set the orderer TLS CA certificate path
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
echo "ORDERER_CA set to: $ORDERER_CA"

# Example command for chaincode approval with proper TLS settings
echo "\nExample command for chaincode approval with proper TLS settings:"
echo "peer lifecycle chaincode approveformyorg \\
  --channelID mychannel \\
  --name basic \\
  --version 1.0 \\
  --package-id basic_1.0:c16187d1ffaa6e10bcc78454632d8929a5961a6261a1ed348c36868e748d7cc6 \\
  --sequence 1 \\
  --tls \\
  --cafile $ORDERER_CA \\
  -o localhost:19443 \\
  --ordererTLSHostnameOverride orderer.example.com"

# Example command for chaincode invocation with proper TLS settings
echo "\nExample command for chaincode invocation with proper TLS settings:"
echo "peer chaincode invoke \\
  -o localhost:19443 \\
  --ordererTLSHostnameOverride orderer.example.com \\
  --tls \\
  --cafile $ORDERER_CA \\
  -C mychannel \\
  -n basic \\
  --peerAddresses localhost:7051 \\
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \\
  --peerAddresses localhost:9051 \\
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \\
  -c '{\"function\":\"InitLedger\",\"Args\":[]}'"

# Example command for chaincode query with proper TLS settings
echo "\nExample command for chaincode query with proper TLS settings:"
echo "peer chaincode query \\
  -C mychannel \\
  -n basic \\
  -c '{\"Args\":[\"GetAllAssets\"]}'"

# Check if the chaincode is already committed
echo "\nChecking if chaincode is already committed:"
peer lifecycle chaincode querycommitted --channelID mychannel --name basic
