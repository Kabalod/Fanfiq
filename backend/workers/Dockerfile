FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r backend/api/requirements.txt

CMD ["celery", "-A", "backend.workers.celery_app:app", "worker", "-Q", "crawl,normalize", "-l", "info"]
