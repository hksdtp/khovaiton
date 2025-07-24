#!/bin/bash

# Start Full Kho Vải Tồn Application
# This script starts both frontend and backend servers

echo "🚀 Starting Kho Vải Tồn Full Application..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Killing process on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check and kill existing processes
echo -e "${BLUE}🔍 Checking for existing processes...${NC}"

if check_port 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use${NC}"
    kill_port 3001
fi

if check_port 3004; then
    echo -e "${YELLOW}⚠️  Port 3004 is in use${NC}"
    kill_port 3004
fi

# Install backend dependencies if needed
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📥 Installing backend dependencies...${NC}"
    cd server
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Install frontend dependencies if needed
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Starting servers...${NC}"
echo ""

# Start backend server in background
echo -e "${BLUE}🖥️  Starting Mock API Server on port 3001...${NC}"
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if check_port 3001; then
    echo -e "${GREEN}✅ Mock API Server started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Mock API Server${NC}"
    exit 1
fi

# Start frontend server
echo -e "${BLUE}🌐 Starting Frontend Server on port 3004...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if check_port 3004; then
    echo -e "${GREEN}✅ Frontend Server started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Frontend Server${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Full Application Started Successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Server Status:${NC}"
echo -e "   🖥️  Mock API Server: ${GREEN}http://localhost:3001${NC}"
echo -e "   🌐 Frontend Server:  ${GREEN}http://localhost:3004${NC}"
echo ""
echo -e "${BLUE}🔗 Available URLs:${NC}"
echo -e "   📱 Sale Version:      ${GREEN}http://localhost:3004/sale${NC}"
echo -e "   📢 Marketing Version: ${GREEN}http://localhost:3004/marketing${NC}"
echo -e "   🏠 Home Page:         ${GREEN}http://localhost:3004/${NC}"
echo ""
echo -e "${BLUE}🛠️  API Endpoints:${NC}"
echo -e "   📡 Health Check:      ${GREEN}http://localhost:3001/api/health${NC}"
echo -e "   🖼️  Cloudinary Sync:   ${GREEN}http://localhost:3001/api/cloudinary-sync${NC}"
echo -e "   📋 Fabric Mappings:   ${GREEN}http://localhost:3001/api/fabric-mappings${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Press ${BLUE}Ctrl+C${NC} to stop both servers"
echo -e "   • API status should now show ${GREEN}'Khả dụng'${NC}"
echo -e "   • All sync functions will work properly"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port 3001
    kill_port 3004
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
echo -e "${BLUE}🔄 Servers are running... Press Ctrl+C to stop${NC}"
wait
