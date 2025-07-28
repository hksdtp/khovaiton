#!/bin/bash

# Commit and push changes to GitHub
echo "🚀 Committing and pushing changes to GitHub..."

# Check git status
echo "📋 Current git status:"
git status

echo ""
echo "📝 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "🤖 Integrate Serena AI Assistant & Fix Image Status Issues

✨ Features:
- Integrate Serena coding agent toolkit for AI-powered development
- Add comprehensive Serena configuration and documentation
- Create setup scripts for Claude Desktop and Claude Code integration

🐛 Bug Fixes:
- Fix refreshImageStatusCounts undefined error in ImageStatusFilter
- Fix hasImages property calculation in fabric data
- Fix TypeScript errors in imageUpdateService and fabricApi
- Hide image status sections in SALE version as requested
- Hide sync button in inventory interface

🔧 Improvements:
- Add withImages and withoutImages to FabricStats type
- Update fabric data logic to sync with Cloudinary mapping
- Improve image status consistency across components
- Add debug scripts for fabric image troubleshooting

📚 Documentation:
- Add Serena Quick Start guide
- Add detailed integration documentation
- Update README with Serena section
- Add project memories for AI context

🛠️ Scripts Added:
- setup-serena.sh - Claude Desktop integration
- setup-claude-code.sh - Claude Code integration  
- test-serena.sh - Integration testing
- debug-fabric-image.js - Image status debugging

This commit integrates Serena AI assistant to enhance development workflow
while fixing critical image status display issues and improving UX."

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit successful!"
    echo ""
    echo "🌐 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Successfully pushed to GitHub!"
        echo ""
        echo "📊 Recent commits:"
        git log --oneline -3
    else
        echo ""
        echo "❌ Failed to push to GitHub"
        echo "Please check your internet connection and GitHub credentials"
    fi
else
    echo ""
    echo "❌ Commit failed"
    echo "Please check for any issues and try again"
fi

echo ""
echo "🔗 Repository: https://github.com/your-username/khovaiton"
echo "📱 Web App: http://localhost:3001"
