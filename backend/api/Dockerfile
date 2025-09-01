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
RUN pip install --no-cache-dir -r /app/backend/api/requirements.txt

# 6. Expose API port
EXPOSE 58090

# 7. Start API
WORKDIR /app
CMD ["python", "-m", "uvicorn", "backend.api.app.main:app", "--host", "0.0.0.0", "--port", "58090"]
