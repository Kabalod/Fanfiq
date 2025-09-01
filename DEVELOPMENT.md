# Fanfiq — Руководство разработки

## Контракты
- Источник правды: `contracts/openapi.yaml` (поиск `/api/v1/works/search`).
- Фронтенд zod-схемы: `frontend/src/lib/fse/apiSchema.ts`.

## Инфраструктура (локально)
```bash
cp env/.env.example .env
# база
docker compose -f infra/docker-compose.yml up -d postgres redis
# инструменты (опц.)
docker compose -f infra/docker-compose.yml --profile optional up -d pgadmin minio flower
```

## Переменные окружения
- `DATABASE_URL=postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq`
- `REDIS_URL=redis://localhost:63790/0`

## Бэкенд (API)
- Запуск (локально):
```bash
pip install -r backend/api/requirements.txt
uvicorn backend.api.app.main:app --host 127.0.0.1 --port 58090 --reload
```
- Миграции Alembic:
```bash
export DATABASE_URL=postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq
alembic -c backend/api/alembic.ini upgrade head
```

## Деплой на Railway (контейнер)
1. Включите Railway (Dashboard → New Project → Deploy from GitHub → выберите репозиторий `Kabalod/Fanfiq`).
2. В настройках сервиса укажите:
   - Build: Dockerfile → `backend/api/Dockerfile`
   - Variables:
     - `DATABASE_URL` — строка подключения к управляемой PostgreSQL Railway (или внешней)
     - `REDIS_URL` — строка подключения к управляемому Redis Railway (или внешнему)
     - `SEARCH_CACHE_TTL` — по желанию (секунды)
   - Start command не нужен (задан в Dockerfile). PORT предоставляется Railway.
3. Сначала создайте базы в Railway: Add Plugin → PostgreSQL, Redis. Скопируйте URL‑ы в переменные.
4. Деплой: после билда контейнер выполнит миграции и поднимет API (`/api/v1/works/search`).
5. Проверка: откройте публичный URL Railway и вызовите `GET /health`.

## Фронтенд
- Состав: Next.js + TS, Tailwind, shadcn/ui, Storybook, MSW.
- Реализованные модули:
  - ✅ `SearchBar` + `FilterPanel` (рейтинг, категория, статус, предупреждения, теги, фандомы, диапазон слов).
- ✅ `ResultsList` + `WorkCard` (loading/empty/error, badges, сортировки).
  - ✅ `ReaderShell` + `ReaderSettings` (sanitizeHtml, темы light/dark/sepia, сохранение настроек).
  - ✅ API-клиент `searchWorks` (fetch + zod), моки через MSW.
  - ✅ Синхронизация фильтров с URL, пагинация, виртуализация списка.
  - ✅ **Читалка с полной навигацией по главам** (`/works/[id]`).

## Договорённости
- Порты сервисов по умолчанию на «…90».
- Каждый крупный шаг фиксируем в README (кратко) и здесь (детали).
- Коммиты атомарные и осмысленные, с префиксом области: `infra:`, `api:`, `parser:`, `frontend:` и т.п.

## Чеклист качества
- A11y (фокус, aria, контраст), ленты состояний (loading/empty/error), структурированные логи, healthchecks.
- Тесты: pytest для API/бизнес-логики; Storybook для UI.

## Этапы реализации (roadmap)
- ✅ Этап 0 — Инфра и контракты (готово): compose, init.sql, env, OpenAPI, zod, mock API.
- ✅ Этап 1 — БД и FTS:
  - Alembic-миграции для схемы (таблицы, индексы по полям).
  - Реализация конструктора SQL-запросов с `unaccent(lower(...))` и триграммами для полнотекста и фильтрами/сортировками.
- ✅ Этап 2 — Очереди и пайплайн:
  - Celery + RabbitMQ, маршрутизация задач `crawl.{site}` → `normalize.input`.
  - `normalizer` (мэппинг полей, дедуп, upsert).
  - Первый парсер `ficbook`.
- ✅ Этап 3 — Фронтенд MVP (с читалкой и расширенными фильтрами).
- ✅ Этап 4 — Парсер Author.Today (готов к тестированию).
- ⏳ Этап 5 — Новые парсеры (Litnet, Fanfics.me).
- ⏳ Этап 6 — Наблюдаемость и CI.

## Промпты для агентов

### Агент Бэкенд — БД и FTS (Этап 1)
Контекст:
- PostgreSQL 16, расширения `unaccent`, `pg_trgm` уже включены в `infra/db/init.sql`.
- Контракт поиска в `contracts/openapi.yaml`. DTO — `backend/api/app/models.py`.
Задача:
- Создать Alembic и миграции со схемой таблиц: `sites`, `authors`, `works`, `work_fandoms`, `work_tags`, `work_warnings`, `chapters`.
- Индексы: GIN (pg_trgm) на `works.title`, `works.summary`; BTree на `updated_at`, `word_count`, `likes_count`, `comments_count`.
- Реализовать конструктор запроса для `POST /api/v1/works/search` с фильтрами/сортировками и пагинацией. Использовать `unaccent(lower(...))` и триграммы.
Артефакты:
- `backend/api/db/*` (модели SQLAlchemy, сессия, миграции Alembic).
- Обновлённый `backend/api/app/main.py` с реальным запросом в БД.
Критерии приёмки:
- Тестовый запрос с фильтрами возвращает корректные поля, соответствующие DTO.
- План запроса использует индексы (проверка EXPLAIN — опционально).
Команды (пример):
```bash
pip install alembic psycopg2-binary sqlalchemy
alembic init backend/api/alembic
# настроить env.py и создать ревизии
alembic revision -m "init schema"
alembic upgrade head
```

### Агент Парсер — Ficbook (Этап 2)
Контекст:
- Очереди будут `crawl.ficbook` → `normalize.input` (RabbitMQ).
- Стандарт результата — ТЗ 3.1 (структура JSON), минимально: метаданные и хотя бы 1 глава с `content_html`.
Задача:
- Реализовать воркер `parser-ficbook` (Python). Для MVP — Requests + lxml/BS; при блокировках — Playwright (фаза 2).
- Вход: сообщение `{ site: "ficbook", work_id?: string, url?: string }`.
- Выход: отправка нормализатору сообщения со стандартной структурой + `source_site: "ficbook"`.
Артефакты:
- `backend/workers/parser-ficbook/*` (воркер, Dockerfile, requirements).
Критерии приёмки:
- На тестовом URL возвращаются корректные поля; платные/закрытые части пропускаются.

### Агент Нормализатор (Этап 2)
Контекст:
- Вход из парсеров, выход — запись в PostgreSQL по единой схеме.
Задача:
- Мэппинг полей, нормализация тегов/категорий/рейтингов, дедуп (`site_id + site_work_id`), upsert в `works` и связанные таблицы, сохранение глав.
Артефакты:
- `backend/workers/normalizer/*` (consumer, бизнес-логика, unit-тесты мэппинга).
Критерии приёмки:
- Повторная обработка того же произведения не создаёт дубликаты, а обновляет записи и `updated_at`.

### Агент Фронтенд — MVP (Этап 3) ✅ ГОТОВО
Контекст:
- Контракт в `contracts/openapi.yaml`, zod — `frontend/src/lib/fse/apiSchema.ts`.
Задача:
- Бутстрап проекта (Next.js, Tailwind, shadcn/ui, Storybook, MSW).
- Реализовать `SearchBar`, `FilterPanel`, `ResultsList`, `WorkCard`, `ReaderShell`, `ReaderSettings` согласно макетам из `sorce/Components/*`.
- API-клиент `searchWorks` с zod валидацией, моки MSW для сценариев success/empty/error/slow.
- Синхронизация фильтров с URL, пагинация, виртуализация списка.
Артефакты:
- `frontend/*` (структура, компоненты, stories, моки).
Критерии приёмки:
- Демо-страница результатов показывает загрузку, пустое состояние, списки, навигацию, и открытие `ReaderShell`.

### Агент Парсер — Author.Today (Этап 4) ✅ ГОТОВО
Контекст:
- Author.Today — самая популярная русская платформа фанфиков
- Схема парсера аналогична Ficbook (`backend/parsers/schemas.py`)
- Архитектура: парсер + Celery воркер + CLI интеграция
Задача:
- Реализовать парсер HTML Author.Today (`backend/parsers/authortoday.py`)
- Создать Celery воркер (`backend/workers/authortoday/worker.py`)
- Обновить CLI для поддержки Author.Today (`backend/cli/crawl.py`)
- Добавить селекторы для всех полей (заголовок, автор, описание, рейтинг, статус, слова, дата, фандомы, теги, предупреждения, главы)
- Интегрировать с существующей архитектурой (Celery, нормализатор)
Артефакты:
- `backend/parsers/authortoday.py` — основной парсер
- `backend/workers/authortoday/` — Celery воркер
- Обновлённые CLI и конфигурация
Критерии приёмки:
- Локальный парсинг: `python backend/cli/crawl.py parse --site authortoday --url "https://author.today/work/..."` возвращает валидный JSON
- Celery воркер: `python backend/cli/crawl.py enqueue --site authortoday --url "..." --wait 60` успешно парсит и сохраняет в БД

### Агент DevOps — Очереди и оркестрация (Этап 2/5)
Контекст:
- Compose уже поднимает Postgres/Redis/RabbitMQ. Нужно добавить сервисы приложений в профиль `app`.
Задача:
- Добавить контейнеры `api`, `parser-ficbook`, `normalizer`, `scheduler` в `docker-compose.yml` (profile `app`).
- Healthchecks, переменные окружения, сети, зависимости.
Артефакты:
- Обновлённый `docker-compose.yml`, шаблоны Dockerfile под сервисы.
Критерии приёмки:
- `docker compose --profile app up -d` поднимает весь пайплайн; `health` сервисов зелёный.

## CI/CD (GitHub Actions)
- CI: `.github/workflows/ci.yml` — установка зависимостей, проверка импорта Alembic, сборка Docker API.
- CD: `.github/workflows/deploy-railway.yml` — деплой API в Railway через Railway CLI.

### Настройка секретов GitHub
- `RAILWAY_TOKEN` — персональный или сервисный токен Railway (railway login → railway tokens create).
- `RAILWAY_PROJECT_ID` — ID проекта Railway (railway project list).
- `RAILWAY_SERVICE_ID` — ID сервиса API (создаётся при первом деплое/линковке; можно получить `railway service`).

### Локальный Railway CLI (по желанию)
```bash
npm i -g @railway/cli
railway login --token <RAILWAY_TOKEN>
railway link --project <PROJECT_ID> --service <SERVICE_ID>
railway up --from-path backend/api
```

### Railway — деплой

#### Автоматический деплой (рекомендуется)
1. Форкните репозиторий или используйте свой
2. В Railway создайте новый проект из GitHub репозитория
3. Railway автоматически обнаружит `railway.toml` и создаст:
   - PostgreSQL база данных
   - Redis для кэша и очередей
   - API сервис (FastAPI)
   - Frontend сервис (Next.js)
   - Worker сервис (Celery)

#### Ручной деплой
1. Создайте проект в Railway
2. Добавьте сервисы из маркетплейса:
   - PostgreSQL
   - Redis
3. Добавьте сервисы из GitHub:
   - **API**: путь `backend/api`, старт команда:
     ```bash
     alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Frontend**: путь `frontend`, старт команда:
     ```bash
     npm run start
     ```
   - **Worker**: путь `backend`, старт команда:
     ```bash
     celery -A workers.celery_app:app worker -Q crawl,normalize -l info
     ```
4. Настройте переменные окружения:
   - API:
     - `DATABASE_URL` → ссылка на PostgreSQL
     - `REDIS_URL` → ссылка на Redis
   - Frontend:
     - `NEXT_PUBLIC_API_URL` → публичный URL API сервиса
   - Worker:
     - `DATABASE_URL` → ссылка на PostgreSQL
     - `REDIS_URL` → ссылка на Redis
5. Добавьте публичные домены для API и Frontend

### Переменные окружения в Railway
- `DATABASE_URL` — строка подключения PostgreSQL (Plugin → Variables → Connection URL).
- `REDIS_URL` — строка Redis (Private URL).
- `SEARCH_CACHE_TTL` — опционально (секунды).

## Очереди и воркеры (Celery + Redis broker)
- Конфигурация: `backend/workers/celery_app.py` (берёт `CELERY_BROKER_URL` или `REDIS_URL`).
- Нормализатор: `backend/workers/normalizer/worker.py` — задача `normalize.upsert_work(payload)`.
- Парсер Ficbook (MVP): `backend/workers/parser_ficbook/worker.py` — задача `crawl.ficbook(url)`.

### Запуск (локально)
```bash
# Redis уже запущен docker compose up -d redis
set REDIS_URL=redis://localhost:63790/0
# один воркер с двумя очередями
celery -A backend.workers.celery_app:app worker -Q crawl,normalize -l info
```

### Тест задач (в другом терминале Python)
```python
from backend.workers.parser_ficbook.worker import crawl_ficbook
crawl_ficbook.delay("https://example.com/fic").id
```

### Переменные окружения
- CELERY_BROKER_URL (если отличается от REDIS_URL)
- CELERY_RESULT_BACKEND (опционально)

## CLI утилиты
- Парсинг локально (stdout JSON):
```bash
python backend/cli/crawl.py parse --site ficbook --url "https://ficbook.net/readfic/..."
```
- Постановка задачи (Celery) и ожидание результата:
```bash
python backend/cli/crawl.py enqueue --site ficbook --url "https://ficbook.net/readfic/..." --wait 60
```
- Экспорт из БД:
```bash
python backend/cli/export.py --id 1            # JSON с главами
python backend/cli/export.py --id 1 --ndjson   # NDJSON построчно по главам
```

### Переменные окружения
- `FICBOOK_COOKIE` — cookie для приватных страниц.
- `SCRAPER_UA` — User-Agent (опц.).
- `SCRAPER_TIMEOUT` — таймаут запросов (сек.).
- `REDIS_URL` — брокер для Celery.
- `DATABASE_URL` — строка подключения Postgres.
