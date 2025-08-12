#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🚀 EduCoin Token System - Setup Script"
echo "======================================"

# Check prerequisites
print_status "📋 Checking prerequisites..."

# Check DFX
if ! command -v dfx &> /dev/null; then
    print_error "❌ DFX is not installed."
    echo "Please install DFX first:"
    echo "  sh -ci \"\$(curl -fsSL https://sdk.dfinity.org/install.sh)\""
    exit 1
fi
print_success "✅ DFX is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "❌ Node.js is not installed."
    echo "Please install Node.js (v18 or later) from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "❌ Node.js version is too old. Please install v18 or later."
    exit 1
fi
print_success "✅ Node.js $(node --version) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "❌ npm is not installed."
    exit 1
fi
print_success "✅ npm $(npm --version) is installed"

# Check Rust
if ! command -v rustc &> /dev/null; then
    print_error "❌ Rust is not installed."
    echo "Please install Rust first:"
    echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
print_success "✅ Rust $(rustc --version | cut -d' ' -f2) is installed"

# Check wasm32 target
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    print_status "📦 Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi
print_success "✅ wasm32-unknown-unknown target is installed"

# Install Node.js dependencies
print_status "📦 Installing Node.js dependencies..."
npm install
print_success "✅ Node.js dependencies installed"

# Check if we can build the frontend
print_status "🏗️  Testing frontend build..."
npm run build &> /dev/null
if [ $? -eq 0 ]; then
    print_success "✅ Frontend builds successfully"
else
    print_error "❌ Frontend build failed"
    exit 1
fi

# Clean up build files
rm -rf dist/ .next/

print_success "🎉 Setup completed successfully!"
echo
echo "📋 What's next:"
echo "  1. For local development:"
echo "     ./scripts/deploy.sh local"
echo
echo "  2. For production deployment:"
echo "     ./scripts/deploy.sh ic"
echo
echo "💡 Tips:"
echo "  • Make sure you have some ICP tokens for mainnet deployment"
echo "  • The first user to access the app becomes the token creator"
echo "  • Use different browser profiles to test with multiple users"
echo
