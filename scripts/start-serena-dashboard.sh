#!/bin/bash

# Start Serena Dashboard for monitoring
echo "🤖 Starting Serena Dashboard..."

PROJECT_DIR="$(pwd)"
echo "📁 Project: $PROJECT_DIR"

# Check if port 24282 is already in use
if lsof -Pi :24282 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Serena Dashboard is already running!"
    echo "🌐 Dashboard: http://localhost:24282/dashboard/"
    
    # Open browser
    read -p "🌐 Open dashboard in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:24282/dashboard/ 2>/dev/null || echo "Please manually open: http://localhost:24282/dashboard/"
    fi
    exit 0
fi

echo "🔄 Starting Serena MCP Server with dashboard..."

# Start Serena in background
uvx --from git+https://github.com/oraios/serena serena-mcp-server \
    --project "$PROJECT_DIR" \
    --context desktop-app \
    --transport sse \
    --port 8000 \
    --enable-web-dashboard true &

SERENA_PID=$!
echo "✅ Serena started with PID: $SERENA_PID"

# Wait for dashboard to be ready
echo "⏳ Waiting for dashboard to initialize..."
for i in {1..10}; do
    if lsof -Pi :24282 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Dashboard is ready!"
        break
    fi
    echo "   Waiting... ($i/10)"
    sleep 2
done

# Check if dashboard is running
if lsof -Pi :24282 -sTCP:LISTEN -t >/dev/null ; then
    echo ""
    echo "🎉 Serena Dashboard is running!"
    echo "🌐 Dashboard: http://localhost:24282/dashboard/"
    echo "🔧 MCP Server: http://localhost:8000"
    echo ""
    
    # Open browser
    read -p "🌐 Open dashboard in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:24282/dashboard/ 2>/dev/null || echo "Please manually open: http://localhost:24282/dashboard/"
    fi
    
    echo ""
    echo "💡 To stop Serena:"
    echo "   kill $SERENA_PID"
    echo "   # or"
    echo "   pkill -f 'serena-mcp-server'"
    echo ""
    echo "📖 For Claude Desktop integration, see:"
    echo "   ./SERENA_QUICK_START.md"
else
    echo "❌ Dashboard failed to start"
    echo "🔍 Check if there are any errors above"
    exit 1
fi
