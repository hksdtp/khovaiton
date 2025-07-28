#!/bin/bash

# Setup Serena with Claude Code for Kho Vải Tồn project
echo "🚀 Setting up Serena with Claude Code..."

# Get current directory
PROJECT_DIR="$(pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Check if claude command is available
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is not installed. Please install it first:"
    echo "Visit: https://claude.ai/download"
    exit 1
fi

echo "✅ Claude Code CLI is available"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install it first:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "✅ uv is installed"

# Add Serena to Claude Code
echo "🔧 Adding Serena MCP server to Claude Code..."

claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project "$PROJECT_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Serena successfully added to Claude Code"
else
    echo "❌ Failed to add Serena to Claude Code"
    exit 1
fi

# Index the project for better performance
echo "📚 Indexing project for better performance..."
uvx --from git+https://github.com/oraios/serena index-project "$PROJECT_DIR"

echo ""
echo "🎉 Serena setup with Claude Code complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start Claude Code in this project directory"
echo "2. In Claude Code, run: /mcp__serena__initial_instructions"
echo "3. Or ask Claude to 'read Serena's initial instructions'"
echo ""
echo "💡 Useful commands to try in Claude Code:"
echo "   - 'Show me the project structure'"
echo "   - 'Help me understand the React components'"
echo "   - 'Run the development server'"
echo "   - 'Check for any TypeScript errors'"
echo "   - 'Show me the Cloudinary integration'"
echo ""
echo "🌐 Dashboard will be available at: http://localhost:24282/dashboard/"
echo ""
echo "🔄 To start development:"
echo "   claude"
echo "   # Then in Claude Code interface, you can start working with Serena tools"
echo ""
