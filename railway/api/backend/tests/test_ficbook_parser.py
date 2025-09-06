from time import perf_counter
from backend.parsers.ficbook import parse_ficbook_html

HTML_FULL = """
<html>
  <body>
    <h1>Полный тайтл</h1>
    <a rel="author" href="/authors/42">АвторПолный</a>
    <div class="work-description">Это описание работы.</div>
    <dl>
      <dt>Рейтинг</dt><dd>PG-13</dd>
      <dt>Статус</dt><dd>In Progress</dd>
      <dt>Размер</dt><dd>123 456 слов</dd>
      <dt>Обновлено</dt><dd>2024-01-15</dd>
      <dt>Предупреждения</dt><dd>Graphic Violence, Major Character Death</dd>
    </dl>
    <div class="tags">
      <a data-entity="fandom">Гарри Поттер</a>
      <a data-entity="fandom">Марвел</a>
      <a data-entity="tag">Драма</a>
      <a data-entity="tag">AU</a>
      <a data-entity="tag">Экшн</a>
    </div>
    <div class="part"><h3 class="part-title">Глава 1</h3><p>Контент 1</p><script>bad()</script></div>
    <div class="part"><h3 class="part-title">Глава 2</h3><p>Контент 2</p><iframe></iframe></div>
  </body>
</html>
"""

HTML_DEFAULTS = """
<html>
  <body>
    <h2 class="title">Без метаданных</h2>
    <a href="/authors/1">Имя</a>
    <div class="summary">краткое</div>
    <div class="part"><p>Only content</p><style>bad{}</style></div>
  </body>
</html>
"""


def test_parse_full_fields():
    p = parse_ficbook_html(HTML_FULL, url="https://ficbook.net/readfic/1")
    assert p["title"] == "Полный тайтл"
    assert p["author_name"] == "АвторПолный"
    assert p["summary"] == "Это описание работы."
    assert p["rating"] == "PG-13"
    assert p["status"].lower() in {"in progress", "в процессе"}
    assert p["word_count"] == 123456
    assert p["updated_at"] == "2024-01-15"
    assert set(p["fandoms"]) >= {"Гарри Поттер", "Марвел"}
    assert set(p["tags"]) >= {"Драма", "AU", "Экшн"}
    assert set([w.lower() for w in p["warnings"]]) >= {"graphic violence", "major character death"}
    assert len(p["chapters"]) == 2
    assert p["chapters"][0]["title"] == "Глава 1"
    assert "script" not in p["chapters"][0]["content_html"].lower()
    assert "iframe" not in p["chapters"][1]["content_html"].lower()


def test_parse_defaults_and_cleanup():
    p = parse_ficbook_html(HTML_DEFAULTS, url="https://ficbook.net/readfic/2")
    assert p["title"] == "Без метаданных"
    assert p["rating"] in ("",)
    assert p["status"] in ("In Progress", "В процессе")
    assert p["word_count"] == 0
    assert p["fandoms"] == []
    assert p["tags"] == []
    assert len(p["chapters"]) == 1
    html = p["chapters"][0]["content_html"].lower()
    assert "style" not in html


def test_performance_many_chapters():
    # синтетически генерируем 50 глав
    parts = "".join([f"<div class='part'><h3 class='part-title'>Глава {i}</h3><p>Текст {i}</p></div>" for i in range(1, 51)])
    html = f"<html><body><h1>T</h1><a rel='author'>A</a><div class='summary'>S</div>{parts}</body></html>"
    t0 = perf_counter()
    p = parse_ficbook_html(html, url="https://ficbook.net/readfic/3")
    dt = perf_counter() - t0
    assert len(p["chapters"]) == 50
    # грубая оценка: парсинг 50 глав должен занимать < 0.5с на среднем ПК
    assert dt < 0.5
