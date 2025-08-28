# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Set PYTHONPATH to the working directory to handle relative imports
ENV PYTHONPATH="/app"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first to leverage Docker cache
# Note: The context for this Dockerfile is the `backend` directory.
COPY ./api/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code (from the `backend` directory)
COPY . .

# The CMD to run is specified in the Railway deploy settings for each service.
