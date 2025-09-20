#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e " Blue Carbon Registry - Complete Setup"
echo -e "========================================${NC}"
echo

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 completed successfully${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

echo -e "${BLUE}[1/4] Starting Blockchain Network...${NC}"
echo "========================================"
cd fabric-samples/test-network

# Clean up any existing network
./network.sh down 2>/dev/null

# Start the network
./network.sh up createChannel -ca
check_status "Blockchain network startup"

echo
echo -e "${BLUE}[2/4] Deploying Blue Carbon Chaincode...${NC}"
echo "========================================"
./deploy-bluecarbon.sh
check_status "Chaincode deployment"

echo
echo -e "${BLUE}[3/4] Starting NCCR Portal...${NC}"
echo "========================================"
cd ../../NCCRPortal

# Check if port 3000 is available
check_port 3000

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing NCCR Portal dependencies..."
    npm install
    check_status "NCCR Portal dependency installation"
fi

# Start NCCR Portal in background
echo "Starting NCCR Portal on http://localhost:3000..."
npm start &
NCCR_PID=$!
sleep 5
check_status "NCCR Portal startup"

echo
echo -e "${BLUE}[4/4] Starting Mobile App...${NC}"
echo "========================================"
cd ../BlueCarbonApp

# Check if port 8081 is available
check_port 8081

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Mobile App dependencies..."
    npm install
    check_status "Mobile App dependency installation"
fi

# Start Metro bundler in background
echo "Starting Metro bundler..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 10

# Start Android app (if device/emulator is connected)
echo "Starting Android app..."
npx react-native run-android &
ANDROID_PID=$!

echo
echo -e "${GREEN}========================================"
echo -e " All Services Started Successfully!"
echo -e "========================================${NC}"
echo
echo -e "${YELLOW}Access Points:${NC}"
echo "- NCCR Portal: http://localhost:3000"
echo "- Mobile App: On connected device/emulator"
echo "- Blockchain: localhost:7051"
echo
echo -e "${YELLOW}Demo Credentials:${NC}"
echo "- Portal Admin: admin@nccr.gov.in / admin123"
echo "- Mobile App: demo@bluecarbon.com / password123"
echo
echo -e "${YELLOW}Process IDs:${NC}"
echo "- NCCR Portal PID: $NCCR_PID"
echo "- Metro Bundler PID: $METRO_PID"
echo "- Android App PID: $ANDROID_PID"
echo

# Function to cleanup on exit
cleanup() {
    echo
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $NCCR_PID 2>/dev/null
    kill $METRO_PID 2>/dev/null
    kill $ANDROID_PID 2>/dev/null
    cd fabric-samples/test-network
    ./network.sh down
    echo -e "${GREEN}All services stopped.${NC}"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

echo -e "${BLUE}========================================"
echo -e " Service Status Monitor"
echo -e "========================================${NC}"
echo
echo "Monitoring services... Press Ctrl+C to stop all services"
echo

# Monitor services
while true; do
    echo -e "${BLUE}$(date): Checking service status...${NC}"
    
    # Check NCCR Portal
    if curl -s http://localhost:3000 >/dev/null; then
        echo -e "${GREEN}✅ NCCR Portal: Running${NC}"
    else
        echo -e "${RED}❌ NCCR Portal: Not responding${NC}"
    fi
    
    # Check Metro bundler
    if curl -s http://localhost:8081/status >/dev/null; then
        echo -e "${GREEN}✅ Metro Bundler: Running${NC}"
    else
        echo -e "${YELLOW}⚠️  Metro Bundler: Not responding${NC}"
    fi
    
    # Check blockchain
    if docker ps | grep -q peer0.org1.example.com; then
        echo -e "${GREEN}✅ Blockchain Network: Running${NC}"
    else
        echo -e "${RED}❌ Blockchain Network: Not running${NC}"
    fi
    
    echo "----------------------------------------"
    sleep 30
done
