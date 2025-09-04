#!/bin/sh

# Exit on any error
set -e

# Set python path to allow imports from project root
export PYTHONPATH=/app

# Run alembic migrations
echo "Running Alembic migrations..."
alembic -c /app/backend/api/alembic.ini upgrade head

# Start Uvicorn server
echo "Starting Uvicorn server..."
uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
