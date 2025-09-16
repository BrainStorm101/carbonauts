#!/bin/bash

# Exit on error
set -e

# Set version
VERSION=1.2
PACKAGE_NAME="blue-carbon-registry-$VERSION.tar.gz"
CHANNEL_NAME="mychannel"
CHAINCODE_NAME="bluecarbon"
SEQUENCE=1  # Increment this if you've committed this version before

# Set path to Fabric binaries
export PATH=${PWD}/../../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../../config/

# Package the chaincode
echo "===== Packaging chaincode ====="
peer lifecycle chaincode package $PACKAGE_NAME \
    --path . \
    --lang node \
    --label ${CHAINCODE_NAME}_${VERSION}

echo "===== Chaincode packaged as $PACKAGE_NAME ====="

# Install on Org1
echo -e "\n===== Installing chaincode on Org1 ====="
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../../test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../../test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install $PACKAGE_NAME

# Install on Org2
echo -e "\n===== Installing chaincode on Org2 ====="
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../../test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../../test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install $PACKAGE_NAME

# Query installed chaincode to get package ID
echo -e "\n===== Querying installed chaincode on Org1 ====="
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/../../test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "$CHAINCODE_NAME" | grep -oP '(?<=Package ID: ).*(?=,)' | head -1)
echo "Package ID: $PACKAGE_ID"

# Approve for Org1
echo -e "\n===== Approving chaincode for Org1 ====="
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE \
    --tls \
    --cafile ${PWD}/../../test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for Org2
echo -e "\n===== Approving chaincode for Org2 ====="
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/../../test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE \
    --tls \
    --cafile ${PWD}/../../test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Commit the chaincode
echo -e "\n===== Committing chaincode ====="
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --sequence $SEQUENCE \
    --tls \
    --cafile ${PWD}/../../test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/../../test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/../../test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

echo -e "\n===== Chaincode committed successfully! ====="
echo "Chaincode Name: $CHAINCODE_NAME"
echo "Version: $VERSION"
echo "Sequence: $SEQUENCE"
echo "Package ID: $PACKAGE_ID"

# Query committed chaincode
echo -e "\n===== Querying committed chaincode ====="
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --cafile ${PWD}/../../test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
