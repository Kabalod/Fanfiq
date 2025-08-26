from typing import Tuple, List
from sqlalchemy import text
from sqlalchemy.engine import Connection
from .models import SearchFilters


def build_search_query(filters: SearchFilters) -> Tuple[str, dict]:
    clauses: List[str] = []
    params: dict = {}

    if filters.query:
        clauses.append("(public.f_unaccent(lower(title)) ILIKE public.f_unaccent(lower(:q)) OR public.f_unaccent(lower(summary)) ILIKE public.f_unaccent(lower(:q)))")
        params["q"] = f"%{filters.query}%"

    if filters.language:
        clauses.append("language = :lang")
        params["lang"] = filters.language

    if filters.rating and filters.rating != 'all':
        clauses.append("rating = :rating")
        params["rating"] = filters.rating

    if filters.status and filters.status != 'all':
        clauses.append("status = :status")
        params["status"] = filters.status

    if filters.category and filters.category != 'all':
        clauses.append("category = :category")
        params["category"] = filters.category

    if filters.word_count_min is not None:
        clauses.append("word_count >= :wc_min")
        params["wc_min"] = filters.word_count_min
    if filters.word_count_max is not None:
        clauses.append("word_count <= :wc_max")
        params["wc_max"] = filters.word_count_max

    if filters.likes_min is not None:
        clauses.append("COALESCE(likes_count, 0) >= :likes_min")
        params["likes_min"] = filters.likes_min
    if filters.comments_min is not None:
        clauses.append("COALESCE(comments_count, 0) >= :comments_min")
        params["comments_min"] = filters.comments_min

    # Фильтры по тегам/фандомам/предупреждениям (exists подзапросы)
    if filters.fandom:
        clauses.append("EXISTS (SELECT 1 FROM work_fandoms wf WHERE wf.work_id = works.id AND wf.fandom = ANY(:fandoms))")
        params["fandoms"] = filters.fandom
    if filters.include_tags:
        clauses.append("EXISTS (SELECT 1 FROM work_tags wt WHERE wt.work_id = works.id AND wt.tag = ANY(:inc_tags))")
        params["inc_tags"] = filters.include_tags
    if filters.exclude_tags:
        clauses.append("NOT EXISTS (SELECT 1 FROM work_tags wt WHERE wt.work_id = works.id AND wt.tag = ANY(:exc_tags))")
        params["exc_tags"] = filters.exclude_tags
    if filters.warnings:
        clauses.append("EXISTS (SELECT 1 FROM work_warnings ww WHERE ww.work_id = works.id AND ww.warning = ANY(:warns))")
        params["warns"] = filters.warnings

    where_sql = (" WHERE " + " AND ".join(clauses)) if clauses else ""

    sort_map = {
        "relevance": "updated_at DESC, likes_count DESC NULLS LAST",
        "updated_desc": "updated_at DESC",
        "popularity_desc": "likes_count DESC NULLS LAST",
        "words_desc": "word_count DESC",
        "words_asc": "word_count ASC",
    }
    order_sql = sort_map.get(filters.sort or "relevance", sort_map["relevance"])

    page = filters.page or 1
    page_size = min(max(filters.page_size or 20, 1), 100)
    offset = (page - 1) * page_size

    sql = f"""
    SELECT * FROM works
    {where_sql}
    ORDER BY {order_sql}
    LIMIT :limit OFFSET :offset
    """
    params["limit"] = page_size
    params["offset"] = offset

    return sql, params


def execute_search(conn: Connection, filters: SearchFilters):
    sql, params = build_search_query(filters)
    return conn.execute(text(sql), params)
