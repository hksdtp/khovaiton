#!/bin/bash

# 🚀 DUAL APPLICATION STARTUP SCRIPT
# Khởi động Web App Kho Vải Tôn + Serena AI Coding Agent

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
KHOVAITON_DIR="/Users/ninh/Webapp/khovaiton"
SERENA_DIR="/Users/ninh/Webapp/serena"
KHOVAITON_PORT=3004
SERENA_PORT=8000
SERENA_DASHBOARD_PORT=24282

echo -e "${CYAN}🚀 DUAL APPLICATION STARTUP${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use (possibly by $service)${NC}"
        return 0
    else
        return 1
    fi
}

# Function to start Kho Vai Ton
start_khovaiton() {
    echo -e "${BLUE}📦 Starting Kho Vải Tôn Web App...${NC}"
    
    if ! check_port $KHOVAITON_PORT "Kho Vải Tôn"; then
        cd "$KHOVAITON_DIR"
        echo -e "${BLUE}   Directory: $KHOVAITON_DIR${NC}"
        echo -e "${BLUE}   Command: npm run dev${NC}"
        
        # Start in background
        npm run dev > /tmp/khovaiton.log 2>&1 &
        KHOVAITON_PID=$!
        
        # Wait a bit and check if it started
        sleep 3
        if kill -0 $KHOVAITON_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Kho Vải Tôn started successfully (PID: $KHOVAITON_PID)${NC}"
            echo -e "${GREEN}   URL: http://localhost:$KHOVAITON_PORT${NC}"
            echo $KHOVAITON_PID > /tmp/khovaiton.pid
        else
            echo -e "${RED}❌ Failed to start Kho Vải Tôn${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Kho Vải Tôn already running on port $KHOVAITON_PORT${NC}"
    fi
    echo ""
}

# Function to start Serena
start_serena() {
    echo -e "${PURPLE}🤖 Starting Serena AI Coding Agent...${NC}"
    
    if ! check_port $SERENA_PORT "Serena"; then
        cd "$SERENA_DIR"
        echo -e "${PURPLE}   Directory: $SERENA_DIR${NC}"
        echo -e "${PURPLE}   Command: uv run serena start-mcp-server${NC}"
        
        # Start in background
        uv run serena start-mcp-server \
            --project "$KHOVAITON_DIR" \
            --port $SERENA_PORT \
            --transport sse \
            --enable-web-dashboard true > /tmp/serena.log 2>&1 &
        SERENA_PID=$!
        
        # Wait a bit and check if it started
        sleep 5
        if kill -0 $SERENA_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Serena started successfully (PID: $SERENA_PID)${NC}"
            echo -e "${GREEN}   MCP Server: http://0.0.0.0:$SERENA_PORT${NC}"
            echo -e "${GREEN}   Dashboard: http://127.0.0.1:$SERENA_DASHBOARD_PORT/dashboard/index.html${NC}"
            echo $SERENA_PID > /tmp/serena.pid
        else
            echo -e "${RED}❌ Failed to start Serena${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Serena already running on port $SERENA_PORT${NC}"
    fi
    echo ""
}

# Function to show status
show_status() {
    echo -e "${CYAN}📊 APPLICATION STATUS${NC}"
    echo -e "${CYAN}=====================${NC}"
    
    # Check Kho Vai Ton
    if check_port $KHOVAITON_PORT "Kho Vải Tôn"; then
        echo -e "${GREEN}✅ Kho Vải Tôn: Running on http://localhost:$KHOVAITON_PORT${NC}"
    else
        echo -e "${RED}❌ Kho Vải Tôn: Not running${NC}"
    fi
    
    # Check Serena
    if check_port $SERENA_PORT "Serena"; then
        echo -e "${GREEN}✅ Serena MCP: Running on http://0.0.0.0:$SERENA_PORT${NC}"
        echo -e "${GREEN}✅ Serena Dashboard: http://127.0.0.1:$SERENA_DASHBOARD_PORT/dashboard/index.html${NC}"
    else
        echo -e "${RED}❌ Serena: Not running${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 QUICK ACCESS LINKS:${NC}"
    echo -e "${YELLOW}   • Kho Vải Tôn: http://localhost:$KHOVAITON_PORT${NC}"
    echo -e "${YELLOW}   • Serena Dashboard: http://127.0.0.1:$SERENA_DASHBOARD_PORT/dashboard/index.html${NC}"
    echo ""
}

# Function to stop all services
stop_all() {
    echo -e "${RED}🛑 Stopping all services...${NC}"
    
    # Stop Kho Vai Ton
    if [ -f /tmp/khovaiton.pid ]; then
        KHOVAITON_PID=$(cat /tmp/khovaiton.pid)
        if kill -0 $KHOVAITON_PID 2>/dev/null; then
            kill $KHOVAITON_PID
            echo -e "${YELLOW}   Stopped Kho Vải Tôn (PID: $KHOVAITON_PID)${NC}"
        fi
        rm -f /tmp/khovaiton.pid
    fi
    
    # Stop Serena
    if [ -f /tmp/serena.pid ]; then
        SERENA_PID=$(cat /tmp/serena.pid)
        if kill -0 $SERENA_PID 2>/dev/null; then
            kill $SERENA_PID
            echo -e "${YELLOW}   Stopped Serena (PID: $SERENA_PID)${NC}"
        fi
        rm -f /tmp/serena.pid
    fi
    
    # Clean up log files
    rm -f /tmp/khovaiton.log /tmp/serena.log
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Main execution
case "${1:-start}" in
    "start")
        start_khovaiton
        start_serena
        show_status
        
        echo -e "${GREEN}🎉 DUAL APPLICATION SETUP COMPLETE!${NC}"
        echo -e "${GREEN}Both applications are now running and ready to use.${NC}"
        echo ""
        echo -e "${CYAN}💡 USAGE TIPS:${NC}"
        echo -e "${CYAN}   • Use 'bash start-dual-apps.sh stop' to stop all services${NC}"
        echo -e "${CYAN}   • Use 'bash start-dual-apps.sh status' to check status${NC}"
        echo -e "${CYAN}   • Use 'bash start-dual-apps.sh restart' to restart all services${NC}"
        echo ""
        ;;
    "stop")
        stop_all
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_all
        sleep 2
        start_khovaiton
        start_serena
        show_status
        ;;
    *)
        echo -e "${RED}Usage: $0 {start|stop|status|restart}${NC}"
        exit 1
        ;;
esac
