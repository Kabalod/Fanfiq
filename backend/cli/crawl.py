import argparse
import sys
import json
from pathlib import Path
from typing import Optional
from celery.result import AsyncResult
from backend.workers.celery_app import app
from backend.workers.ficbook.worker import crawl_ficbook
from backend.workers.authortoday.worker import crawl_authortoday
from backend.parsers.ficbook import get_session as get_ficbook_session, parse_ficbook_html
from backend.parsers.authortoday import get_session as get_authortoday_session, parse_authortoday_html


def write_out(data: dict, out: Optional[str], fmt: str) -> None:
    text = json.dumps(data, ensure_ascii=False)
    if fmt == "ndjson":
        # если chapters есть — построчно
        chapters = data.get("chapters") or []
        if chapters:
            for ch in chapters:
                line = json.dumps({**data, "chapters": [ch]}, ensure_ascii=False)
                if out:
                    Path(out).write_text(line + "\n", encoding="utf-8")
                else:
                    print(line)
            return
    if out:
        Path(out).write_text(text, encoding="utf-8")
    else:
        print(text)


def run_enqueue(site: str, url: str, wait: Optional[int]) -> int:
    site = site.lower()
    if site == "ficbook":
        crawl_task = crawl_ficbook.delay(url)
    elif site == "authortoday":
        crawl_task = crawl_authortoday.delay(url)
    else:
        print(f"Site '{site}' is not supported. Available: ficbook, authortoday", file=sys.stderr)
        return 2

    print(f"enqueued crawl task: {crawl_task.id}")
    if wait is None:
        return 0
    try:
        upsert_task_id = app.AsyncResult(crawl_task.id).get(timeout=wait)
        print(f"upsert task: {upsert_task_id}")
        work_id = app.AsyncResult(upsert_task_id).get(timeout=wait)
        print(json.dumps({"work_id": work_id}, ensure_ascii=False))
        return 0
    except Exception as e:
        print(f"task failed/timeout: {e}", file=sys.stderr)
        return 3


def run_parse(site: str, url: str, out: Optional[str], fmt: str) -> int:
    site = site.lower()
    if site == "ficbook":
        s = get_ficbook_session()
        resp = s.get(url)
        resp.raise_for_status()
        payload = parse_ficbook_html(resp.text, url)
    elif site == "authortoday":
        s = get_authortoday_session()
        resp = s.get(url)
        resp.raise_for_status()
        payload = parse_authortoday_html(resp.text, url)
    else:
        print(f"Site '{site}' is not supported. Available: ficbook, authortoday", file=sys.stderr)
        return 2

    write_out(payload, out, fmt)
    return 0


def main():
    p = argparse.ArgumentParser(description="Fanfiq crawler CLI")
    sub = p.add_subparsers(dest="cmd")

    p_enq = sub.add_parser("enqueue", help="enqueue crawl task (default)")
    p_enq.add_argument("--site", default="ficbook")
    p_enq.add_argument("--url", required=True)
    p_enq.add_argument("--wait", type=int, default=None)

    p_parse = sub.add_parser("parse", help="parse URL locally and print JSON")
    p_parse.add_argument("--site", default="ficbook")
    p_parse.add_argument("--url", required=True)
    p_parse.add_argument("--out", default=None)
    p_parse.add_argument("--format", choices=["json", "ndjson"], default="json")

    args = p.parse_args()
    cmd = args.cmd or "enqueue"
    if cmd == "parse":
        raise SystemExit(run_parse(args.site, args.url, args.out, args.format))
    else:
        raise SystemExit(run_enqueue(args.site, args.url, args.wait))


if __name__ == "__main__":
    main()
