#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Service configuration
const services = [
    {
        name: 'NCCR Portal',
        url: 'http://localhost:3000',
        port: 3000,
        type: 'web'
    },
    {
        name: 'Metro Bundler',
        url: 'http://localhost:8081/status',
        port: 8081,
        type: 'metro'
    },
    {
        name: 'API Gateway',
        url: 'http://localhost:8080/health',
        port: 8080,
        type: 'api'
    },
    {
        name: 'Blockchain Peer',
        port: 7051,
        type: 'blockchain'
    },
    {
        name: 'CouchDB',
        url: 'http://localhost:5984',
        port: 5984,
        type: 'database'
    }
];

// Check if a service is running
async function checkService(service) {
    return new Promise((resolve) => {
        if (service.type === 'blockchain') {
            // Check blockchain using docker
            exec('docker ps | grep peer0.org1.example.com', (error, stdout) => {
                resolve({
                    ...service,
                    status: stdout.includes('peer0.org1.example.com') ? 'running' : 'stopped',
                    responseTime: 0
                });
            });
        } else if (service.url) {
            // Check HTTP services
            const startTime = Date.now();
            const req = http.get(service.url, { timeout: 5000 }, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    ...service,
                    status: res.statusCode < 400 ? 'running' : 'error',
                    responseTime,
                    statusCode: res.statusCode
                });
            });

            req.on('error', () => {
                resolve({
                    ...service,
                    status: 'stopped',
                    responseTime: Date.now() - startTime
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    ...service,
                    status: 'timeout',
                    responseTime: Date.now() - startTime
                });
            });
        } else {
            resolve({
                ...service,
                status: 'unknown',
                responseTime: 0
            });
        }
    });
}

// Get system information
async function getSystemInfo() {
    return new Promise((resolve) => {
        exec('docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"', (error, stdout) => {
            const dockerStats = error ? 'Docker not available' : stdout;
            
            exec('node --version', (error, nodeVersion) => {
                exec('npm --version', (error, npmVersion) => {
                    resolve({
                        nodeVersion: nodeVersion?.trim() || 'Not available',
                        npmVersion: npmVersion?.trim() || 'Not available',
                        dockerStats: dockerStats.split('\n').slice(0, 6).join('\n')
                    });
                });
            });
        });
    });
}

// Display service status
function displayStatus(services, systemInfo) {
    console.clear();
    
    // Header
    console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                Blue Carbon Registry - Service Monitor        ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
    
    console.log(`${colors.blue}Last Updated: ${new Date().toLocaleString()}${colors.reset}\n`);
    
    // Services status
    console.log(`${colors.bright}Service Status:${colors.reset}`);
    console.log('─'.repeat(70));
    
    services.forEach(service => {
        const statusColor = service.status === 'running' ? colors.green : 
                          service.status === 'stopped' ? colors.red : 
                          service.status === 'timeout' ? colors.yellow : colors.magenta;
        
        const statusIcon = service.status === 'running' ? '✅' : 
                          service.status === 'stopped' ? '❌' : 
                          service.status === 'timeout' ? '⏱️' : '❓';
        
        const responseTime = service.responseTime ? `(${service.responseTime}ms)` : '';
        const statusCode = service.statusCode ? `[${service.statusCode}]` : '';
        
        console.log(`${statusIcon} ${service.name.padEnd(20)} ${statusColor}${service.status.toUpperCase()}${colors.reset} ${responseTime} ${statusCode}`);
    });
    
    // System information
    console.log(`\n${colors.bright}System Information:${colors.reset}`);
    console.log('─'.repeat(70));
    console.log(`Node.js Version: ${colors.green}${systemInfo.nodeVersion}${colors.reset}`);
    console.log(`NPM Version: ${colors.green}${systemInfo.npmVersion}${colors.reset}`);
    
    // Docker stats
    if (systemInfo.dockerStats !== 'Docker not available') {
        console.log(`\n${colors.bright}Docker Container Stats:${colors.reset}`);
        console.log('─'.repeat(70));
        console.log(systemInfo.dockerStats);
    }
    
    // Quick actions
    console.log(`\n${colors.bright}Quick Actions:${colors.reset}`);
    console.log('─'.repeat(70));
    console.log(`${colors.yellow}• NCCR Portal:${colors.reset} http://localhost:3000`);
    console.log(`${colors.yellow}• Mobile App:${colors.reset} Connected device/emulator`);
    console.log(`${colors.yellow}• Blockchain Explorer:${colors.reset} http://localhost:7051`);
    console.log(`${colors.yellow}• CouchDB Fauxton:${colors.reset} http://localhost:5984/_utils`);
    
    console.log(`\n${colors.bright}Demo Credentials:${colors.reset}`);
    console.log('─'.repeat(70));
    console.log(`${colors.cyan}Portal Admin:${colors.reset} admin@nccr.gov.in / admin123`);
    console.log(`${colors.cyan}Mobile App:${colors.reset} demo@bluecarbon.com / password123`);
    
    console.log(`\n${colors.magenta}Press Ctrl+C to exit monitoring${colors.reset}`);
}

// Main monitoring loop
async function monitor() {
    try {
        const [serviceStatuses, systemInfo] = await Promise.all([
            Promise.all(services.map(checkService)),
            getSystemInfo()
        ]);
        
        displayStatus(serviceStatuses, systemInfo);
    } catch (error) {
        console.error(`${colors.red}Error monitoring services:${colors.reset}`, error.message);
    }
}

// Start monitoring
console.log(`${colors.blue}Starting Blue Carbon Registry Service Monitor...${colors.reset}`);

// Initial check
monitor();

// Monitor every 10 seconds
const interval = setInterval(monitor, 10000);

// Cleanup on exit
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Stopping service monitor...${colors.reset}`);
    clearInterval(interval);
    process.exit(0);
});

process.on('SIGTERM', () => {
    clearInterval(interval);
    process.exit(0);
});
