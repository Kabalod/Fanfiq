# 🚀 Быстрый старт разработки Fanfiq

Этот документ поможет вам быстро настроить среду разработки и минимизировать проблемы с зависимостями и контейнерами.

## 🛠️ Доступные инструменты

### 1. Makefile - Основной инструмент автоматизации

```bash
# Показать все доступные команды
make help

# Полная установка зависимостей
make install

# Запуск среды разработки
make dev

# Запуск через Docker
make up

# Остановка всех сервисов
make down

# Запуск тестов
make test

# Проверка кода
make lint

# Форматирование кода
make format

# Очистка
make clean
```

### 2. Скрипт быстрого старта (dev.sh)

```bash
# Сделать скрипт исполняемым
chmod +x dev.sh

# Запуск полной среды разработки
./dev.sh start

# Остановка всех сервисов
./dev.sh stop

# Перезапуск
./dev.sh restart

# Просмотр статуса
./dev.sh status

# Очистка (удаляет все контейнеры и volumes)
./dev.sh clean
```

### 3. Health Check скрипт

```bash
# Проверка здоровья всех сервисов
python scripts/health-check.py
```

## 📋 Шаги быстрой настройки

### Шаг 1: Клонирование и настройка

```bash
git clone <repository-url>
cd fanfiq

# Копирование переменных окружения
cp .env.local .env

# Редактирование переменных окружения (опционально)
# nano .env
```

### Шаг 2: Быстрый старт

```bash
# Вариант 1: Использование скрипта (рекомендуется)
./dev.sh start

# Вариант 2: Использование Makefile
make dev

# Вариант 3: Ручная настройка
make install
make up
make api &
make frontend &
```

### Шаг 3: Проверка работы

```bash
# Проверка здоровья сервисов
python scripts/health-check.py

# Или через Makefile
make health
```

## 🔧 Решение типичных проблем

### Проблема: Конфликты зависимостей

**Решение:**
```bash
# Очистка и переустановка
make clean
make install

# Или через скрипт
./dev.sh clean
./dev.sh start
```

### Проблема: Порт уже занят

**Решение:**
```bash
# Проверка занятых портов
netstat -tulpn | grep :58090

# Изменение портов в .env файле
PORT=58091
POSTGRES_PORT_HOST=54391
REDIS_PORT_HOST=63791
```

### Проблема: Ошибки базы данных

**Решение:**
```bash
# Пересоздание базы данных
make down
docker volume rm fanfiq_db_data
make up
make db-init
```

### Проблема: Медленная сборка Docker

**Решение:**
- Используйте `.dockerignore` для исключения ненужных файлов
- Включите BuildKit: `export DOCKER_BUILDKIT=1`
- Используйте multi-stage builds для оптимизации

### Проблема: Ошибки зависимостей Python

**Решение:**
```bash
# Использование Poetry (рекомендуется)
pip install poetry
poetry install

# Или чистая установка pip
pip install --upgrade pip
pip install -r backend/api/requirements.txt --force-reinstall
```

## 🐳 Docker Compose профили

### Базовая инфраструктура (всегда запускается)
```bash
docker compose -f infra/docker-compose.yml up -d
```

### Разработка с приложениями
```bash
docker compose -f infra/docker-compose.yml -f docker-compose.override.yml --profile dev up -d
```

### Только парсеры
```bash
docker compose -f infra/docker-compose.yml -f docker-compose.override.yml --profile parsers up -d
```

## 🔍 Мониторинг и отладка

### Логи сервисов
```bash
# Логи API
docker compose logs api -f

# Логи всех сервисов
docker compose logs -f

# Логи с метками времени
docker compose logs --timestamps
```

### Доступ к сервисам
- **API**: http://localhost:58090/docs
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:54390 (fanfiq/fanfiq_password)
- **Redis**: localhost:63790
- **RabbitMQ**: http://localhost:15690 (fanfiq/rabbitmq_password)
- **pgAdmin**: http://localhost:50590
- **MinIO**: http://localhost:59090
- **Flower**: http://localhost:55590

## 📊 Производительность

### Оптимизации Docker
- Используйте Docker BuildKit для кэширования
- Настройте .dockerignore для исключения ненужных файлов
- Используйте multi-stage builds

### Оптимизации зависимостей
- Используйте Poetry для управления зависимостями Python
- Разделяйте dev и prod зависимости
- Используйте lock-файлы для reproducible builds

## 🆘 Быстрая помощь

Если что-то не работает:

1. **Проверьте логи**: `docker compose logs`
2. **Проверьте здоровье**: `python scripts/health-check.py`
3. **Очистите и перезапустите**: `make clean && make dev`
4. **Проверьте порты**: `netstat -tulpn | grep 58090`

## 📝 Советы по разработке

### Python зависимости
- Используйте Poetry для управления зависимостями
- Указывайте версии с операторами совместимости (^, ~)
- Разделяйте dev и prod зависимости

### Node.js зависимости
- Используйте package-lock.json для фиксации версий
- Регулярно обновляйте зависимости
- Используйте npx для запуска инструментов

### Docker
- Всегда используйте .dockerignore
- Кэшируйте слои с редко меняющимися файлами
- Используйте health checks для зависимостей

---

**Примечание**: Эти инструменты значительно упрощают разработку и минимизируют проблемы с зависимостями и контейнерами. Рекомендуется использовать `make dev` или `./dev.sh start` для быстрого старта.
