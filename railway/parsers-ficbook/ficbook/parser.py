"""
Парсер Ficbook (readfic)
- Извлекает: заголовок, автора, summary, рейтинг, статус, кол-во слов, дату обновления,
  фандомы, теги, предупреждения, главы (HTML очищен от script/style/iframe).
- Авторизация: переменная окружения FICBOOK_COOKIE (полный Cookie заголовок с PHPSESSID и др.).
- Настройки: SCRAPER_UA (User-Agent), SCRAPER_TIMEOUT (сек), SCRAPER_RETRY (число попыток),
  SCRAPER_BACKOFF_MS (задержка между попытками, мс).
"""
from bs4 import BeautifulSoup
from typing import Dict, Any, List
import os
import re
import time
import requests
from .schemas import ParsedWork


def extract_text(el):
    return (el.get_text(" ", strip=True) if el else "")


def clean_html(container) -> str:
    for tag in container.find_all(["script", "style", "iframe"]):
        tag.decompose()
    return str(container)


def get_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": os.getenv("SCRAPER_UA", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"),
        "Accept-Language": "ru,en;q=0.9",
    })
    cookie = os.getenv("FICBOOK_COOKIE")
    if cookie:
        s.headers.update({"Cookie": cookie})
    return s


def fetch_html(session: requests.Session, url: str) -> str:
    timeout = int(os.getenv("SCRAPER_TIMEOUT", "30"))
    retries = int(os.getenv("SCRAPER_RETRY", "3"))
    backoff_ms = int(os.getenv("SCRAPER_BACKOFF_MS", "500"))
    last_err = None
    for i in range(retries):
        try:
            resp = session.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            last_err = e
            if i < retries - 1:
                time.sleep(backoff_ms / 1000)
            else:
                raise
    raise last_err  # type: ignore


def parse_meta_dd(soup: BeautifulSoup, label: str) -> str:
    for dt in soup.select("dt"):
        if label.lower() in extract_text(dt).lower():
            dd = dt.find_next_sibling("dd")
            return extract_text(dd)
    return ""


def parse_ficbook_html(html: str, url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")

    title = extract_text(soup.select_one("h1, h2.title"))
    author = extract_text(soup.select_one("a[rel='author'], a[href*='/authors/']"))
    summary = extract_text(soup.select_one(".summary, .annotation, .work-description"))

    rating = parse_meta_dd(soup, "Рейтинг")
    status = parse_meta_dd(soup, "Статус") or "In Progress"
    size_text = parse_meta_dd(soup, "Размер")
    word_count = 0
    if size_text:
        m = re.search(r"(\d[\d\s]*)\s*слов", size_text, re.I)
        if m:
            word_count = int(m.group(1).replace(" ", ""))

    updated_at = parse_meta_dd(soup, "Обновлено")

    fandoms: List[str] = []
    for a in soup.select(".tags a[data-entity='fandom'], a[href*='/fanfiction']"):
        txt = extract_text(a)
        if txt:
            fandoms.append(txt)

    tags: List[str] = []
    for a in soup.select(".tags a[data-entity='tag'], a[href*='/tags']"):
        txt = extract_text(a)
        if txt:
            tags.append(txt)

    warnings: List[str] = []
    warn_text = parse_meta_dd(soup, "Предупреждения")
    if warn_text:
        warnings = [w.strip() for w in re.split(r",|/|;", warn_text) if w.strip()]

    chapters = []
    for i, part in enumerate(soup.select("div.part"), start=1):
        ch_title = extract_text(part.select_one("h3.part-title")) or f"Глава {i}"
        content_html = clean_html(part)
        chapters.append({
            "chapter_number": i,
            "title": ch_title,
            "content_html": content_html,
        })

    payload: Dict[str, Any] = {
        "source_site": "ficbook",
        "original_url": url,
        "title": title,
        "author_name": author,
        "summary": summary,
        "language": "ru",
        "rating": rating,
        "status": status,
        "word_count": word_count,
        "likes_count": None,
        "comments_count": None,
        "published_at": None,
        "updated_at": updated_at or None,
        "fandoms": fandoms,
        "tags": tags,
        "warnings": warnings,
        "chapters": chapters,
    }
    # строгая валидация схемы
    return ParsedWork(**payload).model_dump()
