# Fanfiq API - Fresh Build v6 - No Cache
FROM python:3.12.0-slim

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
RUN pip install --no-cache-dir -r requirements.txt

# Ensure structlog is installed
RUN pip install --no-cache-dir structlog==25.4.0

# Copy application code
COPY backend/ ./backend/

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Start command
CMD ["sh", "-c", "python -m uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]