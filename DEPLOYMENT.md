# 🚀 Fanfiq Deployment Guide

## Quick Start (YOLO Mode)

### 1. Local Development
```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev
```

### 2. Docker Deployment
```bash
# Build and run all services
docker-compose up --build -d

# Or use deployment script
chmod +x deploy.sh
./deploy.sh
```

### 3. Manual Docker Build
```bash
# Frontend
cd frontend
docker build -t fanfiq-frontend .
docker run -p 3000:3000 fanfiq-frontend

# Backend
cd backend
docker build -t fanfiq-api .
docker run -p 8000:8000 fanfiq-api
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js React App |
| API | 8000 | FastAPI Backend |
| Database | 5432 | PostgreSQL |
| Redis | 6379 | Cache & Queue |
| Parsers | N/A | Background workers |

## Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fanfiq

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Production Deployment

### Railway
1. Connect GitHub repository
2. Add services:
   - Frontend: `frontend/` directory
   - API: `backend/` directory
   - Database: PostgreSQL
   - Redis: Redis

### Vercel (Frontend only)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

## Troubleshooting

### Frontend Issues
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### API Issues
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Docker Issues
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```
