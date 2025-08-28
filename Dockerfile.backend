# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Set PYTHONPATH to the working directory to handle monorepo imports
ENV PYTHONPATH="/app"

# Install system dependencies needed for libraries like psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first to leverage Docker cache
COPY backend/api/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
COPY backend/ .

# The CMD to run is specified in the railway.toml `startCommand` for each service (api, worker)
