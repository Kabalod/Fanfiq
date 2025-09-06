#!/bin/bash

echo "🚀 Starting Fanfiq deployment..."

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Service logs:"
docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "🗄️ Database: localhost:5432"
echo "⚡ Redis: localhost:6379"
