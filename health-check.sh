#!/bin/bash

# Health Check Script for Kho Vải Tồn Docker Services
# Kiểm tra trạng thái của các services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check service health
check_service() {
    local service_name="$1"
    local url="$2"
    local expected_status="$3"
    
    print_status "Checking $service_name..."
    
    if response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null); then
        http_code="${response: -3}"
        body="${response%???}"
        
        if [ "$http_code" = "$expected_status" ]; then
            print_success "$service_name is healthy (HTTP $http_code)"
            if [ "$service_name" = "Backend API" ]; then
                echo "  Response: $body" | head -1
            fi
            return 0
        else
            print_error "$service_name returned HTTP $http_code (expected $expected_status)"
            return 1
        fi
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Function to check Docker containers
check_containers() {
    print_status "Checking Docker containers..."
    
    if ! docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep khovaiton; then
        print_error "No Kho Vải Tồn containers found"
        return 1
    fi
    
    # Check if containers are running
    backend_status=$(docker ps --filter "name=khovaiton-backend" --format "{{.Status}}")
    frontend_status=$(docker ps --filter "name=khovaiton-frontend" --format "{{.Status}}")
    
    if [[ $backend_status == *"Up"* ]]; then
        print_success "Backend container is running"
    else
        print_error "Backend container is not running"
        return 1
    fi
    
    if [[ $frontend_status == *"Up"* ]]; then
        print_success "Frontend container is running"
    else
        print_error "Frontend container is not running"
        return 1
    fi
}

# Function to show service URLs
show_urls() {
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Frontend Application: http://localhost:3004"
    echo "  🔧 Backend API: http://localhost:3001"
    echo "  ❤️  Health Check: http://localhost:3001/api/health"
    echo ""
}

# Main health check
main() {
    echo "🏥 Kho Vải Tồn - Health Check"
    echo "================================"
    echo ""
    
    # Check Docker containers first
    if ! check_containers; then
        print_error "Container check failed. Please start the services first:"
        echo "  ./docker-start.sh dev"
        exit 1
    fi
    
    echo ""
    
    # Check backend API
    if ! check_service "Backend API" "http://localhost:3001/api/health" "200"; then
        print_error "Backend API health check failed"
        exit 1
    fi
    
    # Check frontend
    if ! check_service "Frontend" "http://localhost:3004" "200"; then
        print_error "Frontend health check failed"
        exit 1
    fi
    
    echo ""
    print_success "All services are healthy! 🎉"
    show_urls
    
    # Optional: Show recent logs
    if [ "$1" = "--logs" ]; then
        echo ""
        print_status "Recent logs (last 5 lines):"
        echo "Backend:"
        docker logs khovaiton-backend-dev --tail=5 2>/dev/null | sed 's/^/  /'
        echo ""
        echo "Frontend:"
        docker logs khovaiton-frontend-dev --tail=5 2>/dev/null | sed 's/^/  /'
    fi
}

# Run main function
main "$@"
