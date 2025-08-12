#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if network argument is provided
NETWORK=${1:-local}

if [ "$NETWORK" != "local" ] && [ "$NETWORK" != "ic" ]; then
    print_error "Usage: $0 [local|ic]"
    print_error "  local: Deploy to local replica"
    print_error "  ic: Deploy to IC mainnet"
    exit 1
fi

print_status "🚀 Starting deployment to $NETWORK network"

# Check prerequisites
print_status "📋 Checking prerequisites..."

if ! command -v dfx &> /dev/null; then
    print_error "dfx is not installed. Please install DFX first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js first."
    exit 1
fi

if [ "$NETWORK" = "local" ]; then
    # Check if local replica is running
    if ! dfx ping &> /dev/null; then
        print_warning "Local replica is not running. Starting it now..."
        dfx start --background --clean
        sleep 5
    fi
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "📦 Installing frontend dependencies..."
    npm install
fi

# Deploy backend canister
print_status "⚙️  Deploying backend canister..."
if [ "$NETWORK" = "local" ]; then
    dfx deploy fungible_token_backend
else
    dfx deploy --network ic fungible_token_backend
fi

# Get backend canister ID and update environment
print_status "🔧 Updating environment variables..."
if [ "$NETWORK" = "local" ]; then
    BACKEND_CANISTER_ID=$(dfx canister id fungible_token_backend)
    # Update .env.local
    if grep -q "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND" .env.local; then
        sed -i.bak "s/NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=.*/NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID/" .env.local
    else
        echo "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID" >> .env.local
    fi
    rm -f .env.local.bak
else
    BACKEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_backend)
    # Update .env.production
    if grep -q "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND" .env.production; then
        sed -i.bak "s/NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=.*/NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID/" .env.production
    else
        echo "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID" >> .env.production
    fi
    rm -f .env.production.bak
fi

print_success "✅ Backend canister deployed with ID: $BACKEND_CANISTER_ID"

# Build frontend
print_status "🏗️  Building frontend..."
if [ "$NETWORK" = "local" ]; then
    npm run build
else
    NODE_ENV=production npm run build
fi

# Deploy frontend canister
print_status "🌐 Deploying frontend canister..."
if [ "$NETWORK" = "local" ]; then
    dfx deploy fungible_token_frontend
    FRONTEND_CANISTER_ID=$(dfx canister id fungible_token_frontend)
    FRONTEND_URL="http://localhost:4943?canisterId=$FRONTEND_CANISTER_ID"
else
    dfx deploy --network ic fungible_token_frontend
    FRONTEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_frontend)
    FRONTEND_URL="https://$FRONTEND_CANISTER_ID.ic0.app"
fi

print_success "✅ Frontend canister deployed with ID: $FRONTEND_CANISTER_ID"

# Display final information
echo
echo "🎉 Deployment completed successfully!"
echo
echo "📋 Deployment Summary:"
echo "  Network: $NETWORK"
echo "  Backend Canister ID: $BACKEND_CANISTER_ID"
echo "  Frontend Canister ID: $FRONTEND_CANISTER_ID"
echo "  Frontend URL: $FRONTEND_URL"
echo
echo "🔗 Access your application:"
echo "  $FRONTEND_URL"
echo
if [ "$NETWORK" = "local" ]; then
    echo "💡 Local Development Tips:"
    echo "  • Keep the local replica running with: dfx start --background"
    echo "  • View canister logs with: dfx canister logs [canister_name]"
    echo "  • Reset local state with: dfx start --background --clean"
else
    echo "🌍 Production Deployment:"
    echo "  • Your application is now live on the Internet Computer mainnet"
    echo "  • Share the URL above to allow users to access your token system"
    echo "  • The first user to access will become the token creator"
fi
echo
