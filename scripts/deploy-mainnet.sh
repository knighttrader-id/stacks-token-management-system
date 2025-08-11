#!/bin/bash

# Deploy to Mainnet Script
# This script loads environment variables and deploys to mainnet

set -e  # Exit on any error

echo "🚀 Deploying to Mainnet..."
echo "⚠️  WARNING: This will deploy to MAINNET using real STX!"

# Confirmation prompt
read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Setup configuration with environment variables
echo "🔧 Setting up configuration..."
./scripts/setup-config.sh mainnet

echo "📋 Running contract check..."
# Check contracts first
clarinet check

echo "🌐 Deploying to mainnet..."
echo "💰 Make sure your wallet has sufficient STX for deployment fees!"

# Deploy to mainnet
clarinet deployments apply --mainnet

echo "🔄 Restoring template configurations..."
# Restore template configs for security
./scripts/setup-config.sh restore

echo "🎉 Deployment completed!"
echo "📝 Check the deployment status in your terminal output above."
