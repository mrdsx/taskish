from collections.abc import AsyncGenerator

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# TODO: extract database url segments (user, password, etc.)
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/database"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session


class Base(DeclarativeBase):
    pass


class DB_Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    sub_tasks: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=True)
