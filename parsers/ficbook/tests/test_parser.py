import pytest
from parsers.ficbook.parser import parse_ficbook_html
from pathlib import Path

@pytest.fixture
def mock_html():
    return (Path(__file__).parent / "mock.html").read_text(encoding="utf-8")

def test_ficbook_parser(mock_html):
    work = parse_ficbook_html(mock_html, "mock_url")
    
    assert work["title"] == "Test Title"
    assert work["author_name"] == "Test Author"
    assert work["summary"] == "Test Summary"
    assert work["fandoms"] == ["Fandom 1"]
    assert work["tags"] == ["Tag 1", "Tag 2"]
    assert work["word_count"] == 12345
    assert work["status"] == "completed"
