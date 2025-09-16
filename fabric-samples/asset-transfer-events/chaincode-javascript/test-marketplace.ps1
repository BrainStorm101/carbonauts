# Test Script for Blue Carbon Registry Marketplace Functions
# This script tests the marketplace functionality including listing and purchasing credits

# Set environment variables for Org1
echo "Setting up environment for Org1..."
$env:CORE_PEER_TLS_ENABLED = "true"
$env:CORE_PEER_LOCALMSPID = "Org1MSP"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp"
$env:CORE_PEER_ADDRESS = "localhost:7051"

# Chaincode and channel settings
$CHANNEL_NAME = "mychannel"
$CHAINCODE_NAME = "bluecarbon"

# Test data
$FARMER_ID = "farmer001"
$NGO_ID = "ngo001"
$NCCR_ID = "nccr001"
$INDUSTRY_ID = "industry001"
$PROJECT_ID = "proj001"
$SUBMISSION_ID = "sub001"
$CREDIT_BATCH_ID = "credit001"

# Function to execute a chaincode command
function Invoke-Chaincode {
    param (
        [string]$functionName,
        [string[]]$args
    )
    
    $argsString = $args -join '", "'
    $command = "peer chaincode invoke -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{\"function\":\"$functionName\",\"Args\":[\"$argsString\"]}' --waitForEvent"
    
    Write-Host "`nExecuting: $functionName" -ForegroundColor Cyan
    Write-Host "Command: $command" -ForegroundColor Gray
    
    Invoke-Expression $command
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error executing $functionName" -ForegroundColor Red
        exit 1
    }
}

# Function to query chaincode
function Query-Chaincode {
    param (
        [string]$functionName,
        [string[]]$args
    )
    
    $argsString = $args -join '", "'
    $command = "peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{\"function\":\"$functionName\",\"Args\":[\"$argsString\"]}'"
    
    Write-Host "`nQuerying: $functionName" -ForegroundColor Cyan
    Write-Host "Command: $command" -ForegroundColor Gray
    
    $result = Invoke-Expression $command
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error querying $functionName" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Result: $result" -ForegroundColor Green
    return $result
}

# Test 1: Register Users
echo "`n=== Registering Users ===" -ForegroundColor Yellow
Invoke-Chaincode "RegisterUser" @("$FARMER_ID", "John Farmer", "FARMER", "Local Community", "john@farmer.com")
Invoke-Chaincode "RegisterUser" @("$NGO_ID", "Green Earth NGO", "NGO", "Environmental Org", "contact@greenearth.org")
Invoke-Chaincode "RegisterUser" @("$NCCR_ID", "NCCR Official", "NCCR", "Government", "nccr@gov.in")
Invoke-Chaincode "RegisterUser" @("$INDUSTRY_ID", "Eco Corp", "INDUSTRY", "Manufacturing", "contact@ecocorp.com")

# Test 2: Create Project
echo "`n=== Creating Project ===" -ForegroundColor Yellow
$projectLocation = '{"lat":22.5,"lng":89.0}'
Invoke-Chaincode "CreateProject" @("$PROJECT_ID", "Mangrove Restoration", "Sundarbans", "$projectLocation", "MANGROVE", "1000", "$NGO_ID")

# Test 3: Create and Approve Submission
echo "`n=== Creating and Approving Submission ===" -ForegroundColor Yellow
$imageHashes = '["QmHash1","QmHash2"]'
$gpsCoordinates = '{"lat":22.5001,"lng":89.0001}'
$deviceSignature = "device_sig_123"

Invoke-Chaincode "CreateSubmission" @("$SUBMISSION_ID", "$FARMER_ID", "$PROJECT_ID", "MANGROVE", "50", "$imageHashes", "$gpsCoordinates", "$deviceSignature")
Invoke-Chaincode "ReviewSubmission" @("$SUBMISSION_ID", "$NCCR_ID", "APPROVE", "Submission looks good")

# Test 4: Mint Carbon Credits
echo "`n=== Minting Carbon Credits ===" -ForegroundColor Yellow
Invoke-Chaincode "MintCarbonCredits" @("$SUBMISSION_ID", "$NCCR_ID")

# Test 5: List Credits for Sale
echo "`n=== Listing Credits for Sale ===" -ForegroundColor Yellow
$pricePerCredit = "10"
Invoke-Chaincode "ListCreditsForSale" @("$CREDIT_BATCH_ID", "$pricePerCredit", "$FARMER_ID")

# Test 6: Query Available Credits
echo "`n=== Querying Available Credits ===" -ForegroundColor Yellow
Query-Chaincode "QueryAvailableCredits" @()

# Test 7: Purchase Credits
echo "`n=== Purchasing Credits ===" -ForegroundColor Yellow
$paymentAmount = "100"
Invoke-Chaincode "PurchaseCredits" @("$CREDIT_BATCH_ID", "$INDUSTRY_ID", "$paymentAmount")

# Test 8: Verify Credit Ownership
echo "`n=== Verifying Credit Ownership ===" -ForegroundColor Yellow
Query-Chaincode "QueryCreditsByIndustry" @("$INDUSTRY_ID")

echo "`n=== Marketplace Test Completed Successfully! ===" -ForegroundColor Green
