#!/bin/bash

# Setup Serena for Kho Vải Tồn project
echo "🚀 Setting up Serena for Kho Vải Tồn project..."

# Get current directory
PROJECT_DIR="$(pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install it first:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "✅ uv is installed"

# Install Serena using uvx
echo "📦 Installing Serena..."
uvx --from git+https://github.com/oraios/serena serena-mcp-server --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Serena is ready to use"
else
    echo "❌ Failed to install Serena"
    exit 1
fi

# Create Claude Desktop config
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo "🔧 Setting up Claude Desktop configuration..."

# Create config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Create or update Claude Desktop config
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena-mcp-server",
        "--context",
        "desktop-app",
        "--project",
        "$PROJECT_DIR"
      ]
    }
  }
}
EOF

echo "✅ Claude Desktop configuration created at: $CLAUDE_CONFIG_FILE"

# Index the project for better performance
echo "📚 Indexing project for better performance..."
uvx --from git+https://github.com/oraios/serena index-project "$PROJECT_DIR"

echo ""
echo "🎉 Serena setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Claude Desktop application"
echo "2. Open a new conversation in Claude Desktop"
echo "3. You should see Serena's tools available (hammer icon)"
echo "4. Ask Claude to 'read Serena's initial instructions' to get started"
echo ""
echo "💡 Useful commands to try:"
echo "   - 'Activate the khovaiton project'"
echo "   - 'Show me the project structure'"
echo "   - 'Help me understand the codebase'"
echo "   - 'Run the development server'"
echo ""
echo "🌐 Dashboard will be available at: http://localhost:24282/dashboard/"
echo ""
