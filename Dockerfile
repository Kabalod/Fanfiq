# Railway API Service - Root level paths v8
FROM python:3.12.0-slim

# Force complete cache bust
ENV CACHE_BUSTER_ROOT_LEVEL=20250104_085000
RUN echo "Root level build: $CACHE_BUSTER_ROOT_LEVEL"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libpq-dev \
    curl \
    python3-setuptools \
    python3-distutils \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Copy and install requirements
COPY backend/api/requirements.txt .

# Install setuptools and create distutils
RUN pip install --no-cache-dir setuptools wheel
RUN python -c "import setuptools; print('setuptools installed')"
RUN pip install --no-cache-dir --upgrade pip

# Create distutils if missing
RUN python -c "import sys; sys.path.insert(0, '/usr/lib/python3.12'); import distutils" || \
    (apt-get update && apt-get install -y python3-distutils-extra && \
     ln -sf /usr/lib/python3/dist-packages/distutils /usr/local/lib/python3.12/site-packages/distutils)

# Install requirements
RUN pip install --no-cache-dir -r requirements.txt

# Ensure structlog is available
RUN pip install --no-cache-dir structlog==25.4.0

# Copy backend code
COPY backend/ ./backend/

# Set proper permissions
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Expose port
EXPOSE ${PORT:-8000}

# Start application
CMD ["sh", "-c", "uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
