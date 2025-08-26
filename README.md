# Fanfiq — инфраструктура и запуск (MVP)

## Что внутри
- `docker-compose.yml` — инфраструктура: PostgreSQL, Redis, RabbitMQ; профили `optional` для MinIO, pgAdmin, Flower.
- `infra/db/init.sql` — расширения PostgreSQL (`unaccent`, `pg_trgm`) и базовая схема.
- `env/.env.example` — пример переменных окружения с портами, оканчивающимися на ...90.
- `contracts/openapi.yaml` — контракт API (поиск) для синхронизации фронтенда и бэкенда.
- `DEVELOPMENT.md` — гайд для разработки (бек/фронт, команды, договорённости).

## Быстрый старт
1. Скопируйте переменные окружения:
   ```bash
   cp env/.env.example .env
   ```
2. Поднимите базовую инфраструктуру:
   ```bash
   docker compose up -d postgres redis rabbitmq
   ```
3. (Опционально) инструменты:
   ```bash
   docker compose --profile optional up -d pgadmin minio flower
   ```
4. Проверка:
   - PostgreSQL: localhost:${POSTGRES_PORT_HOST:-54390}
   - Redis: localhost:${REDIS_PORT_HOST:-63790}
   - RabbitMQ UI: http://localhost:${RABBITMQ_MGMT_PORT_HOST:-15690}
   - pgAdmin: http://localhost:${PGADMIN_PORT_HOST:-50590}
   - MinIO: http://localhost:${MINIO_CONSOLE_PORT_HOST:-59091}

## Архитектура (кратко)
- Сервисы: `api` (FastAPI), парсеры `parser-*` (по сайтам), `normalizer`, `scheduler`.
- Хранилища: PostgreSQL 16 (FTS: `pg_trgm`+`unaccent`), Redis 7 (кэш), RabbitMQ 3 (очереди), MinIO (опц.).
- Поток: `scheduler → RabbitMQ → parser-* → normalizer → PostgreSQL`; `frontend → api → PostgreSQL/Redis`.
- API: `POST /api/v1/works/search` — фильтры/сортировки по ТЗ. Контракт в `contracts/openapi.yaml`.

## Парсер (CLI)
- Локальный парсинг (без очередей):
  ```bash
  python backend/cli/crawl.py parse --site ficbook --url "https://ficbook.net/readfic/..."
  ```
- Через Celery (Redis):
  ```bash
  docker compose up -d redis
  # воркеры
  export REDIS_URL=redis://localhost:63790/0
  celery -A backend.workers.celery_app:app worker -Q crawl,normalize -l info
  # задача
  python backend/cli/crawl.py enqueue --site ficbook --url "https://ficbook.net/readfic/..." --wait 60
  # экспорт результата
  python backend/cli/export.py --id <work_id>
  ```
- Авторизация для приватных страниц: `FICBOOK_COOKIE="PHPSESSID=...; other=...;"`

## 🎯 План MVP - текущий статус

### ✅ Этап 0 — Инфра и контракты (ГОТОВО)
- Docker Compose инфраструктура
- База данных PostgreSQL с расширениями
- Контракты API (OpenAPI)
- Zod схемы на фронтенде

### ✅ Этап 1 — БД и FTS (ГОТОВО)
- Alembic миграции для схемы
- FTS с GIN индексами и unaccent
- Конструктор SQL запросов
- Модели SQLAlchemy

### ✅ Этап 2 — Очереди и пайплайн (ГОТОВО)
- Celery + Redis брокер
- Парсер Ficbook (полностью готов)
- Нормализатор данных
- CLI инструменты (parse/enqueue/export)
- API эндпоинты для парсинга

### 🚧 Этап 3 — Фронтенд MVP (СЛЕДУЮЩИЙ)
- Next.js + TypeScript + Tailwind
- shadcn/ui компоненты
- Storybook для разработки
- MSW для моков
- Основные модули:
  - `SearchBar` + `FilterPanel`
  - `ResultsList` + `WorkCard` 
  - `ReaderShell` + `ReaderSettings`
  - API клиент с zod валидацией

### ⏳ Этап 4 — Кэш и UX
- Redis кэширование результатов
- Улучшение пользовательского опыта
- Оптимизация производительности

### ⏳ Этап 5 — Наблюдаемость и CI
- Мониторинг и логирование
- Health checks
- Полная CI/CD пайплайн

## 🔧 Что у нас есть сейчас

### Бэкенд (полностью готов)
- **FastAPI API** с эндпоинтами поиска и парсинга
- **PostgreSQL** с FTS индексами и расширениями
- **Redis** для кэширования и Celery брокера
- **Celery воркеры** для парсинга и нормализации
- **Alembic миграции** с полной схемой БД

### Парсер Ficbook (MVP готов)
- Извлечение метаданных и глав
- Поддержка авторизации через cookies
- Механизм повторных попыток с экспоненциальной задержкой
- Ограничение скорости запросов
- Строгая валидация через Pydantic схемы
- CLI инструменты для разработки

### API эндпоинты
- `POST /api/v1/crawl` — парсинг фанфика
- `GET /api/v1/works/{id}` — получение деталей работы
- `POST /api/v1/works/search` — поиск с фильтрами

### Тестирование
- Комплексные unit тесты для парсера
- Покрытие всех полей и граничных случаев
- Тестирование CLI функциональности

## История крупных шагов
- Базовая инфраструктура (compose, init.sql, env) — готово.
- Контракт API и заглушка `search` (FastAPI) — готово.
- Zod-схемы на фронтенде — готово.
- Этапы реализации и промпты для агентов — добавлены в `DEVELOPMENT.md`.
- FTS: добавлены GIN-индексы на выражения и конструктор поиска — готово.
- Полный парсер Ficbook (CLI/API), воркеры Celery и экспорт — готово.
- **MVP бэкенд завершен** — парсер, API, БД, очереди, тесты.

## Как обновляем документацию
- Только два файла: этот README (для пользователя/запуска) и `DEVELOPMENT.md` (для разработки).
- Каждый крупный шаг (инфра/контракт/миграции/парсер/фича фронта) — краткая запись в «История крупных шагов» и деталь в `DEVELOPMENT.md`.

## Примечания
- Порты по умолчанию оканчиваются на «...90» и валидны (< 65535). Рекомендуемый порт API: 58090.
- Для Windows/WSL убедитесь, что Docker Desktop запущен.
- **Следующий приоритет: Этап 3 — Фронтенд MVP**
