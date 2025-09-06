# Railway Parsers Fanficsme Service
FROM python:3.11-slim

# Force cache bust
ENV CACHE_BUSTER_PARSERS_FANFICSME=20250104_092000
RUN echo "Parsers Fanficsme build: $CACHE_BUSTER_PARSERS_FANFICSME"

WORKDIR /app
ENV PYTHONPATH="/app"

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .
COPY requirements.txt ./parsers-fanficsme-requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r parsers-fanficsme-requirements.txt

# Copy necessary code
COPY schemas.py ./backend/parsers/schemas.py
COPY db ./backend/api/db
COPY fanficsme ./parsers/fanficsme

# Create non-root user
RUN groupadd -r parser && useradd -r -g parser parser
RUN chown -R parser:parser /app
USER parser

# Start prefect worker
CMD ["prefect", "worker", "start", "--pool", "fanficsme-pool"]
