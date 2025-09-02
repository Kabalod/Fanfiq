import pytest
from ..parser import FanficsmeParser
from pathlib import Path

@pytest.fixture
def mock_html():
    return (Path(__file__).parent / "mock.html").read_text(encoding="utf-8")

def test_fanficsme_parser(mock_html):
    parser = FanficsmeParser()
    parser.session.get = lambda url: type("Response", (), {"raise_for_status": lambda: None, "text": mock_html})()
    
    work = parser.parse("mock_url")
    
    assert work.title == "Test Title"
    assert work.author_name == "Test Author"
    assert work.summary == "Test Summary"
    assert work.tags == ["Tag 1", "Tag 2"]
    assert work.status == "completed"
    assert work.word_count == 12345
