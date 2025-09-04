#!/bin/bash

# Railway Deployment Test Script
# Tests production Docker images locally before deploying to Railway

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Test API service
test_api() {
    print_status "Testing API service..."

    cd api

    # Build image
    print_status "Building API image..."
    docker build -t fanfiq-api:test .

    # Run container
    print_status "Starting API container..."
    docker run -d --name fanfiq-api-test \
        -p 8000:8000 \
        -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
        -e REDIS_URL="redis://localhost:6379/0" \
        -e PORT=8000 \
        -e PYTHONPATH=/app \
        fanfiq-api:test

    # Wait for startup
    sleep 10

    # Test health endpoint
    if curl -f http://localhost:8000/health 2>/dev/null; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        docker logs fanfiq-api-test
        return 1
    fi

    # Cleanup
    docker stop fanfiq-api-test
    docker rm fanfiq-api-test

    cd ..
}

# Test Frontend service
test_frontend() {
    print_status "Testing Frontend service..."

    cd frontend

    # Build image
    print_status "Building Frontend image..."
    docker build -t fanfiq-frontend:test .

    # Run container
    print_status "Starting Frontend container..."
    docker run -d --name fanfiq-frontend-test \
        -p 3000:3000 \
        -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
        -e PORT=3000 \
        fanfiq-frontend:test

    # Wait for startup
    sleep 15

    # Test if service is responding
    if curl -f http://localhost:3000 2>/dev/null; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
        docker logs fanfiq-frontend-test
        return 1
    fi

    # Cleanup
    docker stop fanfiq-frontend-test
    docker rm fanfiq-frontend-test

    cd ..
}

# Test Workers service
test_workers() {
    print_status "Testing Workers service..."

    cd workers

    # Build image
    print_status "Building Workers image..."
    docker build -t fanfiq-workers:test .

    # Run container (will fail without broker, but tests build)
    print_status "Testing Workers build..."
    if docker run --rm fanfiq-workers:test echo "Build successful"; then
        print_success "Workers build successful"
    else
        print_error "Workers build failed"
        return 1
    fi

    cd ..
}

# Test Parsers service
test_parsers() {
    print_status "Testing Parsers service..."

    cd parsers-ficbook

    # Build image
    print_status "Building Parsers image..."
    docker build -t fanfiq-parsers:test .

    # Run container (will fail without broker, but tests build)
    print_status "Testing Parsers build..."
    if docker run --rm fanfiq-parsers:test echo "Build successful"; then
        print_success "Parsers build successful"
    else
        print_error "Parsers build failed"
        return 1
    fi

    cd ..
}

# Main test function
main() {
    print_status "Starting Railway deployment tests..."
    print_warning "Make sure Docker is running and you have sufficient disk space"

    local failed_tests=()

    # Test each service
    if ! test_api; then
        failed_tests+=("api")
    fi

    if ! test_frontend; then
        failed_tests+=("frontend")
    fi

    if ! test_workers; then
        failed_tests+=("workers")
    fi

    if ! test_parsers; then
        failed_tests+=("parsers")
    fi

    # Cleanup
    print_status "Cleaning up test images..."
    docker rmi fanfiq-api:test fanfiq-frontend:test fanfiq-workers:test fanfiq-parsers:test 2>/dev/null || true

    # Results
    if [ ${#failed_tests[@]} -eq 0 ]; then
        print_success "All tests passed! Ready for Railway deployment."
        echo ""
        print_status "Next steps:"
        echo "1. Push changes to GitHub"
        echo "2. Create Railway project from GitHub repo"
        echo "3. Configure environment variables"
        echo "4. Deploy!"
        exit 0
    else
        print_error "Some tests failed: ${failed_tests[*]}"
        echo ""
        print_status "Troubleshooting:"
        echo "1. Check Docker logs: docker logs <container-name>"
        echo "2. Verify Dockerfile syntax"
        echo "3. Check file paths in COPY commands"
        echo "4. Ensure all dependencies are in requirements.txt"
        exit 1
    fi
}

# Show usage
usage() {
    echo "Railway Deployment Test Script"
    echo ""
    echo "Usage: $0 [service]"
    echo ""
    echo "Services:"
    echo "  api       - Test API service only"
    echo "  frontend  - Test Frontend service only"
    echo "  workers   - Test Workers service only"
    echo "  parsers   - Test Parsers service only"
    echo "  all       - Test all services (default)"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 api"
    echo "  $0 frontend"
}

# Handle arguments
case "${1:-all}" in
    "api")
        test_api
        ;;
    "frontend")
        test_frontend
        ;;
    "workers")
        test_workers
        ;;
    "parsers")
        test_parsers
        ;;
    "all")
        main
        ;;
    *)
        usage
        exit 1
        ;;
esac
