from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import SearchFilters, SearchResponse, Work
from ..db.session import SessionLocal
from .search import execute_search
from .cache import make_search_cache_key, cache_get, cache_set
from workers.ficbook.worker import crawl_ficbook
import json

app = FastAPI(title="Fanfiq API", version="0.1.0")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/works/search", response_model=SearchResponse)
def search_works(payload: SearchFilters | None = None, db: Session = Depends(get_db)):
    filters = payload or SearchFilters()

    cache_key = make_search_cache_key(filters)
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return SearchResponse(**data)

    conn = db.connection()
    rows = execute_search(conn, filters)

    items: list[Work] = []
    for r in rows.mappings():
        items.append(
            Work(
                id=str(r["id"]),
                title=r["title"],
                author_name="",
                summary=r["summary"],
                language=r["language"],
                fandoms=[],
                tags=[],
                rating=r["rating"],
                status=r["status"],
                word_count=r["word_count"],
                likes_count=r.get("likes_count"),
                comments_count=r.get("comments_count"),
                updated_at=r.get("updated_at"),
                original_url=r.get("original_url"),
            )
        )

    resp = SearchResponse(total_pages=1, current_page=filters.page or 1, results=items)
    cache_set(cache_key, resp.model_dump_json(exclude_none=True))
    return resp


@app.post("/api/v1/crawl")
def crawl(payload: dict):
    url = payload.get("url")
    site = (payload.get("site") or "ficbook").lower()
    if not url:
        raise HTTPException(status_code=400, detail="url is required")
    if site != "ficbook":
        raise HTTPException(status_code=400, detail="only ficbook supported in MVP")
    task = crawl_ficbook.delay(url)
    return {"task_id": task.id}


@app.get("/api/v1/works/{work_id}", response_model=Work)
def get_work(work_id: int, db: Session = Depends(get_db)):
    conn = db.connection()
    w = conn.execute(text("SELECT * FROM works WHERE id=:id"), {"id": work_id}).mappings().first()
    if not w:
        raise HTTPException(status_code=404, detail="work not found")

    fandoms = [r["fandom"] for r in conn.execute(text("SELECT fandom FROM work_fandoms WHERE work_id=:id"), {"id": work_id}).mappings()]
    tags = [r["tag"] for r in conn.execute(text("SELECT tag FROM work_tags WHERE work_id=:id"), {"id": work_id}).mappings()]
    warnings = [r["warning"] for r in conn.execute(text("SELECT warning FROM work_warnings WHERE work_id=:id"), {"id": work_id}).mappings()]
    chapters_rows = conn.execute(text("SELECT chapter_number, title, content_html FROM chapters WHERE work_id=:id ORDER BY chapter_number ASC"), {"id": work_id}).mappings()
    chapters = [{"chapter_number": r["chapter_number"], "title": r["title"], "content_html": r["content_html"]} for r in chapters_rows]

    return Work(
        id=str(w["id"]),
        title=w["title"],
        author_name="",
        summary=w["summary"],
        language=w["language"],
        fandoms=fandoms,
        tags=tags,
        rating=w["rating"],
        status=w["status"],
        word_count=w["word_count"],
        likes_count=w.get("likes_count"),
        comments_count=w.get("comments_count"),
        updated_at=w.get("updated_at"),
        original_url=w.get("original_url"),
        warnings=warnings,
    )
