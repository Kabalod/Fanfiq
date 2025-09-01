#!/usr/bin/env python3
"""
Простой тест парсера Author.Today без зависимостей от Celery
"""
import sys
import os
sys.path.append('.')

# Импортируем парсер напрямую
from backend.parsers.authortoday import parse_authortoday_html, get_session, fetch_html
import json

def test_authortoday_parser():
    """Тестируем парсер Author.Today с реальными данными"""

    # Примеры популярных работ на Author.Today
    test_urls = [
        "https://author.today/work/320793",  # Популярная работа
        "https://author.today/work/320794",  # Другая работа
    ]

    session = get_session()

    for url in test_urls:
        print(f"\n=== Тестируем URL: {url} ===")

        try:
            # Получаем HTML
            html = fetch_html(session, url)
            print(f"✓ Получен HTML ({len(html)} символов)")

            # Парсим данные
            data = parse_authortoday_html(html, url)
            print("✓ Данные распарсены")

            # Выводим основные поля
            print(f"📖 Заголовок: {data.get('title', 'Не найден')}")
            print(f"👤 Автор: {data.get('author_name', 'Не найден')}")
            print(f"📝 Описание: {data.get('summary', 'Не найдено')[:100]}...")
            print(f"🏷️ Рейтинг: {data.get('rating', 'Не найден')}")
            print(f"📊 Статус: {data.get('status', 'Не найден')}")
            print(f"📏 Слов: {data.get('word_count', 'Не найдено')}")
            print(f"🎭 Фандомы: {', '.join(data.get('fandoms', [])[:3])}")
            print(f"🏷️ Теги: {', '.join(data.get('tags', [])[:5])}")
            print(f"📄 Глав: {len(data.get('chapters', []))}")

            # Сохраняем в JSON для анализа
            output_file = f"test_authortoday_{url.split('/')[-1]}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"💾 Сохранено в {output_file}")

        except Exception as e:
            print(f"❌ Ошибка: {e}")
            import traceback
            traceback.print_exc()

def test_with_mock_html():
    """Тестируем парсер с моковым HTML если нет интернета"""

    mock_html = """
    <!DOCTYPE html>
    <html>
    <head><title>Тестовая работа - Author.Today</title></head>
    <body>
        <main>
            <div class="book-info">
                <h1 class="book-title">Волшебный мир Гарри Поттера: Новая эра</h1>

                <div class="book-authors">
                    <a href="/u/rowling/works">Джоан Роулинг</a>
                </div>

                <div class="annotation">
                    <p>Продолжение знаменитой саги о Гарри Поттере. Волшебный мир оживает заново с новыми героями и приключениями.</p>
                    <p>В этой истории мы увидим, как прошлое переплетается с настоящим, и старые друзья встречаются вновь.</p>
                </div>

                <div class="book-details">
                    <div class="rating">18+</div>
                    <div class="book-status">Завершён</div>
                    <div class="words-count">98765 слов</div>
                    <div class="updated-date">2024-01-15</div>
                </div>

                <div class="fandoms">
                    <a href="/fandom/harry-potter">Гарри Поттер</a>
                    <a href="/fandom/fanfiction">Фанфик</a>
                </div>

                <div class="tags">
                    <a href="/tag/romance">Романтика</a>
                    <a href="/tag/drama">Драма</a>
                    <a href="/tag/adventure">Приключения</a>
                    <a href="/tag/magic">Магия</a>
                    <a href="/tag/friends">Друзья</a>
                </div>

                <div class="warnings">
                    Насилие, Смерть персонажа, Кровь, Темные темы
                </div>
            </div>

            <div class="book-content">
                <div class="chapter" id="chapter-1">
                    <h3 class="chapter-title">Глава 1: Возвращение в Хогвартс</h3>
                    <div class="chapter-text">
                        <p>Хогвартс встретил Гарри так же, как и много лет назад. Стены замка хранили память о прошлом.</p>
                        <p>Гарри стоял у окна, глядя на озеро, которое блестело под лунным светом. "Я вернулся", - прошептал он.</p>
                        <p>В коридоре послышались шаги. Кто-то приближался. Гарри напрягся, готовый к любым неожиданностям.</p>
                    </div>
                </div>

                <div class="chapter" id="chapter-2">
                    <h3 class="chapter-title">Глава 2: Тайная комната</h3>
                    <div class="chapter-text">
                        <p>Гарри спускался по узкой лестнице в подземелье. Факелы на стенах отбрасывали длинные тени.</p>
                        <p>"Ты уверен, что знаешь, куда идешь?" - спросил Рон, нервно оглядываясь.</p>
                        <p>Гарри кивнул. Он помнил этот путь слишком хорошо. Тайная комната ждала своего часа.</p>
                    </div>
                </div>
            </div>
        </main>
    </body>
    </html>
    """

    print("\n=== Тестируем с моковым HTML ===")

    try:
        data = parse_authortoday_html(mock_html, "https://author.today/work/test")
        print("✓ Моковые данные распарсены")

        print(f"📖 Заголовок: {data.get('title')}")
        print(f"👤 Автор: {data.get('author_name')}")
        print(f"📝 Описание: {data.get('summary')}")
        print(f"🏷️ Рейтинг: {data.get('rating')}")
        print(f"📊 Статус: {data.get('status')}")
        print(f"📏 Слов: {data.get('word_count')}")
        print(f"🎭 Фандомы: {data.get('fandoms')}")
        print(f"🏷️ Теги: {data.get('tags')}")
        print(f"📄 Глав: {len(data.get('chapters', []))}")

    except Exception as e:
        print(f"❌ Ошибка в моковом тесте: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Тестируем парсер Author.Today")
    print("=" * 50)

    # Сначала тестируем с моковыми данными
    test_with_mock_html()

    # Потом тестируем с реальными URL (если есть интернет)
    test_authortoday_parser()

    print("\n" + "=" * 50)
    print("✅ Тестирование завершено!")
