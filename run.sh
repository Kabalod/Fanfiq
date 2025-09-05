#!/bin/bash

# Exit on any error
set -e

# Set python path to allow imports from project root
export PYTHONPATH=/app

# Change to the API directory to run migrations
cd /app/backend/api

# Run alembic migrations
echo "Running Alembic migrations..."
alembic upgrade head

# Change back to the root directory
cd /app

# Start Uvicorn server
echo "Starting Uvicorn server..."
PORT_VALUE=${PORT:-8000}
echo "Using port: $PORT_VALUE"
exec uvicorn backend.api.app.main:app --host 0.0.0.0 --port $PORT_VALUE
