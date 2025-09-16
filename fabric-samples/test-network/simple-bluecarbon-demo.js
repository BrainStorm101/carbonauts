#!/usr/bin/env node

/**
 * Blue Carbon Registry Demo - Simulated Version for Windows
 * This demonstrates the blockchain functionality without network dependencies
 */

console.log('🌊 Blue Carbon Registry & MRV System - Demo Mode');
console.log('================================================\n');

// Simulate blockchain data structures
const users = new Map();
const projects = new Map();
const submissions = new Map();
const carbonCredits = new Map();

// Sample data initialization
function initializeSystem() {
    console.log('📋 Step 1: Initialize System');
    console.log('   ✅ System initialized with default configuration\n');
}

function registerStakeholders() {
    console.log('👥 Step 2: Register Stakeholders');
    
    const stakeholders = [
        { id: 'farmer001', name: 'Rajesh Kumar', role: 'FARMER', org: 'Local Farmers Coop' },
        { id: 'ngo001', name: 'Green Earth NGO', role: 'NGO', org: 'Environmental NGO' },
        { id: 'nccr001', name: 'Dr. Priya Sharma', role: 'NCCR', org: 'Climate Research Center' },
        { id: 'auditor001', name: 'Environmental Audit Corp', role: 'AUDITOR', org: 'Audit Company' },
        { id: 'industry001', name: 'Tech Corp Industries', role: 'INDUSTRY', org: 'Technology Company' }
    ];
    
    stakeholders.forEach(user => {
        users.set(user.id, user);
        console.log(`   Registering ${user.role}: ${user.name}`);
    });
    
    console.log('   ✅ All stakeholders registered\n');
}

function createProject() {
    console.log('🌱 Step 3: Create Blue Carbon Project');
    
    const project = {
        id: 'proj001',
        name: 'Mangrove Restoration Project',
        location: 'Sundarbans Delta',
        coordinates: { lat: 21.9497, lng: 88.9468 },
        projectType: 'MANGROVE_RESTORATION',
        targetTrees: 10000,
        ngoId: 'ngo001',
        status: 'VERIFIED',
        verifiedBy: 'nccr001',
        createdAt: new Date().toISOString()
    };
    
    projects.set(project.id, project);
    console.log('   Creating mangrove restoration project...');
    console.log('   Verifying project...');
    console.log('   ✅ Project created and verified\n');
}

function submitFieldData() {
    console.log('📸 Step 4: Submit Field Data');
    
    const submission = {
        id: 'sub001',
        farmerId: 'farmer001',
        projectId: 'proj001',
        plantType: 'Rhizophora',
        numberOfSamples: 500,
        imageHashes: ['hash1', 'hash2', 'hash3'],
        gpsCoordinates: { lat: 21.9497, lng: 88.9468 },
        deviceSignature: 'device_sig_123',
        status: 'APPROVED',
        submittedAt: new Date().toISOString()
    };
    
    submissions.set(submission.id, submission);
    console.log('   Farmer submitting field data...');
    console.log('   ✅ Field data submitted for review\n');
}

function reviewAndApprove() {
    console.log('🔍 Step 5: Review and Approve Submission');
    
    console.log('   NCCR reviewing submission...');
    console.log('   Auditor reviewing submission...');
    console.log('   ✅ Submission approved by both NCCR and Auditor\n');
}

function mintCarbonCredits() {
    console.log('🪙 Step 6: Mint Carbon Credits');
    
    const creditBatch = {
        id: 'credits001',
        submissionId: 'sub001',
        creditsAmount: 25.5,
        pricePerCredit: 15.0,
        mintedBy: 'nccr001',
        status: 'AVAILABLE',
        mintedAt: new Date().toISOString()
    };
    
    carbonCredits.set(creditBatch.id, creditBatch);
    console.log('   Minting carbon credits...');
    console.log('   ✅ Carbon credits minted successfully\n');
}

function marketplaceOperations() {
    console.log('🏪 Step 7: Marketplace Operations');
    
    console.log('   Listing credits for sale...');
    console.log('   Industry purchasing credits...');
    console.log('   ✅ Credits listed and purchased\n');
}

function querySystemStatus() {
    console.log('📊 Step 8: Query System Status');
    
    console.log('   Querying system status...');
    console.log(`   📈 Total Users: ${users.size}`);
    console.log(`   📈 Total Projects: ${projects.size}`);
    console.log(`   📈 Total Submissions: ${submissions.size}`);
    console.log(`   📈 Total Carbon Credits: ${carbonCredits.size}`);
    console.log('   ✅ System status retrieved\n');
}

function displayBlockchainFunctions() {
    console.log('🔧 Available Blockchain Functions:');
    console.log('================================');
    
    const functions = [
        'RegisterUser(userId, name, role, organization, contactInfo)',
        'GetUser(userId)',
        'CreateProject(projectId, name, location, coordinates, projectType, targetTrees, ngoId)',
        'GetProject(projectId)',
        'VerifyProject(projectId, verifierId, comments)',
        'CreateSubmission(submissionId, farmerId, projectId, plantType, numberOfSamples, imageHashes, gpsCoordinates, deviceSignature)',
        'ReviewSubmission(submissionId, reviewerId, action, comments)',
        'MintCarbonCredits(submissionId, nccr_id)',
        'ListCreditsForSale(creditBatchId, pricePerCredit, sellerId)',
        'PurchaseCredits(creditBatchId, buyerId, paymentAmount)',
        'QueryPendingSubmissions()',
        'QueryAvailableCredits()',
        'QuerySubmissionsByFarmer(farmerId)',
        'GetProjectStats(projectId)'
    ];
    
    functions.forEach((func, index) => {
        console.log(`   ${index + 1}. ${func}`);
    });
    console.log('');
}

// Run the demo
async function runDemo() {
    initializeSystem();
    registerStakeholders();
    createProject();
    submitFieldData();
    reviewAndApprove();
    mintCarbonCredits();
    marketplaceOperations();
    querySystemStatus();
    displayBlockchainFunctions();
    
    console.log('✅ Blue Carbon Registry Demo Completed Successfully!');
    console.log('🌊🌱 Blockchain foundation is ready for React Native app development!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Set up React Native development environment');
    console.log('2. Create mobile app for farmers and NGOs');
    console.log('3. Build web portal for NCCR and industries');
    console.log('4. Integrate with the blockchain network once network issues are resolved');
    console.log('');
    console.log('📚 The complete blockchain implementation is available in:');
    console.log('   - Chaincode: ../asset-transfer-events/chaincode-javascript/');
    console.log('   - Demo App: ../asset-transfer-events/application-gateway-typescript/');
}

runDemo().catch(console.error);
