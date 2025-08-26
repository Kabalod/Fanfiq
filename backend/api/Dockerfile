FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Зависимости
COPY backend/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Исходники API
COPY backend/api ./backend/api

# Порт приложения (Railway задаёт $PORT)
EXPOSE 8000
ENV PORT=8000

# Миграции + запуск API
CMD sh -c "alembic -c backend/api/alembic.ini upgrade head && uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT}"
