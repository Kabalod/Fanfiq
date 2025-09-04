# 🚂 Railway Production Deployment

Эта папка содержит конфигурацию для production развертывания Fanfiq на Railway.

## Структура

```
railway/
├── api/                    # API сервис (FastAPI)
│   └── Dockerfile
├── frontend/              # Frontend сервис (Next.js)
│   └── Dockerfile
├── workers/               # Workers сервис (Celery)
│   └── Dockerfile
├── parsers-ficbook/       # Ficbook парсер (Prefect)
│   └── Dockerfile
├── docker-compose.prod.yml # Production Docker Compose
├── production-env-example  # Пример переменных окружения
├── test-deployment.sh     # Скрипт тестирования
├── deploy.sh             # Скрипт развертывания
└── README.md             # Эта инструкция
```

## Быстрый старт

### 1. Тестирование локально

```bash
# Из корня проекта
cd railway
chmod +x test-deployment.sh
./test-deployment.sh all
```

### 2. Развертывание на Railway

```bash
# Из папки railway
chmod +x deploy.sh
./deploy.sh [project-name]
```

Или следуйте [подробной инструкции](../RAILWAY_DEPLOYMENT.md)

## Сервисы

### API Service
- **Папка:** `api/`
- **Технология:** FastAPI + PostgreSQL + Redis
- **Порт:** 8000
- **Health check:** `/health`

### Frontend Service
- **Папка:** `frontend/`
- **Технология:** Next.js + TypeScript
- **Порт:** 3000
- **API URL:** Настраивается через `NEXT_PUBLIC_API_URL`

### Workers Service
- **Папка:** `workers/`
- **Технология:** Celery + Redis
- **Очереди:** `crawl`, `normalize`

### Parsers Service
- **Папка:** `parsers-ficbook/`
- **Технология:** Prefect + Python
- **Pool:** `ficbook-pool`

## Переменные окружения

Скопируйте переменные из `production-env-example` в Railway dashboard для каждого сервиса.

### Обязательные переменные:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Порт приложения

### Опциональные переменные:
- `SENTRY_DSN` - Для мониторинга ошибок
- `SECRET_KEY` - Для JWT токенов
- `DEBUG` - Режим отладки (False для production)

## Локальное тестирование

### Запуск production окружения:

```bash
# Из папки railway
docker compose -f docker-compose.prod.yml up -d
```

### Проверка сервисов:

```bash
# API
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

## Мониторинг

### Railway Dashboard
- Логи каждого сервиса
- Метрики производительности
- Использование ресурсов
- Environment variables

### Health Checks
Каждый сервис имеет встроенные health checks:
- API: HTTP запрос на `/health`
- Database: Проверка соединения
- Redis: PING команда
- Workers: Проверка брокера

## Troubleshooting

### Ошибки сборки
1. Проверьте логи в Railway dashboard
2. Убедитесь, что все файлы скопированы в Dockerfile
3. Проверьте зависимости в requirements.txt

### Проблемы с переменными окружения
1. Проверьте, что все переменные установлены
2. Используйте Railway's variable references: `${{Service.VARIABLE}}`
3. Проверьте логи приложения на ошибки импорта

### Проблемы с подключением к БД
1. Убедитесь, что PostgreSQL плагин добавлен
2. Проверьте `DATABASE_URL` формат
3. Запустите миграции: `alembic upgrade head`

## Производительность

### Оптимизации:
- Multi-stage Docker builds для уменьшения размера образов
- Health checks для быстрого перезапуска
- Environment-specific конфигурации
- Production-ready настройки (DEBUG=False, etc.)

### Масштабирование:
- Railway автоматически масштабирует сервисы
- Используйте Redis для кэширования
- Настройте connection pooling для БД

## Безопасность

- Все секреты хранятся в Railway variables
- HTTPS включен автоматически
- CORS настроен только для нужных доменов
- Database credentials не коммитятся в код

---

## Поддержка

Если возникли проблемы:
1. Проверьте [RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md)
2. Посмотрите логи в Railway dashboard
3. Создайте issue в репозитории

**🎉 Удачного развертывания!**
