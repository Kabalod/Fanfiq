#!/bin/bash

# Fanfiq Development Startup Script
# This script helps minimize dependency and container issues

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
    local service=$1
    local host=$2
    local port=$3
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" >/dev/null 2>&1; then
            print_success "$service is ready!"
            return 0
        fi

        print_status "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 2
        ((attempt++))
    done

    print_error "$service failed to start within expected time"
    return 1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    local missing_tools=()

    if ! command_exists docker; then
        missing_tools+=("docker")
    fi

    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi

    if ! command_exists python3; then
        missing_tools+=("python3")
    fi

    if ! command_exists node; then
        missing_tools+=("node")
    fi

    if ! command_exists npm; then
        missing_tools+=("npm")
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo "Please install them and try again."
        exit 1
    fi

    print_success "All prerequisites are available"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found, creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration"
    fi

    # Create required directories
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/minio

    print_success "Environment setup complete"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."

    docker compose -f infra/docker-compose.yml up -d postgres redis rabbitmq

    # Wait for services to be healthy
    wait_for_service "PostgreSQL" "localhost" "54390"
    wait_for_service "Redis" "localhost" "63790"
    wait_for_service "RabbitMQ" "localhost" "56790"

    print_success "Infrastructure services started"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Install Python dependencies
    if [ -f "pyproject.toml" ]; then
        print_status "Installing Python dependencies with Poetry..."
        pip install poetry
        poetry install
    elif [ -f "backend/api/requirements.txt" ]; then
        print_status "Installing Python dependencies with pip..."
        pip install -r backend/api/requirements.txt
    fi

    # Install Node.js dependencies
    if [ -f "frontend/package.json" ]; then
        print_status "Installing Node.js dependencies..."
        cd frontend
        npm install
        cd ..
    fi

    print_success "Dependencies installed"
}

# Initialize database
init_database() {
    print_status "Initializing database..."

    # Wait a bit more for database to be fully ready
    sleep 5

    # Run migrations
    if [ -d "backend/api" ]; then
        cd backend/api
        print_status "Running database migrations..."
        alembic upgrade head
        cd ../..
    fi

    print_success "Database initialized"
}

# Start application services
start_services() {
    print_status "Starting application services..."

    # Start API server
    if [ -d "backend/api" ]; then
        print_status "Starting API server..."
        cd backend/api
        python -m uvicorn app.main:app --host 127.0.0.1 --port 58090 --reload &
        API_PID=$!
        echo $API_PID > ../../logs/api.pid
        cd ../..
        print_success "API server started (PID: $API_PID)"
    fi

    # Start frontend
    if [ -d "frontend" ]; then
        print_status "Starting frontend..."
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../logs/frontend.pid
        cd ..
        print_success "Frontend started (PID: $FRONTEND_PID)"
    fi

    # Start workers
    if [ -d "backend/workers" ]; then
        print_status "Starting workers..."
        cd backend
        python -m celery -A workers.celery_app worker -Q crawl,normalize -l info &
        WORKER_PID=$!
        echo $WORKER_PID > ../logs/worker.pid
        cd ..
        print_success "Workers started (PID: $WORKER_PID)"
    fi
}

# Show status
show_status() {
    print_success "Development environment is running!"
    echo ""
    echo "Services:"
    echo "  🐘 PostgreSQL: http://localhost:54390"
    echo "  🔴 Redis: http://localhost:63790"
    echo "  🐰 RabbitMQ Management: http://localhost:15690"
    echo "  🚀 API: http://localhost:58090"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  📊 Flower (Celery Monitor): http://localhost:55590"
    echo ""
    echo "To stop: ./dev.sh stop"
    echo "To view logs: ./dev.sh logs"
}

# Stop services
stop_services() {
    print_status "Stopping services..."

    # Stop Docker services
    docker compose -f infra/docker-compose.yml down

    # Stop background processes
    if [ -f "logs/api.pid" ]; then
        kill $(cat logs/api.pid) 2>/dev/null || true
        rm logs/api.pid
        print_success "API server stopped"
    fi

    if [ -f "logs/frontend.pid" ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null || true
        rm logs/frontend.pid
        print_success "Frontend stopped"
    fi

    if [ -f "logs/worker.pid" ]; then
        kill $(cat logs/worker.pid) 2>/dev/null || true
        rm logs/worker.pid
        print_success "Workers stopped"
    fi

    print_success "All services stopped"
}

# Show logs
show_logs() {
    echo "Available log options:"
    echo "  docker  - Docker container logs"
    echo "  api     - API server logs"
    echo "  frontend- Frontend logs"
    echo "  worker  - Worker logs"
}

# Main script
case "${1:-start}" in
    "start")
        print_status "Starting Fanfiq development environment..."
        check_prerequisites
        setup_environment
        start_infrastructure
        install_dependencies
        init_database
        start_services
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        $0 start
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        print_warning "This will remove all containers, volumes, and cache files"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose -f infra/docker-compose.yml down -v --remove-orphans
            rm -rf logs/*.pid
            print_success "Cleanup completed"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the development environment"
        echo "  stop    - Stop all services"
        echo "  restart - Restart the development environment"
        echo "  logs    - Show available log options"
        echo "  status  - Show status of running services"
        echo "  clean   - Clean up containers and volumes"
        exit 1
        ;;
esac
