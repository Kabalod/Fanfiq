# Railway Workers Service
FROM python:3.11-slim

# Force cache bust
ENV CACHE_BUSTER_WORKERS=20250104_092000
RUN echo "Workers build: $CACHE_BUSTER_WORKERS"

# Working dir & PYTHONPATH
WORKDIR /app
ENV PYTHONPATH="/app"

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy workers code
COPY workers/ ./workers/
COPY backend/ ./backend/

# Create non-root user
RUN groupadd -r worker && useradd -r -g worker worker
RUN chown -R worker:worker /app
USER worker

# Railway sets Start Command. Default container sleeps.
CMD ["sh", "-lc", "sleep infinity"]
