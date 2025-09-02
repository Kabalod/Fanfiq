FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r parsers/fanficsme/requirements.txt

CMD ["prefect", "worker", "start", "--pool", "fanficsme-pool"]
