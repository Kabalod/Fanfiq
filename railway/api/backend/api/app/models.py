from typing import List, Optional, Literal
from pydantic import BaseModel, HttpUrl


class Author(BaseModel):
    id: Optional[str] = None
    name: str = ""
    url: Optional[HttpUrl] = None


class Work(BaseModel):
    id: str
    site_id: Optional[str] = None
    site_work_id: Optional[str] = None
    title: str
    authors: List[Author] = []
    summary: Optional[str] = ""
    rating: Optional[str] = None
    category: Optional[Literal["gen", "het", "slash", "femslash", "mixed", "other", "article"]] = None
    status: Optional[Literal["completed", "in_progress", "frozen"]] = None
    language: Optional[str] = None
    word_count: Optional[int] = None
    chapter_count: Optional[int] = None
    kudos_count: Optional[int] = None
    comments_count: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    tags: List[str] = []
    fandoms: List[str] = []
    warnings: List[str] = []
    url: Optional[HttpUrl] = None


class SearchFilters(BaseModel):
    query: Optional[str] = None
    sites: Optional[List[str]] = None
    rating: Optional[List[str]] = None
    category: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    status: Optional[List[str]] = None
    word_count_min: Optional[int] = None
    word_count_max: Optional[int] = None
    tags: Optional[List[str]] = None
    fandoms: Optional[List[str]] = None
    sort_by: Optional[Literal["relevance", "updated", "created", "title", "kudos", "comments", "word_count"]] = None
    sort_order: Optional[Literal["asc", "desc"]] = None
    page: int = 1
    page_size: int = 20


class SearchResponse(BaseModel):
    works: List[Work]
    total: int
    page: int
    page_size: int
    total_pages: int


class Chapter(BaseModel):
    id: str
    work_id: str
    number: int
    title: Optional[str] = None
    content: str
    word_count: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SupportedSites(BaseModel):
    sites: List[str]
