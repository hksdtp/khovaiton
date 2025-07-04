#!/bin/bash

# Deployment Script for Vercel
# Ninh ơi, script này giúp deploy lên Vercel một cách tự động

set -e  # Exit on any error

echo "🚀 Starting deployment to Vercel..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    print_error "Install with: npm install -g vercel"
    exit 1
fi

# Check environment variables
print_status "Checking environment configuration..."

if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found"
    print_warning "Make sure to set environment variables in Vercel dashboard"
fi

# Run pre-deployment checks
print_status "Running pre-deployment checks..."

# Type check
print_status "Running TypeScript type check..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Lint check
print_status "Running ESLint check..."
if npm run lint; then
    print_success "Lint check passed"
else
    print_error "Lint check failed"
    exit 1
fi

# Test build locally
print_status "Testing production build locally..."
if npm run build:production; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_status "Build size: $BUILD_SIZE"

if [ -d "dist" ]; then
    ASSET_COUNT=$(find dist -type f | wc -l)
    print_status "Total assets: $ASSET_COUNT files"
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if this is first deployment
if [ ! -f ".vercel/project.json" ]; then
    print_status "First deployment detected. Running vercel setup..."
    vercel --confirm
else
    print_status "Deploying to existing project..."
fi

# Deploy
if vercel --prod; then
    print_success "🎉 Deployment successful!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope=team | head -n 2 | tail -n 1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "🌐 Live URL: https://$DEPLOYMENT_URL"
    fi
    
    print_status "📋 Next steps:"
    print_status "1. Test the deployed application"
    print_status "2. Configure custom domain if needed"
    print_status "3. Set up monitoring and analytics"
    
else
    print_error "❌ Deployment failed"
    exit 1
fi

# Cleanup
print_status "Cleaning up..."
rm -rf dist

print_success "✅ Deployment process completed!"
