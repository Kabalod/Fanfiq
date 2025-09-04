#!/bin/bash

# Railway Deployment Script
# Automates Railway deployment process

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v railway >/dev/null 2>&1; then
        print_error "Railway CLI not found. Install it with: npm install -g @railway/cli"
        exit 1
    fi

    if ! command -v git >/dev/null 2>&1; then
        print_error "Git not found. Please install Git."
        exit 1
    fi

    if [ ! -f "../railway/api/Dockerfile" ]; then
        print_error "Railway Dockerfiles not found. Run this script from railway/ directory."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Login to Railway
railway_login() {
    print_status "Checking Railway authentication..."
    if ! railway whoami >/dev/null 2>&1; then
        print_warning "Not logged in to Railway. Please login:"
        railway login
    else
        print_success "Already logged in to Railway"
    fi
}

# Create Railway project
create_project() {
    local project_name="${1:-fanfiq}"

    print_status "Creating Railway project: $project_name"

    if railway project list | grep -q "$project_name"; then
        print_warning "Project $project_name already exists"
        railway project switch "$project_name"
    else
        railway project create "$project_name"
        print_success "Project $project_name created"
    fi
}

# Add environment variables
setup_environment() {
    print_status "Setting up environment variables..."

    # Database
    railway variables set DATABASE_URL "\${{Postgres.DATABASE_URL}}" || true

    # Redis
    railway variables set REDIS_URL "\${{Redis.REDIS_URL}}" || true

    # API settings
    railway variables set PORT 8000 || true
    railway variables set PYTHONPATH /app || true
    railway variables set DEBUG False || true
    railway variables set LOG_LEVEL INFO || true

    # Frontend settings
    railway variables set NEXT_PUBLIC_API_URL "https://\${{api.RAILWAY_STATIC_URL}}" || true
    railway variables set NODE_ENV production || true

    # Workers settings
    railway variables set CELERY_BROKER_URL "\${{Redis.REDIS_URL}}" || true
    railway variables set CELERY_RESULT_BACKEND "\${{Redis.REDIS_URL}}" || true

    print_success "Environment variables configured"
}

# Add Railway plugins
add_plugins() {
    print_status "Adding Railway plugins..."

    # PostgreSQL
    print_status "Adding PostgreSQL plugin..."
    railway add postgres || print_warning "PostgreSQL plugin may already exist"

    # Redis
    print_status "Adding Redis plugin..."
    railway add redis || print_warning "Redis plugin may already exist"

    print_success "Plugins added"
}

# Deploy services
deploy_services() {
    print_status "Deploying services..."

    # Railway will automatically detect services from Dockerfiles
    # We just need to push to trigger deployment
    print_status "Pushing changes to trigger deployment..."
    git add .
    git commit -m "Railway deployment setup" || print_warning "No changes to commit"
    git push origin main

    print_success "Deployment triggered"
}

# Show status
show_status() {
    print_status "Deployment status:"
    echo ""
    railway project list
    echo ""
    print_status "Service URLs will be available in Railway dashboard"
    print_status "Check Railway dashboard for deployment progress"
}

# Main deployment function
main() {
    print_status "Starting Railway deployment for Fanfiq..."
    print_warning "This script will:"
    echo "  - Create Railway project"
    echo "  - Add PostgreSQL and Redis plugins"
    echo "  - Configure environment variables"
    echo "  - Trigger deployment"

    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi

    check_prerequisites
    railway_login
    create_project
    add_plugins
    setup_environment
    deploy_services
    show_status

    print_success "Railway deployment completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Go to Railway dashboard: https://railway.app/dashboard"
    echo "2. Monitor deployment progress"
    echo "3. Configure custom domains if needed"
    echo "4. Set up monitoring and alerts"
}

# Show usage
usage() {
    echo "Railway Deployment Script"
    echo ""
    echo "Usage: $0 [project-name]"
    echo ""
    echo "Arguments:"
    echo "  project-name  - Name for Railway project (default: fanfiq)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 my-fanfiq-project"
    echo ""
    echo "Prerequisites:"
    echo "  - Railway CLI: npm install -g @railway/cli"
    echo "  - Git repository with railway/ directory"
    echo "  - Railway account"
}

# Handle arguments
case "${1:-}" in
    "-h"|"--help")
        usage
        exit 0
        ;;
    *)
        PROJECT_NAME="${1:-fanfiq}"
        main "$PROJECT_NAME"
        ;;
esac
