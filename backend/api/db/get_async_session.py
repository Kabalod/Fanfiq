import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

raw_db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://fanfiq:fanfiq@localhost:54390/fanfiq")
if raw_db_url.startswith("postgresql://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = raw_db_url

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session() -> AsyncSession:
    async with async_session() as session:
        yield session
