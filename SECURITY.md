# Security Guide for Token Management System

## 🔐 Protecting Your Mnemonics

### Environment Variables Setup

1. **Create your `.env` file**:
   ```bash
   cp env.example .env
   ```

2. **Add your actual mnemonic**:
   ```bash
   # Edit .env file
   TESTNET_MNEMONIC="your actual testnet mnemonic phrase here"
   MAINNET_MNEMONIC="your actual mainnet mnemonic phrase here"
   ```

3. **Export environment variables** (for current session):
   ```bash
   export TESTNET_MNEMONIC="your actual testnet mnemonic phrase here"
   export MAINNET_MNEMONIC="your actual mainnet mnemonic phrase here"
   ```

### Using Environment Variables with Clarinet

**Important**: Clarinet doesn't natively support `${VAR}` substitution in TOML files. Instead, we use a configuration setup script that creates temporary config files with the actual mnemonics during deployment.

The configuration files use placeholders:
- `settings/Testnet.toml` uses `"PLACEHOLDER_TESTNET_MNEMONIC"`
- `settings/Mainnet.toml` uses `"PLACEHOLDER_MAINNET_MNEMONIC"`

During deployment, these are temporarily replaced with actual mnemonics from environment variables.

### Deployment Commands

**For Testnet (Recommended):**
```bash
# Use the deployment script (handles config setup automatically)
./scripts/deploy-testnet.sh
```

**For Mainnet:**
```bash
# Use the deployment script (with confirmation prompt)
./scripts/deploy-mainnet.sh
```

**Manual Deployment (Advanced):**
```bash
# Setup config with environment variables
./scripts/setup-config.sh testnet

# Deploy to testnet
clarinet deployments apply --testnet

# Restore template configs (for security)
./scripts/setup-config.sh restore
```

### Alternative: Using .env file

If you prefer using a `.env` file, you can load it before running commands:

```bash
# Load .env file and run command
set -a; source .env; set +a; clarinet deployments apply --testnet
```

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Data
- ✅ `.env` files are in `.gitignore`
- ✅ Settings files are in `.gitignore`
- ❌ Never commit mnemonics to version control

### 2. Use Different Mnemonics
- **Testnet**: Use a separate mnemonic for testing
- **Mainnet**: Use your secure, backed-up mnemonic for production

### 3. Environment Separation
- Keep testnet and mainnet mnemonics separate
- Use different wallets for development and production

### 4. Backup Your Mnemonics
- Store mnemonics securely offline
- Use hardware wallets for mainnet deployments when possible

### 5. Rotation Strategy
- Rotate testnet mnemonics regularly
- Keep mainnet mnemonics stable and secure

## 🚨 What to Do If Mnemonic is Exposed

1. **Immediately transfer funds** to a new wallet
2. **Generate a new mnemonic** 
3. **Update your configuration** with the new mnemonic
4. **Redeploy contracts** if necessary

## 📝 Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `TESTNET_MNEMONIC` | Testnet deployment wallet | Yes (for testnet) |
| `MAINNET_MNEMONIC` | Mainnet deployment wallet | Yes (for mainnet) |
| `TESTNET_RPC_URL` | Custom testnet RPC endpoint | Optional |
| `MAINNET_RPC_URL` | Custom mainnet RPC endpoint | Optional |

## 🔍 Checking Your Setup

Verify your environment variables are set:
```bash
echo $TESTNET_MNEMONIC
echo $MAINNET_MNEMONIC
```

**Note**: Be careful not to expose these in logs or command history!
