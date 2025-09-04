# 🐳 Docker Optimization Guide для Fanfiq

## Проблемы и решения

### 1. **Медленная сборка образов**

**Проблема**: Каждый билд копирует весь монорепо, включая node_modules и другие тяжелые файлы.

**Решения**:

#### A. Улучшенный .dockerignore
```dockerignore
# Уже создан в корне проекта
node_modules/
.git/
*.log
.env*
__pycache__/
.pytest_cache/
.coverage/
htmlcov/
```

#### B. Multi-stage builds для Python
```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev --no-root

# Runtime stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
COPY . .
EXPOSE 58090
CMD ["uvicorn", "backend.api.app.main:app", "--host", "0.0.0.0", "--port", "58090"]
```

#### C. Layer caching
```dockerfile
# Копируем файлы зависимостей первыми
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-root

# Затем копируем исходный код
COPY backend/ ./backend/
COPY parsers/ ./parsers/
```

### 2. **Конфликты зависимостей**

**Проблема**: Твердые версии в requirements.txt вызывают конфликты.

**Решения**:

#### A. Poetry для управления зависимостями
```bash
# Установка Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Конфигурация
poetry config virtualenvs.in-project true

# Установка зависимостей
poetry install
```

#### B. Использование pyproject.toml (уже создан)
- Гибкие версии с ^ и ~
- Группы зависимостей (main, dev, parsers)
- Автоматическое разрешение конфликтов

### 3. **Проблемы с сетевыми зависимостями**

**Проблема**: Сервисы запускаются до того, как другие будут готовы.

**Решения**:

#### A. Health checks в docker-compose
```yaml
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "scripts/health-check.py"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### B. Wait scripts
```bash
#!/bin/bash
# wait-for-it.sh
until nc -z $1 $2; do
  echo "Waiting for $1:$2..."
  sleep 1
done
echo "$1:$2 is available"
```

### 4. **Проблемы с локальным развитием**

**Проблема**: Разработчики запускают приложения локально, а инфраструктуру в Docker.

**Решения**:

#### A. Docker Compose override для разработки
```yaml
# docker-compose.override.yml (уже создан)
version: "3.9"
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/app
    environment:
      - DEBUG=True
    command: ["uvicorn", "backend.api.app.main:app", "--reload"]
```

#### B. Автоматизированные скрипты
- `dev.sh` - скрипт быстрого старта
- `Makefile` - команды для всех операций
- Health check скрипты

## 🚀 Быстрые команды

### Для ежедневной разработки
```bash
# Быстрый старт (рекомендуется)
./dev.sh start

# Через Makefile
make dev

# Только инфраструктура
docker compose -f infra/docker-compose.yml up -d
```

### Для Docker-only разработки
```bash
# Полная среда
make up

# Сборка образов
make build

# Остановка
make down
```

### Для отладки
```bash
# Проверка здоровья
python scripts/health-check.py

# Логи
docker compose logs -f api

# Вход в контейнер
docker compose exec api bash
```

## 📊 Мониторинг ресурсов

### Очистка Docker
```bash
# Удаление остановленных контейнеров
docker container prune

# Удаление неиспользуемых образов
docker image prune

# Удаление volumes
docker volume prune

# Полная очистка
docker system prune -a --volumes
```

### Оптимизация образов
```bash
# Проверка размера образов
docker images

# История слоев
docker history <image-id>

# Анализ использования диска
docker system df
```

## 🔧 Расширенные оптимизации

### 1. BuildKit
```bash
# Включение BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# В Dockerfile
# syntax=docker/dockerfile:1
```

### 2. Docker Context
```bash
# Использование .dockerignore для уменьшения контекста
echo "node_modules/" >> .dockerignore
echo "*.log" >> .dockerignore
```

### 3. Multi-platform builds
```bash
# Для разных архитектур
docker buildx build --platform linux/amd64,linux/arm64 -t fanfiq/api .
```

### 4. Registry caching
```bash
# Использование GitHub Container Registry
docker build -t ghcr.io/username/fanfiq/api .
docker push ghcr.io/username/fanfiq/api
```

## 🆘 Устранение неполадок

### Конфликты портов
```bash
# Проверка занятых портов
netstat -tulpn | grep :58090

# Изменение портов в .env
PORT=58091
POSTGRES_PORT_HOST=54391
```

### Проблемы с зависимостями
```bash
# Очистка кэша Poetry
poetry cache clear --all .

# Переустановка
rm -rf .venv
poetry install
```

### Проблемы с Docker volumes
```bash
# Просмотр volumes
docker volume ls

# Удаление конкретного volume
docker volume rm fanfiq_db_data

# Очистка всех volumes
docker volume prune
```

## 📈 Производительность

### Метрики для мониторинга
- **Время сборки**: `time docker build .`
- **Размер образа**: `docker images`
- **Использование диска**: `docker system df`
- **Скорость запуска**: замерьте время от `docker run` до готовности сервиса

### Цели оптимизации
- **Время сборки**: < 2 минут для изменений в коде
- **Размер образа**: < 500MB для Python приложений
- **Время запуска**: < 30 секунд
- **Использование RAM**: < 1GB на сервис в development

## 🔗 Полезные ссылки

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Poetry Documentation](https://python-poetry.org/docs/)
- [Docker Compose Health Checks](https://docs.docker.com/compose/compose-file/#healthcheck)
- [BuildKit Advanced Features](https://docs.docker.com/develop/dev-best-practices/)

---

**Рекомендация**: Используйте `./dev.sh start` для быстрого старта разработки. Это скрипт включает все оптимизации и проверки для минимизации проблем.
