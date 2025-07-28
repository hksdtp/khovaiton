#!/bin/bash

# Start complete development environment for Kho Vải Tồn
echo "🚀 Starting Kho Vải Tồn Development Environment..."

PROJECT_DIR="$(pwd)"
echo "📁 Working directory: $PROJECT_DIR"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start web app
start_webapp() {
    echo ""
    echo "🌐 Starting Web Application..."
    
    if check_port 3000; then
        echo "⚠️ Port 3000 is already in use. Web app might already be running."
        echo "🌐 Web app should be available at: http://localhost:3000"
    else
        echo "🔄 Starting Vite development server..."
        npm run dev &
        WEBAPP_PID=$!
        echo "✅ Web app started with PID: $WEBAPP_PID"
        echo "🌐 Web app will be available at: http://localhost:3000"
    fi
}

# Function to start Serena dashboard
start_serena_dashboard() {
    echo ""
    echo "🤖 Starting Serena Dashboard..."
    
    if check_port 24282; then
        echo "⚠️ Port 24282 is already in use. Serena dashboard might already be running."
        echo "🌐 Dashboard should be available at: http://localhost:24282/dashboard/"
    else
        echo "🔄 Starting Serena in SSE mode for dashboard..."
        uvx --from git+https://github.com/oraios/serena serena-mcp-server \
            --project "$PROJECT_DIR" \
            --context desktop-app \
            --transport sse \
            --port 8000 \
            --enable-web-dashboard true &
        SERENA_PID=$!
        echo "✅ Serena started with PID: $SERENA_PID"
        echo "🌐 Dashboard will be available at: http://localhost:24282/dashboard/"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Development Environment Status:"
    echo "=================================="
    
    if check_port 3000; then
        echo "✅ Web App: Running on http://localhost:3000"
    else
        echo "❌ Web App: Not running"
    fi
    
    if check_port 24282; then
        echo "✅ Serena Dashboard: Running on http://localhost:24282/dashboard/"
    else
        echo "❌ Serena Dashboard: Not running"
    fi
    
    if check_port 8000; then
        echo "✅ Serena MCP Server: Running on http://localhost:8000"
    else
        echo "❌ Serena MCP Server: Not running"
    fi
}

# Function to open browsers
open_browsers() {
    echo ""
    echo "🌐 Opening browsers..."
    
    # Wait a bit for services to start
    sleep 3
    
    # Open web app
    if check_port 3000; then
        echo "🔗 Opening web app..."
        open http://localhost:3000 2>/dev/null || echo "Please manually open: http://localhost:3000"
    fi
    
    # Open Serena dashboard
    if check_port 24282; then
        echo "🔗 Opening Serena dashboard..."
        open http://localhost:24282/dashboard/ 2>/dev/null || echo "Please manually open: http://localhost:24282/dashboard/"
    fi
}

# Main execution
echo "🔍 Checking current status..."
show_status

echo ""
echo "🚀 Starting services..."

# Start web app
start_webapp

# Start Serena dashboard
start_serena_dashboard

# Wait a moment for services to initialize
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

# Show final status
show_status

# Open browsers
read -p "🌐 Do you want to open browsers automatically? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open_browsers
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Available services:"
echo "- 🌐 Web App: http://localhost:3000"
echo "- 🤖 Serena Dashboard: http://localhost:24282/dashboard/"
echo "- 🔧 Serena MCP Server: http://localhost:8000"
echo ""
echo "💡 Next steps:"
echo "1. Open Claude Desktop"
echo "2. Start a new conversation"
echo "3. Run: 'read Serena's initial instructions'"
echo "4. Try: 'Activate the khovaiton project'"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'npm run dev'"
echo "   pkill -f 'serena-mcp-server'"
echo ""
echo "📖 For help, see:"
echo "   - ./SERENA_QUICK_START.md"
echo "   - ./docs/SERENA_INTEGRATION.md"
echo ""
