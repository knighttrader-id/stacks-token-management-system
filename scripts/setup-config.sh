#!/bin/bash

# Setup Configuration Script
# This script creates temporary config files with environment variables substituted

set -e

echo "🔧 Setting up configuration files..."

# Check if .env file exists and load it
if [ -f ".env" ]; then
    echo "📁 Loading environment variables from .env file..."
    set -a  # Automatically export all variables
    source .env
    set +a  # Stop auto-exporting
fi

# Function to create testnet config
setup_testnet_config() {
    if [ -z "$TESTNET_MNEMONIC" ]; then
        echo "❌ Error: TESTNET_MNEMONIC environment variable is not set!"
        echo "Please set it in your .env file or export it directly."
        exit 1
    fi
    
    echo "📝 Creating testnet configuration..."
    
    # Create temporary testnet config
    cat > settings/Testnet.toml.tmp << EOF
[network]
name = "testnet"
node_rpc_address = "https://stacks-node-api.testnet.stacks.co"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "$TESTNET_MNEMONIC"
balance = 100000000000000
EOF

    # Replace the original file
    mv settings/Testnet.toml.tmp settings/Testnet.toml
    echo "✅ Testnet configuration updated"
}

# Function to create mainnet config
setup_mainnet_config() {
    if [ -z "$MAINNET_MNEMONIC" ]; then
        echo "⚠️  MAINNET_MNEMONIC not set, skipping mainnet config..."
        return 0
    fi
    
    echo "📝 Creating mainnet configuration..."
    
    # Create temporary mainnet config
    cat > settings/Mainnet.toml.tmp << EOF
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "$MAINNET_MNEMONIC"
EOF

    # Replace the original file
    mv settings/Mainnet.toml.tmp settings/Mainnet.toml
    echo "✅ Mainnet configuration updated"
}

# Function to restore template configs
restore_templates() {
    echo "🔄 Restoring template configurations..."
    
    # Restore testnet template
    cat > settings/Testnet.toml << 'EOF'
[network]
name = "testnet"
node_rpc_address = "https://stacks-node-api.testnet.stacks.co"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "PLACEHOLDER_TESTNET_MNEMONIC"
balance = 100000000000000
EOF

    # Restore mainnet template
    cat > settings/Mainnet.toml << 'EOF'
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "PLACEHOLDER_MAINNET_MNEMONIC"
EOF

    echo "✅ Template configurations restored"
}

# Main execution
case "${1:-setup}" in
    "setup")
        setup_testnet_config
        setup_mainnet_config
        ;;
    "testnet")
        setup_testnet_config
        ;;
    "mainnet")
        setup_mainnet_config
        ;;
    "restore")
        restore_templates
        ;;
    *)
        echo "Usage: $0 [setup|testnet|mainnet|restore]"
        echo "  setup   - Setup both testnet and mainnet configs (default)"
        echo "  testnet - Setup only testnet config"
        echo "  mainnet - Setup only mainnet config"
        echo "  restore - Restore template configs (removes mnemonics)"
        exit 1
        ;;
esac

echo "🎉 Configuration setup completed!"
