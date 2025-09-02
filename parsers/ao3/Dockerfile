FROM python:3.11-slim

WORKDIR /app

# Копируем только общие зависимости
COPY backend/parsers/schemas.py /app/backend/parsers/schemas.py
COPY backend/api/db /app/backend/api/db

# Копируем сам парсер
COPY parsers/ao3 /app/parsers/ao3

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r /app/backend/api/requirements.txt
RUN pip install --no-cache-dir -r /app/parsers/ao3/requirements.txt

CMD ["prefect", "worker", "start", "--pool", "ao3-pool"]
