FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r parsers/ao3/requirements.txt

CMD ["prefect", "worker", "start", "--pool", "ao3-pool"]
