from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    Enum,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from sqlalchemy.sql import func
import enum
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from ..db.get_async_session import get_async_session

Base = declarative_base()


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    site_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("sites.id", ondelete="SET NULL"))


class Work(Base):
    __tablename__ = "works"
    __table_args__ = (
        UniqueConstraint("site_id", "site_work_id", name="uq_works_site_sitework"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_work_id: Mapped[str | None] = mapped_column(String(100), index=True)
    site_id: Mapped[int] = mapped_column(Integer, ForeignKey("sites.id"), index=True)
    title: Mapped[str] = mapped_column(String(500), index=True)
    summary: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(10), index=True)
    rating: Mapped[str] = mapped_column(String(50), index=True)
    category: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), index=True)
    word_count: Mapped[int] = mapped_column(Integer, index=True)
    likes_count: Mapped[int | None] = mapped_column(Integer)
    comments_count: Mapped[int | None] = mapped_column(Integer)
    published_at: Mapped[str | None] = mapped_column(String(20))
    updated_at: Mapped[str | None] = mapped_column(String(20), index=True)
    original_url: Mapped[str | None] = mapped_column(String(500))
    author_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("authors.id"))

    chapters: Mapped[list["Chapter"]] = relationship("Chapter", back_populates="work", cascade="all, delete-orphan")
    fandoms: Mapped[list["WorkFandom"]] = relationship("WorkFandom", back_populates="work", cascade="all, delete-orphan")
    tags: Mapped[list["WorkTag"]] = relationship("WorkTag", back_populates="work", cascade="all, delete-orphan")
    warnings: Mapped[list["WorkWarning"]] = relationship("WorkWarning", back_populates="work", cascade="all, delete-orphan")
    reading_history: Mapped[list["ReadingHistory"]] = relationship("ReadingHistory", back_populates="work")
    pairings: Mapped[list["Pairing"]] = relationship("Pairing", back_populates="work")
    characters: Mapped[list["Character"]] = relationship("Character", back_populates="work")


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    work_id: Mapped[int] = mapped_column(Integer, ForeignKey("works.id", ondelete="CASCADE"), index=True)
    chapter_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str | None] = mapped_column(String(500))
    content_html: Mapped[str] = mapped_column(Text)

    work: Mapped[Work] = relationship("Work", back_populates="chapters")
    reading_history: Mapped[list["ReadingHistory"]] = relationship("ReadingHistory", back_populates="chapter")


class WorkFandom(Base):
    __tablename__ = "work_fandoms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    work_id: Mapped[int] = mapped_column(Integer, ForeignKey("works.id", ondelete="CASCADE"), index=True)
    fandom: Mapped[str] = mapped_column(String(200), index=True)

    work: Mapped[Work] = relationship("Work", back_populates="fandoms")


class WorkTag(Base):
    __tablename__ = "work_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    work_id: Mapped[int] = mapped_column(Integer, ForeignKey("works.id", ondelete="CASCADE"), index=True)
    tag: Mapped[str] = mapped_column(String(200), index=True)

    work: Mapped[Work] = relationship("Work", back_populates="tags")


class WorkWarning(Base):
    __tablename__ = "work_warnings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    work_id: Mapped[int] = mapped_column(Integer, ForeignKey("works.id", ondelete="CASCADE"), index=True)
    warning: Mapped[str] = mapped_column(String(200), index=True)

    work: Mapped[Work] = relationship("Work", back_populates="warnings")


class Pairing(Base):
    __tablename__ = "pairings"
    id = Column(Integer, primary_key=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    character_name = Column(String, nullable=False)

class Character(Base):
    __tablename__ = "characters"
    id = Column(Integer, primary_key=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    name = Column(String, nullable=False)


class ReadingHistory(Base):
    __tablename__ = "reading_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    progress = Column(Float, default=0.0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class User(Base, SQLAlchemyBaseUserTable[int]):
    id: Mapped[int] = mapped_column(primary_key=True)
    reading_history: Mapped[list["ReadingHistory"]] = relationship("ReadingHistory", back_populates="user")


# Индексы для ускорения поиска/сортировок
Index("idx_works_title_trgm", Work.title)
Index("idx_works_summary_trgm", Work.summary)
