# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app
ENV PYTHONPATH="/app"

# 3. Install System Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# 4. Copy all necessary source code and requirements
COPY . /app

# 5. Install Python Dependencies
RUN pip install --no-cache-dir -r /app/api/requirements.txt
