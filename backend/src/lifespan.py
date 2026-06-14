from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager

from src.session import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Before startup
    yield
    # After startup

    await engine.dispose()
