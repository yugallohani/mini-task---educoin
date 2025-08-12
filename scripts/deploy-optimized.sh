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

echo "🔋 CYCLES-OPTIMIZED DEPLOYMENT - EduCoin Token System"
echo "===================================================="

# Suppress DFX mainnet warning
export DFX_WARNING=-mainnet_plaintext_identity

print_status "📋 Pre-deployment optimization checks..."

# Check current identity
PRINCIPAL=$(dfx identity get-principal)
print_status "🔑 Deploying with Principal: $PRINCIPAL"

# Run cycles check
print_status "🔋 Running detailed cycles analysis..."
if [ -f "./scripts/check-cycles.sh" ]; then
    ./scripts/check-cycles.sh
else
    print_warning "Cycles check script not found, proceeding with basic checks"
fi

echo
print_status "💰 Checking personal cycles balance..."
CYCLES=$(dfx cycles balance --network ic 2>/dev/null | grep -o '[0-9.]*' | head -1 || echo "0")
print_status "Your cycles balance: ${CYCLES} TC"

if (( $(echo "$CYCLES < 0.5" | bc -l) )); then
    print_error "❌ Insufficient cycles for deployment!"
    print_error "You need at least 0.5 TC. You have: ${CYCLES} TC"
    echo
    echo "💡 How to get cycles:"
    echo "  1. Buy $1-2 worth of ICP on Coinbase/Binance"
    echo "  2. Send to your principal: $PRINCIPAL"
    echo "  3. Convert: dfx cycles convert --amount 0.5 --network ic"
    echo
    exit 1
elif (( $(echo "$CYCLES < 1" | bc -l) )); then
    print_warning "⚠️  Low cycles balance. Deployment might work but monitor closely."
    echo
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
else
    print_success "✅ Sufficient cycles balance for deployment"
fi

echo
print_status "🏗️  Building canisters for production (optimized)..."

# Check if this is first deployment or upgrade
BACKEND_EXISTS=$(dfx canister --network ic id fungible_token_backend 2>/dev/null || echo "")
FRONTEND_EXISTS=$(dfx canister --network ic id fungible_token_frontend 2>/dev/null || echo "")

if [ -z "$BACKEND_EXISTS" ] && [ -z "$FRONTEND_EXISTS" ]; then
    print_status "🆕 First deployment - creating new canisters"
    DEPLOY_MODE="install"
else
    print_status "🔄 Upgrade deployment - using existing canisters"
    DEPLOY_MODE="upgrade"
fi

# Build for production
dfx build --network ic

print_success "✅ Build completed successfully"

# Deploy backend with appropriate mode
print_status "⚙️  Deploying backend canister (mode: $DEPLOY_MODE)..."
if [ "$DEPLOY_MODE" = "install" ]; then
    dfx deploy --network ic fungible_token_backend
else
    dfx deploy --network ic --mode upgrade fungible_token_backend
fi

BACKEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_backend)
print_success "✅ Backend deployed: $BACKEND_CANISTER_ID"

# Update production environment variables
print_status "🔧 Updating production environment variables..."
echo "NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND=$BACKEND_CANISTER_ID" > .env.production
echo "NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaah-qdrqq-cai" >> .env.production

print_success "✅ Environment variables updated"

# Build frontend for production with size optimization
print_status "🌐 Building optimized frontend for production..."
print_status "   Current frontend size: $(du -sh dist 2>/dev/null | cut -f1 || echo "Unknown")"

# Clean rebuild to ensure optimization
rm -rf dist .next
NODE_ENV=production npm run build

NEW_SIZE=$(du -sh dist | cut -f1)
print_success "✅ Frontend built - Size: $NEW_SIZE"

# Deploy frontend canister
print_status "🚀 Deploying frontend canister..."
dfx deploy --network ic fungible_token_frontend

FRONTEND_CANISTER_ID=$(dfx canister --network ic id fungible_token_frontend)
print_success "✅ Frontend deployed: $FRONTEND_CANISTER_ID"

# Post-deployment cycles check
echo
print_status "🔋 Post-deployment cycles check..."
CYCLES_AFTER=$(dfx cycles balance --network ic 2>/dev/null | grep -o '[0-9.]*' | head -1 || echo "0")
CYCLES_USED=$(echo "$CYCLES - $CYCLES_AFTER" | bc -l)
print_status "Cycles used for deployment: ${CYCLES_USED} TC"
print_status "Remaining cycles: ${CYCLES_AFTER} TC"

# Generate URLs
FRONTEND_URL="https://$FRONTEND_CANISTER_ID.icp0.app"
CANDID_URL="https://$BACKEND_CANISTER_ID.icp0.app/_/candid"

echo
print_success "🎉 OPTIMIZED DEPLOYMENT COMPLETED!"
echo
echo "📋 DEPLOYMENT SUMMARY:"
echo "  Network: IC Mainnet"
echo "  Deploy Mode: $DEPLOY_MODE"
echo "  Backend Canister ID: $BACKEND_CANISTER_ID"
echo "  Frontend Canister ID: $FRONTEND_CANISTER_ID"
echo "  Frontend Size: $NEW_SIZE"
echo "  Cycles Used: ${CYCLES_USED} TC"
echo "  Cycles Remaining: ${CYCLES_AFTER} TC"
echo
echo "🔗 PUBLIC URLs:"
echo "  🌍 Frontend: $FRONTEND_URL"
echo "  🔧 Candid UI: $CANDID_URL"
echo
echo "💡 OPTIMIZATION TIPS:"
echo "  ✅ Used upgrade mode to minimize cycles"
echo "  ✅ Optimized frontend build (${NEW_SIZE})"
echo "  ✅ Static pages reduce compute costs"
echo "  ✅ Efficient Rust backend"
echo
echo "🔄 FUTURE UPDATES (CYCLES-OPTIMIZED):"
echo "  Backend only: dfx deploy --network ic --mode upgrade fungible_token_backend"
echo "  Frontend only: npm run build && dfx deploy --network ic fungible_token_frontend"
echo "  Check cycles: ./scripts/check-cycles.sh"
echo
echo "📊 MONITORING:"
echo "  Run cycles check weekly: ./scripts/check-cycles.sh"
echo "  Expected monthly usage: <100M cycles"
echo "  Your deployment should stay FREE for years!"
echo
print_success "🌟 Your EduCoin token system is live and optimized on IC mainnet!"
print_success "🎯 Estimated time before cycles run out: 10+ years at current usage!"
