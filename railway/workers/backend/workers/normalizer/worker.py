from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from ..celery_app import app
from ...api.db.session import SessionLocal
from ...api.db import models as dbm


def perform_upsert(payload: Dict[str, Any]) -> str:
    """Выполняет upsert в БД. Используется и Celery, и Prefect."""
    with SessionLocal() as db:
        # site
        site_code = payload.get("source_site") or "unknown"
        site = db.execute(select(dbm.Site).where(dbm.Site.code == site_code)).scalar_one_or_none()
        if not site:
            db.add(dbm.Site(code=site_code, name=site_code.title()))
            db.commit()
            site = db.execute(select(dbm.Site).where(dbm.Site.code == site_code)).scalar_one()

        # author
        author_name = payload.get("author_name") or ""
        author_url = payload.get("author_url")
        author = db.execute(select(dbm.Author).where(dbm.Author.name == author_name, dbm.Author.site_id == site.id)).scalar_one_or_none()
        if not author:
            author = dbm.Author(name=author_name, url=author_url, site_id=site.id)
            db.add(author)
            db.flush()

        # work upsert по (site_id, original_url)
        key_site_work = (site.id, payload.get("original_url") or payload.get("id") or "")
        stmt = pg_insert(dbm.Work.__table__).values(
            site_work_id=key_site_work[1],
            site_id=site.id,
            title=payload.get("title") or "",
            summary=payload.get("summary") or "",
            language=payload.get("language") or "ru",
            rating=payload.get("rating") or "",
            category=(payload.get("category") or None),
            status=payload.get("status") or "In Progress",
            word_count=int(payload.get("word_count") or 0),
            likes_count=payload.get("likes_count"),
            comments_count=payload.get("comments_count"),
            published_at=payload.get("published_at"),
            updated_at=payload.get("updated_at"),
            original_url=payload.get("original_url"),
            author_id=author.id,
        ).on_conflict_do_update(
            index_elements=[dbm.Work.site_id, dbm.Work.site_work_id],
            set_={
                "title": pg_insert.excluded.title,
                "summary": pg_insert.excluded.summary,
                "language": pg_insert.excluded.language,
                "rating": pg_insert.excluded.rating,
                "category": pg_insert.excluded.category,
                "status": pg_insert.excluded.status,
                "word_count": pg_insert.excluded.word_count,
                "likes_count": pg_insert.excluded.likes_count,
                "comments_count": pg_insert.excluded.comments_count,
                "updated_at": pg_insert.excluded.updated_at,
                "original_url": pg_insert.excluded.original_url,
                "author_id": pg_insert.excluded.author_id,
            },
        ).returning(dbm.Work.id)
        work_id = db.execute(stmt).scalar_one()

        # связки
        def replace_rel(table, column, values: List[str]):
            db.execute(table.__table__.delete().where(table.work_id == work_id))
            for v in values:
                if v:
                    db.add(table(work_id=work_id, **{column: v}))

        replace_rel(dbm.WorkFandom, "fandom", payload.get("fandoms") or [])
        replace_rel(dbm.WorkTag, "tag", payload.get("tags") or [])
        replace_rel(dbm.WorkWarning, "warning", payload.get("warnings") or [])

        # главы
        chs = payload.get("chapters") or []
        if chs:
            db.execute(dbm.Chapter.__table__.delete().where(dbm.Chapter.work_id == work_id))
            for ch in chs:
                db.add(dbm.Chapter(
                    work_id=work_id,
                    chapter_number=int(ch.get("chapter_number") or 1),
                    title=ch.get("title"),
                    content_html=ch.get("content_html") or "",
                ))

        db.commit()
        return str(work_id)


@app.task(name="normalize.upsert_work")
def upsert_work(payload: Dict[str, Any]) -> str:
    return perform_upsert(payload)
