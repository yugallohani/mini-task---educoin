#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🌍 MAINNET DEPLOYMENT - EduCoin Token System"
echo "============================================="

# Suppress DFX mainnet warning
export DFX_WARNING=-mainnet_plaintext_identity

print_status "📋 Pre-deployment checks..."

# Check current identity
PRINCIPAL=$(dfx identity get-principal)
print_status "🔑 Deploying with Principal: $PRINCIPAL"

# Check cycles balance
CYCLES=$(DFX_WARNING=-mainnet_plaintext_identity dfx cycles balance --network ic | grep -o '[0-9.]*')
print_status "💰 Current cycles balance: ${CYCLES} TC"

if (( $(echo "$CYCLES < 1" | bc -l) )); then
    print_warning "⚠️  Low cycles balance. You may need more cycles for deployment."
    print_warning "Get cycles at: https://faucet.dfinity.org/ or buy ICP and convert to cycles"
    echo
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# Step 2: Check cycles before deployment
print_status "🔋 Pre-deployment cycles check..."
./scripts/check-cycles.sh
echo
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled."
    exit 1
fi

# Step 3: Build for production
print_status "🏗️  Building canisters for production..."
dfx build --network ic

print_success "✅ Build completed successfully"

# Step 4: Deploy backend canister with upgrade mode
print_status "⚙️  Deploying backend canister to IC mainnet..."
dfx deploy --network ic --mode upgrade fungible_token_backend

BACKEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_backend)
print_success "✅ Backend deployed: $BACKEND_CANISTER_ID"

# Step 4: Update production environment variables
print_status "🔧 Updating production environment variables..."
echo "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID" > .env.production
echo "NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaah-qdrqq-cai" >> .env.production

print_success "✅ Environment variables updated"

# Step 5: Build frontend for production
print_status "🌐 Building frontend for production..."
NODE_ENV=production npm run build

# Step 6: Deploy frontend canister
print_status "🚀 Deploying frontend canister to IC mainnet..."
dfx deploy --network ic fungible_token_frontend

FRONTEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_frontend)
print_success "✅ Frontend deployed: $FRONTEND_CANISTER_ID"

# Step 7: Generate URLs
FRONTEND_URL="https://$FRONTEND_CANISTER_ID.icp0.app"
CANDID_URL="https://$BACKEND_CANISTER_ID.icp0.app/_/candid"

echo
print_success "🎉 MAINNET DEPLOYMENT COMPLETED!"
echo
echo "📋 DEPLOYMENT SUMMARY:"
echo "  Network: IC Mainnet"
echo "  Backend Canister ID: $BACKEND_CANISTER_ID"
echo "  Frontend Canister ID: $FRONTEND_CANISTER_ID"
echo
echo "🔗 PUBLIC URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Candid UI: $CANDID_URL"
echo
echo "💡 NEXT STEPS:"
echo "  1. Open frontend URL to test the application"
echo "  2. Login with Internet Identity (works on mainnet)"
echo "  3. First user becomes the token creator"
echo "  4. Share the frontend URL publicly!"
echo
echo "🔄 REDEPLOYMENT COMMANDS:"
echo "  Backend: dfx deploy --network ic fungible_token_backend"
echo "  Frontend: NODE_ENV=production npm run build && dfx deploy --network ic fungible_token_frontend"
echo
print_success "🌟 Your EduCoin token system is now live on IC mainnet!"
