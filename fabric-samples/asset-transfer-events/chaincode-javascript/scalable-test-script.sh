#!/bin/bash

# Blue Carbon Registry - Scalable Testing Script
# Generates unique IDs and tests end-to-end workflow with state verification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHANNEL_NAME="mychannel"
CHAINCODE_NAME="bluecarbon"
TIMESTAMP=$(date +%s)
TEST_RUN_ID="test_${TIMESTAMP}"

echo -e "${BLUE}🌊 Blue Carbon Registry - Scalable Testing Script${NC}"
echo -e "${BLUE}Test Run ID: ${TEST_RUN_ID}${NC}"
echo "=================================================="

# Function to generate unique IDs
generate_user_id() {
    local role=$1
    local org_num=$2
    echo "${role,,}${org_num}_${TIMESTAMP}"
}

generate_project_id() {
    local project_num=$1
    echo "proj${project_num}_${TIMESTAMP}"
}

generate_submission_id() {
    local farmer_id=$1
    local seq_num=$2
    echo "sub_${farmer_id}_${seq_num}"
}

# Function to invoke chaincode with error handling
invoke_chaincode() {
    local function_name=$1
    local args=$2
    local description=$3
    
    echo -e "${YELLOW}📋 ${description}${NC}"
    echo "Function: ${function_name}"
    echo "Args: ${args}"
    
    if peer chaincode invoke -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"function\":\"${function_name}\",\"Args\":${args}}" --waitForEvent; then
        echo -e "${GREEN}✅ SUCCESS: ${description}${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED: ${description}${NC}"
        return 1
    fi
}

# Function to query chaincode
query_chaincode() {
    local function_name=$1
    local args=$2
    local description=$3
    
    echo -e "${YELLOW}🔍 ${description}${NC}"
    
    if result=$(peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"function\":\"${function_name}\",\"Args\":${args}}"); then
        echo -e "${GREEN}✅ QUERY SUCCESS: ${description}${NC}"
        echo "Result: $result"
        return 0
    else
        echo -e "${RED}❌ QUERY FAILED: ${description}${NC}"
        return 1
    fi
}

# Function to verify user exists
verify_user_exists() {
    local user_id=$1
    echo -e "${BLUE}🔍 Verifying user ${user_id} exists...${NC}"
    
    if query_chaincode "GetUser" "[\"${user_id}\"]" "Verify user ${user_id}"; then
        echo -e "${GREEN}✅ User ${user_id} confirmed on ledger${NC}"
        return 0
    else
        echo -e "${RED}❌ User ${user_id} NOT found on ledger${NC}"
        return 1
    fi
}

# Main testing workflow
main() {
    echo -e "${BLUE}🚀 Starting scalable testing workflow...${NC}"
    
    # Generate unique user IDs for this test run
    FARMER1=$(generate_user_id "farmer" "001")
    FARMER2=$(generate_user_id "farmer" "002")
    NGO1=$(generate_user_id "ngo" "001")
    NCCR1=$(generate_user_id "nccr" "001")
    INDUSTRY1=$(generate_user_id "industry" "001")
    
    PROJECT1=$(generate_project_id "001")
    SUBMISSION1=$(generate_submission_id $FARMER1 "001")
    SUBMISSION2=$(generate_submission_id $FARMER2 "001")
    
    echo -e "${BLUE}📝 Generated IDs for this test run:${NC}"
    echo "Farmer 1: $FARMER1"
    echo "Farmer 2: $FARMER2"
    echo "NGO 1: $NGO1"
    echo "NCCR 1: $NCCR1"
    echo "Industry 1: $INDUSTRY1"
    echo "Project 1: $PROJECT1"
    echo "Submission 1: $SUBMISSION1"
    echo "Submission 2: $SUBMISSION2"
    echo ""
    
    # Step 1: Register Users
    echo -e "${BLUE}📋 STEP 1: User Registration${NC}"
    
    invoke_chaincode "RegisterUser" "[\"${FARMER1}\",\"John Doe\",\"FARMER\",\"Local Community\",\"john@example.com\"]" "Register Farmer 1"
    verify_user_exists $FARMER1
    
    invoke_chaincode "RegisterUser" "[\"${FARMER2}\",\"Jane Smith\",\"FARMER\",\"Coastal Community\",\"jane@example.com\"]" "Register Farmer 2"
    verify_user_exists $FARMER2
    
    invoke_chaincode "RegisterUser" "[\"${NGO1}\",\"Green Earth NGO\",\"NGO\",\"Environmental Org\",\"contact@greenearth.org\"]" "Register NGO"
    verify_user_exists $NGO1
    
    invoke_chaincode "RegisterUser" "[\"${NCCR1}\",\"NCCR Official\",\"NCCR\",\"Government Authority\",\"nccr@gov.in\"]" "Register NCCR"
    verify_user_exists $NCCR1
    
    invoke_chaincode "RegisterUser" "[\"${INDUSTRY1}\",\"Tech Corp\",\"INDUSTRY\",\"Technology Company\",\"procurement@techcorp.com\"]" "Register Industry"
    verify_user_exists $INDUSTRY1
    
    # Step 2: Create Project
    echo -e "${BLUE}📋 STEP 2: Project Creation${NC}"
    
    invoke_chaincode "CreateProject" "[\"${PROJECT1}\",\"Mangrove Restoration Sundarbans\",\"Sundarbans, West Bengal\",\"{\\\"lat\\\":22.5,\\\"lng\\\":89.0}\",\"MANGROVE\",\"1000\",\"${NGO1}\"]" "Create Project"
    
    query_chaincode "GetProject" "[\"${PROJECT1}\"]" "Verify Project Created"
    
    # Step 3: Create Submissions
    echo -e "${BLUE}📋 STEP 3: Data Submissions${NC}"
    
    invoke_chaincode "CreateSubmission" "[\"${SUBMISSION1}\",\"${FARMER1}\",\"${PROJECT1}\",\"MANGROVE\",\"50\",\"[\\\"QmHash1\\\",\\\"QmHash2\\\"]\",\"{\\\"lat\\\":22.5001,\\\"lng\\\":89.0001}\",\"device_signature_abc123\"]" "Create Submission 1"
    
    invoke_chaincode "CreateSubmission" "[\"${SUBMISSION2}\",\"${FARMER2}\",\"${PROJECT1}\",\"MANGROVE\",\"30\",\"[\\\"QmHash3\\\",\\\"QmHash4\\\"]\",\"{\\\"lat\\\":22.5002,\\\"lng\\\":89.0002}\",\"device_signature_def456\"]" "Create Submission 2"
    
    # Step 4: Review Submissions
    echo -e "${BLUE}📋 STEP 4: Submission Review${NC}"
    
    invoke_chaincode "ReviewSubmission" "[\"${SUBMISSION1}\",\"${NCCR1}\",\"APPROVE\",\"Verified coordinates and images\"]" "Review Submission 1"
    
    invoke_chaincode "ReviewSubmission" "[\"${SUBMISSION2}\",\"${NCCR1}\",\"APPROVE\",\"Good quality data\"]" "Review Submission 2"
    
    # Step 5: Mint Credits
    echo -e "${BLUE}📋 STEP 5: Carbon Credit Minting${NC}"
    
    # Capture credit batch IDs from minting
    echo "Minting credits for submission 1..."
    CREDIT_RESULT1=$(peer chaincode invoke -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"function\":\"MintCarbonCredits\",\"Args\":[\"${SUBMISSION1}\",\"${NCCR1}\"]}" --waitForEvent 2>&1)
    echo "Mint result 1: $CREDIT_RESULT1"
    
    echo "Minting credits for submission 2..."
    CREDIT_RESULT2=$(peer chaincode invoke -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"function\":\"MintCarbonCredits\",\"Args\":[\"${SUBMISSION2}\",\"${NCCR1}\"]}" --waitForEvent 2>&1)
    echo "Mint result 2: $CREDIT_RESULT2"
    
    # Step 6: Query Results
    echo -e "${BLUE}📋 STEP 6: Final Verification${NC}"
    
    query_chaincode "QueryPendingSubmissions" "[]" "Check Pending Submissions"
    query_chaincode "GetProjectStats" "[\"${PROJECT1}\"]" "Get Project Statistics"
    query_chaincode "QueryAvailableCredits" "[]" "Check Available Credits"
    
    # Test duplicate user registration (should fail)
    echo -e "${BLUE}📋 STEP 7: Test Duplicate Prevention${NC}"
    
    echo -e "${YELLOW}🧪 Testing duplicate user registration (should fail)...${NC}"
    if invoke_chaincode "RegisterUser" "[\"${FARMER1}\",\"Duplicate User\",\"FARMER\",\"Test Org\",\"test@example.com\"]" "Test Duplicate User Registration"; then
        echo -e "${RED}❌ ERROR: Duplicate user registration should have failed!${NC}"
    else
        echo -e "${GREEN}✅ SUCCESS: Duplicate user registration correctly prevented${NC}"
    fi
    
    echo -e "${GREEN}🎉 Test run ${TEST_RUN_ID} completed successfully!${NC}"
    echo -e "${BLUE}📊 Summary:${NC}"
    echo "- Users registered: 5"
    echo "- Projects created: 1" 
    echo "- Submissions created: 2"
    echo "- Submissions approved: 2"
    echo "- Credits minted: 2 batches"
    echo ""
    echo -e "${YELLOW}💡 All IDs were unique for this test run. You can run this script multiple times safely.${NC}"
}

# Run main function
main "$@"
