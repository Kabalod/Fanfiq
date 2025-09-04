#!/bin/bash

# Fanfiq Poetry Setup Script
# Sets up Poetry for better Python dependency management

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

# Check if Poetry is installed
if ! command -v poetry >/dev/null 2>&1; then
    print_warning "Poetry not found. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verify Poetry installation
if ! command -v poetry >/dev/null 2>&1; then
    print_error "Failed to install Poetry. Please install it manually."
    exit 1
fi

print_success "Poetry is installed"

# Configure Poetry
print_status "Configuring Poetry..."
poetry config virtualenvs.in-project true
poetry config virtualenvs.prefer-active-python true

# Install dependencies
print_status "Installing Python dependencies with Poetry..."
poetry install

# Install parser dependencies if needed
if [ "${1:-}" = "--with-parsers" ]; then
    print_status "Installing parser dependencies..."
    poetry install --with parsers
fi

print_success "Poetry setup complete!"
echo ""
echo "Usage:"
echo "  poetry run python backend/api/app/main.py    # Run API"
echo "  poetry run pytest                            # Run tests"
echo "  poetry run black backend/                    # Format code"
echo "  poetry shell                                 # Activate virtual environment"
echo ""
print_warning "Don't forget to activate the virtual environment:"
echo "  poetry shell"
echo "or run commands with:"
echo "  poetry run <command>"
