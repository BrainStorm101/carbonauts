# Set version and paths
$VERSION = "1.2"
$PACKAGE_NAME = "blue-carbon-registry-$VERSION.tar.gz"
$CHANNEL_NAME = "mychannel"
$CHAINCODE_NAME = "bluecarbon"
$SEQUENCE = 1  # Increment this if you've committed this version before

# Set path to Fabric binaries
$env:PATH = "${env:PATH};${pwd}\..\..\bin"
$env:FABRIC_CFG_PATH = "${pwd}\..\..\config"

# Package the chaincode
Write-Host "===== Packaging chaincode =====" -ForegroundColor Green
peer lifecycle chaincode package $PACKAGE_NAME `
    --path . `
    --lang node `
    --label "${CHAINCODE_NAME}_${VERSION}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to package chaincode" -ForegroundColor Red
    exit 1
}

Write-Host "===== Chaincode packaged as $PACKAGE_NAME =====" -ForegroundColor Green

# Function to install chaincode on a peer
function Install-Chaincode {
    param (
        [string]$org,
        [string]$peer,
        [string]$tlsRootCert,
        [string]$mspConfigPath,
        [string]$peerAddress
    )
    
    Write-Host "`n===== Installing chaincode on $org =====" -ForegroundColor Green
    $env:CORE_PEER_TLS_ENABLED = "true"
    $env:CORE_PEER_LOCALMSPID = "${org}MSP"
    $env:CORE_PEER_TLS_ROOTCERT_FILE = $tlsRootCert
    $env:CORE_PEER_MSPCONFIGPATH = $mspConfigPath
    $env:CORE_PEER_ADDRESS = $peerAddress
    
    peer lifecycle chaincode install $PACKAGE_NAME
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install chaincode on $org" -ForegroundColor Red
        exit 1
    }
}

# Install on Org1
Install-Chaincode -org "Org1" -peer "peer0.org1.example.com" `
    -tlsRootCert "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt" `
    -mspConfigPath "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp" `
    -peerAddress "localhost:7051"

# Install on Org2
Install-Chaincode -org "Org2" -peer "peer0.org2.example.com" `
    -tlsRootCert "${pwd}\..\..\test-network\organizations\peerOrganizations\org2.example.com\peers\peer0.org2.example.com\tls\ca.crt" `
    -mspConfigPath "${pwd}\..\..\test-network\organizations\peerOrganizations\org2.example.com\users\Admin@org2.example.com\msp" `
    -peerAddress "localhost:9051"

# Query installed chaincode to get package ID
Write-Host "`n===== Querying installed chaincode on Org1 =====" -ForegroundColor Green
$env:CORE_PEER_LOCALMSPID = "Org1MSP"
$env:CORE_PEER_MSPCONFIGPATH = "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp"
$env:CORE_PEER_ADDRESS = "localhost:7051"

$packageInfo = peer lifecycle chaincode queryinstalled | Select-String -Pattern $CHAINCODE_NAME -Context 0,1
$PACKAGE_ID = ($packageInfo -split "Package ID: " | Select-String -Pattern "${CHAINCODE_NAME}" -SimpleMatch | Select-Object -First 1) -replace ", .*$", "" -replace "^.*Package ID: ", ""

if ([string]::IsNullOrEmpty($PACKAGE_ID)) {
    Write-Host "Failed to get package ID" -ForegroundColor Red
    exit 1
}

Write-Host "Package ID: $PACKAGE_ID"

# Function to approve chaincode for an org
function Approve-Chaincode {
    param (
        [string]$org,
        [string]$tlsRootCert,
        [string]$mspConfigPath,
        [string]$peerAddress
    )
    
    Write-Host "`n===== Approving chaincode for $org =====" -ForegroundColor Green
    $env:CORE_PEER_LOCALMSPID = "${org}MSP"
    $env:CORE_PEER_TLS_ROOTCERT_FILE = $tlsRootCert
    $env:CORE_PEER_MSPCONFIGPATH = $mspConfigPath
    $env:CORE_PEER_ADDRESS = $peerAddress
    
    peer lifecycle chaincode approveformyorg `
        -o localhost:7050 `
        --ordererTLSHostnameOverride orderer.example.com `
        --channelID $CHANNEL_NAME `
        --name $CHAINCODE_NAME `
        --version $VERSION `
        --package-id $PACKAGE_ID `
        --sequence $SEQUENCE `
        --tls `
        --cafile "${pwd}\..\..\test-network\organizations\ordererOrganizations\example.com\orderers\orderer.example.com\msp\tlscacerts\tlsca.example.com-cert.pem"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to approve chaincode for $org" -ForegroundColor Red
        exit 1
    }
}

# Approve for Org1
Approve-Chaincode -org "Org1" `
    -tlsRootCert "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt" `
    -mspConfigPath "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp" `
    -peerAddress "localhost:7051"

# Approve for Org2
Approve-Chaincode -org "Org2" `
    -tlsRootCert "${pwd}\..\..\test-network\organizations\peerOrganizations\org2.example.com\peers\peer0.org2.example.com\tls\ca.crt" `
    -mspConfigPath "${pwd}\..\..\test-network\organizations\peerOrganizations\org2.example.com\users\Admin@org2.example.com\msp" `
    -peerAddress "localhost:9051"

# Commit the chaincode
Write-Host "`n===== Committing chaincode =====" -ForegroundColor Green
peer lifecycle chaincode commit `
    -o localhost:7050 `
    --ordererTLSHostnameOverride orderer.example.com `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $VERSION `
    --sequence $SEQUENCE `
    --tls `
    --cafile "${pwd}\..\..\test-network\organizations\ordererOrganizations\example.com\orderers\orderer.example.com\msp\tlscacerts\tlsca.example.com-cert.pem" `
    --peerAddresses localhost:7051 `
    --tlsRootCertFiles "${pwd}\..\..\test-network\organizations\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt" `
    --peerAddresses localhost:9051 `
    --tlsRootCertFiles "${pwd}\..\..\test-network\organizations\peerOrganizations\org2.example.com\peers\peer0.org2.example.com\tls\ca.crt"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit chaincode" -ForegroundColor Red
    exit 1
}

Write-Host "`n===== Chaincode committed successfully! =====" -ForegroundColor Green
Write-Host "Chaincode Name: $CHAINCODE_NAME"
Write-Host "Version: $VERSION"
Write-Host "Sequence: $SEQUENCE"
Write-Host "Package ID: $PACKAGE_ID"

# Query committed chaincode
Write-Host "`n===== Querying committed chaincode =====" -ForegroundColor Green
peer lifecycle chaincode querycommitted `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --cafile "${pwd}\..\..\test-network\organizations\ordererOrganizations\example.com\orderers\orderer.example.com\msp\tlscacerts\tlsca.example.com-cert.pem"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to query committed chaincode" -ForegroundColor Red
    exit 1
}
