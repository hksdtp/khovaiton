#!/bin/bash

# Quick commit để fix TypeScript build errors
echo "🔧 Quick fix for TypeScript build errors..."

git add .
git commit -m "🔧 Fix TypeScript Build Errors

✅ Fixes:
- Remove unused import 'realtimeUpdateService' in ImageStatsDisplay
- Fix missing 'withImages' and 'withoutImages' properties in FabricStats
- Change private methods to public in imageUpdateService
- Add fallback calculations for image statistics

🛠️ Changes:
- ImageStatsDisplay.tsx: Remove unused import, add fallback stats calculation
- imageUpdateService.ts: Make invalidateAllImageQueries and refreshFabricImage public

This should resolve all TypeScript compilation errors on Vercel build."

git push origin main

echo "✅ Pushed TypeScript fixes to GitHub!"
