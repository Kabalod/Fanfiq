import requests
from backend.workers.celery_app import app
from backend.workers.normalizer.worker import upsert_work
from backend.parsers.ficbook import parse_ficbook_html, get_session


@app.task(name="crawl.ficbook")
def crawl_ficbook(url: str):
    s = get_session()
    resp = s.get(url, timeout=30)
    resp.raise_for_status()
    payload = parse_ficbook_html(resp.text, url)
    return upsert_work.delay(payload).id
