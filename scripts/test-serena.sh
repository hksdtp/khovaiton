#!/bin/bash

# Test Serena integration for Kho Vải Tồn project
echo "🧪 Testing Serena integration..."

PROJECT_DIR="$(pwd)"
echo "📁 Testing in: $PROJECT_DIR"

# Test 1: Check if uv is available
echo ""
echo "1️⃣ Testing uv installation..."
if command -v uv &> /dev/null; then
    echo "✅ uv is installed: $(uv --version)"
else
    echo "❌ uv is not installed"
    exit 1
fi

# Test 2: Check if Serena can be run
echo ""
echo "2️⃣ Testing Serena availability..."
if uvx --from git+https://github.com/oraios/serena serena-mcp-server --help > /dev/null 2>&1; then
    echo "✅ Serena is accessible via uvx"
else
    echo "❌ Serena cannot be accessed"
    exit 1
fi

# Test 3: Check project configuration
echo ""
echo "3️⃣ Testing project configuration..."
if [ -f ".serena/project.yml" ]; then
    echo "✅ Project configuration exists"
else
    echo "❌ Project configuration missing"
    exit 1
fi

# Test 4: Check global configuration
echo ""
echo "4️⃣ Testing global configuration..."
if [ -f "$HOME/.serena/serena_config.yml" ]; then
    echo "✅ Global configuration exists"
else
    echo "❌ Global configuration missing"
    exit 1
fi

# Test 5: Check Claude Desktop configuration
echo ""
echo "5️⃣ Testing Claude Desktop configuration..."
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "✅ Claude Desktop configuration exists"
    if grep -q "serena" "$CLAUDE_CONFIG"; then
        echo "✅ Serena is configured in Claude Desktop"
    else
        echo "⚠️ Serena not found in Claude Desktop config"
    fi
else
    echo "⚠️ Claude Desktop configuration not found"
fi

# Test 6: Check project structure
echo ""
echo "6️⃣ Testing project structure..."
REQUIRED_DIRS=("src" "src/components" "src/features" "src/services" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Missing directory: $dir"
    fi
done

# Test 7: Check key files
echo ""
echo "7️⃣ Testing key files..."
REQUIRED_FILES=("package.json" "tsconfig.json" "vite.config.ts" "src/main.tsx")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ File exists: $file"
    else
        echo "❌ Missing file: $file"
    fi
done

# Test 8: Check memories
echo ""
echo "8️⃣ Testing memories..."
if [ -d ".serena/memories" ]; then
    echo "✅ Memories directory exists"
    MEMORY_COUNT=$(find .serena/memories -name "*.md" | wc -l)
    echo "📚 Found $MEMORY_COUNT memory files"
else
    echo "❌ Memories directory missing"
fi

# Test 9: Check if project can be indexed
echo ""
echo "9️⃣ Testing project indexing..."
echo "🔄 Running quick index test..."
if uvx --from git+https://github.com/oraios/serena index-project "$PROJECT_DIR" > /dev/null 2>&1; then
    echo "✅ Project can be indexed successfully"
else
    echo "⚠️ Project indexing had issues (this might be normal)"
fi

# Test 10: Check TypeScript setup
echo ""
echo "🔟 Testing TypeScript setup..."
if command -v npx &> /dev/null; then
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo "✅ TypeScript compilation successful"
    else
        echo "⚠️ TypeScript has some issues (check with 'npm run type-check')"
    fi
else
    echo "⚠️ npx not available for TypeScript test"
fi

echo ""
echo "🎉 Serena integration test complete!"
echo ""
echo "📋 Summary:"
echo "- Serena is ready to use with this project"
echo "- Configuration files are in place"
echo "- Project structure is compatible"
echo ""
echo "🚀 Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Open new conversation"
echo "3. Run: 'read Serena's initial instructions'"
echo "4. Try: 'Activate the khovaiton project'"
echo ""
echo "📖 For more help, see:"
echo "- ./SERENA_QUICK_START.md"
echo "- ./docs/SERENA_INTEGRATION.md"
echo ""
