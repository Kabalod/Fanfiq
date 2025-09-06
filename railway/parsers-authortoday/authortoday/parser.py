"""
Парсер Author.Today
- Извлекает: заголовок, автора, summary, рейтинг, статус, кол-во слов, дату обновления,
  фандомы, теги, предупреждения, главы (HTML очищен от script/style/iframe).
- Авторизация: переменная окружения AUTHOR_TODAY_COOKIE (полный Cookie заголовок).
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
    # Удаляем все ненужные теги
    for tag in container.find_all(["script", "style", "iframe", "noscript", "nav", "header", "footer",
                                  "modal-dialog", "library-button", "hide-button", "buy-button", "mark-button",
                                  "aside-widget", "feedback-form", "chatra-button", "link"]):
        tag.decompose()

    # Удаляем элементы с определенными классами
    for tag in container.find_all(class_=["book-action-panel", "book-stats", "mt-v-lg", "panel-actions",
                                         "btn-group", "dropdown", "spinner", "widget-spinner"]):
        tag.decompose()

    # Очищаем оставшийся HTML
    return str(container)


def get_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": os.getenv("SCRAPER_UA", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"),
        "Accept-Language": "ru,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    })
    cookie = os.getenv("AUTHOR_TODAY_COOKIE")
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


def parse_authortoday_html(html: str, url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")

    # Заголовок
    title = extract_text(soup.select_one("h1.book-title, .book-title, .title"))

    # Автор
    author_elem = soup.select_one("a[href*='/u/'], .author-name, .book-author, .book-authors a")
    author = extract_text(author_elem)

    # Описание
    summary_elem = soup.select_one(".annotation, .description, .summary, .book-description")
    summary = extract_text(summary_elem)

    # Рейтинг (Author.Today использует разные обозначения)
    rating = ""
    rating_elem = soup.select_one(".rating, .age-rating, [data-rating]")
    if rating_elem:
        rating_text = extract_text(rating_elem).lower()
        if "18+" in rating_text or "nc-21" in rating_text:
            rating = "NC-21"
        elif "16+" in rating_text or "nc-17" in rating_text:
            rating = "NC-17"
        elif "12+" in rating_text or "r" in rating_text:
            rating = "R"
        elif "0+" in rating_text or "g" in rating_text:
            rating = "G"

    # Статус
    status = "In Progress"
    status_elem = soup.select_one(".status, .book-status")
    if status_elem:
        status_text = extract_text(status_elem).lower()
        if "заверш" in status_text or "complete" in status_text:
            status = "Completed"
        elif "заморож" in status_text or "frozen" in status_text:
            status = "Frozen"

    # Количество слов (Author.Today показывает знаки, не слова)
    word_count = 0
    # Ищем текст с количеством знаков
    text_content = soup.get_text()
    m = re.search(r"(\d[\d\s\xa0]*)\s*зн", text_content, re.I)
    if m:
        char_count_str = m.group(1).replace(" ", "").replace("\xa0", "")
        try:
            char_count = int(char_count_str)
            # Примерное преобразование знаков в слова (1 слово ≈ 5-6 знаков)
            word_count = int(char_count / 5.5)
        except ValueError:
            word_count = 0

    # Альтернативный поиск в HTML элементах
    if word_count == 0:
        word_elem = soup.select_one(".words-count, .word-count, [data-words]")
        if word_elem:
            word_text = extract_text(word_elem)
            m = re.search(r"(\d[\d\s]*)\s*слов", word_text, re.I)
            if m:
                word_count = int(m.group(1).replace(" ", ""))
            else:
                # Попробуем найти просто число
                m = re.search(r"(\d+)", word_text.replace(" ", ""))
                if m:
                    word_count = int(m.group(1))

    # Дата обновления
    updated_at = ""
    date_elem = soup.select_one(".updated-date, .last-update, .date")
    if date_elem:
        updated_at = extract_text(date_elem)

    # Фандомы
    fandoms: List[str] = []
    fandom_selectors = [
        ".fandoms a", ".genres a", ".categories a",
        "a[href*='/fandom/']", "a[href*='/genre/']"
    ]
    for selector in fandom_selectors:
        for a in soup.select(selector):
            txt = extract_text(a)
            if txt and len(txt) > 1:
                fandoms.append(txt)

    # Теги
    tags: List[str] = []
    tag_selectors = [
        ".tags a", ".book-tags a", ".labels a",
        "a[href*='/tag/']", "a[href*='/label/']"
    ]
    for selector in tag_selectors:
        for a in soup.select(selector):
            txt = extract_text(a)
            if txt and len(txt) > 1:
                tags.append(txt)

    # Предупреждения
    warnings: List[str] = []
    warning_elem = soup.select_one(".warnings, .caution, .alert")
    if warning_elem:
        warning_text = extract_text(warning_elem)
        # Разбиваем по различным разделителям
        warning_parts = re.split(r",|/|;|•|\n", warning_text)
        for part in warning_parts:
            part = part.strip()
            if part and len(part) > 2:
                warnings.append(part)

    # Главы
    chapters = []
    chapter_selectors = [
        ".chapter", ".part", ".book-chapter",
        ".chapter-content", ".text-chapter",
        "[class*='chapter']", "[class*='part']"
    ]

    for selector in chapter_selectors:
        chapter_elements = soup.select(selector)
        if chapter_elements:
            for i, chapter_elem in enumerate(chapter_elements, start=1):
                # Заголовок главы
                title_elem = chapter_elem.select_one("h2, h3, .chapter-title, .part-title")
                ch_title = extract_text(title_elem) or f"Глава {i}"

                # Содержимое главы
                content_elem = chapter_elem.select_one(".chapter-text, .content, .text") or chapter_elem
                if content_elem:
                    content_html = clean_html(content_elem)
                    chapters.append({
                        "chapter_number": i,
                        "title": ch_title,
                        "content_html": content_html,
                    })
            break

    # Если не нашли главы по селекторам, попробуем весь контент книги
    if not chapters:
        content_elem = soup.select_one(".book-content, .text-content, .book-text, .content")
        if content_elem:
            content_html = clean_html(content_elem)
            chapters.append({
                "chapter_number": 1,
                "title": "Глава 1",
                "content_html": content_html,
            })

    payload: Dict[str, Any] = {
        "source_site": "authortoday",
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
        "fandoms": list(set(fandoms)),  # Убираем дубликаты
        "tags": list(set(tags)),  # Убираем дубликаты
        "warnings": warnings,
        "chapters": chapters,
    }

    # Строгая валидация схемы
    return ParsedWork(**payload).model_dump()
