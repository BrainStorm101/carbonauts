/*
 * Blue Carbon Registry & MRV System - Complete Demo
 * This demonstrates the full end-to-end workflow
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = 'mychannel';
const chaincodeName = 'bluecarbon';

const utf8Decoder = new TextDecoder();

// Sample function to parse JSON safely (currently unused but kept for future use)
// function parseJson(jsonBytes: Uint8Array): unknown {
//     const json = utf8Decoder.decode(jsonBytes);
//     return JSON.parse(json);
// }

/**
 * Complete Blue Carbon Registry Demo
 */
async function main(): Promise<void> {
    console.log('🌊 Starting Blue Carbon Registry & MRV System Demo\n');

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        console.log('📋 Step 1: Initialize System');
        await initializeSystem(contract);

        console.log('\n👥 Step 2: Register Stakeholders');
        await registerStakeholders(contract);

        console.log('\n🌱 Step 3: Create Blue Carbon Project');
        await createBlueCarbonProject(contract);

        console.log('\n📸 Step 4: Submit Field Data');
        await submitFieldData(contract);

        console.log('\n🔍 Step 5: Review and Approve Submission');
        await reviewSubmission(contract);

        console.log('\n🪙 Step 6: Mint Carbon Credits');
        await mintCarbonCredits(contract);

        console.log('\n🏪 Step 7: Marketplace Operations');
        await marketplaceOperations(contract);

        console.log('\n📊 Step 8: Query System Status');
        await querySystemStatus(contract);

        console.log('\n✅ Blue Carbon Registry Demo Completed Successfully!');
        console.log('🌊🌱 Ready for React Native app development!');

    } finally {
        gateway.close();
        client.close();
    }
}

async function initializeSystem(contract: Contract): Promise<void> {
    console.log('   Initializing Blue Carbon Registry system...');
    
    try {
        await contract.submitTransaction('InitLedger');
        console.log('   ✅ System initialized with default configuration');
    } catch (error) {
        console.log('   ℹ️  System already initialized or error:', error);
    }
}

async function registerStakeholders(contract: Contract): Promise<void> {
    const stakeholders = [
        {
            id: 'farmer001',
            name: 'Rajesh Kumar',
            role: 'FARMER',
            organization: 'Sundarbans Community',
            contact: 'rajesh@sundarbans.org'
        },
        {
            id: 'ngo001',
            name: 'Green Earth NGO',
            role: 'NGO',
            organization: 'Environmental Conservation Society',
            contact: 'contact@greenearth.org'
        },
        {
            id: 'nccr001',
            name: 'Dr. Priya Sharma',
            role: 'NCCR',
            organization: 'National Carbon Credit Registry',
            contact: 'priya.sharma@nccr.gov.in'
        },
        {
            id: 'industry001',
            name: 'Tech Corp Industries',
            role: 'INDUSTRY',
            organization: 'Technology Company',
            contact: 'procurement@techcorp.com'
        }
    ];

    for (const stakeholder of stakeholders) {
        console.log(`   Registering ${stakeholder.role}: ${stakeholder.name}`);
        await contract.submitTransaction(
            'RegisterUser',
            stakeholder.id,
            stakeholder.name,
            stakeholder.role,
            stakeholder.organization,
            stakeholder.contact
        );
    }
    console.log('   ✅ All stakeholders registered');
}

async function createBlueCarbonProject(contract: Contract): Promise<void> {
    console.log('   Creating mangrove restoration project...');
    
    const projectData = {
        projectId: 'proj001',
        name: 'Sundarbans Mangrove Restoration',
        location: 'Sundarbans, West Bengal, India',
        coordinates: JSON.stringify({
            lat: 22.5,
            lng: 89.0,
            boundary: [
                { lat: 22.4, lng: 88.9 },
                { lat: 22.6, lng: 88.9 },
                { lat: 22.6, lng: 89.1 },
                { lat: 22.4, lng: 89.1 }
            ]
        }),
        projectType: 'MANGROVE',
        targetTrees: '1000',
        ngoId: 'ngo001'
    };

    await contract.submitTransaction(
        'CreateProject',
        projectData.projectId,
        projectData.name,
        projectData.location,
        projectData.coordinates,
        projectData.projectType,
        projectData.targetTrees,
        projectData.ngoId
    );

    // Verify the project
    console.log('   Verifying project...');
    await contract.submitTransaction(
        'VerifyProject',
        projectData.projectId,
        'nccr001',
        'Project verified for mangrove restoration in Sundarbans'
    );

    console.log('   ✅ Project created and verified');
}

async function submitFieldData(contract: Contract): Promise<void> {
    console.log('   Farmer submitting field data...');
    
    const submissionData = {
        submissionId: 'sub001',
        farmerId: 'farmer001',
        projectId: 'proj001',
        plantType: 'MANGROVE',
        numberOfSamples: '50',
        imageHashes: JSON.stringify([
            'QmHash1_mangrove_planting',
            'QmHash2_gps_verification',
            'QmHash3_community_work'
        ]),
        gpsCoordinates: JSON.stringify({
            lat: 22.5001,
            lng: 89.0001,
            accuracy: 5
        }),
        deviceSignature: 'device_signature_abc123'
    };

    await contract.submitTransaction(
        'CreateSubmission',
        submissionData.submissionId,
        submissionData.farmerId,
        submissionData.projectId,
        submissionData.plantType,
        submissionData.numberOfSamples,
        submissionData.imageHashes,
        submissionData.gpsCoordinates,
        submissionData.deviceSignature
    );

    console.log('   ✅ Field data submitted for review');
}

async function reviewSubmission(contract: Contract): Promise<void> {
    console.log('   NCCR reviewing submission...');
    
    // NCCR approval
    await contract.submitTransaction(
        'ReviewSubmission',
        'sub001',
        'nccr001',
        'APPROVE',
        'Excellent mangrove plantation work. GPS coordinates verified with satellite data. Field verification completed. All data authentic and verified.'
    );

    console.log('   ✅ Submission approved by NCCR');
}

async function mintCarbonCredits(contract: Contract): Promise<void> {
    console.log('   Minting carbon credits...');
    
    await contract.submitTransaction(
        'MintCarbonCredits',
        'sub001',
        'nccr001'
    );

    console.log('   ✅ Carbon credits minted successfully');
}

async function marketplaceOperations(contract: Contract): Promise<void> {
    console.log('   Querying available credits...');
    
    // First, query for available credits to get the actual credit batch ID
    const availableCreditsBytes = await contract.evaluateTransaction('QueryAvailableCredits');
    const availableCredits = JSON.parse(utf8Decoder.decode(availableCreditsBytes));
    
    if (availableCredits.length === 0) {
        console.log('   ⚠️  No credits available for sale');
        return;
    }
    
    const creditBatchId = availableCredits[0].Record.creditBatchId;
    console.log(`   Found credit batch: ${creditBatchId}`);
    
    console.log('   Listing credits for sale...');
    
    // List credits for sale
    await contract.submitTransaction(
        'ListCreditsForSale',
        creditBatchId,
        '25.00', // Price per credit
        'ngo001'
    );

    console.log('   Industry purchasing credits...');
    
    // Purchase credits
    await contract.submitTransaction(
        'PurchaseCredits',
        creditBatchId,
        'industry001',
        '1250.00' // Total payment (50 credits * 25.00)
    );

    console.log('   ✅ Credits listed and purchased');
}

async function querySystemStatus(contract: Contract): Promise<void> {
    console.log('   Querying system status...');
    
    // Get project stats
    const projectStats = await contract.evaluateTransaction('GetProjectStats', 'proj001');
    console.log('   📊 Project Stats:', JSON.parse(utf8Decoder.decode(projectStats)));

    // Get pending submissions
    const pendingSubmissions = await contract.evaluateTransaction('QueryPendingSubmissions');
    console.log('   📋 Pending Submissions:', JSON.parse(utf8Decoder.decode(pendingSubmissions)));

    // Get available credits
    const availableCredits = await contract.evaluateTransaction('QueryAvailableCredits');
    console.log('   🪙 Available Credits:', JSON.parse(utf8Decoder.decode(availableCredits)));

    // Get all users
    const allUsers = await contract.evaluateTransaction('GetAllEntities', 'user');
    console.log('   👥 Registered Users:', JSON.parse(utf8Decoder.decode(allUsers)));

    console.log('   ✅ System status retrieved');
}

/**
 * newGrpcConnection creates a gRPC connection to the Gateway server.
 */
async function newGrpcConnection(): Promise<grpc.Client> {
    const peerEndpoint = 'localhost:7051';
    const tlsRootCert = await fs.readFile(path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.keepalive_time_ms': 120000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
        'grpc.http2.min_ping_interval_without_data_ms': 300000
    });
}

/**
 * newIdentity creates a client identity for this Gateway connection using an X.509 certificate.
 */
async function newIdentity(): Promise<Identity> {
    const mspId = 'Org1MSP';
    const certPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem');
    const cert = await fs.readFile(certPath);
    return { mspId, credentials: cert };
}

/**
 * newSigner creates a client signer for this Gateway connection using a private key.
 */
async function newSigner(): Promise<Signer> {
    const keystorePath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'User1@org1.example.com', 'msp', 'keystore');
    const files = await fs.readdir(keystorePath);
    if (files.length === 0) {
        throw new Error(`No private keys found in ${keystorePath}`);
    }
    const keyFile = files[0];
    if (!keyFile) {
        throw new Error(`No private key file found in ${keystorePath}`);
    }
    const keyPath = path.resolve(keystorePath, keyFile);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * main program entry point.
 */
main().catch(error => {
    console.error('❌ FAILED to run the Blue Carbon demo:', error);
    process.exitCode = 1;
});
