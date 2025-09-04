# Fanfiq Development Makefile
.PHONY: help install dev up down build clean test lint format

# Default target
help: ## Show this help message
	@echo "Fanfiq Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development setup
install: ## Install all dependencies
	@echo "Installing Python dependencies..."
	pip install -r backend/api/requirements.txt
	pip install -r parsers/ao3/requirements.txt
	pip install -r parsers/authortoday/requirements.txt
	pip install -r parsers/fanficsme/requirements.txt
	pip install -r parsers/ficbook/requirements.txt
	pip install -r parsers/litnet/requirements.txt
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install

# Development environment
dev: ## Start development environment with hot reload
	@echo "Starting development environment..."
	docker compose -f infra/docker-compose.yml up -d postgres redis rabbitmq
	@echo "Waiting for services to be ready..."
	sleep 10
	@echo "Starting API server..."
	cd backend/api && uvicorn app.main:app --host 127.0.0.1 --port 58090 --reload &
	@echo "Starting frontend..."
	cd frontend && npm run dev &
	@echo "Development environment started!"
	@echo "API: http://localhost:58090"
	@echo "Frontend: http://localhost:3000"
	@echo "Press Ctrl+C to stop"

# Docker operations
up: ## Start all services with Docker
	docker compose -f infra/docker-compose.yml -f docker-compose.override.yml up -d

down: ## Stop all Docker services
	docker compose -f infra/docker-compose.yml -f docker-compose.override.yml down

build: ## Build all Docker images
	docker compose -f infra/docker-compose.yml -f docker-compose.override.yml build

# Development tasks
test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v
	@echo "Running parser tests..."
	for parser in ao3 authortoday fanficsme ficbook litnet; do \
		echo "Testing $$parser parser..."; \
		python -m pytest parsers/$$parser/tests/ -v || true; \
	done

lint: ## Run linters
	@echo "Running Python linter..."
	python -m flake8 backend/ parsers/ --max-line-length=120 --extend-ignore=E203,W503 || true
	@echo "Running frontend linter..."
	cd frontend && npm run lint

format: ## Format code
	@echo "Formatting Python code..."
	python -m black backend/ parsers/ --line-length=120 || true
	@echo "Formatting frontend code..."
	cd frontend && npm run format || true

# Database operations
db-init: ## Initialize database
	docker compose -f infra/docker-compose.yml up -d postgres
	@echo "Waiting for database..."
	sleep 15
	cd backend/api && alembic upgrade head

db-migrate: ## Create new migration
	cd backend/api && alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Run database migrations
	cd backend/api && alembic upgrade head

# Cleanup
clean: ## Clean up containers, volumes, and cache
	docker compose -f infra/docker-compose.yml -f docker-compose.override.yml down -v
	docker system prune -f
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} +
	cd frontend && rm -rf node_modules/.cache

# Quick commands
api: ## Start API server only
	cd backend/api && uvicorn app.main:app --host 127.0.0.1 --port 58090 --reload

frontend: ## Start frontend only
	cd frontend && npm run dev

workers: ## Start workers only
	cd backend && celery -A workers.celery_app:app worker -Q crawl,normalize -l info

# Health check
health: ## Check health of all services
	@echo "Checking database..."
	docker compose -f infra/docker-compose.yml exec postgres pg_isready -U fanfiq || echo "Database not ready"
	@echo "Checking Redis..."
	docker compose -f infra/docker-compose.yml exec redis redis-cli ping || echo "Redis not ready"
	@echo "Checking RabbitMQ..."
	docker compose -f infra/docker-compose.yml exec rabbitmq rabbitmq-diagnostics check_running || echo "RabbitMQ not ready"
