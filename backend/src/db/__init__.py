from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.core.settings import settings

engine = create_async_engine(
    settings.db_url,
    connect_args={"ssl": settings.db_ssl_mode == "require"},
    pool_size=1,
    max_overflow=0,
    pool_recycle=240,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session


class Base(DeclarativeBase):
    pass
