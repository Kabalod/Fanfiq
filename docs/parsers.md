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

### Авторизация
- Для страниц, требующих логин, укажите `FICBOOK_COOKIE` в окружении:
```bash
set FICBOOK_COOKIE=PHPSESSID=...; other=...;
```
- Дополнительно: `SCRAPER_UA` (User-Agent), `SCRAPER_TIMEOUT` (секунды).
