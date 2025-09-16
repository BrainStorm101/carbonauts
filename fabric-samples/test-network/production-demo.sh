#!/bin/bash
# Production-ready Blue Carbon Registry Demo
# Using existing data and demonstrating real-world scenarios

set -e

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

echo "🌊 Blue Carbon Registry - Production Demo"
echo "========================================"

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "📊 Current System Status"
echo "========================"

echo "1. Available Users:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetAllUsers","Args":[]}' | jq -r '.[] | "\(.userId): \(.name) (\(.role))"'

echo ""
echo "2. Active Projects:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetAllProjects","Args":[]}' | jq -r '.[] | "\(.projectId): \(.name) - \(.status)"'

echo ""
echo "3. Available Carbon Credits:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryAvailableCredits","Args":[]}' | jq -r '.[] | "\(.creditBatchId): \(.creditsAmount) credits (\(.creditType)) - \(.status)"'

echo ""
echo "4. Recent Submissions:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetAllSubmissions","Args":[]}' | jq -r '.[] | "\(.submissionId): \(.plantType) - \(.status) (\(.numberOfSamples) samples)"'

echo ""
echo "🌱 Real-World Scenario: New Mangrove Restoration Project"
echo "========================================================"

echo "Step 1: Registering new coastal community farmer..."
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
    -c '{"function":"RegisterUser","Args":["coastal_farmer_001","Lakshmi Devi","FARMER","Coastal Restoration Community","lakshmi@coastalrestore.org"]}'

echo ""
echo "Step 2: Creating new mangrove restoration project..."
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
    -c '{"function":"CreateProject","Args":["coastal_proj_001","Coastal Mangrove Restoration Initiative","Tamil Nadu Coast","{\"lat\":10.8,\"lng\":79.8,\"boundary\":[{\"lat\":10.6,\"lng\":79.6},{\"lat\":11.0,\"lng\":79.6},{\"lat\":11.0,\"lng\":80.0},{\"lat\":10.6,\"lng\":80.0}]}","MANGROVE","3000","ngo001"]}'

echo ""
echo "Step 3: NCCR verifying the project..."
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
    -c '{"function":"VerifyProject","Args":["coastal_proj_001","nccr001","Project verified for coastal mangrove restoration in Tamil Nadu. GPS coordinates validated with satellite imagery."]}'

echo ""
echo "Step 4: Farmer submitting field data..."
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
    -c '{"function":"CreateSubmission","Args":["coastal_sub_001","coastal_farmer_001","coastal_proj_001","RHIZOPHORA_MUCRONATA","150","[\"QmCoastal1\",\"QmCoastal2\",\"QmCoastal3\"]","{\"lat\":10.82,\"lng\":79.85,\"accuracy\":2}","device_signature_coastal_001"]}'

echo ""
echo "Step 5: NCCR reviewing and approving submission..."
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
    -c '{"function":"ReviewSubmission","Args":["coastal_sub_001","nccr001","APPROVE","Excellent coastal mangrove restoration work. GPS coordinates verified with satellite data. All 150 Rhizophora mucronata saplings properly planted and documented."]}'

echo ""
echo "Step 6: Minting carbon credits..."
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
    -c '{"function":"MintCarbonCredits","Args":["coastal_sub_001","nccr001"]}'

echo ""
echo "Step 7: Listing credits for sale..."
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
    -c '{"function":"ListCreditsForSale","Args":["coastal_sub_001","30.00","coastal_farmer_001"]}'

echo ""
echo "Step 8: Industry purchasing credits..."
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
    -c '{"function":"PurchaseCredits","Args":["coastal_sub_001","industry001","4500.00"]}'

echo ""
echo "📊 Final System Status"
echo "======================"

echo "Updated Projects:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetAllProjects","Args":[]}' | jq -r '.[] | "\(.projectId): \(.name) - \(.status) (\(.creditsGenerated) credits generated)"'

echo ""
echo "Available Credits:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryAvailableCredits","Args":[]}' | jq -r '.[] | "\(.creditBatchId): \(.creditsAmount) credits (\(.creditType)) - \(.status)"'

echo ""
echo "✅ Production Demo Completed Successfully!"
echo "🌊🌱 Blue Carbon Registry is ready for real-world deployment!"
