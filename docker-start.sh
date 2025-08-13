#!/bin/bash

# Kho Vải Tồn - Docker Startup Script
# This script helps you start the application with Docker

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if command -v docker-compose > /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version > /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    print_success "Docker Compose is available: $DOCKER_COMPOSE_CMD"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev       Start development environment"
    echo "  prod      Start production environment"
    echo "  stop      Stop all containers"
    echo "  restart   Restart all containers"
    echo "  logs      Show logs"
    echo "  clean     Clean up containers and images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start development environment"
    echo "  $0 prod     # Start production environment"
    echo "  $0 logs     # Show logs from all services"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml up --build -d
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3004"
    print_status "Backend API: http://localhost:3001"
    print_status "Use '$0 logs' to view logs"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    $DOCKER_COMPOSE_CMD up --build -d
    print_success "Production environment started!"
    print_status "Application: http://localhost:3004"
    print_status "Backend API: http://localhost:3001"
    print_status "Use '$0 logs' to view logs"
}

# Function to stop containers
stop_containers() {
    print_status "Stopping containers..."
    $DOCKER_COMPOSE_CMD down
    $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down
    print_success "All containers stopped"
}

# Function to restart containers
restart_containers() {
    print_status "Restarting containers..."
    stop_containers
    if [ "$1" = "dev" ]; then
        start_dev
    else
        start_prod
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing logs (press Ctrl+C to exit)..."
    if $DOCKER_COMPOSE_CMD ps | grep -q "khovaiton"; then
        $DOCKER_COMPOSE_CMD logs -f
    elif $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml ps | grep -q "khovaiton"; then
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml logs -f
    else
        print_warning "No running containers found"
    fi
}

# Function to clean up
clean_up() {
    print_status "Cleaning up containers and images..."
    $DOCKER_COMPOSE_CMD down --rmi all --volumes --remove-orphans
    $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_docker_compose

    # Handle command
    case "${1:-help}" in
        "dev")
            start_dev
            ;;
        "prod")
            start_prod
            ;;
        "stop")
            stop_containers
            ;;
        "restart")
            restart_containers "${2:-prod}"
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_up
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@"
