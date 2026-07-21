from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.daily_tasks import DB_DailyTask
from src.schemas.daily_tasks import DailyTaskIn


class DailyTaskRepository:
    async def fetch_all(self, session: AsyncSession) -> Sequence[DB_DailyTask]:
        result = await session.execute(
            select(DB_DailyTask).order_by(DB_DailyTask.id),
        )

        return result.scalars().all()

    async def create(self, task: DailyTaskIn, session: AsyncSession) -> DB_DailyTask:
        db_task = DB_DailyTask(**task.model_dump())
        session.add(db_task)
        await session.commit()

        return db_task

    async def update_by_id(
        self,
        id: int,
        task: DailyTaskIn,
        session: AsyncSession,
    ) -> DB_DailyTask | None:
        result = await session.execute(
            select(DB_DailyTask).where(DB_DailyTask.id == id),
        )
        db_task = result.scalar()
        if db_task is None:
            return None

        for key, value in task.model_dump().items():
            setattr(db_task, key, value)

        await session.commit()

        return db_task

    async def delete_by_id(self, id: int, session: AsyncSession) -> DB_DailyTask | None:
        result = await session.execute(
            select(DB_DailyTask).where(DB_DailyTask.id == id),
        )
        db_task = result.scalar()
        if db_task is None:
            return

        await session.delete(db_task)
        await session.commit()

        return db_task
