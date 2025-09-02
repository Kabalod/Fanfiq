from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..db.session import get_db
from .auth import read_users_me

router = APIRouter()

@router.get("/", response_model=List[schemas.Bookmark])
def read_bookmarks(db: Session = Depends(get_db), current_user: schemas.User = Depends(read_users_me)):
    return db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).all()

@router.post("/", response_model=schemas.Bookmark)
def create_bookmark(bookmark: schemas.BookmarkCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(read_users_me)):
    db_bookmark = models.Bookmark(**bookmark.dict(), user_id=current_user.id)
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

@router.delete("/{work_id}", response_model=schemas.Bookmark)
def delete_bookmark(work_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(read_users_me)):
    db_bookmark = db.query(models.Bookmark).filter(models.Bookmark.work_id == work_id, models.Bookmark.user_id == current_user.id).first()
    if db_bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(db_bookmark)
    db.commit()
    return db_bookmark
