# Парсеры — спецификация и селекторы

## Общие требования
- Структура результата — как в ТЗ 3.1 (см. `sorce/specification/project.txt`).
- Минимум для MVP: `title`, `author_name`, `summary`, `language`, `rating`, `status`, `word_count`, `fandoms`, `tags`, `warnings`, `chapters` (может быть пустым).
- Санитайз HTML глав (на фронте — `sanitizeHtml`).
- Уважение robots.txt и rate‑limit (фаза 2).

## Ficbook (readfic)
- Заголовок: `h1`, `h2.title`
- Автор: `a[rel="author"]`, `a[href*="/authors/"]`
- Саммари: `.summary`, `.annotation`, `.work-description`
- Метаданные (dt/dd): `Рейтинг`, `Статус`, `Размер`, `Обновлено` → соседний `dd`
- Фандомы: `.tags a[data-entity="fandom"]` / `a[href*="/fanfiction"]`
- Теги: `.tags a[data-entity="tag"]` / `a[href*="/tags"]`
- Предупреждения: `dt:contains("Предупреждения")` → `dd a`
- Главы: `div.part` → заголовок `h3.part-title`, контент внутри `div.part`

Код парсера: `backend/parsers/ficbook.py` (функция `parse_ficbook_html`).
Воркер: `backend/workers/ficbook/worker.py` (задача `crawl.ficbook`).

## Author.Today
- Заголовок: `h1.book-title`, `.book-title`, `.title`
- Автор: `a[href*='/author/']`, `.author-name`, `.book-author`
- Описание: `.annotation`, `.description`, `.summary`, `.book-description`
- Рейтинг: `.rating`, `.age-rating`, `[data-rating]` (18+, 16+, 12+, 0+ → NC-21, NC-17, R, G)
- Статус: `.status`, `.book-status` (завершён → Completed, в процессе → In Progress, заморожен → Frozen)
- Количество слов: `.words-count`, `.word-count`, `[data-words]`
- Дата обновления: `.updated-date`, `.last-update`, `.date`
- Фандомы: `.fandoms a`, `.genres a`, `.categories a`, `a[href*='/fandom/']`, `a[href*='/genre/']`
- Теги: `.tags a`, `.book-tags a`, `.labels a`, `a[href*='/tag/']`
- Предупреждения: `.warnings`, `.caution`, `.alert`
- Главы: `.chapter`, `.part`, `.book-chapter`, `.chapter-content`, `.text-chapter`, `.book-content`, `.text-content`

Код парсера: `backend/parsers/authortoday.py` (функция `parse_authortoday_html`).
Воркер: `backend/workers/authortoday/worker.py` (задача `crawl.authortoday`).

## AO3 (предложение)
- Заголовок: `h2.title`
- Автор: `a[rel="author"]`
- Метаданные: `dl.work.meta.group` (рейтинг, предупреждения, категория, фандомы, пары/персонажи, теги)
- Статистика: `dl.stats` (даты, kudos, comments, word count)
- Текст: `div#chapters` (режим Entire Work для многоглавных)

## FanFiction.net (предложение)
- Заголовок/автор: `div#profile_top`
- Описание: `div.xcontrast_txt`
- Детали: низ страницы (рейтинг/язык/жанры/персонажи/слова/даты)
- Текст: `div#storytext`

## Wattpad (предложение)
- Динамика контента, требуется Playwright (фаза 2)
- Метаданные: часто в `script` JSON; главы — XHR при прокрутке

## Author.Today / Litnet / Fanfics.me / Hogwartsnet
- Сбор метаданных/описания и доступных глав (без платных)
- HTML может быть устаревшим (таблицы) — сильнее опираться на текстовые маркеры

## Запуск парсера Ficbook
- Вариант 1: локальный парсинг и вывод JSON в stdout
```bash
python backend/cli/crawl.py parse --site ficbook --url "https://ficbook.net/readfic/..."
```
- Вариант 2: постановка задачи в Celery и (опц.) ожидание результата
```bash
# воркеры
docker compose up -d redis
set REDIS_URL=redis://localhost:63790/0
celery -A backend.workers.celery_app:app worker -Q crawl,normalize -l info

# enqueue
python backend/cli/crawl.py enqueue --site ficbook --url "https://ficbook.net/readfic/..." --wait 60
```

## Запуск парсера Author.Today
- Вариант 1: локальный парсинг
```bash
python backend/cli/crawl.py parse --site authortoday --url "https://author.today/work/..."
```
- Вариант 2: постановка задачи в Celery
```bash
python backend/cli/crawl.py enqueue --site authortoday --url "https://author.today/work/..." --wait 60
```

### Авторизация
- **Ficbook**: Для страниц, требующих логин, укажите `FICBOOK_COOKIE` в окружении:
```bash
set FICBOOK_COOKIE=PHPSESSID=...; other=...;
```
- **Author.Today**: Для доступа к платному контенту укажите `AUTHOR_TODAY_COOKIE`:
```bash
set AUTHOR_TODAY_COOKIE=session=...; auth=...;
```
- Дополнительно: `SCRAPER_UA` (User-Agent), `SCRAPER_TIMEOUT` (секунды).

## Ficbook — примечания
- Авторизация: `FICBOOK_COOKIE` (см. docstring в `backend/parsers/ficbook.py`).
- Ретраи/таймаут: `SCRAPER_TIMEOUT`, `SCRAPER_RETRY`, `SCRAPER_BACKOFF_MS`.
- Очистка HTML: удаляются `script/style/iframe`.

## Валидация результата
- Схема Pydantic: `backend/parsers/schemas.py` (`ParsedWork`, `Chapter`). Все парсеры должны возвращать dict, прошедший валидацию.

## Ограничение скорости
- Переменная `CRAWL_RATE` (миллисекунды между задачами) применяется в воркере `backend/workers/ficbook/worker.py`.

## CLI
- Локально:
```bash
# Ficbook
python backend/cli/crawl.py parse --site ficbook --url "https://ficbook.net/readfic/..." --out out.json --format json
# Author.Today
python backend/cli/crawl.py parse --site authortoday --url "https://author.today/work/..." --format ndjson > out.ndjson
```
- Очередь Celery:
```bash
# Ficbook
python backend/cli/crawl.py enqueue --site ficbook --url "https://ficbook.net/readfic/..." --wait 60
# Author.Today
python backend/cli/crawl.py enqueue --site authortoday --url "https://author.today/work/..." --wait 60
```
