# 🚂 Railway Deployment Guide для Fanfiq

## Обзор архитектуры

Проект Fanfiq развертывается на Railway как набор микросервисов:

- **api** - FastAPI backend с REST API
- **frontend** - Next.js веб-приложение
- **workers** - Celery воркеры для фоновых задач
- **parsers-ficbook** - Парсер для Ficbook

Каждый сервис имеет свою папку в `railway/` с Dockerfile.

## 📋 Предварительные требования

1. Аккаунт на [Railway](https://railway.app)
2. Подключенный GitHub репозиторий
3. Railway CLI (опционально): `npm install -g @railway/cli`

## 🚀 Пошаговое развертывание

### Шаг 1: Подготовка репозитория

Убедитесь, что в вашем репозитории есть папка `railway/` со следующей структурой:

```
railway/
├── api/
│   └── Dockerfile
├── frontend/
│   └── Dockerfile
├── workers/
│   └── Dockerfile
├── parsers-ficbook/
│   └── Dockerfile
├── docker-compose.prod.yml
└── production-env-example
```

### Шаг 2: Создание проекта на Railway

1. Перейдите в [Railway Dashboard](https://railway.app/dashboard)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите ваш репозиторий с Fanfiq
4. Railway автоматически обнаружит сервисы по Dockerfile'ам

### Шаг 3: Настройка сервисов

Railway создаст отдельные сервисы для каждой папки с Dockerfile. Вам нужно настроить каждый сервис:

#### API Service (`railway/api/`)

1. **Service Settings:**
   - Root Directory: `railway/api`
   - Dockerfile Path: `Dockerfile`

2. **Environment Variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   PORT=${{PORT}}
   PYTHONPATH=/app
   EXTERNAL_API_URL=${{RAILWAY_STATIC_URL}}
   DEBUG=False
   LOG_LEVEL=INFO
   SECRET_KEY=your-secret-key-here
   SENTRY_DSN=your-sentry-dsn-here
   ```

3. **Database:**
   - Добавьте PostgreSQL плагин в Railway
   - Установите переменную `DATABASE_URL`

4. **Redis:**
   - Добавьте Redis плагин в Railway
   - Установите переменную `REDIS_URL`

#### Frontend Service (`railway/frontend/`)

1. **Service Settings:**
   - Root Directory: `railway/frontend`
   - Dockerfile Path: `Dockerfile`

2. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://${{api.RAILWAY_STATIC_URL}}
   PORT=${{PORT}}
   NODE_ENV=production
   ```

3. **Build Settings:**
   - Build Command: `npm run build` (уже в Dockerfile)
   - Start Command: `node server.js` (уже в Dockerfile)

#### Workers Service (`railway/workers/`)

1. **Service Settings:**
   - Root Directory: `railway/workers`
   - Dockerfile Path: `Dockerfile`

2. **Environment Variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   CELERY_BROKER_URL=${{Redis.REDIS_URL}}
   CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}
   PYTHONPATH=/app
   ```

3. **Start Command:**
   ```
   celery -A backend.workers.celery_app worker -Q crawl,normalize -l info --concurrency 2
   ```

#### Parsers Service (`railway/parsers-ficbook/`)

1. **Service Settings:**
   - Root Directory: `railway/parsers-ficbook`
   - Dockerfile Path: `Dockerfile`

2. **Environment Variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   PREFECT_API_URL=your-prefect-api-url
   PYTHONPATH=/app
   ```

3. **Start Command:**
   ```
   prefect worker start --pool ficbook-pool
   ```

### Шаг 4: Настройка базы данных

1. В Railway dashboard добавьте **PostgreSQL** плагин
2. После создания, Railway автоматически установит `DATABASE_URL`
3. Запустите миграции (можно через Railway CLI или добавить в Dockerfile):

```bash
# Через Railway CLI
railway run --service api alembic upgrade head
```

### Шаг 5: Настройка Redis

1. В Railway dashboard добавьте **Redis** плагин
2. Railway автоматически установит `REDIS_URL`
3. Redis будет использоваться для кэширования и Celery broker

### Шаг 6: Домены и Networking

1. **API Domain:**
   - Railway автоматически создаст домен для API: `api-production-xxxx.railway.app`

2. **Frontend Domain:**
   - Railway автоматически создаст домен для frontend: `frontend-production-xxxx.railway.app`

3. **Environment Variables для Frontend:**
   - Установите `NEXT_PUBLIC_API_URL` на домен API сервиса

### Шаг 7: Проверка развертывания

1. **API Health Check:**
   ```bash
   curl https://api-production-xxxx.railway.app/health
   ```

2. **Frontend:**
   - Откройте `https://frontend-production-xxxx.railway.app`

3. **Logs:**
   - В Railway dashboard перейдите в каждый сервис
   - Проверьте логи на наличие ошибок

## 🔧 Troubleshooting

### Ошибка: "Module not found" или импорты

**Решение:** Убедитесь, что `PYTHONPATH=/app` установлен в переменных окружения API сервиса.

### Ошибка: Database connection failed

**Решение:**
1. Проверьте, что PostgreSQL плагин добавлен
2. Убедитесь, что `DATABASE_URL` правильно установлен
3. Проверьте логи PostgreSQL в Railway dashboard

### Ошибка: Redis connection failed

**Решение:**
1. Проверьте, что Redis плагин добавлен
2. Убедитесь, что `REDIS_URL` правильно установлен
3. Проверьте логи Redis в Railway dashboard

### Ошибка: Build failed

**Решение:**
1. Проверьте логи сборки в Railway dashboard
2. Убедитесь, что все файлы правильно скопированы в Dockerfile
3. Проверьте зависимости в requirements.txt

## 📊 Мониторинг и логи

### Railway Dashboard
- Перейдите в каждый сервис для просмотра логов
- Мониторьте использование CPU/RAM
- Настройте алерты для ошибок

### Health Checks
Railway автоматически выполняет health checks на основе команд в Dockerfile.

### Логи приложений
```bash
# Через Railway CLI
railway logs --service api
railway logs --service frontend
```

## 🔄 Обновление и деплой

### Автоматический деплой
Railway автоматически передеплоивает при push в main ветку.

### Ручной деплой
```bash
# Через Railway CLI
railway up

# Или через Git
git push origin main
```

### Rollback
В Railway dashboard можно откатиться к предыдущей версии.

## 💰 Оценка стоимости

Railway предоставляет бесплатный tier с ограничениями:

- **Hobby Plan:** $5/месяц
  - 512MB RAM, 1GB диск
  - Подходит для разработки и небольшого трафика

- **Pro Plan:** $10/месяц
  - 1GB RAM, 5GB диск
  - Подходит для production

**Ориентировочная стоимость:**
- PostgreSQL: $5/месяц
- Redis: $5/месяц
- API (Python): $5/месяц
- Frontend (Node.js): $5/месяц
- Workers: $5/месяц

**Итого:** ~$30/месяц для полного стека

## 🚀 Оптимизация производительности

### Railway-specific оптимизации:
1. Используйте Railway volumes для персистентных данных
2. Настройте health checks для быстрого перезапуска
3. Используйте Railway's built-in caching для зависимостей

### Application оптимизации:
1. Настройте Gunicorn для production (вместо uvicorn)
2. Включите compression в Nginx (если используете)
3. Настройте кэширование Redis
4. Оптимизируйте Docker образы

## 🔐 Безопасность

1. **Environment Variables:**
   - Никогда не коммитьте секреты в код
   - Используйте Railway's environment variables
   - Регулярно ротируйте ключи

2. **Database:**
   - Используйте strong passwords
   - Включите SSL соединения
   - Регулярно обновляйте PostgreSQL

3. **API:**
   - Включите CORS только для нужных доменов
   - Используйте HTTPS (Railway предоставляет автоматически)
   - Валидируйте все входные данные

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте Railway documentation: https://docs.railway.app/
2. Проверьте логи в Railway dashboard
3. Используйте Railway CLI для диагностики: `railway logs`
4. Создайте issue в репозитории проекта

---

**🎉 Поздравляем!** Ваш Fanfiq проект готов к production на Railway!

После завершения настройки вы получите:
- Полнофункциональное веб-приложение
- Масштабируемый API
- Фоновые воркеры для парсинга
- Автоматическое масштабирование
- Мониторинг и логирование
