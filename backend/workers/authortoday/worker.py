import os
import time
from workers.celery_app import app
from workers.normalizer.worker import upsert_work
from parsers.authortoday import parse_authortoday_html, get_session, fetch_html

_last_run = 0.0

@app.task(name="crawl.authortoday")
def crawl_authortoday(url: str):
    global _last_run
    rate_ms = int(os.getenv("CRAWL_RATE", "0"))
    now = time.time()
    if rate_ms > 0 and _last_run > 0:
        gap = (rate_ms / 1000.0) - (now - _last_run)
        if gap > 0:
            time.sleep(gap)
    _last_run = time.time()

    s = get_session()
    html = fetch_html(s, url)
    payload = parse_authortoday_html(html, url)
    return upsert_work.delay(payload).id
