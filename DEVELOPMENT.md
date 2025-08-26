# Fanfiq — Руководство разработки

## Контракты
- Источник правды: `contracts/openapi.yaml` (поиск `/api/v1/works/search`).
- Фронтенд zod-схемы: `frontend/src/lib/fse/apiSchema.ts`.

## Инфраструктура (локально)
```bash
cp env/.env.example .env
# база
docker compose up -d postgres redis rabbitmq
# инструменты (опц.)
docker compose --profile optional up -d pgadmin minio flower
```

## Переменные окружения
- `DATABASE_URL=postgresql+psycopg2://fanfiq:fanfiq@localhost:54390/fanfiq`

## Бэкенд (API)
- Запуск (локально):
```bash
pip install -r backend/api/requirements.txt
uvicorn backend.api.app.main:app --reload --port 80890
```
- Миграции Alembic:
```bash
export DATABASE_URL=postgresql+psycopg2://fanfiq:fanfiq@localhost:54390/fanfiq
alembic -c backend/api/alembic.ini upgrade head
```
- Эндпоинты:
  - `GET /health`
  - `POST /api/v1/works/search` (заглушка совместима с фронтом)
- Следующие задачи:
  - FTS-конструктор (pg_trgm + unaccent), индексы GIN (выражения) и сортировки.
  - Redis-кэш (ключ = фильтры + сорт), TTL, инвалидация при апдейтах.
  - Celery + RabbitMQ (очереди `crawl.{site}`, `normalize.input`).
  - `normalizer` и `parser-ficbook`.

## Фронтенд
- Состав: Next.js + TS, Tailwind, shadcn/ui, Storybook, MSW.
- Первые модули:
  - `SearchBar` + `FilterPanel` (Accordion, TagMultiSelect, RangeSlider, сброс).
  - `ResultsList` + `WorkCard` (loading/empty/error, badges, сортировки).
  - `ReaderShell` + `ReaderSettings` (sanitizeHtml, темы light/dark/sepia, сохранение настроек).
  - API-клиент `searchWorks` (fetch + zod), моки через MSW.
  - Синхронизация фильтров с URL, пагинация, виртуализация списка.

## Договорённости
- Порты сервисов по умолчанию на «…90».
- Каждый крупный шаг фиксируем в README (кратко) и здесь (детали).
- Коммиты атомарные и осмысленные, с префиксом области: `infra:`, `api:`, `parser:`, `frontend:` и т.п.

## Чеклист качества
- A11y (фокус, aria, контраст), ленты состояний (loading/empty/error), структурированные логи, healthchecks.
- Тесты: pytest для API/бизнес-логики; Storybook для UI.

## Этапы реализации (roadmap)
- Этап 0 — Инфра и контракты (готово): compose, init.sql, env, OpenAPI, zod, mock API.
- Этап 1 — БД и FTS:
  - Alembic-миграции для схемы (таблицы, индексы по полям).
  - Реализация конструктора SQL-запросов с `unaccent(lower(...))` и триграммами для полнотекста и фильтрами/сортировками.
- Этап 2 — Очереди и пайплайн:
  - Celery + RabbitMQ, маршрутизация задач `crawl.{site}` → `normalize.input`.
  - `normalizer` (мэппинг полей, дедуп, upsert).
  - Первый парсер `ficbook`.
- Этап 3 — Фронтенд MVP.
- Этап 4 — Кэш и UX.
- Этап 5 — Наблюдаемость и CI.

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

### Агент Фронтенд — MVP (Этап 3)
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
