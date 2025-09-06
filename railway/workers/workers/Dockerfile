# 1. Base Image
FROM python:3.11-slim

# 2. Working dir & PYTHONPATH
WORKDIR /app
ENV PYTHONPATH="/app"

# 3. System deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# 4. Copy monorepo
COPY . /app

# 5. Python deps
RUN if [ -f /app/backend/api/requirements.txt ]; then \
        pip install --no-cache-dir -r /app/backend/api/requirements.txt ; \
    elif [ -f /app/requirements.txt ]; then \
        pip install --no-cache-dir -r /app/requirements.txt ; \
    else \
        echo "requirements.txt not found" && exit 1 ; \
    fi

# Railway задаёт Start Command. По умолчанию контейнер спит.
CMD ["sh", "-lc", "sleep infinity"]



