from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..db.models import Bookmark, Work
from ..db.session import get_db
from .users import current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Bookmark])
def read_bookmarks(
    db: Session = Depends(get_db),
    user: models.User = Depends(current_active_user),
):
    return db.query(Bookmark).filter(Bookmark.user_id == user.id).all()

@router.post("/", response_model=schemas.Bookmark)
def create_bookmark(
    bookmark: schemas.BookmarkCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(current_active_user),
):
    db_work = db.query(Work).filter(Work.id == bookmark.work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    db_bookmark = Bookmark(**bookmark.dict(), user_id=user.id)
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

@router.delete("/{work_id}", response_model=schemas.Bookmark)
def delete_bookmark(
    work_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(current_active_user),
):
    db_bookmark = db.query(Bookmark).filter(
        Bookmark.work_id == work_id, Bookmark.user_id == user.id
    ).first()
    if db_bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(db_bookmark)
    db.commit()
    return db_bookmark
