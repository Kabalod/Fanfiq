FROM python:3.11-slim

WORKDIR /app

# Копируем только общие зависимости
COPY backend/parsers/schemas.py /app/backend/parsers/schemas.py
COPY backend/api/db /app/backend/api/db

# Копируем сам парсер
COPY ./parsers/fanficsme /app/parsers/fanficsme

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r /app/backend/api/requirements.txt
RUN pip install --no-cache-dir -r /app/parsers/fanficsme/requirements.txt

CMD ["prefect", "worker", "start", "--pool", "fanficsme-pool"]
