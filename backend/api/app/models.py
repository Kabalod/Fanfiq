from typing import List, Optional, Literal
from pydantic import BaseModel, HttpUrl


class Work(BaseModel):
    id: str
    original_url: Optional[HttpUrl] = None
    title: str
    author_name: str
    author_url: Optional[HttpUrl] = None
    summary: str = ""
    language: str = "ru"
    fandoms: List[str] = []
    tags: List[str] = []
    rating: str
    category: Optional[Literal["Gen", "Het", "Slash", "Femslash", "Other"]] = None
    status: Literal["In Progress", "Completed", "On Hiatus"]
    warnings: Optional[List[str]] = None
    word_count: int
    likes_count: Optional[int] = None
    comments_count: Optional[int] = None
    published_at: Optional[str] = None
    updated_at: Optional[str] = None


class SearchFilters(BaseModel):
    source_sites: Optional[List[str]] = None
    query: Optional[str] = None
    language: Optional[str] = None
    fandom: Optional[List[str]] = None
    include_tags: Optional[List[str]] = None
    exclude_tags: Optional[List[str]] = None
    rating: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    warnings: Optional[List[str]] = None
    word_count_min: Optional[int] = None
    word_count_max: Optional[int] = None
    likes_min: Optional[int] = None
    comments_min: Optional[int] = None
    date_updated_after: Optional[str] = None
    date_updated_before: Optional[str] = None
    page: Optional[int] = 1
    page_size: Optional[int] = 20
    sort: Optional[Literal["relevance", "updated_desc", "popularity_desc", "words_desc", "words_asc"]] = "relevance"


class SearchResponse(BaseModel):
    total_pages: int
    current_page: int
    results: List[Work]
