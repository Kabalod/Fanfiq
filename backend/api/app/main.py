from fastapi import FastAPI
from .models import SearchFilters, SearchResponse, Work

app = FastAPI(title="Fanfiq API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/works/search", response_model=SearchResponse)
def search_works(payload: SearchFilters | None = None):
    # Заглушка ответа (совместима с фронтендом)
    items = [
        Work(
            id="work_123",
            title="Тени прошлого",
            author_name="АвторПример",
            summary="История о том, как прошлое может настигнуть...",
            language="ru",
            fandoms=["Гарри Поттер"],
            tags=["Драма", "Приключения", "Дружба"],
            rating="PG-13",
            status="Completed",
            word_count=45000,
            likes_count=234,
            comments_count=67,
            updated_at="2024-01-15",
        )
    ]
    return SearchResponse(total_pages=1, current_page=1, results=items)
