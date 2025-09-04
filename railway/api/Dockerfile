# Production Dockerfile for Fanfiq API Service
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Copy requirements first for better caching
COPY ../../backend/api/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ../../backend/ ./backend/

# Set PYTHONPATH
ENV PYTHONPATH="/app"

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:${PORT:-8000}/health')" || exit 1

# Expose port
EXPOSE ${PORT:-8000}

# Start command
CMD ["sh", "-c", "python -m uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
