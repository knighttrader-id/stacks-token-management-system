# Troubleshooting Guide

## Common Deployment Issues

### 1. "ContractAlreadyExists" Error

**Error Message:**
```
Error publishing transactions: unable to post transaction
{"error":"transaction rejected","reason":"ContractAlreadyExists","reason_data":{"contract_identifier":"ST3M6R2V839TT2JKDXWT8W8869VFZB3G9WS529TVA.simple-token"}}
```

**Cause:** The contract is already deployed to the network with the same address and name.

**Solutions:**
1. **Use a different contract name** in `Clarinet.toml`:
   ```toml
   [contracts.simple-token-v2]
   path = "contracts/simple-token.clar"
   ```

2. **Use a different deployer address** (different mnemonic)

3. **Deploy to a different network** (if testing)

4. **This is normal** if you've already successfully deployed - your contract is live!

### 2. "unrecognized subcommand 'deploy'" Error

**Error Message:**
```
error: unrecognized subcommand 'deploy'
tip: some similar subcommands exist: 'deployments', 'deployment'
```

**Cause:** Using old Clarinet command syntax.

**Solution:** Use the correct command:
```bash
# ❌ Old (doesn't work)
clarinet deploy --network testnet

# ✅ Correct
clarinet deployments apply --testnet
```

### 3. "mnemonic has an invalid word count" Error

**Error Message:**
```
error: mnemonic (located in ./settings/Testnet.toml) for deploying address is invalid: 
mnemonic has an invalid word count: 1. Word count must be 12, 15, 18, 21, or 24
```

**Cause:** Configuration file has placeholder instead of actual mnemonic.

**Solution:** Run the setup script first:
```bash
./scripts/setup-config.sh testnet
# Then run your command
clarinet deployments apply --testnet
# Don't forget to restore
./scripts/setup-config.sh restore
```

### 4. "TESTNET_MNEMONIC environment variable is not set"

**Cause:** Missing or incorrect `.env` file.

**Solutions:**
1. **Create `.env` file:**
   ```bash
   cp env.example .env
   ```

2. **Add your mnemonic to `.env`:**
   ```
   TESTNET_MNEMONIC="your 12 or 24 word mnemonic phrase here"
   ```

3. **Check mnemonic word count:**
   ```bash
   echo $TESTNET_MNEMONIC | wc -w
   ```

### 5. "Permission denied" on Scripts

**Error Message:**
```
bash: ./scripts/deploy-testnet.sh: Permission denied
```

**Solution:** Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## Deployment Status Meanings

### ✅ Success Messages
- `✔ 1 contract checked` - Contract syntax is valid
- `Total cost: 0.019600 STX` - Deployment fee calculated
- `Duration: 1 blocks` - Transaction will be mined in next block

### ⚠️ Warning Messages
- `ContractAlreadyExists` - Contract already deployed (this is actually success if it's your contract!)
- `A new deployment plan was computed` - Deployment plan updated with current costs

### ❌ Error Messages
- `transaction rejected` - Check the reason (insufficient funds, invalid contract, etc.)
- `unable to post transaction` - Network or connection issues

## Useful Commands

### Check Contract Status
```bash
# Check if contract is deployed
clarinet deployments check --testnet

# View deployment plans
ls deployments/
cat deployments/default.testnet-plan.yaml
```

### Reset and Redeploy
```bash
# If you need to deploy a new version, change the contract name in Clarinet.toml
# Then regenerate the deployment plan
./scripts/generate-deployment.sh testnet --low-cost

# Deploy with new plan
./scripts/deploy-testnet.sh
```

### Manual Deployment Steps
```bash
# 1. Setup config
./scripts/setup-config.sh testnet

# 2. Check contracts
clarinet check

# 3. Generate deployment plan (optional)
clarinet deployments generate --testnet --low-cost

# 4. Apply deployment
clarinet deployments apply --testnet

# 5. Cleanup
./scripts/setup-config.sh restore
```

## Getting Help

### Clarinet Help
```bash
clarinet --help
clarinet deployments --help
clarinet deployments apply --help
```

### Check Network Status
- **Testnet Explorer**: https://explorer.stacks.co/?chain=testnet
- **Mainnet Explorer**: https://explorer.stacks.co/
- **Network Status**: https://status.hiro.so/

### Verify Your Contract
After successful deployment, check your contract at:
```
https://explorer.stacks.co/txid/[TRANSACTION_ID]?chain=testnet
```

Replace `[TRANSACTION_ID]` with the txid from deployment output.
