import requests
from bs4 import BeautifulSoup
from backend.parsers.schemas import Work
import re

class LitnetParser:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def parse(self, url: str) -> Work:
        response = self.session.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        title = soup.select_one('h1.book-title').text.strip()
        author = soup.select_one('a.author-name').text.strip()
        summary = soup.select_one('div.book-annotation').text.strip()
        
        tags = [tag.text.strip() for tag in soup.select('a.book-genre-chip')]
        
        status_text = soup.select_one('span.book-status').text.strip()
        status = 'completed' if 'завершено' in status_text.lower() else 'in_progress'
        
        word_count_text = soup.select_one('span.book-stats-value').text.strip()
        word_count = int(re.sub(r'\D', '', word_count_text))

        return Work(
            title=title,
            author_name=author,
            summary=summary,
            tags=tags,
            status=status,
            word_count=word_count,
            url=url,
        )
