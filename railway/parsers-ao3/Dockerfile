# Railway Parsers AO3 Service
FROM python:3.11-slim

# Force cache bust
ENV CACHE_BUSTER_PARSERS_AO3=20250104_092000
RUN echo "Parsers AO3 build: $CACHE_BUSTER_PARSERS_AO3"

WORKDIR /app
ENV PYTHONPATH="/app"

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY ../../backend/api/requirements.txt .
COPY ../../parsers/ao3/requirements.txt ./parsers-ao3-requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r parsers-ao3-requirements.txt

# Copy necessary code
COPY ../../backend/parsers/schemas.py ./backend/parsers/schemas.py
COPY ../../backend/api/db ./backend/api/db
COPY ../../parsers/ao3 ./parsers/ao3

# Create non-root user
RUN groupadd -r parser && useradd -r -g parser parser
RUN chown -R parser:parser /app
USER parser

# Start prefect worker
CMD ["prefect", "worker", "start", "--pool", "ao3-pool"]
