#!/bin/bash

# Deploy to Testnet Script
# This script loads environment variables and deploys to testnet

set -e  # Exit on any error

echo "🚀 Deploying to Testnet..."

# Setup configuration with environment variables
echo "🔧 Setting up configuration..."
./scripts/setup-config.sh testnet

echo "📋 Running contract check..."
# Check contracts first
clarinet check

echo "🌐 Deploying to testnet..."
# Deploy to testnet
clarinet deployments apply --testnet

echo "🔄 Restoring template configurations..."
# Restore template configs for security
./scripts/setup-config.sh restore

echo "🎉 Deployment completed!"
echo "📝 Check the deployment status in your terminal output above."
