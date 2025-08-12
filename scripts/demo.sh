#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🎭 EduCoin Token System - Demo Scenarios"
echo "========================================"

echo -e "${BLUE}This demo will guide you through testing the token system with multiple users.${NC}"
echo

# Check if deployed locally
if ! dfx ping &> /dev/null; then
    echo -e "${YELLOW}⚠️  Local replica is not running.${NC}"
    echo "Please run './scripts/deploy.sh local' first to set up the system locally."
    exit 1
fi

# Get canister IDs
FRONTEND_CANISTER_ID=$(dfx canister id fungible_token_frontend 2>/dev/null || echo "")
BACKEND_CANISTER_ID=$(dfx canister id fungible_token_backend 2>/dev/null || echo "")

if [ -z "$FRONTEND_CANISTER_ID" ] || [ -z "$BACKEND_CANISTER_ID" ]; then
    echo -e "${YELLOW}⚠️  Canisters are not deployed.${NC}"
    echo "Please run './scripts/deploy.sh local' first to deploy the system locally."
    exit 1
fi

FRONTEND_URL="http://localhost:4943?canisterId=$FRONTEND_CANISTER_ID"

echo -e "${GREEN}✅ System is ready for demo!${NC}"
echo
echo "Frontend URL: $FRONTEND_URL"
echo "Backend Canister: $BACKEND_CANISTER_ID"
echo

echo "🚀 Demo Scenarios:"
echo "=================="
echo
echo "1. 👑 CREATOR SCENARIO"
echo "   • Open the URL above in your main browser"
echo "   • Login with Internet Identity - you'll be the creator"
echo "   • You'll have 1,000,000 EDU tokens initially"
echo "   • Try the 'Mint' tab to create more tokens"
echo "   • Use 'Transfer' tab to send tokens to other users"
echo
echo "2. 👤 REGULAR USER SCENARIO"
echo "   • Open the same URL in an incognito/private window"
echo "   • Login with a different Internet Identity"
echo "   • You'll start with 0 tokens"
echo "   • Copy your Principal ID from the header"
echo "   • Ask the creator to mint some tokens to your Principal ID"
echo
echo "3. 🔍 EXPLORER TESTING"
echo "   • Use the 'Token Explorer' tab to see all users"
echo "   • Search for specific Principal IDs"
echo "   • Notice the creator has a special 'Creator' badge"
echo "   • Check balance distribution and percentages"
echo
echo "4. 💰 BALANCE CHECKER"
echo "   • Use 'Check Balance' to look up any user's balance"
echo "   • Try your own Principal ID"
echo "   • Try other users' Principal IDs"
echo
echo "5. 📤 TRANSFER TESTING"
echo "   • As the creator, transfer tokens to new users"
echo "   • As a regular user, transfer tokens between accounts"
echo "   • Try invalid scenarios (insufficient balance, same account)"
echo
echo "💡 Testing Tips:"
echo "==============="
echo "• Use different browser profiles for different users"
echo "• Chrome: Ctrl+Shift+N (incognito), Firefox: Ctrl+Shift+P (private)"
echo "• Each Internet Identity creates a unique Principal ID"
echo "• Copy Principal IDs carefully - they're case-sensitive"
echo "• Watch the real-time updates after each transaction"
echo "• Check the browser console for detailed error messages"
echo
echo "🎯 What to Test:"
echo "==============="
echo "✓ Internet Identity login/logout"
echo "✓ Token explorer shows all users correctly"
echo "✓ Balance checking works for any Principal ID"
echo "✓ Transfers work between different users"
echo "✓ Minting only works for the creator"
echo "✓ Error handling for invalid operations"
echo "✓ Real-time UI updates after transactions"
echo "✓ Responsive design on different screen sizes"
echo
echo -e "${GREEN}🌟 Ready to start demo! Open:${NC}"
echo -e "${BLUE}$FRONTEND_URL${NC}"
echo
