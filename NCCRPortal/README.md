# NCCR Portal - Blue Carbon Registry MRV System

A comprehensive web portal for the National Centre for Coastal Research (NCCR) to manage the Blue Carbon Registry's Monitoring, Reporting, and Verification (MRV) system.

## Features

### 🔐 Authentication & Security
- Email/password login with 2FA support
- Role-based access control (Admin, Verifier, Analyst)
- Secure session management
- Permission-based feature access

### 📊 Dashboard & Analytics
- Real-time system overview
- Project and submission statistics
- Performance metrics and KPIs
- Interactive charts and visualizations
- Recent activity tracking

### 🌿 Project Management
- Comprehensive project review system
- GPS location verification
- Evidence review (photos, drone data)
- Project approval/rejection workflow
- Detailed project analytics

### ✅ MRV Panel (Monitoring, Reporting, Verification)
- Submission review and verification
- Multi-party approval process
- Data quality assessment
- Additional data requests
- Carbon credit award calculations

### 💰 Carbon Credit Management
- Credit minting and issuance
- Serial number generation
- Transfer and retirement tracking
- Market value monitoring
- Certificate generation

### 👥 User Management
- KYC verification workflow
- User role management
- Registration approval
- Activity monitoring
- Compliance tracking

### 📈 Advanced Analytics
- Regional performance analysis
- Vegetation type distribution
- Carbon sequestration trends
- Interactive maps with project locations
- Exportable reports

## Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Charts**: Recharts
- **Maps**: React Leaflet
- **State Management**: React Context API
- **Build Tool**: Create React App
- **Styling**: Emotion (CSS-in-JS)

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern web browser

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Layout.tsx     # Main app layout
│   └── ProtectedRoute.tsx
├── contexts/          # React Context providers
│   ├── AuthContext.tsx
│   └── BlockchainContext.tsx
├── pages/             # Application pages
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MRVPage.tsx
│   ├── ProjectsPage.tsx
│   ├── CarbonCreditsPage.tsx
│   ├── AnalyticsPage.tsx
│   └── UsersPage.tsx
├── services/          # API services
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_BLOCKCHAIN_GATEWAY_URL=localhost:7051
REACT_APP_BLOCKCHAIN_CHANNEL_NAME=mychannel
REACT_APP_BLOCKCHAIN_CHAINCODE_NAME=bluecarbon
```

## Demo Credentials

For testing the portal, use these demo accounts:

### Administrator
- **Email**: admin@nccr.gov.in
- **Password**: admin123
- **Permissions**: Full system access

### MRV Verifier
- **Email**: verifier@nccr.gov.in
- **Password**: verify123
- **Permissions**: Project and submission verification

### Data Analyst
- **Email**: analyst@nccr.gov.in
- **Password**: analyze123
- **Permissions**: Analytics and reporting

## Key Features

### MRV Workflow
1. **Project Submission**: Field teams submit projects via mobile app
2. **Initial Review**: NCCR staff review project documentation
3. **Site Verification**: GPS coordinates and evidence validation
4. **Approval/Rejection**: Decision with detailed feedback
5. **Monitoring**: Ongoing data submission and verification
6. **Credit Issuance**: Carbon credits minted upon verification

### Dashboard Metrics
- Total projects and their status distribution
- Pending reviews and verification queue
- Carbon credits issued and market value
- User registration and KYC statistics
- Regional performance comparisons

### Analytics Capabilities
- Monthly trends and performance tracking
- Vegetation type distribution analysis
- Carbon sequestration projections
- Regional impact assessment
- User activity and engagement metrics

## API Integration

### Blockchain Integration
The portal integrates with Hyperledger Fabric for:
- Immutable project records
- Transparent verification process
- Carbon credit tokenization
- Audit trail maintenance

### Data Management
- Real-time synchronization with mobile apps
- Secure document storage
- Automated report generation
- Export capabilities (PDF, Excel, CSV)

## Security Features

### Access Control
- Role-based permissions
- Session timeout management
- Audit logging
- Secure API endpoints

### Data Protection
- Encrypted data transmission
- Secure file uploads
- Privacy compliance
- Backup and recovery

## Deployment

### Development
```bash
npm start
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build
# Creates optimized build in 'build' folder
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build/ ./build/
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Monitoring & Logging

### Application Monitoring
- Performance metrics
- Error tracking
- User activity logs
- System health checks

### Business Metrics
- Project approval rates
- Verification turnaround times
- Carbon credit issuance volume
- User engagement statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request
5. Code review and merge

## Compliance

### Standards Adherence
- ISO 14064 for carbon accounting
- Verra VCS methodology
- Gold Standard requirements
- National carbon registry guidelines

### Audit Requirements
- Complete transaction logs
- Verification documentation
- Compliance reporting
- Regular system audits

## Support & Documentation

### Resources
- User Manual: `/docs/user-manual.pdf`
- API Documentation: `/docs/api-reference.md`
- System Architecture: `/docs/architecture.md`
- Deployment Guide: `/docs/deployment.md`

### Contact
- Technical Support: tech-support@nccr.gov.in
- System Admin: admin@nccr.gov.in
- Documentation: docs@nccr.gov.in

## License

This project is developed for the National Centre for Coastal Research (NCCR), Ministry of Earth Sciences, Government of India.

## Acknowledgments

- Ministry of Earth Sciences, Government of India
- National Centre for Coastal Research (NCCR)
- Blue Carbon Initiative
- Hyperledger Fabric Community
