from typing import List, Optional
from pydantic import BaseModel, HttpUrl, field_validator


class Chapter(BaseModel):
    chapter_number: int
    title: str
    content_html: str


class ParsedWork(BaseModel):
    source_site: str
    original_url: Optional[str] = None
    title: str
    author_name: str
    author_url: Optional[HttpUrl] = None
    summary: str = ""
    language: str = "ru"
    fandoms: List[str] = []
    tags: List[str] = []
    rating: str = ""
    category: Optional[str] = None
    status: str = "In Progress"
    warnings: List[str] = []
    word_count: int = 0
    likes_count: Optional[int] = None
    comments_count: Optional[int] = None
    published_at: Optional[str] = None
    updated_at: Optional[str] = None
    chapters: List[Chapter] = []

    @field_validator("language")
    @classmethod
    def normalize_lang(cls, v: str) -> str:
        return (v or "ru").lower()
