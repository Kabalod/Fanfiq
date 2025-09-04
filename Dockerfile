# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app
ENV PYTHONPATH="/app"

# 3. Install System Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements first
COPY backend/api/requirements.txt .

# 5. Install Python Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy application code
COPY backend/ ./backend/

# 7. Ensure structlog is installed
RUN pip install --no-cache-dir structlog==25.4.0

# 8. Expose API port
EXPOSE ${PORT:-8000}

# 9. Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# 10. Start API (expand $PORT on Railway)
WORKDIR /app
CMD ["sh", "-c", "python -m uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]



# Force rebuild
