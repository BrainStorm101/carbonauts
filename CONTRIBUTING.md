# Contributing to Blue Carbon Registry

Thank you for your interest in contributing to the Blue Carbon Registry project! 🌊

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/blue-carbon-registry.git
   cd blue-carbon-registry
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Android Studio (for mobile development)
- Docker (for blockchain development)
- Git

### Installation
```bash
# Install NCCR Portal dependencies
cd NCCRPortal
npm install

# Install Mobile App dependencies
cd ../BlueCarbonApp
npm install
```

## 📝 Code Style

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for functions

### React/React Native
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries

### Git Commits
- Use conventional commit messages:
  ```
  feat: add new carbon credit calculation
  fix: resolve mobile app crash on login
  docs: update README with new features
  style: format code with prettier
  refactor: simplify blockchain service
  test: add unit tests for user authentication
  ```

## 🧪 Testing

### Mobile App
```bash
cd BlueCarbonApp
npm test
```

### NCCR Portal
```bash
cd NCCRPortal
npm test
```

### Blockchain
```bash
cd fabric-samples/test-network
node standalone-blockchain-simulator.js
```

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update the README** if necessary
5. **Create a pull request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Testing instructions

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment details** (OS, Node.js version, etc.)
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Error messages** or logs

## 💡 Feature Requests

For new features:
- **Describe the problem** you're trying to solve
- **Explain your proposed solution**
- **Consider alternatives** you've thought about
- **Provide mockups** for UI features

## 🏗️ Project Structure

```
blue-carbon-registry/
├── BlueCarbonApp/          # React Native mobile app
├── NCCRPortal/             # React web portal
├── fabric-samples/         # Blockchain implementation
├── .github/                # GitHub workflows
└── docs/                   # Documentation
```

## 🔧 Development Guidelines

### Mobile App (BlueCarbonApp/)
- Follow React Native best practices
- Use TypeScript for type safety
- Implement offline-first architecture
- Add proper error handling
- Test on both Android and iOS

### Web Portal (NCCRPortal/)
- Use Material-UI components
- Implement responsive design
- Add accessibility features
- Optimize for performance
- Test across browsers

### Blockchain (fabric-samples/)
- Follow Hyperledger Fabric conventions
- Write comprehensive chaincode tests
- Document API endpoints
- Ensure security best practices
- Test network configurations

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Community

- **GitHub Discussions** - For questions and ideas
- **Issues** - For bug reports and feature requests
- **Pull Requests** - For code contributions

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for helping make Blue Carbon Registry better! 🌱
