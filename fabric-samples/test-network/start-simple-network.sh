#!/bin/bash

echo "🌊 Starting Simple Blue Carbon Blockchain Network"
echo "=================================================="

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker-compose -f compose/docker-compose-simple.yaml down -v --remove-orphans
docker system prune -f

# Generate crypto material if not exists
if [ ! -d "organizations" ]; then
    echo "Generating crypto material..."
    ./network.sh up -ca
    ./network.sh down
fi

# Start the simplified network
echo "Starting simplified blockchain network..."
docker-compose -f compose/docker-compose-simple.yaml up -d

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 10

# Check if containers are running
echo "Checking container status..."
docker ps

# Create channel using CLI
echo "Creating channel 'mychannel'..."
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/mychannel.tx --outputBlock ./channel-artifacts/mychannel.block

# Join peers to channel
echo "Joining peer0.org1 to channel..."
docker exec cli peer channel join -b ./channel-artifacts/mychannel.block

echo "Joining peer0.org2 to channel..."
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer channel join -b ./channel-artifacts/mychannel.block

echo "✅ Simple blockchain network started successfully!"
echo "📊 Network Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔗 Access Points:"
echo "- Orderer: localhost:7050"
echo "- Peer0.Org1: localhost:7051"
echo "- Peer0.Org2: localhost:9051"
