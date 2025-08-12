# 🪙 EduCoin Token System

> **A complete fungible token system built on Internet Computer Protocol**

## 🎯 **Overview**

EduCoin is a fully functional fungible token system demonstrating modern blockchain development on the Internet Computer. It features secure authentication, real-time token operations, and a professional user interface.

## 🚀 **Quick Start**

```bash
# 1. Setup prerequisites
./scripts/setup.sh

# 2. Deploy locally  
./scripts/deploy.sh local

# 3. Access the application
# Visit: http://[canister-id].localhost:4943/
```

## ✨ **Key Features**

### 🏦 **Token System**
- **EduCoin (EDU)** with 1,000,000 initial supply
- **Secure transfers** between users with validation
- **Creator-only minting** with access control
- **Balance checking** for any Principal ID
- **Live token explorer** with search and rankings
- **Persistent storage** with stable memory

### 🔐 **Authentication**
- **Internet Identity** integration for secure login
- **Principal-based** user identification
- **Anonymous** and privacy-focused authentication
- **Role-based access** control (creator privileges)

### 💻 **User Experience**
- **Modern React/Next.js** frontend
- **TailwindCSS** styling with responsive design
- **Real-time updates** after all transactions
- **Comprehensive error handling** with user feedback
- **Intuitive tab-based** navigation

## 🏗️ **Architecture**

### Backend (Rust Canister)
- Rust canister with stable memory for persistence
- Standard token operations: transfer, mint, balance
- Role-based access control for minting
- Uses `ic-stable-structures` for upgrade safety

### Frontend (Next.js/React)
- Modern React components with TypeScript
- Internet Identity authentication integration
- Real-time UI updates with error handling
- TailwindCSS for responsive styling

## 🎮 **Demo Scenarios**

### **Scenario 1: Token Explorer**
- View all token holders with rankings
- See creator with initial 1M EDU tokens
- Search for specific users
- Real-time balance updates

### **Scenario 2: Multi-User Testing**
1. **Login as Creator** - Access all features including minting
2. **Open Incognito Browser** - Create second user account  
3. **Mint Tokens** - Send tokens to new user as creator
4. **Test Transfers** - Move tokens between accounts
5. **Watch Live Updates** - See changes across all interfaces

### **Scenario 3: Access Control**
- **Creator privileges**: Mint tab accessible, creator badge shown
- **Regular users**: Transfer and balance checking only
- **Input validation**: Handles invalid Principal IDs gracefully

## Technical Details

### Token Contract Functions

```rust
// Query functions
get_token_info() -> TokenInfo          // Get token name, symbol, supply, creator
get_balance(Principal) -> u64          // Get balance for any account
get_total_supply() -> u64              // Get total token supply
get_all_users() -> Vec<UserInfo>       // Get all token holders
is_creator(Principal) -> bool          // Check if account is creator

// Update functions
transfer(to: Principal, amount: u64) -> TransferResult  // Transfer tokens
mint(to: Principal, amount: u64) -> MintResult          // Mint new tokens (creator only)
```

### Data Structures

```rust
TokenInfo {
    name: String,           // "EduCoin"
    symbol: String,         // "EDU" 
    total_supply: u64,      // Current total supply
    creator: Principal,     // Creator's Principal ID
}

UserInfo {
    principal: Principal,   // User's Principal ID
    balance: u64,          // Token balance
}
```

### Memory Layout

- **Memory 0**: Token metadata (name, symbol, total supply, creator)
- **Memory 1**: User balances (Principal -> Balance mapping)

Uses `ic-stable-structures` for automatic persistence across upgrades.

## Development

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Backend Development

```bash
# Test Rust code
cd src/fungible_token_backend
cargo test

# Check Rust code
cargo check --target wasm32-unknown-unknown

# Generate Candid interface
dfx generate fungible_token_backend
```

### Common Development Tasks

#### Update canister code
```bash
# After making changes to Rust code
dfx deploy fungible_token_backend

# After making changes to frontend
npm run build
dfx deploy fungible_token_frontend
```

#### Reset local state
```bash
# Stop replica and start fresh
dfx stop
dfx start --background --clean
dfx deploy
```

#### Check canister logs
```bash
# View backend logs
dfx canister logs fungible_token_backend

# View frontend logs  
dfx canister logs fungible_token_frontend
```

## Security Features

- **Internet Identity** for secure, anonymous authentication
- **Principal-based** access control
- **Creator-only minting** to prevent unauthorized token creation
- **Input validation** for all user inputs
- **Stable memory** for secure data persistence
- **Error handling** to prevent invalid operations


## Troubleshooting

### Common Issues

**"Failed to load user data"**
- Check that canister IDs are set in environment variables
- Verify canisters are deployed and running
- Check browser console for detailed errors

**"Invalid Principal ID"**  
- Ensure Principal ID format is correct
- Copy/paste Principal IDs to avoid typos
- Use "Use my Principal ID" buttons when available

**Login issues**
- Try clearing browser cache/cookies
- Ensure Internet Identity service is accessible
- Check that you're using the correct II anchor

**Canister not found**
- Verify canister IDs in environment files
- Redeploy canisters if necessary
- Check dfx.json configuration

### Development Issues

**Rust compilation errors**
- Ensure wasm32-unknown-unknown target is installed
- Check Rust version compatibility
- Review Cargo.toml dependencies

**Frontend build errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (should be v18+)
- Verify all environment variables are set

## Contributing

This is an internship project demonstrating ICP development best practices:

- Modern Rust canister with stable memory
- React/Next.js frontend with TailwindCSS
- Internet Identity authentication
- Comprehensive error handling
- Production deployment ready

## License

This project is for educational purposes as part of an internship program.
