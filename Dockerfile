# Railway Fanfiq API - Nuclear rebuild v5 - Maximum cache destruction
FROM python:3.12.0-slim

# Nuclear cache busting
ENV CACHE_BUSTER_V5=20250104_$(date +%s)
RUN echo "Nuclear rebuild v5 - $(date)" > /tmp/cache_buster

# Set metadata
LABEL maintainer="Fanfiq Team"
LABEL version="4.0"
LABEL description="Fanfiq API Service"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Set Python path
ENV PYTHONPATH="/app"
ENV PYTHONUNBUFFERED=1

# Copy requirements first for better caching
COPY backend/api/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir structlog==25.4.0

# Copy application code
COPY backend/ ./backend/

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start command
CMD ["python", "-m", "uvicorn", "backend.api.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
