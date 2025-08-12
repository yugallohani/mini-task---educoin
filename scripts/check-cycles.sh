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

echo "🔋 CYCLES MONITORING - EduCoin Token System"
echo "==========================================="

# Suppress DFX mainnet warning
export DFX_WARNING=-mainnet_plaintext_identity

# Check if we can connect to IC
print_status "📡 Checking connection to IC mainnet..."

# Check personal cycles balance
print_status "💰 Checking your personal cycles balance..."
PERSONAL_CYCLES=$(dfx cycles balance --network ic 2>/dev/null | grep -o '[0-9.]*' | head -1 || echo "0")
print_status "Your cycles balance: ${PERSONAL_CYCLES} TC"

if (( $(echo "$PERSONAL_CYCLES < 1" | bc -l) )); then
    print_warning "⚠️  Low personal cycles balance. Consider topping up."
else
    print_success "✅ Sufficient personal cycles balance"
fi

# Check if canisters exist
BACKEND_EXISTS=$(dfx canister --network ic id fungible_token_backend 2>/dev/null || echo "")
FRONTEND_EXISTS=$(dfx canister --network ic id fungible_token_frontend 2>/dev/null || echo "")

if [ -z "$BACKEND_EXISTS" ] && [ -z "$FRONTEND_EXISTS" ]; then
    print_status "📦 No canisters deployed yet"
    echo
    echo "🚀 Ready for first deployment!"
    echo "Run: ./scripts/deploy-mainnet.sh"
    exit 0
fi

echo
print_status "🔍 Checking deployed canisters..."

# Check backend canister
if [ ! -z "$BACKEND_EXISTS" ]; then
    print_status "⚙️  Backend Canister Status:"
    echo "   ID: $BACKEND_EXISTS"
    
    # Get detailed status
    BACKEND_STATUS=$(dfx canister status --network ic fungible_token_backend 2>/dev/null || echo "Error getting status")
    
    if [[ "$BACKEND_STATUS" != "Error"* ]]; then
        # Extract cycles from status
        BACKEND_CYCLES=$(echo "$BACKEND_STATUS" | grep -i "balance:" | grep -o '[0-9,]*' | tr -d ',' || echo "0")
        echo "   Cycles: $BACKEND_CYCLES"
        
        # Extract memory usage
        BACKEND_MEMORY=$(echo "$BACKEND_STATUS" | grep -i "memory size:" | grep -o '[0-9]*' || echo "0")
        echo "   Memory: $BACKEND_MEMORY bytes"
        
        # Cycles warning levels
        if [ "$BACKEND_CYCLES" -gt 1000000000000 ]; then
            print_success "   ✅ Backend cycles: Healthy"
        elif [ "$BACKEND_CYCLES" -gt 100000000000 ]; then
            print_warning "   🟡 Backend cycles: Monitor closely"
        else
            print_error "   🔴 Backend cycles: Top-up needed!"
        fi
    else
        print_error "   ❌ Cannot get backend status"
    fi
else
    print_status "⚙️  Backend canister: Not deployed"
fi

echo

# Check frontend canister
if [ ! -z "$FRONTEND_EXISTS" ]; then
    print_status "🌐 Frontend Canister Status:"
    echo "   ID: $FRONTEND_EXISTS"
    
    # Get detailed status
    FRONTEND_STATUS=$(dfx canister status --network ic fungible_token_frontend 2>/dev/null || echo "Error getting status")
    
    if [[ "$FRONTEND_STATUS" != "Error"* ]]; then
        # Extract cycles from status
        FRONTEND_CYCLES=$(echo "$FRONTEND_STATUS" | grep -i "balance:" | grep -o '[0-9,]*' | tr -d ',' || echo "0")
        echo "   Cycles: $FRONTEND_CYCLES"
        
        # Extract memory usage
        FRONTEND_MEMORY=$(echo "$FRONTEND_STATUS" | grep -i "memory size:" | grep -o '[0-9]*' || echo "0")
        echo "   Memory: $FRONTEND_MEMORY bytes"
        
        # Cycles warning levels
        if [ "$FRONTEND_CYCLES" -gt 1000000000000 ]; then
            print_success "   ✅ Frontend cycles: Healthy"
        elif [ "$FRONTEND_CYCLES" -gt 100000000000 ]; then
            print_warning "   🟡 Frontend cycles: Monitor closely"
        else
            print_error "   🔴 Frontend cycles: Top-up needed!"
        fi
        
        # Show public URL
        echo "   Public URL: https://$FRONTEND_EXISTS.icp0.app"
    else
        print_error "   ❌ Cannot get frontend status"
    fi
else
    print_status "🌐 Frontend canister: Not deployed"
fi

echo
print_status "📊 Usage Summary:"

# Calculate total canister cycles
TOTAL_CANISTER_CYCLES=0
if [ ! -z "$BACKEND_CYCLES" ] && [ "$BACKEND_CYCLES" != "0" ]; then
    TOTAL_CANISTER_CYCLES=$((TOTAL_CANISTER_CYCLES + BACKEND_CYCLES))
fi
if [ ! -z "$FRONTEND_CYCLES" ] && [ "$FRONTEND_CYCLES" != "0" ]; then
    TOTAL_CANISTER_CYCLES=$((TOTAL_CANISTER_CYCLES + FRONTEND_CYCLES))
fi

echo "   Total cycles in canisters: $TOTAL_CANISTER_CYCLES"

# Total memory
TOTAL_MEMORY=0
if [ ! -z "$BACKEND_MEMORY" ] && [ "$BACKEND_MEMORY" != "0" ]; then
    TOTAL_MEMORY=$((TOTAL_MEMORY + BACKEND_MEMORY))
fi
if [ ! -z "$FRONTEND_MEMORY" ] && [ "$FRONTEND_MEMORY" != "0" ]; then
    TOTAL_MEMORY=$((TOTAL_MEMORY + FRONTEND_MEMORY))
fi

TOTAL_MEMORY_KB=$((TOTAL_MEMORY / 1024))
echo "   Total memory usage: ${TOTAL_MEMORY_KB} KB"

echo
print_status "💡 Recommendations:"

if [ "$TOTAL_CANISTER_CYCLES" -gt 2000000000000 ]; then
    print_success "🟢 Your canisters are well-funded. Continue monitoring monthly."
elif [ "$TOTAL_CANISTER_CYCLES" -gt 500000000000 ]; then
    print_warning "🟡 Monitor more frequently. Consider topping up soon."
    echo "   Top-up command: dfx cycles convert --amount 0.1 --network ic"
else
    print_error "🔴 Low cycles! Top up immediately to prevent stops."
    echo "   Emergency top-up: dfx cycles convert --amount 0.5 --network ic"
fi

# Storage efficiency check
if [ "$TOTAL_MEMORY_KB" -lt 2000 ]; then
    print_success "✅ Memory usage is very efficient"
elif [ "$TOTAL_MEMORY_KB" -lt 10000 ]; then
    print_success "✅ Memory usage is reasonable" 
else
    print_warning "⚠️  Consider optimizing asset sizes"
fi

echo
print_status "🔄 Next check recommended in 1 week"
print_status "Monitor continuously at: https://internetcomputer.org/docs/current/developer-docs/deploy/computation-and-storage-costs"
