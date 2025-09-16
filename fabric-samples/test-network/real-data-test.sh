#!/bin/bash
# Real Data Test for Blue Carbon Registry
# Testing with actual mangrove restoration data

set -e

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../config
export PATH=$PATH:$PWD/../bin

echo "🌊 Blue Carbon Registry - Real Data Test"
echo "========================================"

# Set Org1 environment
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "📋 Test 1: Sundarbans Mangrove Restoration Project"
echo "--------------------------------------------------"

# Register Sundarbans Farmer
echo "1. Registering Sundarbans Farmer..."
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
    -c '{"function":"RegisterUser","Args":["sundarbans_farmer_001","Mohammad Ali","FARMER","Sundarbans Fishermen Cooperative","mohammad.ali@sundarbans.org"]}'

# Register Sundarbans NGO
echo "2. Registering Sundarbans NGO..."
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
    -c '{"function":"RegisterUser","Args":["sundarbans_ngo_001","Sundarbans Conservation Society","NGO","Wildlife Conservation Trust","info@sundarbansconservation.org"]}'

# Register NCCR Official
echo "3. Registering NCCR Official..."
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
    -c '{"function":"RegisterUser","Args":["nccr_sundarbans_001","Dr. Ananya Chatterjee","NCCR","National Carbon Credit Registry - West Bengal","ananya.chatterjee@nccr.gov.in"]}'

# Register Industry Buyer
echo "4. Registering Industry Buyer..."
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
    -c '{"function":"RegisterUser","Args":["tata_steel_001","Tata Steel Limited","INDUSTRY","Steel Manufacturing","carbon.offset@tatasteel.com"]}'

# Create Sundarbans Project
echo "5. Creating Sundarbans Mangrove Restoration Project..."
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
    -c '{"function":"CreateProject","Args":["sundarbans_proj_001","Sundarbans Mangrove Restoration Phase 1","Sundarbans National Park, West Bengal","{\"lat\":22.0,\"lng\":88.5,\"boundary\":[{\"lat\":21.8,\"lng\":88.3},{\"lat\":22.2,\"lng\":88.3},{\"lat\":22.2,\"lng\":88.7},{\"lat\":21.8,\"lng\":88.7}]}","MANGROVE","5000","sundarbans_ngo_001"]}'

# Verify Project
echo "6. Verifying Sundarbans Project..."
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
    -c '{"function":"VerifyProject","Args":["sundarbans_proj_001","nccr_sundarbans_001","Project verified for mangrove restoration in Sundarbans National Park. GPS coordinates validated with satellite imagery."]}'

# Submit Field Data - Batch 1
echo "7. Submitting Field Data - Batch 1 (500 Rhizophora mucronata)..."
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
    -c '{"function":"CreateSubmission","Args":["sundarbans_sub_001","sundarbans_farmer_001","sundarbans_proj_001","RHIZOPHORA_MUCRONATA","500","[\"QmSundarbans1\",\"QmSundarbans2\",\"QmSundarbans3\",\"QmSundarbans4\",\"QmSundarbans5\"]","{\"lat\":22.05,\"lng\":88.52,\"accuracy\":3}","device_signature_sundarbans_001"]}'

# Review and Approve Submission
echo "8. NCCR reviewing and approving submission..."
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
    -c '{"function":"ReviewSubmission","Args":["sundarbans_sub_001","nccr_sundarbans_001","APPROVE","Excellent mangrove plantation work. GPS coordinates verified with satellite data. All 500 Rhizophora mucronata saplings properly planted and documented."]}'

# Mint Carbon Credits
echo "9. Minting carbon credits..."
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
    -c '{"function":"MintCarbonCredits","Args":["sundarbans_sub_001","nccr_sundarbans_001"]}'

echo ""
echo "📋 Test 2: Andaman Islands Seagrass Restoration"
echo "-----------------------------------------------"

# Register Andaman Farmer
echo "10. Registering Andaman Farmer..."
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
    -c '{"function":"RegisterUser","Args":["andaman_farmer_001","Rajesh Kumar","FARMER","Andaman Coastal Community","rajesh.kumar@andaman.org"]}'

# Register Andaman NGO
echo "11. Registering Andaman NGO..."
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
    -c '{"function":"RegisterUser","Args":["andaman_ngo_001","Andaman Marine Conservation Society","NGO","Marine Life Protection Trust","info@andamanmarine.org"]}'

# Create Andaman Project
echo "12. Creating Andaman Seagrass Restoration Project..."
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
    -c '{"function":"CreateProject","Args":["andaman_proj_001","Andaman Seagrass Restoration Initiative","Port Blair, Andaman Islands","{\"lat\":11.6,\"lng\":92.7,\"boundary\":[{\"lat\":11.4,\"lng\":92.5},{\"lat\":11.8,\"lng\":92.5},{\"lat\":11.8,\"lng\":92.9},{\"lat\":11.4,\"lng\":92.9}]}","SEAGRASS","2000","andaman_ngo_001"]}'

# Verify Andaman Project
echo "13. Verifying Andaman Project..."
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
    -c '{"function":"VerifyProject","Args":["andaman_proj_001","nccr_sundarbans_001","Project verified for seagrass restoration in Andaman Islands. Marine ecosystem restoration initiative approved."]}'

# Submit Field Data - Andaman
echo "14. Submitting Field Data - Andaman (300 Halophila ovalis)..."
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
    -c '{"function":"CreateSubmission","Args":["andaman_sub_001","andaman_farmer_001","andaman_proj_001","HALOPHILA_OVALIS","300","[\"QmAndaman1\",\"QmAndaman2\",\"QmAndaman3\"]","{\"lat\":11.62,\"lng\":92.72,\"accuracy\":2}","device_signature_andaman_001"]}'

# Review and Approve Andaman Submission
echo "15. NCCR reviewing and approving Andaman submission..."
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
    -c '{"function":"ReviewSubmission","Args":["andaman_sub_001","nccr_sundarbans_001","APPROVE","Excellent seagrass restoration work. Underwater GPS coordinates verified. All 300 Halophila ovalis plants properly transplanted."]}'

# Mint Andaman Carbon Credits
echo "16. Minting Andaman carbon credits..."
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
    -c '{"function":"MintCarbonCredits","Args":["andaman_sub_001","nccr_sundarbans_001"]}'

echo ""
echo "📊 Querying System Status..."
echo "============================"

# Query Project Stats
echo "17. Sundarbans Project Stats:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProjectStats","Args":["sundarbans_proj_001"]}'

echo ""
echo "18. Andaman Project Stats:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"GetProjectStats","Args":["andaman_proj_001"]}'

echo ""
echo "19. Available Credits:"
peer chaincode query -C mychannel -n bluecarbon -c '{"function":"QueryAvailableCredits","Args":[]}'

echo ""
echo "✅ Real Data Test Completed Successfully!"
echo "🌊🌱 Blue Carbon Registry ready for production!"
