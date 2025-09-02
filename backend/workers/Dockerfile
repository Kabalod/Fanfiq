FROM python:3.11-slim

WORKDIR /app

# Копируем requirements.txt
COPY ../api/requirements.txt /app/requirements.txt

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r /app/requirements.txt

# Копируем остальной код
COPY . .

CMD ["celery", "-A", "backend.workers.celery_app:app", "worker", "-Q", "crawl,normalize", "-l", "info"]
