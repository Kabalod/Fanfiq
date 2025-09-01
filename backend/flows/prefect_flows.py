from prefect import flow, task
from typing import Dict, Any

from backend.parsers.ficbook import get_session as fb_session, fetch_html as fb_fetch, parse_ficbook_html
from backend.workers.normalizer.worker import perform_upsert


@task(retries=3, retry_delay_seconds=2)
def fetch_html_ficbook(url: str) -> str:
    s = fb_session()
    return fb_fetch(s, url)


@task
def parse_ficbook(html: str, url: str) -> Dict[str, Any]:
    return parse_ficbook_html(html, url)


@task
def upsert(payload: Dict[str, Any]) -> str:
    return perform_upsert(payload)


@flow(name="crawl_ficbook_flow")
def crawl_ficbook_flow(url: str) -> str:
    html = fetch_html_ficbook(url)
    payload = parse_ficbook(html, url)
    work_id = upsert(payload)
    return work_id


