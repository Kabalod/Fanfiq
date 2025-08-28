import os
from celery import Celery

BROKER_URL = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:63790/0"))
BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", BROKER_URL)

app = Celery(
    "fanfiq",
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=[
        "workers.normalizer.worker",
        "workers.ficbook.worker",
    ],
)

app.conf.task_routes = {
    "crawl.*": {"queue": "crawl"},
    "normalize.*": {"queue": "normalize"},
}

app.conf.task_default_queue = "default"
app.conf.worker_hijack_root_logger = False
