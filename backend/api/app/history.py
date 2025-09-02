from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..db import models
from .. import schemas
from ..db.session import get_db
from .users import current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.ReadingHistory])
def read_history(
    db: Session = Depends(get_db),
    user: models.User = Depends(current_active_user),
):
    return db.query(models.ReadingHistory).filter(models.ReadingHistory.user_id == user.id).all()

@router.post("/", response_model=schemas.ReadingHistory)
def update_history(
    history_item: schemas.ReadingHistoryCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(current_active_user),
):
    db_item = db.query(models.ReadingHistory).filter_by(
        user_id=user.id, work_id=history_item.work_id
    ).first()
    
    if db_item:
        db_item.chapter_id = history_item.chapter_id
        db_item.progress = history_item.progress
    else:
        db_item = models.ReadingHistory(**history_item.dict(), user_id=user.id)
        db.add(db_item)
        
    db.commit()
    db.refresh(db_item)
    return db_item
