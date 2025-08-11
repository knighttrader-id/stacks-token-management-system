#!/bin/bash

# Generate Deployment Plan Script
# This script handles config setup for deployment plan generation

set -e

NETWORK=${1:-testnet}
FLAGS=${2:-""}

echo "📋 Generating deployment plan for $NETWORK..."

# Setup configuration with environment variables
echo "🔧 Setting up configuration..."
./scripts/setup-config.sh $NETWORK

# Generate deployment plan
echo "⚙️  Generating deployment plan..."
case $NETWORK in
    "testnet")
        clarinet deployments generate --testnet $FLAGS
        ;;
    "mainnet")
        echo "⚠️  WARNING: Generating MAINNET deployment plan!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "❌ Generation cancelled."
            ./scripts/setup-config.sh restore
            exit 0
        fi
        clarinet deployments generate --mainnet $FLAGS
        ;;
    *)
        echo "❌ Error: Invalid network '$NETWORK'. Use 'testnet' or 'mainnet'"
        ./scripts/setup-config.sh restore
        exit 1
        ;;
esac

# Restore template configs for security
echo "🔄 Restoring template configurations..."
./scripts/setup-config.sh restore

echo "✅ Deployment plan generation completed!"
echo "📁 Check deployments/default.$NETWORK-plan.yaml"
