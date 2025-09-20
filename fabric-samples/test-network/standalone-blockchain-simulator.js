#!/usr/bin/env node

const http = require('http');
const crypto = require('crypto');

// Simple in-memory blockchain simulation
class SimpleBlockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.projects = new Map();
        this.submissions = new Map();
        this.users = new Map();
        
        // Create genesis block
        this.createGenesisBlock();
        console.log('🔗 Simple Blockchain initialized');
    }

    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0',
            hash: this.calculateHash(0, Date.now(), [], '0'),
            nonce: 0
        };
        this.chain.push(genesisBlock);
    }

    calculateHash(index, timestamp, transactions, previousHash, nonce = 0) {
        return crypto
            .createHash('sha256')
            .update(index + timestamp + JSON.stringify(transactions) + previousHash + nonce)
            .digest('hex');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        console.log(`📝 Transaction added: ${transaction.type} - ${transaction.id}`);
    }

    minePendingTransactions() {
        const block = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousHash: this.getLatestBlock().hash,
            nonce: 0
        };

        // Simple proof of work
        while (block.hash === undefined || !block.hash.startsWith('0')) {
            block.nonce++;
            block.hash = this.calculateHash(
                block.index,
                block.timestamp,
                block.transactions,
                block.previousHash,
                block.nonce
            );
        }

        console.log(`⛏️  Block mined: ${block.hash}`);
        this.chain.push(block);
        this.pendingTransactions = [];
        return block;
    }

    // Blue Carbon specific methods
    createProject(projectData) {
        const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const project = {
            id: projectId,
            ...projectData,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            blockHash: null
        };

        this.projects.set(projectId, project);
        
        const transaction = {
            type: 'CREATE_PROJECT',
            id: projectId,
            data: project,
            timestamp: Date.now()
        };

        this.addTransaction(transaction);
        const block = this.minePendingTransactions();
        project.blockHash = block.hash;

        console.log(`🌱 Project created: ${projectId}`);
        return { projectId, blockHash: block.hash };
    }

    createSubmission(submissionData) {
        const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const submission = {
            id: submissionId,
            ...submissionData,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            blockHash: null
        };

        this.submissions.set(submissionId, submission);
        
        const transaction = {
            type: 'CREATE_SUBMISSION',
            id: submissionId,
            data: submission,
            timestamp: Date.now()
        };

        this.addTransaction(transaction);
        const block = this.minePendingTransactions();
        submission.blockHash = block.hash;

        console.log(`📊 Submission created: ${submissionId}`);
        return { submissionId, blockHash: block.hash };
    }

    getProject(projectId) {
        return this.projects.get(projectId);
    }

    getSubmission(submissionId) {
        return this.submissions.get(submissionId);
    }

    getAllProjects() {
        return Array.from(this.projects.values());
    }

    getAllSubmissions() {
        return Array.from(this.submissions.values());
    }

    getBlockchainInfo() {
        return {
            totalBlocks: this.chain.length,
            totalProjects: this.projects.size,
            totalSubmissions: this.submissions.size,
            latestBlockHash: this.getLatestBlock().hash,
            pendingTransactions: this.pendingTransactions.length
        };
    }
}

// Initialize blockchain
const blockchain = new SimpleBlockchain();

// HTTP Server for API
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // Set JSON response header
    res.setHeader('Content-Type', 'application/json');

    try {
        if (method === 'GET' && path === '/health') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'OK', message: 'Blockchain simulator running' }));
        }
        else if (method === 'GET' && path === '/info') {
            res.writeHead(200);
            res.end(JSON.stringify(blockchain.getBlockchainInfo()));
        }
        else if (method === 'GET' && path === '/projects') {
            res.writeHead(200);
            res.end(JSON.stringify(blockchain.getAllProjects()));
        }
        else if (method === 'GET' && path === '/submissions') {
            res.writeHead(200);
            res.end(JSON.stringify(blockchain.getAllSubmissions()));
        }
        else if (method === 'GET' && path.startsWith('/projects/')) {
            const projectId = path.split('/')[2];
            const project = blockchain.getProject(projectId);
            if (project) {
                res.writeHead(200);
                res.end(JSON.stringify(project));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Project not found' }));
            }
        }
        else if (method === 'POST' && path === '/projects') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    const projectData = JSON.parse(body);
                    const result = blockchain.createProject(projectData);
                    res.writeHead(201);
                    res.end(JSON.stringify(result));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        }
        else if (method === 'POST' && path === '/submissions') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    const submissionData = JSON.parse(body);
                    const result = blockchain.createSubmission(submissionData);
                    res.writeHead(201);
                    res.end(JSON.stringify(result));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        }
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

const PORT = 7051;
server.listen(PORT, () => {
    console.log(`
🌊 Blue Carbon Blockchain Simulator Started!
===============================================
🔗 Blockchain API: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📈 Blockchain Info: http://localhost:${PORT}/info
🌱 Projects API: http://localhost:${PORT}/projects
📋 Submissions API: http://localhost:${PORT}/submissions

Available Endpoints:
- GET  /health          - Health check
- GET  /info            - Blockchain information
- GET  /projects        - List all projects
- POST /projects        - Create new project
- GET  /projects/:id    - Get specific project
- GET  /submissions     - List all submissions
- POST /submissions     - Create new submission

Press Ctrl+C to stop the blockchain simulator
===============================================
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down blockchain simulator...');
    server.close(() => {
        console.log('✅ Blockchain simulator stopped');
        process.exit(0);
    });
});

// Demo data creation
setTimeout(() => {
    console.log('📝 Creating demo data...');
    
    // Create demo project
    blockchain.createProject({
        name: 'Mangrove Restoration Project',
        location: {
            latitude: 19.0760,
            longitude: 72.8777,
            address: 'Mumbai, Maharashtra, India'
        },
        area: 50,
        areaUnit: 'hectares',
        vegetationType: 'MANGROVE',
        saplingsPlanted: 1000,
        createdBy: 'demo@bluecarbon.com'
    });

    // Create demo submission
    blockchain.createSubmission({
        projectId: 'demo_project_1',
        farmerId: 'demo@bluecarbon.com',
        plantType: 'Mangrove',
        numberOfSamples: 25,
        imageHashes: ['hash1', 'hash2', 'hash3'],
        gpsCoordinates: {
            latitude: 19.0760,
            longitude: 72.8777,
            accuracy: 5
        },
        deviceSignature: 'demo_signature'
    });

    console.log('✅ Demo data created');
}, 2000);
