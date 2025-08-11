# Token Management System

A secure token management system built on the Stacks blockchain, implementing the SIP-010 fungible token standard.

## 🔐 Security First Setup

### 1. Environment Variables

**IMPORTANT**: Never commit mnemonics to version control!

1. **Create your environment file**:
   ```bash
   cp env.example .env
   ```

2. **Add your actual mnemonic to `.env`**:
   ```bash
   TESTNET_MNEMONIC="your actual testnet mnemonic phrase here"
   MAINNET_MNEMONIC="your actual mainnet mnemonic phrase here"
   ```

3. **Verify `.env` is in `.gitignore`** (it should be already)

### 2. Quick Deployment

**For Testnet** (recommended for testing):
```bash
# Ensure your .env file has TESTNET_MNEMONIC set
./scripts/deploy-testnet.sh
```

**For Mainnet** (production):
```bash
# Ensure your .env file has MAINNET_MNEMONIC set
./scripts/deploy-mainnet.sh
```

**Note**: The scripts automatically handle config file generation and cleanup for security.

### 3. Manual Deployment

If you prefer manual control:

```bash
# Setup config with environment variables
./scripts/setup-config.sh testnet

# Check contracts
clarinet check

# Deploy to testnet
clarinet deployments apply --testnet

# Restore template configs (for security)
./scripts/setup-config.sh restore
```

## 📋 Project Structure

```
token-management-system/
├── contracts/
│   └── simple-token.clar          # Main token contract
├── tests/
│   ├── simple-token.test.ts       # Comprehensive tests
│   └── simple-token-basic.test.ts # Basic functionality tests
├── settings/
│   ├── Testnet.toml              # Testnet configuration (uses env vars)
│   ├── Mainnet.toml              # Mainnet configuration (uses env vars)
│   └── Devnet.toml               # Local development
├── scripts/
│   ├── deploy-testnet.sh         # Secure testnet deployment
│   └── deploy-mainnet.sh         # Secure mainnet deployment
├── deployments/
│   ├── default.testnet-plan.yaml # Testnet deployment plan
│   └── default.simnet-plan.yaml  # Simnet deployment plan
├── env.example                   # Environment variables template
├── SECURITY.md                   # Security best practices
└── README.md                     # This file
```

## 🪙 Token Details

- **Name**: Stack Bootcamp Token
- **Symbol**: SBT
- **Decimals**: 6
- **Standard**: SIP-010 Fungible Token
- **Features**: Transfer, Mint (owner-only), Burn

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm install
npm test
```

Tests cover:
- ✅ Token metadata (name, symbol, decimals)
- ✅ Minting functionality (owner-only)
- ✅ Transfer operations
- ✅ Burn operations
- ✅ Access control validation
- ✅ Edge cases and error handling

## 🔧 Development Commands

```bash
# Check contract syntax
clarinet check

# Run tests
npm test

# Start local devnet
clarinet devnet start

# Interactive console
clarinet console

# Check deployment plans
clarinet deployments generate --network testnet
```

## 🌐 Network Configuration

### Testnet
- **Network**: Stacks Testnet
- **RPC**: https://stacks-node-api.testnet.stacks.co
- **Explorer**: https://explorer.stacks.co/?chain=testnet

### Mainnet
- **Network**: Stacks Mainnet  
- **RPC**: https://api.hiro.so
- **Explorer**: https://explorer.stacks.co/

## 🛡️ Security Features

- ✅ Environment variable protection for mnemonics
- ✅ Gitignore configuration for sensitive files
- ✅ Owner-only mint functions
- ✅ Sender validation for transfers and burns
- ✅ Balance validation for burn operations
- ✅ Comprehensive error handling

## 📖 Smart Contract Functions

### Read-Only Functions
- `get-name()` - Returns token name
- `get-symbol()` - Returns token symbol  
- `get-decimals()` - Returns decimal places
- `get-balance(user)` - Returns user's token balance
- `get-total-supply()` - Returns total token supply
- `get-token-uri()` - Returns token metadata URI

### Public Functions
- `transfer(amount, from, to, memo)` - Transfer tokens
- `mint(amount, to)` - Mint new tokens (owner only)
- `burn(amount, from)` - Burn tokens (sender only)

## 🚨 Security Best Practices

1. **Never commit mnemonics** to version control
2. **Use different mnemonics** for testnet and mainnet
3. **Keep mainnet mnemonics secure** and backed up
4. **Test on testnet first** before mainnet deployment
5. **Use hardware wallets** for mainnet when possible

## 🔗 Related Projects

- **UI Application**: `../token-management-system-ui/`
- **Stacks Documentation**: https://docs.stacks.co/
- **SIP-010 Standard**: https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md

## 📄 License

This project is for educational purposes as part of the Stacks Bootcamp.

---

**⚠️ Important**: Always test on testnet before deploying to mainnet. Keep your mnemonics secure and never share them publicly.
