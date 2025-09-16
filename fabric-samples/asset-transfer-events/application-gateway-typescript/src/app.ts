/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers, Network } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = 'mychannel';
const chaincodeName = 'bluecarbon';

// User ID and project ID for the demo
const userId = 'ngo1';
const projectId = 'project1';

const utf8Decoder = new TextDecoder();

// Sample function to parse JSON safely
function parseJson(jsonBytes: Uint8Array): unknown {
    const json = utf8Decoder.decode(jsonBytes);
    return JSON.parse(json);
}

/**
 * This function is used to set up and run the application.
 */
async function main(): Promise<void> {
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

        // Use a fixed block height for the demo
        const blockHeight = BigInt(1);
        console.log(`Starting from block height: ${blockHeight}`);

        // Register a user
        await registerUser(contract);

        // Get the user
        await getUser(contract);

        // Create a project
        await createProject(contract);

        // Get the project
        await getProject(contract);

        // Replay events from the start of the demo
        await replayChaincodeEvents(network, blockHeight);

        console.log('*** Successfully completed all transactions');
    } finally {
        gateway.close();
        client.close();
    }
}

async function registerUser(contract: Contract): Promise<void> {
    console.log(`\n--> Submit Transaction: RegisterUser, ${userId}`);

    await contract.submitTransaction(
        'RegisterUser',
        userId,
        'Jane Smith',
        'NGO', // ✅ Correct role
        'Org1',
        'jane.smith@example.com'
    );

    console.log('\n*** RegisterUser committed successfully');
}

async function getUser(contract: Contract): Promise<void> {
    console.log(`\n--> Evaluate Transaction: GetUser, ${userId}`);

    const resultBytes = await contract.evaluateTransaction('GetUser', userId);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);

    console.log('*** Result:', result);
}

async function createProject(contract: Contract): Promise<void> {
    console.log(`\n--> Submit Transaction: CreateProject, ${projectId}`);

    await contract.submitTransaction(
        'CreateProject',
        projectId,
        'Reforestation Project',
        'Amazon Rainforest',
        '10.123,-67.456',
        'Reforestation',
        '1000',
        userId // ✅ Now will be 'ngo1'
    );

    console.log('\n*** CreateProject committed successfully');
}

async function getProject(contract: Contract): Promise<void> {
    console.log(`\n--> Evaluate Transaction: GetProject, ${projectId}`);

    const resultBytes = await contract.evaluateTransaction('GetProject', projectId);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);

    console.log('*** Result:', result);
}

async function replayChaincodeEvents(network: Network, startBlock: bigint): Promise<void> {
    console.log('\n*** Start chaincode event replay');

    const events = await network.getChaincodeEvents(chaincodeName, {
        startBlock,
    });

    try {
        for await (const event of events) {
            const payload = parseJson(event.payload);
            console.log(`\n<-- Chaincode event replayed: ${event.eventName} -`, payload);

            if (event.eventName === 'GetProject') {
                // Reached the last submitted transaction so break to stop listening for events
                break;
            }
        }
    } finally {
        events.close();
    }
}

/**
 * newGrpcConnection creates a gRPC connection to the Gateway server.
 */
async function newGrpcConnection(): Promise<grpc.Client> {
    const peerEndpoint = 'localhost:7051';
    const tlsRootCert = await fs.readFile(path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {});
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
    // Fix TypeScript error by ensuring files[0] is not undefined
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
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});
