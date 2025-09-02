from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from .. import models
from ..db.session import get_db

router = APIRouter()

@router.get("/{work_id}/download/txt", response_class=PlainTextResponse)
def download_work_as_txt(work_id: int, db: Session = Depends(get_db)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    content = f"{db_work.title}\n\n"
    content += f"Автор: {db_work.author.name}\n\n"
    content += f"Описание: {db_work.summary}\n\n"
    
    for chapter in db_work.chapters:
        content += f"Глава {chapter.chapter_number}: {chapter.title}\n\n"
        content += f"{chapter.content_html}\n\n" # TODO: Convert HTML to plain text
        
    return PlainTextResponse(content, headers={"Content-Disposition": f"attachment; filename={db_work.title}.txt"})
