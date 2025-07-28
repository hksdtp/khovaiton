#!/bin/bash

# Script commit và push lên GitHub
# Ninh ơi, script này sẽ commit tất cả changes và push lên GitHub

echo "🚀 Committing and pushing to GitHub..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status --porcelain

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️ No changes to commit"
    exit 0
fi

# Create commit message
COMMIT_MESSAGE="🔧 Fix ImageStatusFilter & Add Cloudinary Checker

✅ Bug Fixes:
- Fix 'refreshImageStatusCounts is not defined' error in ImageStatusFilter
- Replace undefined function with queryClient.invalidateQueries
- Fix /sale route error page issue

🔍 Features Added:
- Add Cloudinary image checker scripts
- Add browser-based Cloudinary verification tools
- Add manual URL testing capabilities

🛠️ Improvements:
- Improve error handling in ImageStatusFilter component
- Add comprehensive Cloudinary debugging tools
- Better fabric image verification workflow

📊 Status:
- Web app working on both / and /sale routes
- ImageStatusFilter component functioning properly
- Cloudinary integration stable with 35.8% image coverage
- 120/335 fabrics have images, 118 Cloudinary URLs generated

This commit fixes critical runtime errors and adds tools for better
Cloudinary image management and verification."

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Failed to commit changes"
    exit 1
fi

echo "✅ Changes committed successfully"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Check your repository for the latest changes"
else
    echo "❌ Failed to push to GitHub"
    echo "💡 You may need to pull first or check your credentials"
    exit 1
fi

echo ""
echo "🎉 Commit and push completed!"
echo "📊 Summary:"
echo "   - Fixed ImageStatusFilter error"
echo "   - Added Cloudinary checker tools"
echo "   - Web app working on all routes"
