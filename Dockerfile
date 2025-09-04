# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app
ENV PYTHONPATH="/app"

# 3. Install System Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# 4. Copy all project source code (монорепо)
COPY . /app

# 5. Install Python Dependencies
# Поддержка двух вариантов контекста: корень репо или backend/api
RUN if [ -f /app/backend/api/requirements.txt ]; then \
        pip install --no-cache-dir -r /app/backend/api/requirements.txt ; \
    elif [ -f /app/requirements.txt ]; then \
        pip install --no-cache-dir -r /app/requirements.txt ; \
    else \
        echo "requirements.txt not found" && exit 1 ; \
    fi

# Убедимся, что structlog установлен
RUN pip install --no-cache-dir structlog==25.4.0

# 6. Expose API port
EXPOSE ${PORT:-8000}

# 7. Start API (expand $PORT on Railway)
WORKDIR /app
CMD ["sh", "-c", "python -m uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]



