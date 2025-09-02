from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi_users import schemas

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class BookmarkBase(BaseModel):
    work_id: int

class BookmarkCreate(BookmarkBase):
    pass

class Bookmark(BookmarkBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class UserRead(schemas.BaseUser[int]):
    pass

class UserCreate(schemas.BaseUserCreate):
    pass

class UserUpdate(schemas.BaseUserUpdate):
    pass

class AuthorDetail(Author):
    works: List[Work] = []

class Author(BaseModel):
    id: int
    name: str
    url: Optional[str] = None

    class Config:
        orm_mode = True

class SearchFilters(BaseModel):
    include_tags: Optional[List[str]] = None
    exclude_tags: Optional[List[str]] = None
