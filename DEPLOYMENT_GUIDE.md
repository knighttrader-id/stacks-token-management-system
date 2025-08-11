# Deployment Guide - Token Management System

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy the environment template
cp env.example .env

# Edit .env with your actual mnemonic
nano .env
```

### 2. Deploy to Testnet
```bash
./scripts/deploy-testnet.sh
```

### 3. Deploy to Mainnet (when ready)
```bash
./scripts/deploy-mainnet.sh
```

## 🔧 How It Works

### The Problem
Clarinet doesn't natively support environment variable substitution in TOML files using `${VAR}` syntax. This caused the error:
```
error: mnemonic (located in ./settings/Testnet.toml) for deploying address is invalid: 
mnemonic has an invalid word count: 1. Word count must be 12, 15, 18, 21, or 24
```

### The Solution
We use a dynamic configuration approach:

1. **Template Files**: Configuration files contain placeholders like `"PLACEHOLDER_TESTNET_MNEMONIC"`
2. **Setup Script**: `scripts/setup-config.sh` temporarily replaces placeholders with actual mnemonics
3. **Deployment**: Clarinet uses the temporarily updated config files
4. **Cleanup**: Scripts restore template configs for security

### Security Features
- ✅ **No Exposed Mnemonics**: Config files never contain real mnemonics in version control
- ✅ **Temporary Replacement**: Real mnemonics only exist during deployment
- ✅ **Automatic Cleanup**: Templates restored after deployment
- ✅ **Environment Variables**: Mnemonics stored securely in `.env` files

## 📋 Available Scripts

### `./scripts/generate-deployment.sh`
```bash
# Generate testnet deployment plan
./scripts/generate-deployment.sh testnet

# Generate testnet deployment plan with low cost
./scripts/generate-deployment.sh testnet --low-cost

# Generate mainnet deployment plan (with confirmation)
./scripts/generate-deployment.sh mainnet
```

### `./scripts/setup-config.sh`
```bash
# Setup both testnet and mainnet configs
./scripts/setup-config.sh setup

# Setup only testnet config
./scripts/setup-config.sh testnet

# Setup only mainnet config  
./scripts/setup-config.sh mainnet

# Restore template configs (remove mnemonics)
./scripts/setup-config.sh restore
```

### `./scripts/deploy-testnet.sh`
- Loads environment variables from `.env`
- Sets up testnet configuration
- Runs contract check
- Deploys to testnet
- Restores template configurations

### `./scripts/deploy-mainnet.sh`
- Confirmation prompt for mainnet deployment
- Loads environment variables from `.env`
- Sets up mainnet configuration
- Runs contract check
- Deploys to mainnet
- Restores template configurations

## 🔍 Troubleshooting

### Error: "TESTNET_MNEMONIC environment variable is not set"
**Solution**: Create or update your `.env` file:
```bash
cp env.example .env
# Edit .env and add your mnemonic
```

### Error: "mnemonic has an invalid word count"
**Solution**: Ensure your mnemonic in `.env` has 12, 15, 18, 21, or 24 words:
```bash
# Check your mnemonic word count
echo $TESTNET_MNEMONIC | wc -w
```

### Error: "Permission denied"
**Solution**: Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Error: Contract deployment fails
**Solutions**:
1. Check you have sufficient STX for deployment fees
2. Verify your mnemonic corresponds to the correct address
3. Ensure you're on the correct network (testnet/mainnet)

## 🌐 Network Information

### Testnet
- **RPC**: https://stacks-node-api.testnet.stacks.co
- **Explorer**: https://explorer.stacks.co/?chain=testnet
- **Faucet**: https://explorer.stacks.co/sandbox/faucet

### Mainnet
- **RPC**: https://api.hiro.so
- **Explorer**: https://explorer.stacks.co/

## 📝 Manual Deployment Process

If you prefer manual control:

```bash
# 1. Setup configuration
./scripts/setup-config.sh testnet

# 2. Check contracts
clarinet check

# 3. Deploy
clarinet deployments apply --testnet

# 4. Cleanup (important for security)
./scripts/setup-config.sh restore
```

## ⚠️ Important Security Notes

1. **Never commit `.env` files** - they're in `.gitignore` for a reason
2. **Always run restore** after manual deployment to remove mnemonics from config files  
3. **Use different mnemonics** for testnet and mainnet
4. **Keep mainnet mnemonics secure** - consider hardware wallets for production
5. **Test on testnet first** before any mainnet deployment

## 🎯 Contract Addresses

After successful deployment, you'll see output like:
```
✅ simple-token deployed at ST3M6R2V839TT2JKDXWT8W8869VFZB3G9WS529TVA.simple-token
```

Update your UI configuration with this address in:
`../token-management-system-ui/src/config/constants.ts`
