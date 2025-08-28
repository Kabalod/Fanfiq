# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app
ENV PYTHONPATH="/app"

# 3. Install System Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# 4. Install Python Dependencies
# We use the same requirements.txt as the api for simplicity
COPY ../api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy Shared and Service-Specific Code
# The build context is the `backend` directory.
COPY ./api /app/api
COPY ./workers /app/workers
COPY ./parsers /app/parsers
COPY ./cli /app/cli

# The start command is specified in Railway's deploy settings.
