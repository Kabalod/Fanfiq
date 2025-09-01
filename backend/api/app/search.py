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

    if filters.sites:
        clauses.append("EXISTS (SELECT 1 FROM sites s WHERE s.id = works.site_id AND s.code = ANY(:sites))")
        params["sites"] = filters.sites

    if filters.rating:
        clauses.append("rating = ANY(:ratings)")
        params["ratings"] = filters.rating

    if filters.status:
        clauses.append("status = ANY(:statuses)")
        params["statuses"] = filters.status

    if filters.category:
        clauses.append("category = ANY(:categories)")
        params["categories"] = filters.category

    if filters.word_count_min is not None:
        clauses.append("word_count >= :wc_min")
        params["wc_min"] = filters.word_count_min
    if filters.word_count_max is not None:
        clauses.append("word_count <= :wc_max")
        params["wc_max"] = filters.word_count_max

    if filters.tags:
        clauses.append("EXISTS (SELECT 1 FROM work_tags wt WHERE wt.work_id = works.id AND wt.tag = ANY(:tags))")
        params["tags"] = filters.tags
    if filters.fandoms:
        clauses.append("EXISTS (SELECT 1 FROM work_fandoms wf WHERE wf.work_id = works.id AND wf.fandom = ANY(:fandoms))")
        params["fandoms"] = filters.fandoms
    if filters.warnings:
        clauses.append("EXISTS (SELECT 1 FROM work_warnings ww WHERE ww.work_id = works.id AND ww.warning = ANY(:warnings))")
        params["warnings"] = filters.warnings

    where_sql = (" WHERE " + " AND ".join(clauses)) if clauses else ""

    sort_map = {
        "relevance": "updated_at DESC, likes_count DESC NULLS LAST",
        "updated": "updated_at",
        "created": "created_at",
        "title": "title",
        "kudos": "likes_count",
        "comments": "comments_count",
        "word_count": "word_count",
    }
    sort_field = sort_map.get(filters.sort_by or "relevance", sort_map["relevance"])
    sort_dir = "ASC" if (filters.sort_order or "desc") == "asc" else "DESC"
    order_sql = f"{sort_field} {sort_dir}"

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
