# Encrypted Trust Score Tracker

A privacy-preserving application for couples to record and track trust events using Fully Homomorphic Encryption (FHE). Built with FHEVM protocol by Zama, this application allows users to record trust scores, view encrypted statistics, and decrypt their personal trust history while keeping all data private.

## 🌐 Live Demo

**Web Application**: [https://marriage-black.vercel.app/](https://marriage-black.vercel.app/)

**Demo Video**: [View demonstration video](./heritage.mp4)

## 📋 Contract Information

**Testnet**: Sepolia

**TrustScoreTracker Contract Address**: `0xe54e516948093F126290F985d7c2658f38DF1124`

**FHECounter Contract Address**: `0xCa5E0de301dD2439E6652919dC8C9550E57aD7A7`

**Network**: Ethereum Sepolia Testnet

**Block Explorer**:
- [TrustScoreTracker on Etherscan](https://sepolia.etherscan.io/address/0xe54e516948093F126290F985d7c2658f38DF1124)
- [FHECounter on Etherscan](https://sepolia.etherscan.io/address/0xCa5E0de301dD2439E6652919dC8C9550E57aD7A7)

## ✨ Features

### Core FHE Functionality
- **Encrypted Trust Recording**: Record trust events with scores (1-10) encrypted before storage using FHEVM
- **Private Statistics**: View encrypted total scores, event counts, and averages without exposing data
- **Decrypt History**: Decrypt and view personal trust score history with wallet signature
- **Fully Homomorphic Encryption**: All mathematical operations (sum, average) performed on encrypted data

### Security & Privacy
- **Zero-Knowledge Operations**: Trust scores remain encrypted throughout all operations
- **User-Only Decryption**: Only the user can decrypt their own trust scores
- **Audit Trail**: Comprehensive event logging for transparency
- **Access Control**: User-specific data isolation and permissions

### Enhanced User Experience
- **Rainbow Wallet Integration**: Seamless wallet connection and transaction handling
- **Input Validation**: Comprehensive validation for trust score range (1-10) with real-time feedback
- **Keyboard Navigation**: Enter key support for quick score submission
- **Timeout Protection**: 30-second timeout protection for decryption operations
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Real-time Feedback**: Loading states, progress indicators, and error messages
- **Error Recovery**: Graceful error handling with user-friendly recovery options

### Developer Experience
- **Type Safety**: Custom TypeScript types for trust score operations and better development experience
- **Gas Optimization**: Optimized FHE operations by caching variables and reducing redundant calculations

## 🚀 Deployment Instructions

### Prerequisites
- Node.js v18+
- npm or yarn
- Git
- MetaMask or Rainbow Wallet

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/wawsyy/pro24.git
   cd pro24
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy and configure environment files
   cp .env.example .env
   # Add your private keys and API keys
   ```

4. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

5. **Deploy contracts**
   ```bash
   npx hardhat deploy --network localhost
   ```

6. **Start frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

### Production Deployment

1. **Deploy to Sepolia testnet**
   ```bash
   npx hardhat deploy --network sepolia
   ```

2. **Build frontend for production**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Vercel/Netlify**
   ```bash
   # Configure your hosting platform with the built files
   ```
- **Comprehensive Testing**: Full test coverage including edge cases, limits, and integration tests
- **Error Handling**: Improved error messages, recovery mechanisms, and user feedback
- **Code Quality**: ESLint, Prettier, and comprehensive linting rules
- **Build Optimization**: Production build scripts with type checking and analysis
- **Deployment Automation**: Automated deployment scripts with verification

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager
- **Rainbow Wallet**: Browser extension wallet

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network (in another terminal)
   npx hardhat deploy --network localhost
   # Generate ABI files for frontend
   cd frontend
   npm run genabi
   ```

5. **Run the frontend**

   ```bash
   cd frontend
   npm run dev:mock
   ```

6. **Deploy to Sepolia Testnet** (Optional - contracts already deployed)

   ```bash
   # Deploy to Sepolia (if needed)
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   # Generate ABI files for frontend
   cd frontend
   npm run genabi
   ```

   **Note**: The TrustScoreTracker contract is already deployed on Sepolia testnet at address `0xe54e516948093F126290F985d7c2658f38DF1124`. You can use the live demo without deploying your own contracts.

## 📁 Project Structure

```
pro24/
├── contracts/                    # Smart contract source files
│   ├── FHECounter.sol           # Example FHE counter contract
│   └── TrustScoreTracker.sol    # Main FHE trust score tracker contract
├── deploy/                       # Hardhat deployment scripts
│   └── deploy.ts                 # Multi-contract deployment script
├── tasks/                        # Hardhat custom tasks
├── test/                         # Comprehensive test suite
│   ├── FHECounter.ts             # FHECounter local tests
│   ├── FHECounterSepolia.ts      # FHECounter Sepolia integration tests
│   ├── TrustScoreTracker.ts      # TrustScoreTracker local tests
│   └── TrustScoreTrackerSepolia.ts # TrustScoreTracker Sepolia tests
├── frontend/                     # Next.js React application
│   ├── app/                      # App router directory
│   │   ├── globals.css           # Global styles with utility classes
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Main application page
│   │   ├── providers.tsx         # React context providers
│   │   └── not-found.tsx         # 404 error page
│   ├── components/               # Reusable React components
│   │   ├── TrustScoreTrackerDemo.tsx # Main trust score demo
│   │   ├── FHECounterDemo.tsx    # FHE counter demonstration
│   │   ├── ErrorNotDeployed.tsx  # Network error handling
│   │   ├── NavBar.tsx            # Navigation component
│   │   └── NetworkToggle.tsx     # Network switching UI
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTrustScoreTracker.tsx # Trust score tracker logic
│   │   ├── useFHECounter.tsx     # FHE counter logic
│   │   ├── useInMemoryStorage.tsx # Local storage utilities
│   │   └── rainbow/              # Rainbow wallet integration
│   │       ├── useRainbowEthersSigner.tsx
│   │       └── useRainbowProvider.tsx
│   ├── fhevm/                    # FHEVM utilities and types
│   │   ├── useFhevm.tsx          # FHEVM provider hook
│   │   ├── FhevmDecryptionSignature.ts
│   │   └── types.ts              # FHEVM type definitions
│   └── abi/                      # Auto-generated contract ABIs
├── artifacts/                    # Hardhat compilation artifacts (ABI, bytecode)
├── cache/                        # Compilation cache for faster builds
├── types/                        # Generated TypeScript definitions for contracts
├── fhevmTemp/                    # FHEVM temporary configuration files
├── deployments/                  # Contract deployment information and addresses
│   ├── localhost/                # Local development deployments
│   └── sepolia/                  # Sepolia testnet deployments
├── hardhat.config.ts            # Hardhat configuration with plugins
├── heritage.mp4                  # Project demonstration video
├── package.json                  # Dependencies and npm scripts
└── tsconfig.json                 # TypeScript configuration
```

## 📜 Available Scripts

### Backend Scripts
| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run compile`         | Compile all contracts                |
| `npm run test`            | Run all local tests                  |
| `npm run test:sepolia`    | Run tests on Sepolia testnet         |
| `npm run test:full`       | Run both local and Sepolia tests     |
| `npm run test:gas`        | Run tests with gas reporting         |
| `npm run coverage`        | Generate coverage report             |
| `npm run lint`            | Run linting checks                   |
| `npm run lint:fix`        | Run linting and auto-fix issues      |
| `npm run clean`           | Clean build artifacts                |
| `npm run clean:deploy`    | Clean and redeploy locally           |
| `npm run deploy:local`    | Deploy to local network              |
| `npm run deploy:sepolia`  | Deploy to Sepolia testnet            |
| `npm run verify:sepolia`  | Verify contract on Etherscan         |

### Frontend Scripts
| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Start development server             |
| `npm run dev:mock`        | Start with mock FHEVM environment    |
| `npm run dev:webpack`     | Start with Webpack (alternative)     |
| `npm run build`           | Build for production                 |
| `npm run build:production`| Build with type check and lint       |
| `npm run build:analyze`   | Build with bundle analysis            |
| `npm run start`           | Start production server              |
| `npm run preview`         | Build and preview locally            |
| `npm run lint`            | Run ESLint                           |
| `npm run lint:fix`        | Run ESLint and auto-fix              |
| `npm run type-check`      | Run TypeScript type checking         |
| `npm run genabi`          | Generate contract ABIs for frontend  |
| `npm run ishhrunning`     | Check if Hardhat node is running     |

## 🎯 Usage

### Recording Trust Events

1. Connect your Rainbow wallet
2. Enter a trust score between 1-10
3. Click "Record Trust Event"
4. Confirm the transaction in your wallet

### Viewing Trust Statistics

- **Total Score**: Sum of all recorded trust scores (encrypted)
- **Event Count**: Number of trust events recorded
- **Average Score**: Average of all trust scores (encrypted)

### Decrypting Scores

Click "Decrypt Scores" to decrypt and view your personal trust history. This operation requires your wallet signature and decrypts the data locally.

## 🔧 Development Features

### Code Improvements Made

- **Enhanced Input Validation**: Added comprehensive validation for trust score range (1-10) with real-time feedback and duplicate logic removal
- **Timeout Protection**: Implemented 30-second timeout for decryption operations to prevent hanging
- **Gas Optimization**: Optimized FHE operations by caching variables and reducing redundant calculations in average score computation
- **Error Handling**: Improved error messages, recovery mechanisms, and user feedback throughout the application
- **Type Safety**: Added custom TypeScript types for trust score operations, decryption request types, and better development experience
- **UI/UX Improvements**: Enhanced keyboard navigation (Enter key support), visual feedback, responsive design, and new CSS utility classes
- **Testing Coverage**: Added comprehensive test cases including edge cases, limits, maximum event enforcement (1000 events), and integration tests
- **Documentation**: Extensive inline documentation, troubleshooting guides, deployment instructions, and contract event logging
- **Build Process**: Added production build scripts, code analysis, deployment automation, and npm script convenience commands
- **Contract Auditing**: Added decryption request event logging for better audit trails and transparency
- **Performance**: Optimized frontend rendering, state management, and bundle analysis
- **Security**: Enhanced access control, user data isolation, and comprehensive validation

### Contract Features

- **Trust Score Tracking**: Encrypted storage of trust events with scores 1-10
- **Encrypted Operations**: Sum and average calculations performed on encrypted data
- **Event Logging**: Comprehensive event logging for audit trails
- **Access Control**: User-specific data isolation and permissions
- **Limit Enforcement**: Maximum 1000 trust events per user to prevent abuse

### Frontend Features

- **Rainbow Wallet Integration**: Seamless wallet connection and transaction handling
- **Real-time Feedback**: Loading states and progress indicators
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Error Recovery**: Graceful error handling with user-friendly messages
- **Performance**: Optimized rendering and state management

## 🔒 Privacy & Security

- All trust scores are encrypted using FHE before being stored on-chain
- Only you can decrypt your personal trust scores
- Encrypted operations (sum, average) are performed without decrypting the data
- No third party can view your trust event details

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

**Contract not deployed error**
```
Error: Contract not deployed on this network
```
- Ensure you're connected to the correct network (Sepolia for testnet)
- Run `npm run deploy:sepolia` to deploy contracts
- Check that your wallet is connected to the same network

**FHEVM initialization failed**
```
FHEVM initialization failed. Please check the error message above and try again.
```
- Make sure Rainbow wallet is installed and connected
- Try refreshing the page
- Check browser console for more detailed error messages

**Transaction failed**
```
Transaction reverted: Maximum trust events reached
```
- The contract limits users to 1000 trust events maximum
- Consider starting a new account or contact support for limit increase

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

## 📈 Development History

This project was developed through a simulated collaborative workflow with 21 commits over 7 days (November 10-16, 2025), demonstrating professional development practices including:

- **Incremental Development**: Progressive feature implementation and bug fixes
- **Code Quality**: Comprehensive testing, linting, and type safety
- **Documentation**: Detailed README, inline comments, and troubleshooting guides
- **Deployment**: Automated deployment scripts and production builds
- **Security**: Privacy-preserving FHE operations and access control
- **User Experience**: Responsive design and comprehensive error handling

### Contributors
- **LauraCommons** (lceekhjf76931@outlook.com) - Full-stack development, contract design, testing, and deployment

---

**Built with ❤️ using FHEVM by Zama**
