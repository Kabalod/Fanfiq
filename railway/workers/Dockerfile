# Production Dockerfile for Fanfiq Workers
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

# Copy requirements
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
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
    CMD python -c "import redis; r = redis.Redis(host='localhost', port=6379); r.ping()" || exit 1

# Start command (Railway will override this)
CMD ["celery", "-A", "backend.workers.celery_app:app", "worker", "-Q", "crawl,normalize", "-l", "info", "--concurrency", "2"]
