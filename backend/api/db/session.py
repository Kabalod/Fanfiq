import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def _normalize_postgres_dsn(url: str) -> str:
    """Ensure SQLAlchemy uses psycopg (v3) driver in DSN.

    - postgres:// → postgresql+psycopg://
    - postgresql:// → postgresql+psycopg:// (если не указан драйвер)
    - postgresql+psycopg2:// → postgresql+psycopg://
    """
    if not url:
        return url
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql+psycopg2://"):
        return "postgresql+psycopg://" + url[len("postgresql+psycopg2://"):]
    if url.startswith("postgresql://") and "+" not in url:
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


DATABASE_URL = _normalize_postgres_dsn(
    os.getenv("DATABASE_URL", "postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq")
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
