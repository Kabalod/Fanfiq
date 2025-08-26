import argparse
import json
from sqlalchemy import text
from backend.api.db.session import SessionLocal


def export_work_json(work_id: int, ndjson: bool = False) -> int:
    with SessionLocal() as db:
        conn = db.connection()
        w = conn.execute(text("SELECT * FROM works WHERE id=:id"), {"id": work_id}).mappings().first()
        if not w:
            print(json.dumps({"error": "work not found", "id": work_id}, ensure_ascii=False))
            return 2
        fandoms = [r["fandom"] for r in conn.execute(text("SELECT fandom FROM work_fandoms WHERE work_id=:id"), {"id": work_id}).mappings()]
        tags = [r["tag"] for r in conn.execute(text("SELECT tag FROM work_tags WHERE work_id=:id"), {"id": work_id}).mappings()]
        warnings = [r["warning"] for r in conn.execute(text("SELECT warning FROM work_warnings WHERE work_id=:id"), {"id": work_id}).mappings()]
        chapters_rows = conn.execute(text("SELECT chapter_number, title, content_html FROM chapters WHERE work_id=:id ORDER BY chapter_number ASC"), {"id": work_id}).mappings()
        chapters = [{"chapter_number": r["chapter_number"], "title": r["title"], "content_html": r["content_html"]} for r in chapters_rows]

        doc = {
            "id": str(w["id"]),
            "original_url": w.get("original_url"),
            "title": w["title"],
            "author_name": "",
            "summary": w["summary"],
            "language": w["language"],
            "fandoms": fandoms,
            "tags": tags,
            "rating": w["rating"],
            "category": w.get("category"),
            "status": w["status"],
            "warnings": warnings,
            "word_count": w["word_count"],
            "likes_count": w.get("likes_count"),
            "comments_count": w.get("comments_count"),
            "published_at": w.get("published_at"),
            "updated_at": w.get("updated_at"),
            "chapters": chapters,
        }
        if ndjson:
            for ch in chapters:
                line = json.dumps({**doc, "chapters": [ch]}, ensure_ascii=False)
                print(line)
        else:
            print(json.dumps(doc, ensure_ascii=False))
        return 0


def main():
    p = argparse.ArgumentParser(description="Export work to JSON/NDJSON")
    p.add_argument("--id", type=int, required=True, help="work id")
    p.add_argument("--ndjson", action="store_true", help="emit each chapter as separate NDJSON line")
    args = p.parse_args()
    raise SystemExit(export_work_json(args.id, args.ndjson))


if __name__ == "__main__":
    main()
