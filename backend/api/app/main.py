from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import SearchFilters, SearchResponse, Work, Chapter, SupportedSites, Author
from ..db.session import SessionLocal
from .search import execute_search
from .cache import make_search_cache_key, cache_get, cache_set
import os
import json
from typing import List
from . import bookmarks
from .users import fastapi_users, auth_backend, UserRead, UserCreate, UserUpdate
from sqlalchemy import select
from . import models

app = FastAPI(title="Fanfiq API", version="0.1.0")

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])

# CORS (разрешаем фронтенд-домен)
_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if _origins_env.strip() == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


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

    works: list[Work] = []
    for r in rows.mappings():
        works.append(
            Work(
                id=str(r["id"]),
                title=r["title"],
                authors=[Author(name=r.get("author_name") or "")],
                summary=r.get("summary") or "",
                language=r.get("language"),
                fandoms=[],
                tags=[],
                rating=r.get("rating"),
                status=r.get("status"),
                word_count=r.get("word_count"),
                kudos_count=r.get("likes_count"),
                comments_count=r.get("comments_count"),
                updated_at=r.get("updated_at"),
                url=r.get("original_url"),
            )
        )

    page = filters.page or 1
    page_size = filters.page_size or 20
    # Простейшее вычисление total: если работ меньше page_size — это последняя страница
    total = len(works) if len(works) < page_size else page * page_size + 1
    total_pages = page if len(works) < page_size else page + 1

    resp = SearchResponse(works=works, total=total, page=page, page_size=page_size, total_pages=total_pages)
    cache_set(cache_key, resp.model_dump_json(exclude_none=True))
    return resp


@app.post("/api/v1/crawl")
def crawl(payload: dict):
    url = payload.get("url")
    site = (payload.get("site") or "").lower()
    
    if not url:
        raise HTTPException(status_code=400, detail="url is required")

    try:
        if site == 'ficbook':
            from parsers.ficbook.worker import ficbook_flow
            flow = ficbook_flow
        elif site == 'authortoday':
            from parsers.authortoday.worker import authortoday_flow
            flow = authortoday_flow
        elif site == 'litnet':
            from parsers.litnet.worker import litnet_flow
            flow = litnet_flow
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported site: {site}")
    except ImportError:
        raise HTTPException(status_code=500, detail="Could not import parser flow.")

    if os.getenv("PREFECT_SUBMIT") == "1":
        future = flow.submit(url)
        return {"state": str(future.state.type)}
    
    work_id = flow(url)
    return {"work_id": work_id}


@app.get("/api/v1/works/{work_id}", response_model=Work)
def get_work(work_id: int, db: Session = Depends(get_db)):
    conn = db.connection()
    w = conn.execute(text("SELECT * FROM works WHERE id=:id"), {"id": work_id}).mappings().first()
    if not w:
        raise HTTPException(status_code=404, detail="work not found")

    fandoms = [r["fandom"] for r in conn.execute(text("SELECT fandom FROM work_fandoms WHERE work_id=:id"), {"id": work_id}).mappings()]
    tags = [r["tag"] for r in conn.execute(text("SELECT tag FROM work_tags WHERE work_id=:id"), {"id": work_id}).mappings()]
    warnings = [r["warning"] for r in conn.execute(text("SELECT warning FROM work_warnings WHERE work_id=:id"), {"id": work_id}).mappings()]

    return Work(
        id=str(w["id"]),
        title=w["title"],
        authors=[Author(name=w.get("author_name") or "")],
        summary=w.get("summary") or "",
        language=w.get("language"),
        fandoms=fandoms,
        tags=tags,
        rating=w.get("rating"),
        status=w.get("status"),
        word_count=w.get("word_count"),
        kudos_count=w.get("likes_count"),
        comments_count=w.get("comments_count"),
        updated_at=w.get("updated_at"),
        url=w.get("original_url"),
        warnings=warnings,
    )


@app.get("/api/v1/works/{work_id}/chapters", response_model=List[Chapter])
def get_work_chapters(work_id: int, db: Session = Depends(get_db)):
    conn = db.connection()
    chapters_rows = conn.execute(text("SELECT id, work_id, chapter_number, title, content_html FROM chapters WHERE work_id=:id ORDER BY chapter_number ASC"), {"id": work_id}).mappings()
    chapters = []
    for r in chapters_rows:
        chapters.append(Chapter(
            id=str(r["id"]),
            work_id=str(r["work_id"]),
            number=r["chapter_number"],
            title=r["title"],
            content=r["content_html"] or "",
        ))
    return chapters


@app.get("/api/v1/works/{work_id}/chapters/{number}", response_model=Chapter)
def get_chapter(work_id: int, number: int, db: Session = Depends(get_db)):
    conn = db.connection()
    c = conn.execute(text("SELECT * FROM chapters WHERE work_id=:wid AND chapter_number=:num"), {"wid": work_id, "num": number}).mappings().first()
    if not c:
        raise HTTPException(status_code=404, detail="chapter not found")

    return Chapter(
        id=str(c["id"]),
        work_id=str(c["work_id"]),
        number=c["chapter_number"],
        title=c["title"],
        content=c["content_html"] or "",
    )


@app.get("/api/v1/sites", response_model=SupportedSites)
def get_supported_sites():
    return SupportedSites(sites=["ficbook", "authortoday"])

@app.get("/api/v1/tags", response_model=List[str])
def get_tags(q: str = "", db: Session = Depends(get_db)):
    query = select(models.WorkTag.tag).distinct()
    if q:
        query = query.filter(models.WorkTag.tag.ilike(f"%{q}%"))
    results = db.execute(query).scalars().all()
    return results

@app.get("/api/v1/fandoms", response_model=List[str])
def get_fandoms(q: str = "", db: Session = Depends(get_db)):
    query = select(models.WorkFandom.fandom).distinct()
    if q:
        query = query.filter(models.WorkFandom.fandom.ilike(f"%{q}%"))
    results = db.execute(query).scalars().all()
    return results
