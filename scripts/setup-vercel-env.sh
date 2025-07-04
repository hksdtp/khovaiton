#!/bin/bash

# Vercel Environment Variables Setup
# Ninh ơi, script này giúp setup environment variables cho Vercel

echo "🔧 Setting up Vercel Environment Variables..."

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install: npm install -g vercel"
    exit 1
fi

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo "⚠️  Project not linked to Vercel. Run 'vercel' first to link."
    exit 1
fi

echo "📋 Setting up environment variables..."

# Production environment variables
echo "Setting VITE_APP_ENV..."
vercel env add VITE_APP_ENV production production

echo "Setting VITE_APP_NAME..."
vercel env add VITE_APP_NAME "Kho Vải Tôn" production

echo "Setting VITE_APP_VERSION..."
vercel env add VITE_APP_VERSION "1.0.0" production

echo "Setting VITE_GOOGLE_DRIVE_FOLDER_ID..."
vercel env add VITE_GOOGLE_DRIVE_FOLDER_ID "1YiRnl2CfccL6rH98S8UlWexgckV_dnbU" production

echo "⚠️  IMPORTANT: You need to manually set VITE_GOOGLE_DRIVE_API_KEY"
echo "   1. Go to Vercel dashboard"
echo "   2. Project Settings → Environment Variables"
echo "   3. Add: VITE_GOOGLE_DRIVE_API_KEY = your_api_key_here"

echo "Setting feature flags..."
vercel env add VITE_ENABLE_GOOGLE_DRIVE_SYNC "true" production
vercel env add VITE_ENABLE_BATCH_IMPORT "true" production
vercel env add VITE_ENABLE_REAL_TIME_SYNC "true" production
vercel env add VITE_ENABLE_ANALYTICS "true" production

echo "Setting performance configs..."
vercel env add VITE_IMAGE_CACHE_TTL "3600" production
vercel env add VITE_API_TIMEOUT "10000" production
vercel env add VITE_MAX_IMAGE_SIZE "10485760" production

echo "Setting security configs..."
vercel env add VITE_ENABLE_CSP "true" production

echo "✅ Environment variables setup completed!"
echo ""
echo "📋 Manual steps required:"
echo "1. Get Google Drive API key from Google Cloud Console"
echo "2. Add VITE_GOOGLE_DRIVE_API_KEY in Vercel dashboard"
echo "3. Update VITE_ALLOWED_ORIGINS with your domain"
echo "4. Test deployment with: npm run deploy"
